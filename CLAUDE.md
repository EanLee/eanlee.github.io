# Claude 開發助手 - 後續開發指南

這份文件記錄了專案的 CSS 架構重構成果與後續開發的重點注意事項。

## 📋 已完成的 CSS 重構

### ✅ 主要成就

1. **建立統一設計令牌系統** (`src/styles/design-tokens.css`)
   - 包含 100+ 個設計變數
   - 顏色、間距、字體、圓角、陰影、動畫時間等完整系統
   - 為深色主題做好準備

2. **清理重複的 CSS 變數**
   - 移除 EpicBlock、SeriesBlock、summary 組件中的重複定義
   - 統一使用設計令牌變數

3. **統一響應式斷點**
   - 全站統一使用 768px、480px、414px
   - 修正 global.css 中的 720px → 768px
   - 修正 TableOfContents 的 1023px → 1024px

4. **重構 prose 樣式系統**
   - 移除 `!important` 覆蓋
   - 使用設計令牌替換硬編碼值

5. **修正手機版佈局問題**
   - 解決 content-wrapper 異常寬度 (6634px)
   - 統一容器寬度至 1120px
   - 修正表格樣式和換行問題

## 🎯 後續開發重點

### 1. CSS 架構維護

#### 設計令牌優先原則
```css
/* ✅ 推薦 - 使用設計令牌 */
.my-component {
  padding: var(--spacing-md);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
}

/* ❌ 避免 - 硬編碼值 */
.my-component {
  padding: 1rem;
  color: #333333;
  border-radius: 8px;
  transition: 0.2s ease;
}
```

#### 響應式斷點一致性
```css
/* ✅ 統一的響應式斷點 */
@media (max-width: 1024px) { /* 大平板 */ }
@media (max-width: 768px)  { /* 小平板/大手機 */ }
@media (max-width: 480px)  { /* 標準手機 */ }
@media (max-width: 414px)  { /* 小手機 Pixel 7 */ }

/* ❌ 避免使用其他斷點 */
@media (max-width: 992px) { /* 不一致 */ }
@media (max-width: 720px) { /* 已廢棄 */ }
```

### 2. 新組件開發規範

#### CSS 變數使用
1. **組件內不應定義重複的設計變數**
2. **直接使用 design-tokens.css 中的變數**
3. **如需組件特有變數，使用 `--component-` 前綴**

#### 容器寬度標準
```css
/* ✅ 統一使用設計令牌 */
.container {
  max-width: var(--container-xl); /* 1120px */
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
```

#### 表格樣式
- 基礎表格樣式已定義在 `global.css`
- 如需客製化，請擴展而非覆蓋基礎樣式
- 確保手機端的響應式表格處理

### 3. 效能最佳化注意事項

#### CSS 載入順序
```css
/* 當前正確的載入順序 */
@import './design-tokens.css';  /* 1. 設計令牌 */
@tailwind base;                 /* 2. Tailwind 基礎 */
@tailwind components;           /* 3. Tailwind 組件 */
@tailwind utilities;            /* 4. Tailwind 工具類 */
/* 其他自定義樣式 */           /* 5. 專案樣式 */
```

#### 避免樣式衝突
- 不使用 `!important` 除非絕對必要
- 優先使用 CSS 特異性來解決樣式優先級
- 組件樣式應保持封裝性

### 4. 深色主題準備

設計令牌系統已為深色主題做好準備：

```css
/* design-tokens.css 中已預留深色主題結構 */
@media (prefers-color-scheme: dark) {
  :root {
    /* 未來實作深色主題時啟用 */
    /* --color-bg-primary: #1a1a1a; */
    /* --color-text: #ffffff; */
  }
}
```

### 5. 常見問題與解決方案

#### 手機版佈局問題
- **問題**：內容寬度異常、文字截斷
- **解決**：檢查 CSS Grid 設定，使用 `minmax(0, 1fr)` 模式
- **預防**：確保所有容器都有 `box-sizing: border-box`

#### 表格響應式問題
- **問題**：表格內容不換行、寬度不對齊
- **解決**：移除 `white-space: nowrap`，使用 `.table-wrapper` 處理滾動
- **預防**：使用 `table-layout: auto` 讓表格自動調整

#### CSS 變數未生效
- **問題**：設計令牌變數未正確載入
- **解決**：確認 `@import './design-tokens.css'` 在 global.css 頂部
- **預防**：避免在組件中重複定義相同變數名

### 6. 開發工具建議

#### 瀏覽器開發者工具
- 使用響應式設計模式測試 414px (Pixel 7) 寬度
- 檢查 CSS 變數是否正確載入和使用
- 監控 CSS Grid 和 Flexbox 的寬度計算

#### 程式碼品質
- 定期檢查是否有新的硬編碼值需要替換為設計令牌
- 確保新增的響應式斷點符合統一標準
- 驗證表格和其他複雜佈局在手機端的顯示效果

## ⚠️ 重要注意事項

1. **不要修改 design-tokens.css 的變數名稱** - 會影響整個網站
2. **新增響應式斷點前請確認必要性** - 避免增加維護複雜度
3. **表格內容較長時應考慮使用 `.table-wrapper`** - 提供水平滾動
4. **測試手機版時務必檢查 414px 寬度** - 這是最小支援寬度
5. **避免在組件中使用 `!important`** - 破壞 CSS 層級結構

## 🚀 Google Ads & SEO 優化

### ✅ 已完成的廣告優化

1. **延遲載入 AdSense 腳本**
   - 使用動態載入避免阻塞初始渲染
   - 1秒延遲載入，提升 FCP (First Contentful Paint)
   - 錯誤處理和重複載入防護

2. **CLS (Cumulative Layout Shift) 優化**
   - 廣告佔位符預留空間，減少版面跳動
   - 載入動畫和骨架屏幕提升用戶體驗
   - 響應式廣告尺寸適配

3. **Google Analytics 優化**
   - 用戶互動後才載入，符合 Core Web Vitals 最佳實踐
   - 防止重複發送頁面瀏覽事件
   - 3秒備用自動載入機制

4. **網路優化**
   - 添加 `preconnect` 和 `dns-prefetch` 預連線
   - 安全標頭 (X-Frame-Options, CSP 等)
   - 推薦人政策優化

### 🎯 廣告載入策略

#### AdSense 最佳實踐
```javascript
// ✅ 推薦做法 - 延遲載入
setTimeout(() => {
  loadAdSense();
}, 1000);

// ❌ 避免 - 同步載入
<script src="adsbygoogle.js"></script>
```

#### CLS 預防措施
```css
/* ✅ 使用佔位符 */
.ad-placeholder {
  min-height: 250px; /* 預留廣告空間 */
  background-color: var(--color-bg-muted);
}

/* ❌ 避免無高度容器 */
.ad-container {
  /* 會造成 CLS */
}
```

### 📊 性能監控

使用 `PerformanceMonitor.astro` 組件監控：
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay) 
- **CLS** (Cumulative Layout Shift)
- **廣告載入時間**

```astro
<!-- 開發環境啟用監控 -->
<PerformanceMonitor enabled={import.meta.env.DEV} />
```

### ⚠️ 廣告相關注意事項

1. **不要移除 ads.txt** - Google AdSense 驗證必需
2. **廣告密度控制** - 避免過多廣告影響用戶體驗
3. **響應式適配** - 確保各尺寸設備廣告正常顯示
4. **載入錯誤處理** - 廣告攔截器或網路問題的 fallback
5. **Core Web Vitals 監控** - 定期檢查 Lighthouse 分數

### 🔍 SEO 檢查清單

- [x] 延遲載入非關鍵 JavaScript
- [x] 預連線外部域名
- [x] 安全標頭設置
- [x] CLS 優化
- [x] 廣告佔位符
- [x] 錯誤處理機制
- [ ] 定期 Lighthouse 審計
- [ ] PageSpeed Insights 監控

## 📈 未來改進方向

1. **深色主題實作** - 基於現有設計令牌系統
2. **更多設計令牌** - 根據需求擴展動畫、陰影等系統
3. **CSS 模組化** - 考慮將大型組件樣式獨立管理
4. **效能監控** - 追蹤 CSS 載入和渲染效能
5. **A/B 測試廣告位置** - 優化廣告收益和用戶體驗平衡
6. **Service Worker** - 考慮實作離線支援和快取策略

這個 CSS 架構重構和廣告優化為網站提供了堅實的基礎，請在後續開發中遵循這些原則，確保代碼品質和用戶體驗的一致性。