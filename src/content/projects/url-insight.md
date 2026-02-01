---
title: "Url-Insight"
alias: "url-insight"
description: "URL縮短與分析服務，提供短網址生成、點擊追蹤與數據分析功能"
techStack: [".NET", "Vue3", "PostgreSQL", "Redis"]
status: "active"
startDate: 2024-01-20
url: "https://url-ins.com"
keywords: ["URL縮短", "短網址", ".NET", "Vue3", "PostgreSQL"]
lastmod: 2026-02-01T22:04:27+08:00
---
## 專案背景

在日常工作中經常需要分享長網址，市面上雖然有許多短網址服務，但缺少客製化功能和完整的分析數據。因此決定自己開發一個功能完整的短網址系統。

## 核心功能

### 1. 短網址生成
- 自動產生短代碼
- 支援自訂短代碼
- 批次生成功能

### 2. 點擊追蹤
- 即時點擊統計
- 來源分析（Referrer）
- 裝置類型分析
- 地理位置統計

### 3. 管理後台
- Vue3 + Element Plus 開發
- 響應式設計，支援行動裝置
- 直觀的數據視覺化

## 技術架構

### 後端 (.NET)
```
API Layer (ASP.NET Core Web API)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Entity Framework Core)
    ↓
Database (PostgreSQL)
```

### 快取策略
使用 **Redis** 作為快取層：
- 熱門短網址快取（LRU 策略）
- 減少資料庫查詢壓力
- 提升回應速度至 < 50ms

### 前端 (Vue3)
- **Composition API** 提升程式碼可維護性
- **Pinia** 狀態管理
- **Vue Router** 路由管理
- **Element Plus** UI 框架

## 開發挑戰與解決方案

### 挑戰 1: 高併發處理
**問題**: 熱門短網址可能在短時間內被大量存取

**解決方案**:
- 實作 Redis 分散式快取
- 使用非同步處理降低資料庫負載
- 設定適當的連線池大小

### 挑戰 2: 短代碼衝突
**問題**: 隨機生成的短代碼可能重複

**解決方案**:
- 使用 Base62 編碼 + 時間戳
- 資料庫層級的 UNIQUE 約束
- 重試機制處理極端情況

## 學習收穫

1. **分散式系統設計**
   - 學會設計快取失效策略
   - 理解 CAP 定理的實際應用

2. **效能優化**
   - 掌握資料庫索引優化技巧
   - 學會使用 APM 工具監控效能

3. **前後端整合**
   - Vue3 + .NET API 的最佳實踐
   - RESTful API 設計原則
