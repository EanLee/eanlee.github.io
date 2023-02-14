---
title: 使用 dotnet-ef 建立 SQL Server on Docker 的 DBContext
description: ""
date: 2023-02-14T02:50:41.920Z
categories:
  - 軟體開發
tags:
  - EF Core
  - SQL Server
  - Docker
keywords:
  - EF Core
draft: true
slug: dotnet-ef-sqlserver
---

在[使用 dotnet-ef 建立 PostgreSQL 的 DBContext]({{<ref "../efcore-postgresql/index.md">}}) 之後，也嘗試從 SQL Server on Docker 建立 DBContext，就順手把過程中遇到的小問題記錄下來。

> 🔖 長話短說 🔖
>
> - 使用 Docker 建立的 SQL Server，若需要進行 bak 的備份與還原時，在執行 Container 時，別忘了 mount 資料夾。
> - 使用 `dotnet ef dbcontext scaffold` 時，發生 `此憑證鏈結是由不受信任的授權單位發出的` 的差異，請在連線字串內加入 `TrustServerCertificate=true`。
> - 使用 `dotnet ef dbcontext scaffold` 時，發生 `Login failed for user` 的名稱與連線字串內的 `User Id` 不同時，請確認連線字串內的 `Server` 位置是否正確。

<!--more-->

操作環境：

- Windows 11
- .NET Core 7
- EF Core 7
- SQL Server 2022

## 使用 Docker 建立 SQL Server

為了方便，選擇使用 Docker 來建立 SQL Server，作為暫時性的服務

```shell
docker run -e "ACCEPT_EULA=Y" /
		   -e "MSSQL_SA_PASSWORD=AZ@xsw2ec" /
		   -p 1433:1433 /
		   --name sql1 /
		   -d /
		   mcr.microsoft.com/mssql/server:2022-latest
```

SQL Server 環境參數說明

- `ACCEPT_EULA`
- `MSSQL_SA_PASSWORD`: sa 帳戶的密碼

### 資料的備份與還原

```shell
docker run -e "ACCEPT_EULA=Y" /
		   -e "MSSQL_SA_PASSWORD=AZ@xsw2ec" 
		   -p 1433:1433 
		   --name sql1 
		   -d 
		   -v C:\docker_mount:/sql_data 
		   mcr.microsoft.com/mssql/server:2022-latest
```

## 使用 dotnet-ef 建立 DBContext

### 套件與指令

在使用 dotnet-ef 之前，別忘了先為專案增加以下兩個套件。

```shell
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
```

```txt
dotnet ef dbcontext scaffold "Server=(localdb)\mssqllocaldb;Database=Lab;User Id=sa;Password=;Trusted_Connection=True;" Microsoft.EntityFrameworkCore.SqlServer -o Models
```

```shell
dotnet ef dbcontext scaffold "Server=localhost;Database=Lab;User Id=sa;Password=AZ@xsw2ec;TrustServerCertificate=true;" Microsoft.EntityFrameworkCore.SqlServer -o Models
```

連線字串參數說明

- `TrustServerCertificate`:
- `Trusted_Connection`:

### 錯誤排除

#### ⚠ Login failed

user 與連線字串內的 User Id 不同

原因:

#### ⚠ 此憑證鏈結是由不受信任的授權單位發出

A connection was successfully established with the server, but then an error occurred during the login process. (provider: SSL Provider, error: 0 - 此憑證鏈結是由不受信任的授權單位發出的。)

原因:

## 延伸閱讀

▶ 站內文章

- [Docker 操作簡介 - command / dockerfile / docker-compose]({{< ref "../../Series/build-automated-deploy/docker_operate/index.md">}})
- [使用 dotnet-ef 建立 PostgreSQL 的 DBContext]({{< ref "../efcore-postgresql/index.md">}})

▶ 外部文章

- [設定和自訂 SQL Server Docker 容器 - SQL Server | Microsoft Learn](https://learn.microsoft.com/zh-tw/sql/linux/sql-server-linux-docker-container-configure?view=sql-server-ver16&pivots=cs1-bash)
- [Dockerize your SQL Server and use it in ASP.NET Core with Entity Framework Core (twilio.com)](https://www.twilio.com/blog/containerize-your-sql-server-with-docker-and-aspnet-core-with-ef-core)
- [Using Entity Framework for .NET 6 with SQL Server in a Docker Container | no dogma blog (bryanhogan.net)](https://nodogmablog.bryanhogan.net/2021/08/using-entity-framework-for-net-6-with-sql-server-in-a-docker-container/)
