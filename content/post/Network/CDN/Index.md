---
title: 淺談 CDN 的概念與應用
date: 2022-06-16T06:08:07.314Z
description: 經常使用 CDN 服務來提升站台服務的品質，但未深入了解其原理概念，嘗試深入淺出的說明 CDN 概念與適用場景。
keywords:
  - CDN
categories:
  - 網路概念
tags:
  - 網路
draft: true
---

**內容傳遞網路(Content Delivery Network, CDN)**或稱**內容分發網路(Content Distribution Network, CDN)**，透過在網路內多個相互連結的節點伺服器，針對目的站台的快取。配合使用離請求端最近距離的節點，達到網站加的技術。

<!--more-->

## 目的

而為什麼會有 CDN 服務出現？主要是受到網際網路的普及化，網路使用量快速增加的影響下，大量的使用者湧入同個網站時，就容易造成連線壅塞，或是想連到其他國家網站時，也可能因為連線路徑過長，出現讀取緩慢等問題，導致用戶體驗不佳。然而在重視網站瀏覽體驗的今日，透過 CDN 加速改善上述的網站問題就顯得十分重要。

其基本思路是盡可能避開互聯網上有可能影響數據傳輸速度和穩定性的瓶頸和環節，使內容傳輸的更快、更穩定。

## 概念

![無 CDN 的網路架構]()

1. 用戶端發送 `Domain Name` 給 DNS，查詢對應的 IP 位置
2. DNS 回應站台的 IP 位置給用戶端
3. 用戶端依據取得的 IP 位置，發送請求給站台
4. 站台回應資料給用戶端

![使用 CDN 的網路架構]()

1. 用戶端發送 `Domain Name` 給 DNS，查詢對應的 IP 位置
2. DNS 回應 CNAME (Canonical Name) 別名記錄，指向 CDN 的全局負載均衡
3. 用戶端依據取得的 IP 位置，發送請求給站台
4. 站台回應資料給用戶端

## 應用場域

### 無法使用的情境

## 實際運行流程

## 常見 CDN 廠商

Fastly

Akamai CDN

Cloudflare CDN

CloudFront CDN

Google Cloud CDN

更多的全球 CDN 服務供應商，可以參考[Gobel CDN Review & Rating](https://www.gartner.com/reviews/market/global-cdn)

## 延伸閱讀

- [为了搞清楚 CDN 的原理，我头都秃了](https://network.51cto.com/article/680148.html)
- [內容傳遞網路](https://zh.wikipedia.org/zh-tw/%E5%85%A7%E5%AE%B9%E5%82%B3%E9%81%9E%E7%B6%B2%E8%B7%AF)