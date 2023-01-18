---
title: 八、通訊與協定
description: null
date: 2023-01-18T09:20:26.723Z
keywords: null
tags: null
draft: true
---

> [第 11 屆(2020) iThome 鐵人賽](https://ithelp.ithome.com.tw/users/20107551/ironman/2172)文章補完計劃，[從零開始土炮 MQ]({{< ref "../foreword/index.md#基礎篇">}}) 基礎篇


<!--more-->

## 八、通訊與協定

接下來，我們不滿足 FloraMQ 只能為一個系統服務，嘗試拉高它的層級、期許它獨立為一個服務，作為不同系統之間資料交換的中繼點。

遇到的第一個關卡，就是不同系統之間要如何與 FloraMQ 通訊，並交換資料。

就像一個只會說中文的人，到不同語言的異鄉旅遊時，與其他同團的人失散。他與當地人，只有用比手劃腳的方式，才能有效溝通。那肢體語言，就是兩者間的共同語言。

同樣的，不同系統之間的資料溝通與交換，也必須找出或定義共同的語言，或稱為協定。

### 8.1 Remote Procedure Call, RPC

只要提到分散式系統，RPC 這個名詞就必定會被提到，尤其是 Google 提出的 gRPC 後，RPC 這個名詞就被更多人所接觸。

RPC 全稱 Remote Procedure Call，先來看一下，WIKI 的說明：

> RPC is a request–response protocol. An RPC is initiated by the client , which sends a request message to a known remote server to execute a specified procedure with supplied parameters. The remote server sends a response to the client, and the application continues its process.

### 8.2 Advanced Message Queuing Protocol, AMQP

若使用 RabbitMQ ，必定對 AMQP 這名詞不陌生，Wiki 是如此介紹。

> AMQP is a binary, application layer protocol, designed to efficiently support a wide variety of messaging applications and communication patterns. It provides flow controlled,message-oriented communication with message-delivery guarantees such as *at-most-once* (where each message is delivered once or never), *at-least-once* (where each message is certain to be delivered, but may do so multiple times) and *exactly-once* (where the message will always certainly arrive and do so only once), and authentication and/or encryption based on SASL and/or TLS. It assumes an underlying reliable transport layer protocol such as **Transmission Control Protocol (TCP)**.

### 8.3 Message Queuing Telemetry Transpor, MQTT

若有在研究 IoT ，多少會聽到 MQTT 這名詞。來看看 Wiki 是如何介紹 MQTT。

> MQTT (Message Queuing Telemetry Transport) is an ISO standard(ISO/IEC PRF 20922) publish-subscribe-based messaging protocol. It works on top of the TCP/IP protocol suite. It is designed for connections with remote locations where a "small code footprint" is required or the network bandwidth is limited. The publish-subscribe messaging pattern requires a message broker.

### 8.4 延伸閱讀

1. [谁能用通俗的语言解释一下什么是 RPC 框架](https://www.zhihu.com/question/25536695)
2. [远程过程调用(RPC)详解](https://waylau.com/remote-procedure-calls/)
3. [[ Protocol ] 認識 MQTT](https://oranwind.org/-broker-ren-shi-mqtt/)
4. [MQTT](https://en.wikipedia.org/wiki/MQTT)
5. [MQTT.org](http://mqtt.org/)

## 延伸閱讀
