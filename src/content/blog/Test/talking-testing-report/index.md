﻿---
title: 淺談負載測試/壓力測試/效能測試報告
date: 2023-01-06T13:36:16+08:00
categories:
  - 測試
  - 開發雜談
tags:
  - 負載測試
description: 使用壓力測試/負載測試來驗證系統的穩健度後，接著就是要整理報告，跟其他相關人員同步這次的測試結果，或是系統優化前後的差異。在這報告應該要注意或著重的部份有那些？
keywords:
  - 壓力測試
  - 負載測試
  - 效能測試
slug: talking-testing-report
lastmod: 2023-06-28T10:10:44+08:00
---

當我們好不容易完成了系統的壓力測試，這時候，我們可能需要整理測試數據給相關人員查看，或是報告。

那在這份報告中，需要要揭露那些資訊呢? 或者說, 受眾會想要看到什麼？這份報告會因為不同的測試目的，呈現的內容與重點也會有所不同。

接著，我們來聊聊撰寫壓力測試報告的時候，在這份報告裡面會具備哪一些要素。

<!--more-->

個人認為測試報告，大概由三個部份組成

1. 第一部分、測試目的、環境與架構
2. 第二部分、測試案例、策略與測試結果
3. 第三部分、期望藉由測試的結果，來幫助我們進行什麼樣的後續動作

## 共通資訊

### 測試的目的

在進行測試之前，需要知道這次測試的目的為何？

- 是要確認目前系統正常提供服務的極限值？作為設定系統警報水位的參考值。
- 要找出目前可能發生的 [單點故障](../../Nouns/spof/index.md) 的位置或瓶頸點？作為系統效能調教或改善的依據。

不同的目的，測試的條件、計劃、與測試過程所關注的重點都有所不同，這些都會影響或決定產出的結告內容。

只有知道前進的目標，才有辦法掌握前進的方向。

### 測試環境

首先，從報告中，可以理解到測試當下的系統架構、機器規格、網路、資料庫等設定。以便後續回顧或覆盤時，便於釐清與發掘不足或待改善的環節。

#### 系統架構圖

在考量測試的目的後，我們可能會對現有的系統加以調整，以便於取得測試的結果。

因為測試時的系統架構與現在的架構有所不同，最好是將正式系統架構圖與測試系統架構圖兩者進行比對。讓其他人可以知道兩者的差異。

至少，也應註明測試時的系統架構圖，測試當下的系統服務配置情況、如負載測試軟體([Apache JMeter - Apache JMeter™](https://jmeter.apache.org/)、[Grafana K6](https://k6.io/)) 所使用的硬體主機、網路位置、有無使用 Mock API 等。

以便其他人，更精確的知道我們是怎麼樣去測試的。

#### 機器規格

大家都知道，當硬體規格越好，處理資料的效率就越好。

避免在同一次的測試專案中，不同硬體規格造成的結果數據落差。因此，必須清楚說明測試當下，所使用的機器的等級，例如CPU、記憶體、硬碟 I/O。

#### 相依的系統變數

一般而言，待測試的系統不太可能獨立運行，有可能需要依賴第三方服務或是資料庫等。

當測試計劃中，有調整程式碼、或是使用 Mock API 來模擬第三方服務，也需要特別的註明如此實作的原因與目的。

再者，若測試的過程中，系統需要大量與資料庫進行互動，也必須特別說明，目前的測試環境中，是基於資料庫存在多少資料量的前提下，進行測試。

### 測試策略

在不同的測試方式，測試案例的設計的側重點也不同。

使用壓力測試進行系統穩定性和可靠性的驗證，並找出最大乘載量時。所採用的測試策略可能就是漸進式的增加負載強度。

使用負載測試，在確保正常穩定提供服務的前提下，來評估系統的當前性能，例如 TPS (Transactions Per Second)、QPS (Queries Per Second)。所採用的測試策略，就可能是固定時間內，持續固定的負戴強度。

而效能測試的的測試策略，基本上與負戴測試相似。

## 負載測試/ 效能測試 / 壓力測試的關注點

### 負載測試

在負載測試中，我們關注的是穩定提供服務的前提下，各子系統/組件的資源使用率、處理效率。

就會特別的注意硬體裝置的 CPU / Memory 的使用率、Disk I/O、網路使用的頻寬。並與負載強度進行匹配。

### 效能測試

在效能測試中，我們關注的是穩定提供服務的前提下，各子系統/組件的響應時間，是否能符合或優於設定的閾值。

此時，我們關注的地方，就是各子系統 / 組件的互動間，所需的處理反應時間。並借此發掘可優化或改善的瓶頸點。

### 壓力測試

在壓力測試，關注的在何種的負載強度下，系統無法正常提供服務。

雖然造成系統無法穩定提供服務的可能性很多，但大多是硬體資源耗盡、等待響應時間過久。

因此，主要關注的對象與負載測試相同，硬體裝置的 CPU / Memory 的使用率、Disk I/O、網路使用的頻寬。

## 報告的結論

總而言之，不管是那種測試，都只是一個過程。一個將系統能力加以量化的過程。

所以需要針對測試過程中，收集到的數據，加以分析、整理為有用的資訊，才能有效提供決策用的資訊。

若測試目的，想要使用壓力測試，找出系統的最大乘載量，以便於設定系統警報或 Auto Scale 的水位。在結論的部份，就必須說明結果與建議的警示水位。

若測試目的，是想要用負載測試，來證實目前的系統服務，符合需要要求的乘載量。就可以提出實際的證明數據。

若測試目的，是想要借由效能測試，來改善現行系統的服務能力。那在結論的部份，就可以進行系統改善前後的數據比較，點出效能提升了多少？或是相同的效能下，節省了多少的成本。

另外，請盡可能以圖表的方式呈現，不然一堆的數據資料，不易明確表達重點。

## 延伸閱讀

1. [亂聊壓力測試/負載測試到底要做什麼?](../what-does-load-testing-do/index.md)
2. [Introduction (k6.io)](https://k6.io/docs/test-types/introduction/)
3. [Performance Testing vs. Load Testing vs. Stress Testing | Blazemeter by Perforce](https://www.blazemeter.com/blog/performance-testing-vs-load-testing-vs-stress-testing)
