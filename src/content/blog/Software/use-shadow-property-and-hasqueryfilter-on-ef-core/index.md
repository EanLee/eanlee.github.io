---
title: "EF Core 實戰：當 HasQueryFilter 遇上 Shadow\r  Property"
description: 在 EF Core 中結合 HasQueryFilter 與 Shadow Property 時，會遇到無法直接存取屬性的問題。本文將說明如何改用 `Expression.Call` 搭配 `EF.Property` 來正確設定全域查詢篩選器，並覆寫 SaveChanges 以自動管理這些隱藏欄位。
date: 2025-08-06T11:15:00+08:00
tags:
  - EF-Core
  - CSharp
  - LINQ
categories:
  - EF Core
keywords:
  - EF Core
  - HasQueryFilter
  - Shadow Property
  - Expression.Call
  - LINQ
  - T4 CodeTemplate
slug: use-shadow-property-and-hasqueryfilter-on-ef-core
lastmod: 2025-08-07T01:05:28+08:00
---
> 🔖 長話短說 🔖
>
> - 使用 `Expression.Property` 取得 Shadow Property 資料時，會發生找不到 property 的錯誤。請改用 `Expression.Call`

前面 [使用 T4 CodeTemplate 客制化 EFCore Scaffold 產出內容](../dotnet-ef-core-customized-dbcontext-entity/index.md) 與 [使用 HasQueryFilter 限定 DBContext 查詢內容](../dfcore-dbcontext-hasqueryfilter/index.md) 兩篇文章，提到限制 Scaffold 生成 Entry 欄位，以及使用 `HasQueryFilter` 與改寫 SaveChange 機制。

若 `HasQueryFilter` 使用的欄位資訊，在調整 [T4 CodeTemplate](../dotnet-ef-core-customized-dbcontext-entity/index.md) 後，將查詢的必要欄位隱藏，調整為 `Shadow Property` 後，在運行程式時，發生查無欄位資訊的問題。

因為個人剛好遇到這個問題，就順手記錄下來。（草稿寫在 2023 年，但完稿在 2025 年年中）

<!-- more -->
## 問題描述

在先前分享的文章中，我們分別使用 `HasQueryFilter` 與 `Shadow Property` 時，都可以正常執行。但我們更貪心，想要把兩者結合使用，自動去更新隱藏的屬性。

我們直接套用先前 `HasQueryFilter` 的寫法，去取用 `Shadow Perperty` 的寫法如下(錯誤寫法)。

```csharp
public partical class LabContext
{
	partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
	{
		var shopId = this.GetShopId();  
  
		foreach (var entityType in modelBuilder.Model.GetEntityTypes())  
		{
			// 對每個實體應用全局篩選器, 只取出當前租戶的資料
			BinaryExpression? filterShop = null;
			var property = entityType.GetProperties()
		                         .SingleOrDefault(prop => prop.Name == "shopId");
		 
			var parameter = Expression.Parameter(entityType.ClrType);
		
			if (property != null)
			{
				// 這裡會發生錯誤，因為 shopId 是 Shadow Property
			    BinaryExpression? filterShop = 
				    Expression.Equal(
					    Expression.Property(parameter, property.Name), 
					    Expression.Constant(shopId));

				modelBuilder.Entity(entityType.ClrType).HasQueryFilter(
                    Expression.Lambda(filterShop, parameter));
			}
		}
	}
}
```

因為 Lamda 動態執行的緣故，在 Complie 建置階段順利通知，但程式一執行到這的時候，就直接噴以下的錯誤。

```
System.ArgumentException: Property 'TenantId' is not defined for type 'Name'
   at System.Linq.Expressions.Expression.Property(Expression expression, String propertyName)
```

### 問題的原因

使用 `Expression.Parameter(entityType.ClrType)` 取得的 Object，是使用 `dbcontext scaffold` 產的 Entity。

當欄位被設定為 Shadow Property 時，該欄位不會出現在 Entity 類別中，因此使用 `Expression.Property(parameter, property.Name)` 時，會找不到對應的屬性，造成異常。

為了可以調用 `Shadow Property`，採用 `Expression.Call` 時，它會：

1. 產生一個對 `EF.Property<T>(entity, "propertyName")` 方法的呼叫表達式
2. 這個呼叫會在**執行時期**由 EF Core 的查詢引擎處理
3. EF Core 會檢查 Entity 的 Metadata 來找到對應的 Shadow Property

若是直接操作 Entry 內的 shadow property，可以使用下述的寫法

```csharp
public partial class LabContext
{
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        var shopId = this.GetShopId();  
  
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())  
        {
            // 對每個實體應用全局篩選器, 只取出當前租戶的資料
            BinaryExpression? filterShop = null;
            var property = entityType.GetProperties()
                                   .SingleOrDefault(prop => prop.Name == "shopId");
         
            var parameter = Expression.Parameter(entityType.ClrType);
        
            if (property != null)
            {
                // 使用 Expression.Call 搭配 EF.Property 來存取 Shadow Property
                var shopIdAccess = Expression.Call(
                    typeof(EF),
                    nameof(EF.Property),
                    new[] { property.ClrType }, // 使用 property 的實際型別
                    parameter,
                    Expression.Constant(property.Name));
                
                 BinaryExpression? filterShop = 
                    Expression.Equal(shopIdAccess, Expression.Constant(shopId));
                
                // 套用篩選器到實體
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(
                    Expression.Lambda(filterShop, parameter));
            }
        }
    }
}
```

## 覆寫 SaveChange/SaveChangeAsync

除了在查詢層面使用 `HasQueryFilter` 來篩選資料外，我們也需要在新增和修改資料時，自動設定 Shadow Property 的值。這可以透過覆寫 `SaveChanges` 和 `SaveChangesAsync` 方法來實現，在資料儲存前自動處理這些欄位。

EF Core 提供了 `ChangeTracker` 來追蹤實體的狀態變化，我們可以利用這個機制，在適當的時機，透過 `Metadata` 設定 Shadow Property 的值。

```csharp
public override int SaveChanges()
{
    UpdateShadowProperties();
    return base.SaveChanges();
}

public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
{
    UpdateShadowProperties();
    return await base.SaveChangesAsync(cancellationToken);
}

private void UpdateShadowProperties()
{
    var currentTenantId = GetCurrentTenantId();
    
    foreach (var entry in ChangeTracker.Entries())
    {
        if (entry.State == EntityState.Added)
        {
            // 設定新增資料的 TenantId
            if (entry.Properties.Any(p => p.Metadata.Name == "ShopId"))
            {
                entry.Property("ShopId").CurrentValue = currentTenantId;
            }
            
            // 設定建立時間
            if (entry.Properties.Any(p => p.Metadata.Name == "CreatedAt"))
            {
                entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
        else if (entry.State == EntityState.Modified)
        {
            // 設定更新時間
            if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
            {
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
    }
}

```

## 小結

當使用 T4 Template 將某些欄位設定為 Shadow Property 時，需要特別注意在 `HasQueryFilter` 中存取這些欄位的方式。主要重點如下：

1. **不能使用 `Expression.Property`**：因為 Shadow Property 不存在於 Entity 類別中
2. **改用 `Expression.Call` 搭配 `EF.Property`**：這是存取 Shadow Property 的正確方式
3. **在 SaveChanges 中設定值**：使用 `entry.Property("PropertyName").CurrentValue` 來設定 Shadow Property 的值
4. **查詢時使用 `EF.Property`**：在 LINQ 查詢中使用 `EF.Property<T>(entity, "PropertyName")` 來存取

這種方式既能保持 Entity 類別的簡潔性，又能在資料庫層面維護必要的業務邏輯約束。
## 補充資料

▶ 延伸閱讀

- [使用 T4 CodeTemplate 客制化 EFCore Scaffold 產出內容](../dotnet-ef-core-customized-dbcontext-entity/index.md)
- [使用 HasQueryFilter 限定 DBContext 查詢內容](../dfcore-dbcontext-hasqueryfilter/index.md)

▶ 外部文章

- [c# - EF Core: Soft delete with shadow properties and query filters - Stack Overflow](https://stackoverflow.com/questions/47673524/ef-core-soft-delete-with-shadow-properties-and-query-filters)
- [Entity Framework Core Shadow Properties](https://www.learnentityframeworkcore.com/model/shadow-properties)
