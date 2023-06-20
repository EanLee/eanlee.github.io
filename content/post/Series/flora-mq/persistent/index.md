---
title: 持久性
date: 2023-01-18T08:44:29.569Z
draft: true
---

> [第 11 屆(2020) iThome 鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/2172)文章補完計劃，[從零開始土炮 MQ]({{< ref "../foreword/index.md#基礎篇">}}) 基礎篇

<!--more-->

## 六、持久性(Persistent)

在前面的例子中，都是直接將資料放罝在記憶體之中，雖然使用方便，但也會出現對應的問題。

* 當不可抗的因素，讓系統掛彩。
* 系統設計時缺陷，當出現非預期的情況，造成系統的 carsh。

如果資料本身可以再重覆產生的類型，那還好處理。

若如果資料本身都具有獨特性、不可再重現性或是再現成本太過高，資料不見就會造成很大的麻煩。例如：金融的交易資訊，生理監控資訊、實驗即時數據。

因此，在某些情境下，**系統必須確保資料內容不會因為異常終止，造成資料消失。**這個特性，又被稱為 **持久性(Persistent)**。

所以接下來，談談實現 Persistent 特性時，可考量的儲存介面。

### 1. 儲存介面

#### Memory

將資料內容保存在 Memory 之中，是成本最低、最簡單的作法。像是實作使用的 `ConcurrentQueue` 或是 `System.Collecitons.Generic` 包含的 `List`、`Dictionary` 都是這種。

選擇使用 Memory 時，需注意的部份如下：

* 當系統異常終止時，資料也會隨之不見。
* 可儲存的空間上限，被作業作業所局限。例如 x86 的 windows 一個 Process 的上限是 2 Gb。

#### File

如果要確保資料的存在，通常第一直覺就是採用檔案的方式，進行資料內容的存取操作。

也因為儲存到檔案，可操作的空間與靈活性就更大。可以儲存自訂格式的 `BIN` 檔，或是可以直接檢視內的的 `Txt`、`Json` 。

也因為如此，選擇使用 File 時，需注意的部份如下；

* 儲存的資料內容是否有機敏性的內容，是否需要進行**資安**部份考慮或額外處理。
* 儲存速度會被 Disk 的 `I/O` 所限制。當大量的存取時，`I/O` 速度是否會成為瓶頸，也需要考量。

#### Database

當然，存取資料的部份，也可以交給專業的 Database。對 database 而言，`原子性 Atomicity`、`一致性 Consistency`、`隔離性 Isolation`、`持久性 Durability`，這四種特性又被稱為 **ACID**，是 [資料庫管理系統](https://zh.wikipedia.org/wiki/数据库管理系统)(DBMS)必須具備的。

目前可選擇的 database 有許多的類別，但可簡單區分為`NoSQL`、`RDSDB`、`Memory DB` 三種。

選擇使用 Database 時，同樣的，也有必須評估的部份：

* 所使用的 DBMS 的特性是否符合需求情境。
* 環境的影響是否在可控制的範圍內。

### 2. CQRS

對資料的操作，不外乎就是讀取與寫入，但隨著系統越來越複雜，**讀取：不會變更狀態的查詢**與**寫入：變更狀態的操作命令**使用比例越來越大時，可能因為讀取的次數過多，間接影響寫入的效率；或是寫入時間過長，影響讀取的反應時間。

我們看一下，在 [Microsoft 文件](https://docs.microsoft.com/zh-tw/azure/architecture/patterns/cqrs)，是如何介紹 CQRS。

>[Command and Query Responsibility Segregation (CQRS)](https://martinfowler.com/bliki/CQRS.html) was introduced by Greg Young and strongly promoted by Udi Dahan and others. It is based on the CQS principle, although it is more detailed. It can be considered a pattern based on commands and events plus optionally on asynchronous messages. In many cases, CQRS is related to more advanced scenarios, like having a different physical database for reads (queries) than for writes (updates). Moreover, a more evolved CQRS system might implement [Event-Sourcing (ES)](https://martinfowler.com/eaaDev/EventSourcing.html) for your updates database, so you would only store events in the domain model instead of storing the current-state data. However, this is not the approach used in this guide; we are using the simplest CQRS approach, which consists of just separating the queries from the commands.

依筆者自己的解讀，將引文內容簡釋一下。

* CQRS 是 CQS 的威力加強版。由Greg Young 引進，Udi Dahan 等人推廣。
* 簡易的 CQRS 就只有將查詢與命令(新增、更新、刪除)分隔。
* 再更進階的作法，例如：讀取和寫入使用不同的實體資料庫；或使用資料庫實作 [事件溯源 (Event Sourcing，ES)](https://martinfowler.com/eaaDev/EventSourcing.html)。

當資料要寫入資料庫時，大多數的情況下，需要進行商業邏輯的運算，有可能運算時間就需要寫入時間的 N 倍之多。但是資料庫，為了確保資料交易的正確性，會將對應的資料區塊進行鎖定 `Lock`。

造成查詢動作，必須等待交易完成後，才能進行。導致讀取資料反應時間過久，造成 Timeout 的現象。

![從CQS到CQRS](/CQRS.png)
圖片來源: [From CQS to CQRS](https://herbertograca.com/2017/10/19/from-cqs-to-cqrs/)

在上面的圖，可以很精闢的說明，CQRS 將查詢與命令分開為兩條線的優點。

* 查詢本身不需進行額外的商業邏輯，需要的只是將查詢到的資料取回。
* 命令本身會對資料狀態進行變更，在確保資料的一致性因素下，需要時間較長。

如果想要進一步再了解 CQRS，可以閱讀延伸閱讀內的文章。

### 延伸閱讀

1. [Event-Driven Architectures - The Queue vs The Log](https://jack-vanlightly.com/blog/2018/5/20/event-driven-architectures-the-queue-vs-the-log)
2. [Event-Driven Architectures - Queue vs Log - A Case Study](https://jack-vanlightly.com/blog/2018/5/21/event-driven-architectures-queue-vs-log-case-study)
3. [Day 2 - 我的C是你的C嗎，介紹CAP Theorem與ACID/BASE](https://ithelp.ithome.com.tw/articles/10216500)
4. [命令與查詢責任隔離 (CQRS) 模式](https://docs.microsoft.com/zh-tw/azure/architecture/patterns/cqrs)
5. [從CQS 到CQRS](https://www.infoq.cn/article/from-cqs-to-cqrs)
6. [淺談命令查詢職責分離(CQRS)模式](https://www.cnblogs.com/yangecnu/p/Introduction-CQRS.html)