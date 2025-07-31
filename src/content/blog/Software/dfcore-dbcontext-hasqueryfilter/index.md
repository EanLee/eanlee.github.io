---
title: EF Core | 使用 HasQueryFilter 限定 DBContext 查詢內容
description: 分享三種在 EF Core 2.0 後的查詢過濾資料的方法。並著重說明 EFCore 2.0 後提供的 Global Query Filter 功能，它可以讓開發人員在模型建立期間設定預設的查詢過濾條件，這樣在所有的查詢中都會自動套用這個過濾條件，簡化查詢程式碼並避免查詢錯誤。
date: 2023-06-19T03:17:17+08:00
categories:
  - 軟體開發
  - EF Core
tags:
  - EF-Core
keywords:
  - EF Core
  - HasQueryFilter
  - Entity Framework
slug: dfcore-dbcontext-hasqueryfilter
lastmod: 2023-06-29T09:43:17+08:00
---

前些時間，在幫朋友改造現有倉儲系統時，發現現有資料庫內，所有的表格都有四個作為異動記錄使用的固定欄位。

導致查詢這些資料時，需要針對這些欄位內的數值，去做進行過濾的動作。

雖然以前經常使用 `Where` 與自定義的 `IQueryable Extension Methods` 來過濾資料，但是總會想要再更精簡開發要寫的程式碼。剛好發現 Entity Framework Core 在 2.0 版之後，提供了一個 Gobal Query Filter 的作法。

就順便把實驗過程與踩到的坑，順手記錄下來。

> 🔖 長話短說 🔖
>
> - Entity Framework 常見過濾查詢資料作法有 `Where` 與自定義的 `IQueryable Extension Methods` 。
> - EF Core 2.0 之後提供 `HasQueryFilter` 的方法，可針對 Entity 的任何查詢，進行套用 Linq 運算式。
> - 若要排除 `HasQueryFilter` 的影響，可以在 DBContext.Entites 加上 `.IgnoreQueryFilters()` 。

<!--more-->

操作環境：

- Windows 11
- .NET Core 7
- EF Core 7

## 前提/背景

當開發一個多租戶的系統，同時，每一個租戶可能會管理多個商店。

對應這個需求，常見的資料庫表格設計，可能會把商店的資訊與租戶 Id 放在同張表格之中。同時，為了確保刪除資料，在事後可以查詢或回復，增加軟刪除使用的欄位。

在查詢資料的時候，只要加入過濾 `租戶 Id` 與 `未刪除` 的條件，就可以取得有效資料內容。

假設下述的 `Store` 是使用 EFCore Scffold 產生來的 Entity Type 與 DbContext。

```csharp
public partial class LabContext : DBContext
{
	public virtual DbSet<Tenant> Tenants { get; set; }
	public virtual DbSet<Store> Stories { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		...

		OnModelCreatingPartial(modelBuilder);
	}

	partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

public class Store
{
	public int TenantId { get; set; }
	public int Id { get; set; }
	public string Name { get; set; }
	public bool IsDeleted { get; set; }
}
```

## 作法

在 Entity Framework 或 Entity Framework Core 的使用中，經常使用 `Where` 方法或者自定義的 `IQueryable Extension Methods` 來過濾資料，這樣的方式雖然方便，但是也需要對每一個 `DbSet<T>` 的操作都下達過濾條件。

若是資料庫設計之初，就在所有資料表中加入 `IsDeleted` 欄位。意味著查詢資料的時，每次都要排除已被標註刪除的資料，否則會拿到已被標記為刪除的資料，導致資料取得的錯誤。

對應 `DbSet<T>` 的操作，只要在某一次進行 Query/Select 查詢時，忘記使用 `Where` 或 `IQueryable Extension Method`，就會發生，誤取已被標註刪除的資料。

為了解決這個問題，Entity Framework Core 2.0 之後引入了全域查詢篩選（Global Query Filter）的功能。

透過全域查詢篩選，自訂預設的過濾條件，讓這個條件自動應用到所有的查詢上。這樣一來，在查詢資料的時候，一方面簡化查詢的條件，另一方面避免查詢失誤。

### Linq Lamda: Where

下述為最常使用的 `.Where` 的查詢方式。

使用 `.Where` 後的資料類型為 `IQueryable` ，屬於 `sever evaluation` 的操作，意味著這個搜尋條件會送到資料庫。

而在 `.ToList()` 之後的操作，屬於 `client evaluation`，意味著資料已經下載到主機的記憶體。

```csharp
var context = new LabContext;

// 使用 Where 過濾資料
var stories = LabContext.Stories.Where(x => x.IsDeleted == false).ToList();
```

### IQueryable Extension Methods

當然我們也可以針對資料去進行封裝，在設定好通用的 `Expression.Lambda` 後，配合 `IQueryable.Where`，一樣可以達成 `sever evaluation` 資料過濾的目的。

```csharp
internal static class DbExtension
{
    public static IQueryable<T> Valid<T>(this IQueryable<T> data) where T : class
    {
        var prop = typeof(T).GetProperties()
                            .FirstOrDefault(property => property.Name.EndsWith("IsDeleted"));

        if (prop == null)
            return data;

        var param = Expression.Parameter(typeof(T));
        var falseExp = Expression.IsFalse(Expression.Property(param, prop));

        var predicate = Expression.Lambda<Func<T, bool>>(falseExp, param);

        return data.Where(predicate);
    }
}
```

### Gobal Query Filter: HasQueryFilter

在 EFCore 2.0 之後，可以在通過 `partial void OnModelCreatingPartial(ModelBuilder modelBuilder)` 中，對 ModelBuilder 內的 Entity 進行 Query Filter。

針對 `IsDeleted` 欄位的過濾，我們可以用下述的程式，取回 `IsDeleted = false` 的資料。

```csharp
public partical class LabContext
{
	partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
	{
		foreach (var entityType in modelBuilder.Model.GetEntityTypes())
		{
			// 只取出有效的資料
			var prop =
				entityType.GetProperties().FirstOrDefault(p => p.Name.EndsWith("IsDeleted"));

			var parameter = Expression.Parameter(entityType.ClrType);

			var filter =
				Expression.Equal(
					Expression.Property(parameter, prop.Name),
					Expression.Constant(false));

			var lambda =
				Expression.Lambda(
					filter,
					Expression.Parameter(entityType.ClrType));

			modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
		}
	}
}
```

注意：在上述範例中，因為所有 Entity 都存在 `IsDeleted`，所以沒有加上 `IsDeleted` 欄位不存在的判斷。若其中一個 Entity 不存在 IsDeleted 欄位，執行到 `.HasQueryFilter()` 會直接丟出異常例外。

#### 個別排除使用 Gobal Query Filter

若是查詢時，想要排除已經設定在 Gobal Query Filter 的過濾條件，可以在查詢時，加入 `.IgnoreQueryFilters()`，告知不要使用 Query Filter。

```csharp
var context = new LabContext;

// 告知不要使用 Query Filter
var stories = LabContext.Stories.IgnoreQueryFilters().ToList();
```

## Gobal Query Filter 多條件過濾

假設多租戶系統的資料庫表格中，所有的表格都有存在 `StoreId` 與 `IsDeleted` 的欄位，所以我們希望可以同時過濾這 2 個欄位的資訊。

所以我們可能會撰寫以下的程式。

```csharp
public partical class LabContext
{
	partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
	{
		// Demo 固定值為 1, 實務上需透明其他方式取得
		int storeId = 1;

		foreach (var entityType in modelBuilder.Model.GetEntityTypes())
		{
			var parameter = Expression.Parameter(entityType.ClrType);

			// 只取出有效的資料
			var isDeletedProp =
				entityType.GetProperties().FirstOrDefault(p => p.Name.EndsWith("IsDeleted"));

			var isDeletedFilter =
				Expression.Equal(
					Expression.Property(parameter, isDeletedProp.Name),
					Expression.Constant(false));

			var storeIdProp =
				entityType.GetProperties().FirstOrDefault(p => p.Name.EndsWith("StoreId"));

			var storeIdFilter =
				Expression.Equal(
					Expression.Property(parameter, prop.Name),
					Expression.Constant(storeId));

			var combine = Expression.AndAlso(isDeletedFilter, storeIdFilter);
			var lambda = Expression.Lambda(combine, parameter);
			modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
		}
	}
}
```

首先，先分別產生 isDeletedFilter 與 tenantIdFitler 兩個 `BinaryExpress`

```csharp
var parameter = Expression.Parameter(entityType.ClrType);

// 只取出有效的資料
var isDeletedProp =
	entityType.GetProperties().FirstOrDefault(p => p.Name.EndsWith("IsDeleted"));

var isDeletedFilter =
	Expression.Equal(
		Expression.Property(parameter, isDeletedProp.Name),
		Expression.Constant(false));
var storeIdProp =
	entityType.GetProperties().FirstOrDefault(p => p.Name.EndsWith("StoreId"));

var storeIdFilter =
	Expression.Equal(
		Expression.Property(parameter, prop.Name),
		Expression.Constant(storeId));
```

在這邊，我們使用 `Express.AndAlso` 來合併兩個以上的 `BinaryExpress` 後，以便後續使用 `Expression.Lambda` 產出 `.HasQueryFilter()` 所需的 `LamdaExpression`。

```csharp
var combine = Expression.AndAlso(isDeletedFilter, storeIdFilter);
var lambda = Expression.Lambda(combine, parameter);
modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
```

### 異常排除

但是有時候，若沒有特別注意要使用相同的 `Expression.Parameter` 生成的物件，在執行時，會發生下述 `NoNameParameter` 的 Linq expression `InvalidOperationException` 異常。

```log
System.InvalidOperationException: The LINQ expression 'NoNameParameter' could not be translated.
Either rewrite the query in a form that can be translated, or switch to client evaluation explicitly by inserting a call to 'AsEnumerable', 'AsAsyncEnumerable', 'ToList', or 'ToListAsync'.
```

下述為錯誤的範例。在 `Expression.Equal` 與 `Expression.Lamdba` 都是直接使用 `Expression.Parameter` 建立的新物件。雖然在編譯檢查的時候不會出現任何錯誤，但在執行階段就會出現無效操作的例外。

```csharp
var isDeletedProp =
	entityType.GetProperties().FirstOrDefault(p => p.Name.EndsWith("IsDeleted"));

var isDeletedFilter =
	Expression.Equal(
		Expression.Property(Expression.Parameter(entityType.ClrType), isDeletedProp.Name),
		Expression.Constant(false));
var storeIdProp =
	entityType.GetProperties().FirstOrDefault(p => p.Name.EndsWith("StoreId"));

var storeIdFilter =
	Expression.Equal(
		Expression.Property(Expression.Parameter(entityType.ClrType), prop.Name),
		Expression.Constant(storeId));

var combine = Expression.AndAlso(isDeletedFilter, storeIdFilter);
var lambda = Expression.Lambda(combine, Expression.Parameter(entityType.ClrType));
modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
```

## 延伸閱讀

▶ 站內文章

- [使用 T4 CodeTemplate 客制化 EFCore Scaffold 產出內容](../dotnet-ef-core-customized-dbcontext-entity/index.md)

▶ 站外文章

- [How to Use Global Query Filters in EF Core](https://www.milanjovanovic.tech/blog/how-to-use-global-query-filters-in-ef-core)
- [EntityTypeBuilder.HasQueryFilter(LambdaExpression) 方法 ](https://learn.microsoft.com/zh-tw/dotnet/api/microsoft.entityframeworkcore.metadata.builders.entitytypebuilder.hasqueryfilter?view=efcore-7.0)
