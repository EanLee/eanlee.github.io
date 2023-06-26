---
title: 從零開始土炮 MQ (持續更新中)
description: 從零開始土炮 Message Queue 序言
date: 2022-06-14T07:12:18.564Z
keywords:
  - Message Queue
  - Queue
categories:
  - 系列文章
lastmod: 2023-01-09T03:37:10.009Z
slug: foreword
---

> 將原本參與 [第 11 屆(2020) iThome 鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/2172) 的文章，再加以整理與補充。

近幾年參與開發的軟體之中，大量使用到佇列(Queue)的技術與觀念。從同步與非同步存取 Queue；利用 Queue 與 Dispatch 組合，進行備援處理的機制；大量資料的接收與轉發等等。另一方面，微服務與服務解耦的議題，訊息佇列（Message Queue）的使用頻率也逐年提升。

以傻子的精神，土幹一個 Message Queue，利用這個過程，好好的深入了解 Message Queue 的概念。

<!--more-->

事實上，隨著實作的進行，越會覺得，Message Queue 包含了各方面知識，結合許多基本功與理論，才行誕生出來的成果。

- 從基本的`演算法`、`資料結構`、`同步\非同步處理`、`Design Pattern`
- 資料傳輸用的協定，如 `gRPC`、 `AMQP` 、`MQTT`
- 維持系統穩定的 `不死性`、`獨立性`、`擴充性`、`監控`
- 分散式系統的 `AICD`、`狀態機`
- 分派任務的 `QoS`
- ...

相關知識族繁不及備載，因此在土炮過程中，遇到很多沒有深入理解的知識關卡，而上面提到的關鍵字，都是接下來會遇到的難關。如果有理解不正確或更好的作法，也請各位給與指點。

同時配合內容，使用 .NET Core 進行 Side Project 開發，專案名稱私心取為 *Flora Message Queue, FloraMQ* 。

就算目前這個 MQ 不管在實用性或性能上，離真正能應用於商業環境還有一大段距離。但只要持續投入，它一定可以像植物一樣慢慢的成長。

沒有一個軟體系統，是一開始就可以達到完美設計。而是有了基本功能後，隨著環境的演進，自然的產生不同的需求。隨著克服一個一個的需求，逐漸的進行軟體的迭代，盡可能的朝向完美前進。

從 Queue 的基本概念作為切入點，隨著需求的不同，持續的改進，從單一的模組，演進為一個函式庫。再從函式庫，成長為分散式的架構的 Message Queue。

---

## 文章目次

### 基礎篇

- [佇列 Queue]({{< ref "../queue/index.md" >}})
  - 說明 Queue、Circle Queue、Priority Queue、Linked List 的差異
- 佇列的應用
  - 生產者與消費者模型 (producer-consumers pattern)
  - 鎖定機制: Lock、Mutex、Semaphore
  - 原子性、有序性、可見性
- Router 路由器
- Dispatcher 分派機制
  - 同質性與異質性分派
  - 被動式與主動式分派
  - 優先性分派
- Queue、Router、Dispatcher 整合
  - 將 Queue、Router、Dispatcher 各功能串通，讓功能可以正常的運行。
  - 資料的持久性。

### 進階篇

- 通訊與協定
  - Remote Procedure Call, RPC
  - Advanced Message Queuing Protocol, AMQP
  - Message Queuing Telemetry Transport, MQTT
- 需求與服務框架規劃
  - 監控
  - 軔性 Resilience
  - 延伸性 Scale
