---
title: 打通 Queue、Router、Dispatcher
draft: true
slug: 打通-queue、router、dispatcher
date: 2023-01-18T08:19:45.429Z
---

> [第 11 屆(2020) iThome 鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/2172)文章補完計劃，[從零開始土炮 MQ]({{< ref "../foreword/index.md#基礎篇">}}) 基礎篇

當了解了 Queue、Router、Dispatcher 各部份的功用後，接著就要試著將其串通，讓它真正的為我們服務。

在這過程中，我們會發現有些資料可能無法立即被處理，或是會有服務中斷的風險，我們要如何確保重啟服務後，我們依然可以取回未被處理的服務。

<!--more-->

## Queue、Router、Dispatcher 整合

## 七、功能整合與函式庫開發

經過前面的介紹與概念實作，針對 Queue 的類型、Router、Dispatch 與 持久性這幾個部份，有了大致的理解。接下來，就要這些元件，進行整合。

在整合之前，先將期望整合後提供的功能，將其列表。

* 提供簡易的建置方式，可以一口氣建立 Router、Queue 與 Dispatch 的樣版。
* 支援異質性資料的處理。
* 提供 Queue 持久性的擴充介面。
* 提供主動與被動的兩種取得資料的方式。

在開始進行整合前，先統整名詞，以便後續開發。隨著開發過程，會持續出現新的名詞。

* `Router`：資料進入控制的元件。
* `Dispatch`：資料回傳控制的元件。
* `Resource`：儲存在 Queue 之內，包含特定結構的的資料。

將提供功能與流程初步整理後，可以得到以下的示意圖。

![SDK_Architecture](/SDK_Architecture.png)

依示意圖表示，將 `Router`、`Queue`、`Dispatch` 視為一個完整的個體。但是各元件開放外部操作的部份有所限制。

* `Router`：只開放外部將 `Resurce` 的傳入。
* `Queue`：完全隱藏，不被外部所接觸。只提供 `Router`、`Dispatch` 操作。
* `Dispatch`：提供取得 `Release` 與註冊通知的兩個功能。
* `Resource`：資料本身。

```C#
public class Resource
{
    byte[] Payload{set;get;}
}

public interface IRouter
{
    // 放入 Resource 
    void Push(Resource res)
}

public interface IDispatch
{
    Resource Pop();
    void Subscription(IConsumer consumer);
}
```

接著，定義出測試的實境案例。

1. 同質性資料：
   * 當放入 N 筆資料到 Router 後，隨後從 Dispatch 取得的資料與放入順序相同。
   * 當放入資料數量超過限制時，丟出異常例外。
   * 當 Queue 內不存在任何資料，從 Dispatch 取得資料時，會丟出異常例外。
   * 當 Dispatch 採用註冊通知時，會依據 consumer 的處理狀態進行分派。
2. 異質性資料：
   * 當放入未註冊的異質性資料，丟出無法識別的異常例外。
   * 當 consumer 向 Dispatch 取得未註冊的異質性資料時，丟出無法識別的例外。

## 延伸閱讀
