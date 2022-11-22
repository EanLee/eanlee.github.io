---
title: 聊聊架構 - 系統負載、分流與限制理論
date: 2022-07-26T09:35:47.106Z
description: 從軟體系統的負載來聊聊，在先天資源限制下，運用分流的機制，減輕系統的負載
keywords:
  - TOC
  - 限制理論
  - 系統負載
  - 分流
  - 80/20
categories:
  - 開發雜談
  - 架構
tags:
  - 思維模式
  - 系統架構
draft: false
---

無論技術決策或解決方案的選擇，經常因為現實環境造成的種種限制條件，導致無法直接使用最優解。需要基於限制條件下，進行相對應的妥協與方案的調整。

做為系統開發或維運人員，當系統遇到麻煩或困難或瓶頸時，所提出的解決方案或作法，需將先天的限制列入評估。試著在有限的的資源，想辦法得到最大的效率或收益。為此，需要試著找出造成麻煩的瓶頸，加以分析，最終得出解除瓶頸的方案。

若觀察的視角過小或過於局部，所找到的系統瓶頸，從整個系統視角評估，有時會發現，原先認為的瓶頸，並不是真正的瓶頸問題。為此，可以運用限制理論去找出問題環節，配合 80/20 法則找出影響力最大的點，然後處理它。

<!--more-->

## 情境

若今天有一個電商站台，採用三層式架構。其連線請求的資料流為 Web ➝ API ➝ 資料庫。

假設我們對系統的要求，首頁請求的響應時間應小於 1.5 秒。同時，需確保 300 人同時交易時，系統正常穩定的服務。

當少數人使用進入站台首頁時，系統可以在理想的時間內，將資料順利回傳到使用者的瀏覽器上。也可以順利的完成線上交易。

但進行壓測時發現，當首頁訪問人數提升到 300 QPS(Query Per Secend)時，發現首頁請求等待的時間變長，出現大量的錯誤，直接影響到站台的交易功能。

### 系統負載

![系統與使用率](origin.png)

此時，嘗試重現發現異常的情境。

使用壓測工具，模擬同一時間 300 人同時檢視首頁的同時，中間還穿插交易的請求。發現大量請求湧入時，會造成所有主機的 CPU/Memeory 資源使用率滿載。進一步造成大量連線逾時，造成交易失敗。**以業務與收益層面而言，這種情況一定不允許發生的。**

為解決這個方式，增加機器來分擔現行主機上的壓力，無疑是最快的方式，但是因為資金或交貨時間延誤等因素，目前無法立即擴充硬體主機。為此，必需進一步挖掘系統本身的效能。

以目前的資訊，可以評估 300 QPS 已超出系統最大負載量。

在無法額外增加機器的先決條件下，需盡可能的提升服務的穩定度，並解決當下的問題。讓系統可以支撐 300 人同時檢視首頁時，線上交易功能依然維持正常服務。

### 資料限制下的分析

在[限制理論](#限制理論)中提到的五步對焦法，提到要先找到系統的瓶頸點。

檢視原本架構，發現首頁所有的呈現的資料，都要從資料庫取得資料，就算是固定或久久才變更的資料，也要從 DB 取得。這對 DB 主機的 Loading 很大，而且浪費主機資源。

> 瓶頸點一：對資料庫過多重複的資料查詢，耗損主機資源。

接著發現，API 需等 DB 查詢結果，才能進行後續作業。當 DB 執行時間變慢，而 API 主機還持續送出查詢，造成 API 等候過程中，系統資源使用率上升。

> 瓶頸點二：API 需等得 DB 查詢結果回應，當回應時間緩慢，API 主機會花費大量資源等候回應。

再著，Web 首頁需要呼叫多支 API，只要其中一支 API 逾時，就會直接轉導到錯誤頁。

> 瓶頸點三：API 響應過久，Web 站台會直接中斷連線，轉導到錯誤頁。

乍看之下，直接調整 API 或 DB 效能，好像就可以達成目標了。

但只從系統面來找問題，可能有些偏頗，所以再從使用場景來分析。

一個消費者進入購物平台，可能有 80% 以上的時間都在瀏覽商品，但真正能為服務帶來價值(造成利益)的，只有在消費者進行購買交易的行為。而這行為可能不到使用者操作時間的 5%。

從使用者行為來分析，可以發現對 API 的從請求內容來看. 發現有大量的請求都與首頁、商品清單與商品頁相關。真正需要用到交易相關的 API 次數，不到總體請求量到 3~5%

依 [80/20 法則](#8020-法則) 交易請求的數量最小，確是可以為平台帶來最大利益的行為。所以 API 主機用 80% 的效能，來服務這 20 % 的交易，也是合理的。

到此，我們找出三個瓶頸時

- DB 的存取過於頻繁，DB 主機無法負擔
- API 主機服務，可能會能因為 DB 回應緩慢，造成負擔
- 非交易行為的 API 吃掉 API/DB 主機八成以上的資源。導到交易行為無法正常動作。

會發現這三個瓶頸，環環相扣。但最主要的問題在於過於大量的查詢作業，需要大量使用到 DB 資源，造成一連串的影響。

### 資料分流

最快而且不用調整服務架構的做法，當然是添加新的 API 主機與 DB 主機。交易行為與非交易行為分不同主機處理。說白了，就是用錢去拉服務的效能。

為解決這個方式，增加機器來分擔現行主機上的壓力，無疑是最快的方式，但是因為資金或交貨時間延誤等因素，目前無法立即擴充硬體主機。

所以這條路走不通。

只好再進一步的分析最大量的請求內容，評估有無辦法減少首頁的請求對 AP 主機或 DB 主機的負擔呢？當觀察這些 API 的行為與回應資料，發現它們資料內容大多重覆。

再者進一步分析資料的屬性，發現這些資料的更新頻率不高，基本上只有新商品上架或宣傳文案更新時，才會有所異動。

依據資料的特性，可以將需重覆存取的固定資料，先暫存於特定位置，當有存取的需要時，直接到暫存位置取得資料即可，避免每次都要跟資料庫要資料。同時，還要確保暫存資料的有效性，並可以手動或定期的去跟資料庫要最新的資料，更新暫存資料，避免取到舊的資料。

這就是俗稱的 Cache 機制，運用該機制，進行資料的分流，減少直接對資料庫重覆資料的存取。

### 優化後的架構

![加入 Cache 的架構](use_cache.png)

在調整服務架構後，對於首頁相關的請求，可以直接從 Cache 取得資料，當 Cache 內資料不存在或過期了，再去跟 DB 取資料。

而 API 主機與 DB 主機，就可專心處理大部份與交易相關的請求。

題外話，可能會有人說為什麼不用 CDN？ 用 CDN 就可以處理掉這個問題了。主要是基於風險控管，我們無法保證使用的 CDN 廠商永遠不會出問題，萬一發生異常，那很有可能直接影響到我們的服務。

## 限制理論

限制理論(Theory of Constraints，TOC)是高德拉特想出來解決系統問題的方法。他的解題步驟是 (Five Focusing Steps，五步聚焦法):

步驟一、找出系統的瓶頸。

步驟二、決定如何利用瓶頸。

步驟三、根據上述的決定，調整其他的一切。

步驟四、把系統的的瓶頸鬆綁。(就是解決它)

步驟五、假如步驟四打破了系統原有的瓶頸，那麼就回到步驟一。

TOC 也是一套能用邏輯、系統的思考方式去解答我們在持續改善時，所產生以下的問題：

　　　1. 要改變什麼？(What to Change？)

　　　2. 要改變成什麼？(What to Change to？)

　　　3. 如何改變？(How to Cause the Change？)

## 80/20 法則

儘管 80/20 法則幾乎可應用在每一個產業，但帕雷托法則卻最常用於商業和經濟。這是因為 80/20 法則有助於判斷應該專心致志於哪些地方，才能將輸出最大化。

帕雷托法則的基礎概念是，80% 的結果來自於 20% 的行動。若有任何一種能夠分解成更小部分的工作，帕雷托法則就能協助您辨別，哪一部分的工作最具影響力。

## 延伸閱讀

### 限制理論

- [目標](https://www.books.com.tw/products/0010898249?loc=P_0004_082)
- [工程師的機會成本](https://ruddyblog.wordpress.com/2020/09/14/%e5%b7%a5%e7%a8%8b%e5%b8%ab%e7%9a%84%e6%a9%9f%e6%9c%83%e6%88%90%e6%9c%ac/)

### 80/20 法則

- [80/20 法則：只要有資源分配問題，你就用得上它](https://www.managertoday.com.tw/articles/view/1211)
- [《80/20 法則》：關鍵少數 vs. 無用多數，向混沌理論找答案](https://www.thenewslens.com/article/111804/fullpage)