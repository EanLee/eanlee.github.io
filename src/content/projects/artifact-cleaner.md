---
title: "Artifact Cleaner"
alias: "artifact-cleaner"
description: "快速、簡單的 .NET CLI 工具，用於掃描、統計和清理專案目錄下的 node_modules 與指定的資料夾"
techStack: [".NET 9", "C#", "System.CommandLine", "Spectre.Console"]
status: "active"
startDate: 2026-02-20
github: "https://github.com/EanLee/artifact-cleaner"
keywords: ["node_modules", "清理工具", ".NET", "CLI", "C#"]
lastmod: 2026-02-23T00:00:00+08:00
---

## 專案背景

在成長為使用 AI Agent（Claude Code）快速開發多個前端或 Node.js 專案後，才發現一個隱藏的成本問題：**磁碟空間被無形中吃掉了**。

某一天檢查硬碟空間發現滿了。一查才發現，分散在各個專案中的 `node_modules` 資料夾竟然佔用了將近 **10GB** 的空間！

雖然使用配合經常使用的 [Everything](https://www.voidtools.com/) 工具，快速找到這些 `node_modules` 的位置，但是要手動刪除這些資料夾，還是很麻煩。

在過年期間，使用 **Claude Code** 快速完成了這個 .NET CLI 工具的開發。

## 功能特色

- 🔍 **快速掃描** - 遞迴搜尋指定目錄下的所有 node_modules
- 📊 **詳細統計** - 顯示每個資料夾的大小和最後修改時間
- 🎯 **互動式選擇** - 使用方向鍵和空白鍵選擇要刪除的資料夾
- 🎨 **美觀的介面** - 使用 Spectre.Console 提供現代化 CLI 體驗
- ⚡ **效能優化** - 使用 yield return 和非同步 I/O 提升效能
- 🎛️ **靈活參數** - 支援掃描深度限制、最小尺寸篩選

## 技術架構

- **.NET 9** - 最新的 .NET 版本，性能優化
- **System.CommandLine** - 官方命令列框架
- **Spectre.Console** - 現代化 CLI UI 框架
- **xUnit** - 單元測試框架

## 專案成果

- ✅ **交互式清理**：可視化選擇要刪除的資料夾，安全可控
- ✅ **效能優化**：非同步 I/O 和高效搜尋演算法
- ✅ **Windows 最佳化**：針對 Windows 環境優化
- ✅ **完整測試**：xUnit 單元測試
- ✅ 已清理超過 **10GB+** 的累積 node_modules 檔案

## 注意事項

⚠️ **重要警告**
- 刪除操作是**永久性的**，不會移到回收桶
- 刪除前請確認選擇的資料夾
- 建議先使用 `scan` 命令檢視，確認無誤後再使用 `clean` 命令

有任何問題或建議，歡迎在 GitHub 上提出 Issue 或 Pull Request！