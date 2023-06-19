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

順帶一提，`Reverse Enginerring` 內，勾選的設定，都會存在 `efpt.config.json` 之中。

## 使用 CodeTemplate 自訂產出的 DBContext 與 Entity

此外，可以選擇 `EFCore Power Tools > Add CodeTemplate`，它會自動在專案的目錄下，建立一個名稱 `CodeTemplate/EFCore` 的資料夾。

資料夾內有 `DbContext.t4` 與 `EntityType.t4` 兩個檔案，分別到 DBContext 與產生出來的 Entity Type。

不管是使用 `EFCore Power Tools > Reverse Enginerring`，或是使用 CLI `dotnet ef scaffold`


若是有以下的需求，那麼可以使用 CodeTemplate 的 T4([Text Template Transformation Toolkit](https://en.wikipedia.org/wiki/Text_Template_Transformation_Toolkit)) 來客制化產出 DBContext 與 Entity Type 。

- 要想限制建立出來的類型不公開，為 `private` 或 `internal` 的存取層級。。
- 變更 Entity Type 內的欄位名稱。
- 排除特定的 Entity Type 欄位。

### 客制建立的 Entity 內的 Field 

### 客制 DBContext 的行為


### 客制 DBContext 的 SaveChange 行為

#### 統一資料的增/刪/修的特定行為




### 

## 延伸閱讀

▶ 站內文章
- [使用 HasQueryFilter 限定 DBContext 查詢內容](../efcore-hasqueryfilter/index.md)

▶ 站外文章
- [Reverse Engineering · ErikEJ/EFCorePowerTools Wiki · GitHub](https://github.com/ErikEJ/EFCorePowerTools/wiki/Reverse-Engineering)
