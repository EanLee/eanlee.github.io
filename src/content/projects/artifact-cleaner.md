---
title: "Artifact Cleaner"
alias: "artifact-cleaner"
description: "輕量級磁碟清理工具，快速清理 node_modules、obj、package 等大型中間檔案"
techStack: ["TypeScript", "Node.js", "CLI"]
status: "active"
startDate: 2025-02-01
github: "https://github.com/EanLee/artifact-cleaner"
keywords: ["node_modules", "清理工具", "磁碟優化", "TypeScript", "CLI"]
lastmod: 2026-02-23T00:00:00+08:00
---

## 專案背景

隨著開發的專案越來越多，特別是在使用 AI Agent（Claude Code）快速開發前端或 TypeScript 程式後，才發現一個隱藏的成本問題：**磁碟空間被無形中吃掉了**。

某一天檢查硬碟空間，才驚覺竟然滿了。一查才發現，分散在各個專案中的 `node_modules` 資料夾竟然佔用了將近 **10GB** 的空間！

## 問題描述

- 📁 **多個專案累積**：每個 npm 專案都有自己的 `node_modules`，重複的依賴包堆積成巨大的存儲浪費
- 🤔 **沒有好工具**：想找一個簡單易用的工具來統一清理，但市面上的要嘛太複雜，要嘛功能不齊全
- ⚠️ **不只是 npm**：後來發現 C# 專案的 `obj` 和 `packages` 資料夾也有同樣的問題

## 解決方案

在 2025 年過年期間，使用 **Claude Code** 快速完成了這個小工具的開發：

### 核心功能

- 🧹 **快速掃描和清理**：一行命令清理所有 node_modules
- 🔍 **智能識別**：自動尋找並清理大型中間檔案
- ⚙️ **可自訂**：支援自訂資料夾名稱，不只限於 node_modules
- 📊 **空間統計**：顯示清理前後的磁碟空間節省量
- 🛡️ **安全操作**：確認清理操作前進行提示

### 技術特點

- **TypeScript** 開發，型別安全
- **CLI 工具**，輕量級無依賴
- 支援多平台（Windows、macOS、Linux）
- 高效的遞迴搜尋演算法

## 開發過程中的學習

1. **AI 輔助開發**：使用 Claude Code 大幅加速開發流程，從概念到完成不到一天
2. **需求迭代**：初版完成後才想到可以泛用化，支援自訂資料夾名稱
3. **真實問題的解決**：這個工具解決的是真實存在的、困擾多數開發者的問題
4. **TypeScript CLI 開發**：學習 CLI 工具開發的最佳實踐

## 使用場景

- 🧹 清理過期的 node_modules（節省數 GB 空間）
- 🔧 清理 C# 專案的 build artifacts（obj、bin、packages）
- 📦 重新整理磁碟空間前的預準備
- 🤖 自動化磁碟維護腳本

## GitHub 倉庫

https://github.com/EanLee/artifact-cleaner

## 相關技術文章

- 預計撰寫：「為什麼 node_modules 這麼大？如何高效管理」
- 預計撰寫：「使用 Claude Code 快速開發 CLI 工具」

## 專案成果

- ✅ 已清理超過 **50GB** 的累積垃圾檔案
- ✅ 支援 node_modules、obj、packages、bin 等多種型別
- ✅ 開源供社群使用
- ✅ 啟發更多關於磁碟管理的思考
