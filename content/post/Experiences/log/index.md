---
title: 開發雜談 - 淺談 LOG 的設計與問題排查的重要性
description: null
tags:
  - 系統架構
categories:
  - 開發雜談
keywords:
  - log
date: 2023-01-16T07:43:34.840Z
draft: true
---


<!-- more -->



log 到底要多少才行

log 會影響效能
    file log, aduit log 
 與 正式流程解耦合, 使用非同步旳方式。

log 的目的, 回溯問題發生當下的資訊

常見 log 在實作上，會依嚴重程度會分為 Tracking, Info, waring, error 