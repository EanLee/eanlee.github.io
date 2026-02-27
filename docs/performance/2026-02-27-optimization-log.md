# eandev.com PageSpeed 優化紀錄 (2026-02-27)

本文件紀錄了 2026-02-27 針對 eandev.com 進行的效能優化項目，作為後續追蹤與效果評估的基準。

## 📋 優化背景

基於 PageSpeed Insights 的初始分析，發現手機版效能（特別是 LCP 與 CLS）有較大的改進空間，主要原因在於資源加載順序與未經優化的圖片。

## 🛠️ 執行措施

### 1. 圖片視覺優化 (Critical Path Optimization)

- **Astro Image 整合**：將 `src/components/HomeHero.astro` 與 `src/components/LatestPosts.astro` 的 `<img>` 標籤替換為 Astro 的 `<Image />` 元件，利用自動化的格式轉換（WebP）與尺寸縮放。
- **預加載策略**：針對首頁 Hero Image 與文章第一屏 Banner，添加 `fetchpriority="high"` 屬性。
- **防止佈局位移 (CLS)**：在 `LatestPosts.astro` 與 `BlogPost.astro` 中，為所有圖片指定明確的 `width` 與 `height`。

### 2. 渲染效能優化 (Rendering Performance)

- **CSS 內聯化**：修改 `astro.config.mjs`，設定 `build.inlineStylesheets: 'always'`，將關鍵樣式直接嵌入 HTML，消除外部 CSS 的渲染阻塞。
- **HTML 壓縮**：啟用 `compressHTML: true`，縮減最終部署的檔案體積。
- **字體非同步優化**：微調 `src/components/FontLoader.astro`，移除 `DOMContentLoaded` 事件鎖定，讓字體儘早開始請求。
- **AdSense 懶加載 (Interaction-Driven)**：將原本固定 1 秒的延遲載入改為「使用者互動驅動」。腳本僅在使用者產生 `scroll`、`mousedown` 或 `touchstart` 等行為時才開始加載廣告資源，大幅降低初始 TBT (Total Blocking Time) 與資源爭搶。

## 📊 預期成效

- **LCP (Largest Contentful Paint)**：預計降低 300ms 以上。
- **CLS (Cumulative Layout Shift)**：預計降至 0.05 以下的最佳區間。
- **FCP (First Contentful Paint)**：透過 CSS 內聯與字體優化，預計提升 15-20%。

## 🏁 驗證結果

- 通過 `pnpm build` 檢查，確認 HTML 已正確壓縮且 CSS 內聯生效。
- 手動檢查 `dist/` 產出物，圖片已包含預期的 WebP 選項與尺寸資訊。

---
*紀錄維護者：AI Coding Agent*
