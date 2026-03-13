---
title: 問題排除的下一階段：從單一 Log 到建立 Telemetry (遙測) 的可觀測性思維
description: 系統出問題只看 Log 夠嗎？當微服務架構越來越複雜，我們需要建立完整的 Telemetry (遙測) 思維。本文帶你認識可觀測性三大基石：Logs, Metrics, Traces，以及實務上的使用情境。
date: 2023-01-16T07:43:34+08:00
lastmod: 2026-03-14T02:31:34+08:00
tags:
  - Logging
  - 系統架構
  - 可觀測性
  - Telemetry
categories:
  - 軟體開發
  - 開發雜談
keywords:
  - Telemetry
  - 可觀測性
  - Logs
  - Metrics
  - Traces
  - 問題排除
  - Observability
  - 分散式追蹤 (Distributed Tracing)
  - 系統監控
  - 微服務維運
slug: from-logging-to-telemetry-observability
epic: software
---
>這篇文章的草稿在 2023 年寫了一半，一放又是兩年。
>
>2025 年 7 月，在完成 [系統開發實務對談記錄：Log 與 Error Handling](../log-and-error-handling-the-foundation-of-buildin-observable-systems/index.md) 後，打鐵趁熱，重新把這篇文章補完。
>
>2026 年，但回顧文章是否要調整時，發現這篇內容與上一篇的內容大量重複，因此決定調整方向，將原本的內容精簡，並進一步補充關於 Telemetry (遙測) 的思維。

若想了解實務上 Log 該怎麼分級、該記錄哪些欄位，以及 Error Handling 的最佳實踐，建議先去閱讀上面提過的那篇對談紀錄，確保對 Log 有足夠的認識後，再繼續往下閱讀。

當系統架構越來越複雜、微服務越來越多時，單純依賴 Log 往往會讓我們在排查問題時陷入「見樹不見林」的窘境。

所以接下來，我們將把視角拉高，從上帝視角來看見全貌，更有效率的掌握異常事故的脈絡。為此，我們需要進入下一個階段：建立 **Telemetry (遙測)** 的可觀測性思維。

> 🔖 長話短說 🔖
>
> - **從 Log 到 可觀測性 (Observability)**：Log 只是手段，我們的最終目標是即使不看原始碼，也能透過系統輸出的數據，了解系統內部的健康狀態。
> - **Telemetry 三大基石**：
>   - **Logs (日誌)**：記錄「發生了什麼事」，提供最詳細的現場脈絡。
>   - **Metrics (指標)**：記錄「系統的健康趨勢」，用數字告訴你整體表現。
>   - **Traces (分散式追蹤)**：記錄「請求的流向」，幫你找出分散架構中的效能瓶頸。
> - **實務情境不可少**：無論是問題排除、效能優化還是營運監控，三大基石的靈活搭配才是發揮 Telemetry 價值的關鍵。

<!--more-->

## 當單一 Log 已經不夠用

在單體架構 (Monolithic) 的時代，一台伺服器、一個資料庫，出了問題通常去翻那台機器的 Error Log，搭配一下 Stack Trace，大概就能鎖定問題點。

但隨著系統演進到微服務 (Microservices) 或雲原生 (Cloud Native) 架構，一個使用者的請求可能會穿梭過 API Gateway、Auth Service、Order Service，最後才寫入 Database。

這時候如果使用者抱怨「結帳失敗」，你該去查哪個服務的 Log？

如果你只有散落在各個節點的 Log，排查問題就會像是在大海撈針。這就是為什麼我們不能只談 Logging，而必須談 **Telemetry (遙測)** 與 **可觀測性 (Observability)**。

## 什麼是 Telemetry (遙測)？

在軟體工程中，**可觀測性 (Observability)** 指的是「透過系統外部輸出的數據，來理解系統內部狀態的能力」。

而 **Telemetry (遙測)**，就是收集並傳輸這些數據的過程與技術。要建立系統的可觀測性，業界公認有三大基石 (The Three Pillars of Observability)：**Logs (日誌)**、**Metrics (指標)**、**Traces (分散式追蹤)**。

它們各自扮演不同的角色，卻又互補不足。

### 1. Logs (日誌)：案發現場的詳細紀錄

**Logs 記錄了離散的事件，告訴我們「發生了什麼事」。**

在 [系統開發實務對談記錄：Log 與 Error Handling](../log-and-error-handling-the-foundation-of-buildin-observable-systems/index.md) 中我們有深入討論過，好的結構化 Log 可以提供 Exception Type、Message、Stack Trace 以及 UserId 等詳細的上下文資訊。

- **優點**：提供最豐富、最深度的上下文細節，是找出 Bug 根本原因 (Root Cause) 的最終武器。
- **缺點**：資料量龐大，難以宏觀地看出系統的整體趨勢。如果沒有經過良好的結構化處理，很難關聯不同服務間的 Log。

### 2. Metrics (指標)：掌握系統的健康趨勢

**Metrics 是一段時間內聚合 (Aggregated) 的數值資料，告訴我們「系統的整體表現如何」。**

它通常包含時間戳記、數值以及一些標籤 (Tags/Labels)。常見的 Metrics 包括：

- **基礎設施層**：CPU 使用率、記憶體消耗、網路流量。
- **應用程式層**：API 的 QPS (每秒請求數)、Error Rate (錯誤率)、Latency (回應時間，通常看 P95 或 P99)。
- **業務邏輯層**：每分鐘成立的訂單數、活躍使用者數。

Metrics 的重點在於**趨勢與告警**。

- **優點**：資料量小、儲存成本低，非常適合用來做視覺化儀表板 (Dashboard) 以及設定自動化告警 (Alerting)。
- **缺點**：當指標異常時（例如 Error Rate 飆高），Metrics 只能告訴你「出事了」，卻無法告訴你「為什麼出事」，還是得回去翻 Log 或 Trace。

### 3. Traces (分散式追蹤)：看見請求的流向

**Traces 記錄了一個請求 (Request) 在分散式系統中穿梭的完整軌跡，告訴我們「請求去了哪裡，花了多少時間」。**

在微服務架構中，一個使用者請求會產生一個唯一的 `TraceId`。當請求經過 A 服務、B 服務、C 服務時，每個服務都會產生一個包含這個 `TraceId` 的 Span (跨度)，並記錄起始與結束時間。

- **優點**：能清晰地描繪出服務之間的依賴關係，是抓出效能瓶頸（究竟是哪個微服務拖慢了整體時間？）的最佳工具。
- **缺點**：實作成本較高，通常需要侵入程式碼或透過 OpenTelemetry 等框架來進行埋點，且資料量也相當龐大（實務上常採用採樣 Sampling 機制來降低儲存成本）。

---

## 實務上的搭配與使用情境

這三大基石不是獨立存在的，將它們組合起來，才能發揮最大的威力。讓我們透過幾個實務情境來看看它們如何協作。

### 情境一：問題排除 (Troubleshooting) - 處理結帳失敗客訴

當客服回報有幾位使用者反映無法結帳時，我們不再是像無頭蒼蠅一樣去撈 Log。

1. **Metrics (發現異常)**：我們先查看監控看板，發現結帳 API 的 Error Rate 指標在過去 10 分鐘內確實有異常飆高的趨勢。
2. **Traces (鎖定範圍)**：我們從異常的時段中，抓出一筆結帳失敗請求的 `TraceId`。透過分散式追蹤的視覺化圖表，我們看到請求成功經過了 Gateway 和 Auth Service，但在呼叫 Payment Service 時花費了整整 5 秒，最後以 500 錯誤收場。
3. **Logs (找出根因)**：範圍已經縮小到 Payment Service。我們拿著同一個 `TraceId` 去搜尋 Payment Service 的 Log，很快就發現了一筆 Error Log 記錄著 `SQL Timeout Exception`，原來是背後的資料庫因為某個長時間的鎖表 (Deadlock) 導致查詢超時。

**這就是經典的排查路徑：Metrics 發現問題 -> Traces 定位瓶頸 -> Logs 找出根因。**

### 情境二：效能優化 (Performance Optimization) - 拯救緩慢的報表頁面

業務單位反應，月底拉報表的頁面轉圈圈轉得特別久。

1. **Metrics**：查看 P95 Latency 監控，發現報表 API 的回應時間高達 15 秒。
2. **Traces**：調出報表 API 的 Trace，發現整個 15 秒的時間裡，有 12 秒都卡在某個迴圈呼叫 User Service 取拿會員資料的 Span 身上。（經典的 N+1 Query 問題）
3. **優化行動**：開發人員針對這個瓶頸進行修復，將迴圈呼叫改為批次查詢 (Batch Query) 並加上快取機制。上線後，再次觀察 Metrics，確認 P95 Latency 降回 1 秒內。

### 情境三：營運監控 (Business Monitoring) - 確保商業活動順利

不僅僅是工程師，Telemetry 對營運也有巨大價值。

在雙 11 大促期間，我們不只監控 CPU 和 Error Rate，更監控**商業 Metrics**，像是「每分鐘訂單成立數 (Orders per minute)」與「金流成功率」。

我們設定了一個規則：如果「每分鐘訂單數」低於歷史同期的均值 50%，或者「金流成功率」跌破 90%，就立刻透過 Slack 發出高危險級別的告警。

這能確保當系統默默發生邏輯錯誤（系統沒當機、沒有 Error Log，但結帳流程卡住）時，團隊能第一時間察覺並介入處理。

---

## 小結

回到我們最一開始的問題：Log 該怎麼寫？

在理解了 Telemetry 的全貌後，你會發現單獨討論 Log 往往容易陷入死胡同。我們應該將 Log 視為系統可觀測性藍圖中的一塊拼圖。

- 用 **Metrics** 建立防線，讓系統主動告訴我們哪裡生病了。
- 用 **Traces** 劃出地圖，讓我們在錯綜複雜的服務中不迷航。
- 用 **Logs** 提供顯微鏡，讓我們能對症下藥，精確拔除病灶。

從單純的「寫 Log 到文字檔」進化到「建立系統的 Telemetry 觀測網」，是每一個現代系統與開發團隊的必經之路。

## 補充資料

▶ 站內文章

- [開發實務對談：日誌 (Log) 記錄與錯誤處理 (Error Handling) 的最佳實踐](../log-and-error-handling-the-foundation-of-buildin-observable-systems/index.md)

▶ 外部文章

- [What is OpenTelemetry? | OpenTelemetry](https://opentelemetry.io/docs/what-is-opentelemetry/)
- [The Three Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/ch04.html)

---

💬 **參與討論**
從寫 Log 到建立完整的 Telemetry，你的團隊走到哪一步了呢？是還在單機看 TXT 檔，還是已經有了帥氣的 Grafana 看板？留言分享你們家的監控大招吧！
