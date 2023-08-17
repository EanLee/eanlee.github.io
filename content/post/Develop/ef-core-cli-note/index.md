---
title: EF Core | CLI Tools 操作筆記
description: 記錄 ef tool 內的 DbContext Scaffold 與 code template 的 cli 指令
date: 2023-08-17T01:29:27.194Z
tags:
  - EF Core
categories:
  - EF Core
keywords:
  - EF Core
  - dotnetef
  - dbcontext scaffold
slug: ef-core-cli-note
---

將之前使用 dotnet ef 相關的指令整理在這篇，以便後續快速盤查資料使用。

<!--more-->

## Cli Tools 安裝與更新

### EF Tool 的安裝與更新

使用 EF Core Tools 之前，需先進行安裝。

```shell
# 將 dotnet ef 安裝為全域工具
dotnet tool install --global dotnet-ef
```

若曾經安裝過 dotnet-ef 的工具，但後續專案使用最新版本的 EF Core，在執行 `dotnet ef` 相關指令時，會出現以下的提示訊息。

`The Entity Framework tools version '6.0.8' is older than that of the runtime '7.0.1'. Update the tools for the latest features and bug fixes. See https://aka.ms/AAc1fbw for more information.`

當發生上述的訊息時，可以使用以下的指令來更新本機內的 EF Core 的 Tools 工具版本。

```shell
 dotnet tool update --global dotnet-ef
```

### 使用 EF Core

在使用 dotnet-ef 的 context scaffold 之前，別忘了增加下述的套件。

```shell
dotnet add package Microsoft.EntityFrameworkCore.Design
```

資料庫來源不同，要安裝的不同的 `<EFCore-PROVIDER>。

```shell
# 使用 MS SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer

# 使用 PostgreSQL
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

## DbContext scaffold

```powershell
dotnet ef dbcontext scaffold <Connect> <EFCore-PROVIDER> [options]
```

options 參數說明

- `--context`
- `-f`、`--force`: 強制覆蓋已存在的檔案。
- `--context-dir`: 指定 DbContext 的目錄位置。
- `-o`、`--output-dir`: 指定 Entity 輸出的位置。
- `--no-build`: 忽略專案需建置成功，才能更新 EF Core 相關的 DbContext 與 Entities。
- `--no-onconfiguring`: 產生的 DbContext，不要包含連線字串資料。

```powershell
dotnet ef dbcontext scaffold "Server=localhost;Database=Lab;User Id=sa;Password=AZ@xsw2ec;TrustServerCertificate=true;" Microsoft.EntityFrameworkCore.SqlServer -o Models
```

## 客制 DbContext 與 Entity

若想要客制 dbdcontext scaffold 產生出來的 DbContext 與 Entity，可以使用 CodeTemplate 自訂產出的 DbContext 與 Entity。詳細實作可參考 [使用 T4 CodeTemplate 客制化 EFCore Scaffold 產出內容]({{< ref "../dotnet-ef-core-customized-dbcontext-entity/index.md" >}})。

在使用 CLI 的方式來產生 CodeTemplate 前，需先安裝 `dotnet new` EF Core 範本套件：

```shell
dotnet new install Microsoft.EntityFrameworkCore.Templates

# 若上述指令無法執行，可將 install 改為 -i
dotnet new -i Microsoft.EntityFrameworkCore.Templates
```

接著到要新增 CodeTemplate 的專案目錄下，執行下述指令。

```shell
dotnet new ef-templates
```

會在專案目錄下，建立 `CodeTemplate\EFCore` 資料夾，資料夾內有 `DbContext.t4` 與 `EntityType.t4` 兩個檔案，分別對應產出的 DBContext 與 Entity Type。

不管是使用 `EFCore Power Tools > Reverse Enginerring`，或是使用 CLI `dotnet ef dbcontext scaffold`，都會套用 CodeTemplate 內的設定。

## 補充資料

▶ 延伸閱讀

- [使用 HasQueryFilter 限定 DbContext 查詢內容]({{< ref "../dfcore-dbcontext-hasqueryfilter/index.md" >}})
- [使用 T4 CodeTemplate 客制化 EFCore Scaffold 產出內容]({{< ref "../dotnet-ef-core-customized-dbcontext-entity/index.md" >}})
- [使用 dotnet-ef 建立 PostgreSQL 的 DbContext]({{< ref "../dotnet-ef-postgresql-dbcontext/index.md" >}})
- [使用 dotnet-ef 建立 SQL Server on Docker 的 DbContext]({{< ref "../dotnet-ef-sqlserver/index.md" >}})
