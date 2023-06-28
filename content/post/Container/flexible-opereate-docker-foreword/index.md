---
title: 靈活運用 Docker - 打造高效的容器化應用環境
description: 
date: 2023-06-28T09:44:39+08:00
lastmod: 2023-06-28T12:14:55+08:00
tags: 
- Container
- Docker
categories: 
- 系列文章
- container
keywords: 
- Docker
slug: flexible-opereate-docker-foreword
toc: false
---

目前有許多文章的內容，都包含部份的 Docker 操作指令。也因為如此，所有的 Docker 指令與說明散在各處，所以起心動念，整理完整的 Docker 操作與應用的系列文章。

<!--more-->

系統文章大綱暫定如下，後續會隨撰寫過程，來進行增修。


**觀念**

- 靈活運用 Docker - Container 觀念與 VM 的差異

**IMAGE / CONTAINER 操作**

- 靈活運用 Docker - Docker 的安裝
- 靈活運用 Docker - Image 流程與架構
- 靈活運用 Docker - Container 操作與參數
- 靈活運用 Docker - 使用 Mount 或 Volume 來確保資料的持久性
- 靈活運用 Docker - docker-compose 統一操作 Container Group
- 靈活運用 Docker - 無法使用 Registry 的 Image 操作

**IMAGE 的建立**

- 靈活運用 Docker - 簡易建立 IMAGE
- 靈活運用 Docker - 使用 Multi-Build 減少不必要的資料
- 靈活運用 Docker - 修改現有的 IMAGE
- 靈活運用 Docker - Image 的安全性

**Docker Network**

- 靈活運用 Docker - 網路類型與應用情境
- 靈活運用 Docker - 建立三層架構的網站服務

**CONTAINER 監控與維運**

- 靈活運用 Docker - 備份
- 靈活運用 Docker - 監控

**CONTAINER 的應用**

- 靈活運用 Docker - 配合 K6 與 Docker 進行自動化測試
- 靈活運用 Docker - 快速建立與回溯不同版本的環境

## 補充資料

▶ 延伸閱讀

- [Docker 操作簡介]({{< ref "../../Series/build-automated-deploy/docker-operate/index.md" >}})
- [Container 簡介]({{< ref "../../Series/build-automated-deploy/container-intro/index.md" >}})
- [GitLab CI 實作記錄(1) - 使用 Docker 在同台主機運行 GitLab 與 GitLab-Runner](../../Publish/DevOps/GitLab%20CI%20實作記錄(1)%20-%20使用%20Docker%20在同台主機運行%20GitLab%20與%20GitLab-Runner.md)
- [GitLab CI 實作記錄(2) - Gitlab CI 的私有環境建置](../../Publish/DevOps/GitLab%20CI%20實作記錄(2)%20-%20Gitlab%20CI%20的私有環境建置.md)
- [使用 Docker 建置 ASP.NET Webapi 的 Image]({{< ref "../aspnet-webapi-containerized/index.md" >}})
- [淺談 YAML 格式]({{< ref "../../Series/build-automated-deploy/yaml/index.md" >}})