---
title: 從零開始建立自動化發佈的流水線(持續搬移中)
description: 這是一位 SOHO 族從無到有、一步一步建立自己的 CI/CD 的故事。隨著故事的推進，將逐一提及版控、測試、訊息通知、CI/CD、Container
  等概念，最終將其串接為一條自動化發佈的流水線。
keywords:
  - CI/CD
  - version control
  - Docker
  - 版控
categories:
  - 系列文章
date: 2022-06-20T06:58:08.103Z
lastmod: 2023-01-15T16:08:36.674Z
slug: build-ci-cd-from-scratch
toc: false
---

> 將 [2019 iT 邦幫忙鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/1906) 的文章搬遷到此，同時有些內部可能已經過時，在搬移的過程中，會重新針對內容加以整併與補充。

以一位 SOHO 族從無到有、一步一步建立自己的 CI/CD 的故事。伴隨著故事的發展，逐一建構一條從版控到發佈的自動化作業，會逐一帶出四個階段的主題。

- 程式碼版本控管
- CI/CD Server 的架設
- 自動發佈最新版本的軟體
- Container

<!--more-->

## 故事背景

吉米獨立接案己經有三年的經驗，其中有個長期合作案，內容是與 C 公司協同開發一套影像識別軟體，並在每一季，針對新的功能需求，持續開發。

隨著 C 公司將軟體銷售到不同客戶單位，吉米也接到許多客制化功能的延伸案，也都順利完成結案。

但是最近 C 公司有一個很重要的需求，就是在一年多前釋出的特定版本進行客制化。就這一個簡單的需求，卻讓吉米傷透腦筋。

原因竟然是因為客戶要求的特定版本，吉米當時為了趕工，釋出後，忘了備份該版本原始碼。

最後，吉米找出距離特定版本，時間最接近的原始碼備份檔案，與 C 公司的協助下，好不容易的完成這個需求。

事後，吉米為了不要讓這樣的事件再次發生，決定跟之前在研討會上認識的 Eric 請教。

## 文章目次

### 版控篇

- [程式碼版控 - 觀念與 Git 簡述]({{< ref "../version_control/index.md">}})
- [程式碼托管平台 - GitHub/BitBucket/Azure DevOps]({{< ref "../remote-repository/index.md">}})

### 持續整合

- [踏入 CI/CD 的世界 - 觀念篇]({{< ref "../cicd_concept/index.md">}})

- [使用 Travis CI/GitHub Action 進行持續整合]({{< ref "../ci-github-action-travis-ci/index.md" >}})

  介紹使用 Travis CI 與 GitHub 內建的 GitHub Action 的設定方式。

- [使用 Jenkins/Azure Pipeline 進行持續整合]({{< ref "../ci-azure-jenkins/index.md" >}})

  介紹使用 Azure DevOps 內的 Azure Pipeline，以及使用 Azure VM 去建立 Jenkins。在 Azure VM 的部份，會簡單介紹雲端運算的概念(Cloud Compute)。

- [使用 CI 進行自動化測試]({{< ref "../ci-automated-unit-test/index.md">}})

### 訊息通知

- CI 訊息通知 - Line
- 訊息通知 - E-mail/Microsoft Teams

### 持續發佈

- [持續發佈軟體到 Dropbox 與 Azure App Service]({{< ref "../cd-dropbox-and-azure/index.md">}})

  嘗試把軟體打包上傳到 Dropbox 以及 Azure App Service

### Container

- [部署新境界 - 使用 Container 簡化流程]({{< ref "../container_intro/index.md">}})
  
  介紹 Container 與 VM 的差異，以及 Docker for Windows 的安裝方式。
  
- [Docker 操作簡介 - command / dockerfile / docker-compose]({{< ref "../docker_operate/index.md">}})
  
  介紹 Docker 常用的指令，並簡單介紹 Dockerfile 與 Docker Compose 的用法。

- [使用 Container 建立 CI 所需要的建置環境]({{< ref "../docker_and_ci/index.md" >}})
  
  介紹 Travis CI、Azure DevOps、Jenkins 如何配合 docker 的概念，使用 container 進行 CI 動作。

- [使用 Azure Pipelines / Jenkins 來建立 Docker image]({{< ref "../ci_build_image/index.md" >}})
  
  簡介使用 Azure Devops、Jenkins 去建立 Docker image 的作法。

### 額外補充

- [淺談 YAML 格式]({{< ref "../yaml/index.md">}})
