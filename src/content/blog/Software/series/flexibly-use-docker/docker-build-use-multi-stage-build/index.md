---
title: 靈活運用 Docker - 建置 Docker Image 時，使用 Multi-Stage Build 減少不必要的資料
description: 「靈活運用 Docker 打造高效的容器化應用環境」系列的文章之一。記錄在建置 Docker Image 時，如何使用 Multi-Stage build 的方式，有效的減少產出 Artfact 的大小。後續不定期更新內容。
date: 2023-12-02T09:09:31+08:00
lastmod: 2024-02-27T10:55:37+08:00
tags:
  - Docker
categories:
  - Container
keywords:
  - Container
  - Docker
  - docker build
  - Multi-Stage Build
slug: docker-build-use-multi-stage-build
series: 靈活運用 Docker 打造高效的容器化應用環境
---

> 本篇為 [靈活運用 Docker 打造高效的容器化應用環境](../flexibly-use-docker-foreword/index.md) 系列的文章之一。內容由現有的文章中，將相關的內容整理於此。後續不定期編修與更新內容。

> 🔖 長話短說 🔖
> Multi-Stage Build 分階段建置 Image,可以減少 Image 大小,也降低資料外洩的風險。
### Multi-Stage Build

在 Visual studio 建立 .NET 專案時，若有勾選 support Docker 的選項。在建立專案的同時，一併建立 `Dockerfile` 的檔案，其內容的編排，就是使用 `Multi-stage` 的方式。

在這個 Dockerfile 內的描述，會分成四個階段來進行建置。可以使用 `AS` 為每個階段命名:

- 首先，建立運行發佈程式所需要的 Base Image。
- 再來，建立建置環境用的影像檔，裡面包含.NET SDK 與 程式碼，並確認程式碼可以正常建置。
- 第三步，將第二步建置過的程式碼，打包成發佈版本。
- 最後，將發佈版本的程式，放入運行環境的 Base Image 內。

```dockerfile
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

若要確認每一個階段的 Image 內容，可以使用 `docker image history` 指令，來查看。

也可以使用 `docker scan` 指令，來進行掃描，確認是否有安全性的問題。

## 補充資料

▶ 延伸閱讀

- [使用 Docker 建置 ASP.NET Webapi 的 Image](../../../aspnet-webapi-containerized/index.md)

▶ 外部文章

- [构建多系统架构支持的 Docker 镜像 - 徐靖峰|个人博客](https://www.cnkirito.moe/docker-multi-arch/)
- [使用 buildx 构建跨平台镜像 - 知乎](https://zhuanlan.zhihu.com/p/622399482)
- [[教學] 用 Docker 的 buildx 輕鬆多架構編譯 (multi-architecture build) - 清新下午茶](https://blog.jks.coffee/docker-multi-architecture-build/)
