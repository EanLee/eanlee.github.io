---
title: EF Core | 使用 T4 CodeTemplate 客制化 EFCore Scaffold 產出內容
description: null
date: 2023-06-17T03:22:44.931Z
categories:
  - 軟體開發
tags:
  - EF Core
keywords:
  - EF Core
  - EF Core Power Tool
  - DbContext
  - T4
  - Text Template Transformation Toolkit
slug: dotnet-ef-core-customized-dbcontext-entity
---

接續 DBContext 操作的議題，目前已知現有的資料庫內，所有的表格都有 `createTime`、`changeTime`、`changeUser`、 `changeState` 四個欄位，額外記錄資料異動記錄。

在「[使用 HasQueryFilter 限定 DBContext 查詢內容](../efcore-hasqueryfilter/index.md)」中，提到如何已經透過 `HasQueryFilter` 來簡化資料庫查詢的動作。

接下來，想要再進一步的封裝 EFCore 所使用的 Entity，讓這四個欄位的資訊，不要曝露於 DBContext 的操作中。

針對客制化 EFCore 的 DBContext 與 Entity Type，將相關的實作內容記錄下來。

> 🔖 長話短說 🔖
>
> - 若是覺得用 `dotnet ef dbcontext scaffold` 的指令來建立 DBContext 不方便，在 Visual Studo 可以安裝 [`EF Core Power Tool`](https://marketplace.visualstudio.com/items?itemName=ErikEJ.EFCorePowerTools) Extension 套件，以 GUI 進階設定 DBContext 的建立內容。
> - 針對 DBContext 的查詢要進行過濾，可在 DBContext 內的 `OnModelCreatingPartial(ModelBuilder modelBuilder)` 進行過濾。
> - 

<!--more-->

操作環境：

- Windows 11
- .NET Core 6
- EF Core 7

## DBContext 與 EntityType 的建立

`EFCore Power Tools` 是 Visual Studio 的 Extension，所以在使用前，需要先進行安裝。

在安裝完成後，我們可以在專案項目，按下滑鼠右鍵的選單中，選擇 `EFCore Power Tools > Reverse Enginerring`，以 GUI 的方式進行 EFCore Scaffold 產出想要的 DBContext。

可以在不調整 CodeTemplate 的前提下，配合勾選 GUI 內的選項,就可以達到進階 DbContext 生成設定。若需要調整 CodeTemplate，也可以利用 `EFCore Power Tools > Add CodeTemplate`，它會自動在專案的目錄下，建立一個名稱 `CodeTemplate/EFCore` 的資料夾。

順帶一提，`Reverse Enginerring` 內，勾選的設定，都會存在 `efpt.config.json` 之中。

## 使用 CodeTemplate 自訂產出的 DBContext 與 Entity

也可以使用 CLI 的方式來產生 CodeTemplate 資料夾。首先安裝 的 `dotnet new` EF Core 範本套件：

```shell
dotnet new install Microsoft.EntityFrameworkCore.Templates
```

接著到要新增 CodeTemplate 的專案目錄下，執行下述指令。

```
dotnet new ef-templates
```

會在專案目錄下，建立 `CodeTemplate\EFCore` 資料夾，資料夾內有 `DbContext.t4` 與 `EntityType.t4` 兩個檔案，分別對應產出的 DBContext 與 Entity Type。

不管是使用 `EFCore Power Tools > Reverse Enginerring`，或是使用 CLI `dotnet ef dbcontext scaffold`，都會套用CodeTemplate 內的設定。

可以使用 CodeTemplate 的 T4([Text Template Transformation Toolkit](https://en.wikipedia.org/wiki/Text_Template_Transformation_Toolkit)) 來客制化產出 DBContext 與 Entity Type ，來達成以下的需求。

- 要想限制建立出來的類型不公開，為 `private` 或 `internal` 的存取層級。。
- 變更 Entity Type 內的欄位名稱。
- 排除特定的 Entity Type 欄位。

個人建議，若需要調整 `DbContext.t4` 或 `EntityType.t4` 進行客制化，建議使用 CLI 的方式來執行，因為這樣可以更直接查看 `.t4` 調整後執行階段的錯誤訊息。

## 實作 Lab

在實作 Lab 之前，來描述一下需求。

目前有一個遵循三層式架構(Applicaiton/Business/Data Layer)的軟體，並使用 DI/IoC 的方式，避免模組之間的直接的耦合依賴關係。

這意味著 DbContext 的使用應儘量被限制在 Data Layer 中，避免 DbContext 曝露在外的。確保資料操作在適當的範疇內進行。

在資料庫的表格內，均有  `createTime`、`chgTime`、`chgUser`、 `chgState` 四個欄位，額外記錄資料異動記錄。但希望減輕開發者的工作負擔，讓這四個欄位的更新或自動化。避免使用 ORM 時，還要花費心思在更新或維護這四個欄位的資料，或是發生更新失誤的情況。

同時，資料庫欄位名稱過長或不夠直覺，想要讓 ORM 生成 Entity Field 時，變更為適當的名稱。讓程式碼更加直觀易懂，提高開發效率。

將上述的需求用工程話語解釋如下

- DBContext 與 Entity 的 Class 存取等級為 Private/internal
- 開發人員在使用 Entity 時，無法變更四個欄位的資料。
- 自定義 Entity 內的 Field 名稱。

假設直接使用預設 Template 產生的 DBContext/Entity 內容。

```C#
public partial class LabDbContext : DbContext
{
	public virtual DbSet<Book> Books { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		...

		OnModelCreatingPartial(modelBuilder);
	}

	partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

public class Book
{
	public int BId { get; set; }
	public string BName { get; set; }
	public DateTime BCreateTime { get; set; }
	public DateTime BChgTime { get; set; }
	public string BChgUsr { get; set; }
	public short BChgState { get; set; }
}
```

期望的 DBContext/Entity 內容

```C#
internal partial class LabDbContext : DbContext
{
	public virtual DbSet<Book> Books { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		...

		OnModelCreatingPartial(modelBuilder);
	}

	partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

internal class Book
{
	public int Id { get; set; }
	public string Name { get; set; }
}
```

### 更新 DbContext/Entity 的存取等級

我們從最簡單的開始，把 DbContext/Entity 的存取等級，由 public 更改為 internal。

分別在 `DbContext.t4` 與 `EnitiyType.t4` 找到 `public partial class` 這一行，改為 `internal partical class` 。

```t4
// DbContext.t4
internal partial class <#= Options.ContextName #> : DbContext

// EntityType.t4
internal partial class <#= EntityType.Name #>
```

再執行 `dbcontext scaffold` 結果如下。

### 隱藏特定欄位，並在增/修/刪時，自動更新資料

這要從 `EntityType.t4` 與 override DbContext 的 `SaveChanges/SaveChangesAsync` 兩邊同時調整。

在 `EntityType.t4` 的調整，主要目的是讓開發者不會透過 Entity 去異動到不該動的資料欄位。

```t4
```

接著，去進行 `SaveChanges/SaveChangesAsync` 的調整

```C#

internal partial class ERetailContext  
{  
	public override int SaveChanges()  
	{  
		this.UpdateDataAttribute();  
		return base.SaveChanges();  
	}  
  
	public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())  
	{  
		this.UpdateDataAttribute();  
		return base.SaveChangesAsync(cancellationToken);  
	}  
  
	private void UpdateDataAttribute()  
	{  
		// Lab 先固定 operateUser 為 system, 實務上需要從其他取得資料
		var operateId = "system";  
			  
		var currentTime = DateTime.UtcNow;  
		  
		foreach (var entry in this.ChangeTracker.Entries())  
		{  
			  
		// 對於被刪除的實體，我們將其狀態設定為修改（EntityState.Modified），並設定相應的屬性  
		if (entry.State == EntityState.Deleted)  
		{  
		var isValid = entry.Entity.GetType().GetProperties()  
		.FirstOrDefault(prop =>  
		prop.Name.EndsWith("",  
		StringComparison.OrdinalIgnoreCase));  
		  
		isValid?.SetValue(entry.Entity, false);  
		  
		entry.State = EntityState.Modified;  
		}  
		  
		if (entry.State == EntityState.Added)  
		{  
		// 對於新增的實體，我們同樣要更新 "CreateAt" 屬性  
		var createAtProperty = entry.Entity.GetType().GetProperties()  
		.FirstOrDefault(prop => prop.Name.EndsWith("CreatedAt",  
		StringComparison.OrdinalIgnoreCase));  
		  
		createAtProperty?.SetValue(entry.Entity, currentTime);  
		}  
		  
		// 找到所有名稱以 "UpdateAt" 結尾的屬性，並更新它們的值  
		var updateAtProperty = entry.Entity.GetType().GetProperties()  
		.FirstOrDefault(prop => prop.Name.EndsWith("UpdatedAt",  
		StringComparison.OrdinalIgnoreCase));  
		  
		updateAtProperty?.SetValue(entry.Entity, currentTime);  
		  
		// 找到所有名稱以 "UpdateUser" 結尾的屬性，並更新它們的值  
		var updateUserProperty = entry.Entity.GetType().GetProperties()  
		.FirstOrDefault(prop => prop.Name.EndsWith("UpdatedUser",  
		StringComparison.OrdinalIgnoreCase));  
		  
		updateUserProperty?.SetValue(entry.Entity, operateId); // 替換成實際的使用者名稱  
		  
		}  
	}  
}
```


### 更新 Enity 的 Field 名稱

針對這個需求,需要同時異動 `EntityType.t4` 與 `DbContext.t4`，不然 DbContext 無法將 Entity 與 Database 的欄位 Mapping 起來。

```C#

```


### 

## 延伸閱讀

▶ 站內文章
- [使用 HasQueryFilter 限定 DBContext 查詢內容](../efcore-hasqueryfilter/index.md)

▶ 站外文章
- [Reverse Engineering · ErikEJ/EFCorePowerTools Wiki · GitHub](https://github.com/ErikEJ/EFCorePowerTools/wiki/Reverse-Engineering)
- [自訂反向工程範本 - EF Core | Microsoft Learn](https://learn.microsoft.com/zh-tw/ef/core/managing-schemas/scaffolding/templates?tabs=dotnet-core-cli)
