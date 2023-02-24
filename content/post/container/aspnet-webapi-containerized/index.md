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
date: 2023-02-24T08:47:12.279Z
slug: docker-build-aspnet-webapi
draft: true
---


<!--more-->

## 簡介 Dockerfile

如果這章節的內容很熟悉，可以直接跳過，

#### build image

```dockerfile
From 
```

#### multi-stage build 的方式

在建立 .NET Project 時，若有選擇支援 Docker，工具會自動協助建立一個 `Dockerfile` ，內容如下。

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["demo/demo.csproj", "demo/"]
RUN dotnet restore "demo/demo.csproj"
COPY . .
WORKDIR "/src/demo"
RUN dotnet build "demo.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "demo.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "demo.dll"]

```

我們會取得最後產出的 Image 使用，這個是 Multi-Stage Build, 多階段建置的作法

好處是可以減少不必要的空間消息與資訊鋪出

// 建置過程訊息如下


## Log 的存取

1. 首先, 先確定 ASP.NET 的存放位置
2. 在 dockerfile 建立 `VOLUME`, 已提供 docker run 時, 外部 mount 的位置

```C#
// exmple code
```


```dockerfile
VOLUME /app/logs
```


## 機敏性資料的處理



### 連線字串

調整並使用環境變數

```dockerfile
```

##### 作法一, 直接傳入連線字串

##### 作法二: 多個變數




### 憑證


### 安全性掃描

```shell
docker scan
```

## 環境變數與 appsetting.json 的設定


## 問題 F&A

1. 為什麼連不到同一台主機的 DB Container？

可參考 []

3. 

## 最終結果

## 延伸閱讀