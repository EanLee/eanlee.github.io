---
title: EF Core 系列文章總覽
description: 彙整 EF Core 在 .NET 環境的完整實戰經驗，涵蓋 CLI 工具指令、Database-First 模型生成、Docker 資料庫環境、T4 模板客製化，以及 HasQueryFilter 與 Shadow Property 的進階應用，協助快速找到所需技術解法。
date: 2025-08-10
tags:
  - EF-Core
  - 軟體開發
categories:
  - EF Core
keywords:
  - EF Core
  - Entity Framework Core
  - dotnet-ef
  - DbContext
slug: ef-core-series-overview
lastmod: 2025-08-10T14:04:47+08:00
---
> 本系列文章彙整了在 .NET 環境中使用 Entity Framework  Core 的各種實踐與筆記，從基礎工具的使用、由資料庫優先 (Database-First) 的 DbContext 生成，到進階的查詢過濾與模板客製化，提供一系列的實戰經驗分享。

目前站內有不少與 `EF Core` 相關的文章，如果要依應用情境個別去尋找的話，有些麻煩。
所以才會產生這一個文章中，以便快速找到需要的文章內容。

## 🛠️ 基礎工具與環境設置

關於 `EF Code` 的操作，雖說部份 IDE 已有提供操作 UI，但大多時間的操作，都是透過 CLI 指令進行。

有時候久久未使用，臨時無法回想起所需要的指令。在這個時機點，可以直接在這查詢需要的指令。

-   **[EF Core CLI Tool 操作筆記](../ef-core-cli-note/index.md)**
    
    **實際情境：**
    - 剛加入新專案，PM 說要用 EF Core，但不知道從哪開始
    - 接手舊專案，發現資料庫結構改了但程式碼沒更新
    - 開發到一半忘記 Scaffolding 指令的完整參數
    - 團隊成員電腦的 EF Core 工具版本不一致導致問題
    
    **解決問題：** 
    - 不熟悉 EF Core 命令列工具的安裝、更新與基本操作
    - FAQ 基本操作問題的查找與排除
    
## 🗄️ 從既有資料庫建立專案 (Database First)

以個人而言，開發後端服務時，與資料庫相關的功能，大多是使用 DataBase First，再透過 `scaffold` 方式，讓工具自動產生對應的 Model。

但個人電腦資源有限，不想要在本地端直接安裝資料庫的主體。大多都會採用 Docker 建立 Container 的方式，在本地端建立起資料庫。一方面保持系統的乾淨性，另一方面，在無需使用時，釋放資料庫相關的使用資源。

若在使用 Container 容器，建立資料庫的操作遇到相關的問題，可以參考以下的文章。

-   **[使用 dotnet-ef 建立 SQL Server on Docker 的 DBContext](../dotnet-ef-sqlserver/index.md)**
    
    **實際情境：**
    - 公司使用 Docker 環境開發，但每次重啟容器資料都不見了
    - 用 `dotnet ef scaffold` 連 SQL Server 時出現憑證錯誤
    - 開發環境的 SQL Server 登入帳密設定有問題
    - 需要在容器化環境中建立穩定的開發資料庫
    
    **解決問題：**
    - 如何建立 SQL Server 的 container 
    - Docker 環境下 SQL Server 的資料持久性與連線問題
    - EF Core  Nuget 相關套件安裝
    - 處理憑證錯誤、登入問題
    
-   **[使用 dotnet-ef 建立 PostgreSQL 的 DBContext](../dotnet-ef-postgresql-dbcontext/index.md)**
    
    **實際情境：**
    - 專案決定從 SQL Server 轉換到 PostgreSQL
    - 新專案選用 PostgreSQL，但不知道如何設定 EF Core
    - 需要快速從現有 PostgreSQL 資料庫產生 C# 程式碼
    - 想要跨平台部署，選擇開源資料庫方案
    
    **解決問題：** 
	- 建立 PostgreSQL 的 Container
	- PostgreSQL 資料庫提供者的安裝與連接設定
	- 資料庫機敏資料的管理    

## ⚙️ 進階客製化與資料存取控制

隨著 `EF Core` 使用的次數與情境越來越多，開始發現有些固定的欄位，基於維運與稽核，是系統必須保留的資訊。

但是每次都手動更新的話，可能會忘記去更新，或更新錯誤。為避免這個問題，我們就開始考慮，能否以採用自動化的方式來自動更新。

還好知道，當透過 `EF Core` 的 `scaffold` 工具來建立 Model 時，其底層透過 `T4 Template` 的技術，產出程式中使用的 `DBContext` 與對應表格的 `Entry`。

而資料庫的存取控制操作，則是在 `DBContent` 預設的提供方法。

因此可以從這兩個方向下手，來達成自動化的目標。

如果是針對 `T4 Template` 或是改寫 `DBContent` 現行方法有需求的話，可以參考下面內容。

-   **[使用 T4 CodeTemplate 客制化 EFCore Scaffold 產出內容](../dotnet-ef-core-customized-dbcontext-entity/index.md)**
    
    **實際情境：**
    - 公司要求所有 Entity 類別都要有 `CreatedAt`、`UpdatedAt` 審計欄位，但**希望** Scaffold 產出的程式碼沒有
    - 希望自動產生的程式碼能遵循公司的 Coding Standard（如 private 欄位、特定命名規則）
    - 有些資料庫欄位不想暴露給 API，希望設成 Shadow Property
    - 每次重新 Scaffold 都要手動修改一堆程式碼，想要一次性解決
    
    **解決問題：** 
    - 自動產生的 Entity 類別缺乏客製化邏輯，如審計欄位自動更新
    - 需要統一的程式碼風格、Shadow Properties、或自動化業務邏輯
    
    **核心價值：** 透過 T4 模板實現程式碼生成的完全控制，減少重複性工作

-   **[使用 HasQueryFilter 限定 DBContext 查詢內容](../dfcore-dbcontext-hasqueryfilter/index.md)**
    
    **實際情境：**
    - SaaS 產品需要多租戶功能，每個客戶只能看到自己的資料
    - 實作軟刪除功能，避免直接從資料庫刪除重要資料
    - 每個查詢都要寫 `Where(x => !x.IsDeleted)` 很煩，容易忘記
    - 需要確保敏感資料不會意外洩露給錯誤的使用者
    
    **解決問題：** 
    - 避免在每個查詢中重複撰寫相同的過濾條件
    - 避免遺忘加入必要過濾條件，造成的資料錯誤
    - 透過全域查詢篩選器 (Global Query Filter) 簡化程式碼，提升安全性
    
-   **[EF Core 實戰：當 HasQueryFilter 遇上 Shadow Property](../use-shadow-property-and-hasqueryfilter-on-ef-core/index.md)**
    
    **實際情境：**
    - 使用 T4 模板將 `IsDeleted`、`TenantId` 設為 Shadow Property，但 HasQueryFilter 無法存取
    - 想要隱藏系統欄位不讓 API 回傳，同時又要在查詢中使用
    - 編譯時出現「無法存取 Shadow Property」的錯誤
    - 架構師要求將審計欄位完全從 Entity 類別中隱藏
    
    **解決問題：** 
    - Shadow Property 無法在 Global Query Filter 中直接存取的技術難題
    - 將審計欄位或系統欄位設為 Shadow Property，但仍需要全域過濾
