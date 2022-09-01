---
title: GitLab CI 實作記錄(2) - Gitlab CI 的私有環境建置
tags:
  - GitLab
categories:
  - DevOps
keywords:
  - Docker
  - GitLab
  - Gitlab Runner
  - DevOps
draft: true
date: 2022-08-13T05:51:03.669Z
---

延續上一篇 [GitLab CI 實作記錄 - 使用 Docker 在同台主機運行 GitLab 與 GitLab-Runner]({{< ref "../gitlab_ci_same_host/index.md">}}) 的結果，接著要開始進行 GitLab CI 的環境架設。

架設的環境

- Gitlab EE
- Gitlab Runner ver.1.5.1
- OS: Ubuntu 20.4

<!--more-->

## 網路架設與規劃

在開始架設之前，有幾個要求點

- CI/CD 的主機不可以暴露於公開環境

![Netowrk arch](network_arch.png)

## 建立 Gitlab Server

直接使用 docker-compose 來架設 GitLab

``` yml
version: '3.6'
services:
  web:
    image: 'gitlab/gitlab-ee:latest'
    restart: always
    hostname: 'gitlab.mycode.it'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://gitlab.mycode.it'
        # Add any other gitlab.rb configuration here, each on its own line
    ports:
      - '80:80'
      - '443:443'
      - '22:22'
    volumes:
      - 'gitlab_data:/etc/gitlab'
      - 'gitlab_log:/var/log/gitlab'
      - 'gitlab_opt:/var/opt/gitlab'
    shm_size: '256m'

volumes:
gitlab_data:
gitlab_opt:
gitlab_log:
```

### 設定 Gitlab-Runner

GitLab-Runner 的安裝與註冊方式，可參考 [註冊 GitLab-Runner](({{< ref "../gitlab_ci_same_host/index.md##註冊-gitlab-runner">}})) 的操作。

但在這邊，我們需要配合要求，進行一些設定。

發現無法成功從 gitlab 拉 code 下來。
所以我們參考官網, 需要額外在 Gitlab-runner 的 etc\gitlab-runner\config.toml 中，加入參數 `clone-url`

## 防火牆與 NAT 的設定

## 補充資料

### 延伸閱讀

### 參考資料
