---
title: Docker | 使用 Docker 建置 ASP.NET Webapi 的 Image
description: null
tags:
  - Postgresql
  - Docker
categories:
  - container
keywords:
  - Docker
  - ASP.NET
  - dockerfile
date: 2023-02-25T05:07:49.003Z
slug: aspnet-webapi-containerized
draft: true
---


> 🔖 長話短說 🔖
>

<!--more-->

## Dockerfile 簡介

雖然在 [Docker 操作簡介 - command / dockerfile / docker-compose]({{< ref "..\..\Series\build-automated-deploy\docker_operate\index.md" >}}) 已經有提過，不過還是簡單回顧一下。

### Single-Stage Build

Dockerfile 的設定方式，最基本的就是一個步驟內，完成所有的設定。這種方式，就是 `Single-Stage Build`。

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:7.0
WORKDIR /src
COPY ["demo/demo.csproj", "demo/"]
RUN dotnet restore "demo/demo.csproj"
WORKDIR /src/demo
RUN dotnet build "demo.csproj" -c Release -o /app/build
RUN dotnet publish "demo.csproj" -c Release -o /app

WORKDIR /app
EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "demo.dll"]
```

簡單說明一下指令的意義

- `FROM` 使用的 base Image
- `WORKDIR` 目前 Image 內所在的位置
- `COPY` 把外部資料複制到 Image 內的指定位置
- `RUN` 執行指定的指令
- `EXPOSE` 指定 Image 內的服務埠
- `ENTRYPOINT` 指定 Image 內的執行指令

但要特別注意，若是在 `Single-Stage Build` 中，直接將程式碼進行建置、打裝的方式，會將所有的步驟所使用的工具、中繼檔、程式碼等等，都包含在 Image 內。

導致 Image 內部存在不必要的檔案、多餘資料，除了檔案過大外，還可能造成資料的外洩。

當然，我們也可以建置過程中，加入指令刪除建置過程中，所使用的程式碼與中繼檔，也僅能確保刪除的項目不會被他人看到，至於過程中使用的工具等，可能還是遺留在 Image 內。

Docker 的 [官方文件](https://docs.docker.com/build/building/multi-stage/)，也建議使用 `Multi-Stage Build` 的方式，來建置 Image。除了可以減少 Image 的大小外，也可以確保 Image 內的資料，不會被外洩。

### Multi-Stage Build

在 Visual studio 建立 .NET 專案時，若有勾選 support Docker 的選項。在建立專案的同時，一併建立 `Dockerfile` 的檔案，其內容的編排，就是使用 `Multi-stage` 的方式。

在這個 Dockerfile 內的描述，會分成四個階段來進行建置。

- 首先，建立運行發佈程式所需要的 Base Image。
- 再來，建立建置環境用的影像檔，裡面包含.NET SDK 與 程式碼，並確認程式碼可以正常建置。
- 第三步，將第二步建置過的程式碼，打包成發佈版本。
- 最後，將發佈版本的程式，放入運行環境的 Base Image 內。

```Dockerfile
# 建立一個執行程式的基礎模板 
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base  
WORKDIR /app  
EXPOSE 80  
EXPOSE 443  

# 使用 .NET SDK 的 Image, 並程式碼複製到容器內，並執行建置 
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build  
WORKDIR /src  
COPY ["demo/demo.csproj", "demo/"]  
RUN dotnet restore "demo/demo.csproj"  
COPY . .  
WORKDIR "/src/demo"  
RUN dotnet build "demo.csproj" -c Release -o /app/build  
  
# 使用上一步建立的 Image, 進行發佈版本的建置 
FROM build AS publish  
RUN dotnet publish "demo.csproj" -c Release -o /app/publish  

# 將最後建置的程式，放置到基礎的 Image 內，並設定執行的指令
FROM base AS final  
WORKDIR /app  
COPY --from=publish /app/publish .  
ENTRYPOINT ["dotnet", "demo.dll"]
```

## 機敏資料的處理

在專案中，可能會有一些機敏資料，例如資料庫的連線字串、憑證資料等等。

大伙都知道，這些資料，不應該直接放置在程式碼內。相同的，也不應該放置在 Image 內。

### 資料庫的連線字串

若 ASP.NET Webapi 已經建置為 Docker Image，可以使用`環境變數`、`命令列`、`掛載文件檔` 的方式，來傳遞資料庫的連線資訊。

#### 作法一、自組連線字串

把資料庫相關資訊，如 `Host`、`Port`、`Database`、`User`、`Password` 等，放置在環境變數內，並在程式碼中，使用環境變數的方式，自行組合為連線字串。

首先，調整程式碼，連線字串的取得方式，改為由環境變數自行組合而成。

```C#
// 以 postgresql 的連線字串 為例
var connectionString = string.Format(
    "Host={0};Port={1};Database={2};Username={3};Password={4};Pooling=true;",
    Environment.GetEnvironmentVariable("DB_HOST"),
    Environment.GetEnvironmentVariable("DB_PORT"),
    Environment.GetEnvironmentVariable("DB_NAME"),
    Environment.GetEnvironmentVariable("DB_USER"),
    Environment.GetEnvironmentVariable("DB_PASSWORD"));

builder.Services.AddDbContext<LabContext>(options => options.UseNpgsql(connectionString));
```

接著，調整 Dockerfile ，增加環境變數。

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app

# 設定 DB 相關的環境變數，這邊先給予預設值
ENV DB_HOST=127.0.0.1
ENV DB_PORT=5432
ENV DB_NAME=postgres
ENV DB_USER=postgres
ENV DB_PASSWORD=123

EXPOSE 80
EXPOSE 443

// 略 ...
```

在完成上述的調整後，就可以使用 `docker run` 的方式，啟動容器。

```bash
docker run -e DB_HOST=127.0.0.1 -e DB_PORT=5432 -e DB_NAME=postgres -e DB_USER=postgres -e DB_PASSWORD=123 -d -p 5000:80 --name webapi lab/webapi
```

#### 作法二、以環境變數傳遞加密後的連線字串

將連線字串加密，使用環境變數的方式，傳遞加密後的字串，這樣就可以避免直接將連線字串放置在程式碼內。

要注意的是，加密後的連線字串，無法直接使用，需要在程式碼中，進行解密。至於連線字串的加解密方式，網路上已經有很多範例，這邊就不再贅述。例如：[為EF連線字串加密的簡單範例-黑暗執行緒](https://blog.darkthread.net/blog/encrypt-ef-connstring/)。

基本上，Dockerfile 的調整方式，與作法一相同，只是在環境變數的設定上，改為加密後的連線字串。

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app

# 加入環境變數
ENV ConnectionStrings

EXPOSE 80
EXPOSE 443

// 略 ...
```

在完成上述的調整後，就可以使用 `docker run` 的方式，啟動 Container。

```bash
docker run -d -p 5000:80 --name webapi -e ConnectionStrings={加密後的連線字串} lab/webapi
```

#### 作法三、以 Command Argument 傳遞加密後連線字串

```bash
docker run -d -p 5000:80 --name webapi -e lab/webapi --ConnectionStrings={加密後的連線字串}
```

#### 作法四、掛載文件檔

使用 Volume 的方式，將連線字串放置在檔案內，並在程式碼中，讀取檔案內的連線字串

```C#
```

### 憑證資料

接著是 Dockerfile 內的設定，將檔案掛載到容器內的指定位置

```Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app

# 存放憑證的 Volume 位置
VOLUME /app/cert

EXPOSE 80
EXPOSE 443
```

## FAQ

### 為何 Webapi Container 無法連線本機另一個 Container 的資料庫？

原因如同 [GitLab CI 實作記錄(1) - 使用 Docker 在同台主機運行 GitLab 與 GitLab-Runner]({{< ref "..\..\DevOps\gitlab_ci_same_host\index.md" >}}) 中提到的 Docker Network 的觀念問題。

在同一台主機上，啟動 Container 卻不指定 Network 的情況下，會使用名為 `bridge` 的預設 Network。

而加預設 Network 內的 Container ，會被自動分配一個網段為 `172.17.0.0/16` 的 IP 位置，此時要連線到其他 Container，必須要知道對方的 IP 位置。

這是因為預設 Network 不支援 Docker 內的 DNS 功能，因此無法透過 Container 的名稱來連線。

```bash
docker run -d --name -e host=localhost -e database=demo -e user_id=test -e password=test -p 5001:80 lab/webapi
```

上述指令中，指定 Webapi 的 container 的環境變數 `host` 為 `localhost`，但實際上，對於 Webapi 的 container 來說，`localhost` 是指是自己的 IP 位置，而非使用者的主機。更不用說資料庫的 container 了。

當 Webapi 的 container 指定連線的 Host 為 `localhost` 時，實際上是連線到 Webapi container 自己，而非資料庫的 container。

對此，有兩種解決方式：

#### 解法一、使用資料庫的 container 的 IP 位置

- 使用資料庫的 container 的 IP 位置，而非 `localhost`。

```bash
# 查詢 Webapi 的 container 的 IP 位置
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' {db_container_name}
```

// 加圖

#### 解法二、新增 Network 並使用 Docker 內的 DNS 功能

將 Webapi 的 container 與資料庫的 container 都加入到同一個 Network 內，並指定相同的網段，這樣兩個 Container 就可以互相連線了。

只要手動增加一個類型為 `Bridge` 的 Network，它就會自動支援 Docker 內的 DNS 功能。

然後先把資料庫的 Container 切換到新的 Network 內，再啟動 Webapi 的 Container，就可以使用資料庫的 Container 的名稱來連線了。

```bash
# 建立 Network
docker network create --driver bridge {network_name}

# 將資料庫的 Container 切換到新的 Network 內
docker network connect {network_name} {db_container_name}

# 啟動 Webapi 的 Container
docker run -d --name -e host={db_container_name} -e database=demo -e user_id=test -e password=test -p 5001:80 lab/webapi --network {network_name}
```

## 延伸閱讀

▶ 站內文章

- [Docker 操作簡介 - command / dockerfile / docker-compose]({{< ref "..\..\Series\build-automated-deploy\docker_operate\index.md" >}})
- [使用 dotnet-ef 建立 PostgreSQL 的 DBContext]({{< ref "..\..\Develop\efcore-postgresql\index.md" >}})
- [使用 dotnet-ef 建立 SQL Server on Docker 的 DBContext]({{< ref "..\..\Develop\efcore-docker-sqlserver\index.md" >}})
- [Docker | 建立 PostgreSQL 的 container 時，同時完成資料庫的初始化]({{< ref "..\postgres-docker-initial-script\index.md" >}})

▶ 站外文章

- [ConnectionStrings.com](https://www.connectionstrings.com/)
- [為EF連線字串加密的簡單範例-黑暗執行緒](https://blog.darkthread.net/blog/encrypt-ef-connstring/)
