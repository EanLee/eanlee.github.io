# 深色主題設計文件

**日期：** 2026-01-31
**狀態：** 已確認
**作者：** Claude & Ean

## 概述

為部落格網站實作完整的深色主題支援，採用混合模式策略（自動跟隨系統設定 + 手動切換），提供優質的閱讀體驗和視覺一致性。

## 設計決策

### 1. 主題切換機制

**選擇：混合模式**

- 預設跟隨作業系統的 `prefers-color-scheme` 設定
- 提供手動切換按鈕覆蓋系統設定
- 使用 localStorage 記住使用者偏好
- 優先級：手動設定 > 系統偏好 > 預設淺色

### 2. UI 設計

**主題切換按鈕位置：** Header 導航列右側，搜尋功能旁邊

**按鈕樣式：** 圖示切換
- 淺色模式：月亮圖示 🌙（點擊切換到深色）
- 深色模式：太陽圖示 ☀️（點擊切換到淺色）
- 使用 Lucide 圖示庫保持視覺一致性

### 3. 配色方案

**深色主題配色：深灰背景 (Dark Gray)**

```css
[data-theme="dark"] {
  /* 背景色系 */
  --color-bg-primary: #0f1419;     /* 主背景 */
  --color-bg-secondary: #1c2128;   /* 次背景 */
  --color-bg-muted: #22272e;       /* 靜音背景 */

  /* 文字色系 */
  --color-text: #e6edf3;           /* 主文字 */
  --color-text-light: #adbac7;     /* 次要文字 */
  --color-text-muted: #768390;     /* 靜音文字 */

  /* 主色系 - 調亮版本 */
  --color-primary: #6b8aff;        /* 從 #2337ff 調亮 */
  --color-primary-dark: #5b7cff;   /* hover 狀態 */

  /* 卡片系統 */
  --card-bg: #1c2128;
  --card-border: #373e47;
  --card-shadow: rgba(0, 0, 0, 0.3);

  /* 邊框色系 */
  --color-border-light: #373e47;
  --color-border-medium: #444c56;
  --color-border-dark: #545d68;
}
```

**設計理由：**
- 深灰而非純黑，減少視覺疲勞
- 對比度適中，適合長時間閱讀
- 主色調亮以符合 WCAG 對比度標準
- 參考 GitHub、Twitter 等主流網站的深色模式

### 4. 語法高亮主題

**選擇：GitHub Dark**

- 與淺色主題（GitHub Light）保持一致性
- 配色專業且經過充分測試
- 開發者普遍熟悉

## 技術架構

### 三層架構設計

#### 1. CSS 變數層 (`design-tokens.css`)

- 使用 `[data-theme]` 屬性選擇器而非媒體查詢
- 將現有 `:root` 改為 `:root, [data-theme="light"]`
- 新增 `[data-theme="dark"]` 定義所有深色變數
- 所有組件使用設計令牌，自動適配主題切換

#### 2. 狀態管理層 (`ThemeToggle.astro`)

**防閃爍腳本：**
```javascript
// 在 <head> 中執行，頁面渲染前設定主題
const theme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = theme;
```

**主題切換邏輯：**
- 讀取：localStorage → 系統偏好 → 預設淺色
- 切換：更新 `document.documentElement.dataset.theme`
- 保存：寫入 localStorage
- 監聽：系統偏好改變時自動更新（未手動設定時）

#### 3. UI 層

**ThemeToggle 組件：**
- SVG 圖示按鈕（太陽/月亮）
- 平滑的旋轉/淡入淡出動畫
- 整合進 Header 導航列
- 響應式設計，桌面和手機版都可見

### 整合點

**Header.astro：**
```astro
<Search />
<ThemeToggle />  <!-- 新增在搜尋旁邊 -->
<div class="internal-links">
  ...
</div>
```

**astro.config.mjs：**
```javascript
markdown: {
  shikiConfig: {
    themes: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
}
```

## 需要適配的組件

以下組件需要確保在深色模式下正確顯示：

1. **TableOfContents.astro**
   - 背景色、邊框色
   - Active 狀態顏色
   - Hover 效果

2. **Footer.astro**
   - 背景漸層調整
   - 社交媒體圖示顏色

3. **AdRow.astro**
   - 廣告佔位符背景色

4. **SocialShare.astro**
   - 分享按鈕背景和對比度

5. **BackToTop.astro**
   - 按鈕背景、陰影

6. **Breadcrumbs.astro**
   - 連結和分隔符顏色

7. **CodeCopy.astro**
   - 按鈕背景和圖示顏色

**原則：** 所有組件應使用設計令牌變數，避免硬編碼顏色

## 使用者體驗優化

### 錯誤處理與回退

1. **localStorage 不可用**
   - 回退到系統偏好
   - Try-catch 包裝所有 localStorage 操作

2. **JavaScript 禁用**
   - 預設淺色主題
   - `<noscript>` 提示訊息

3. **舊瀏覽器**
   - `dataset` 不支援時回退到 className
   - 漸進增強策略

### 平滑過渡

```css
/* 主題切換時的平滑過渡 */
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

/* 首次載入時禁用過渡（防止閃爍動畫） */
.no-transition * {
  transition: none !important;
}
```

### 無障礙支援

- `aria-label="切換深色模式"`
- `aria-pressed="true|false"` 反映當前狀態
- 鍵盤操作支援（Enter、Space）
- 焦點狀態清晰可見

### 系統偏好監聽

```javascript
// 監聽系統偏好變化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // 只在未手動設定時才自動切換
  if (!localStorage.getItem('theme')) {
    document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
  }
});
```

## 測試檢查清單

### 功能測試

- [ ] 首次訪問：正確讀取系統偏好
- [ ] 手動切換：狀態正確保存和讀取
- [ ] 頁面刷新：無閃爍，主題保持
- [ ] 不同頁面：主題狀態全站一致
- [ ] 系統偏好改變：自動更新（未手動設定時）
- [ ] localStorage 清除：回退到系統偏好

### 響應式測試

- [ ] 桌面版（> 1024px）：按鈕位置正確
- [ ] 平板版（768px - 1024px）：按鈕可見
- [ ] 手機版（< 768px）：按鈕在導航列中
- [ ] 小手機（414px）：按鈕不被擠壓

### 視覺測試

- [ ] 所有文字符合 WCAG AA 對比度標準（4.5:1）
- [ ] 連結在兩種主題下都清晰可見
- [ ] 程式碼區塊語法高亮正確切換
- [ ] 卡片邊框和陰影在深色模式下可見
- [ ] 圖片和圖示在深色背景上不突兀
- [ ] 表格在深色模式下易讀

### 效能測試

- [ ] 無 FOUC（Flash of Unstyled Content）
- [ ] 主題切換動畫流暢（60fps）
- [ ] localStorage 讀寫不阻塞渲染
- [ ] 首次載入時間無明顯增加

### 瀏覽器相容性

- [ ] Chrome/Edge（Chromium）
- [ ] Firefox
- [ ] Safari（macOS/iOS）
- [ ] Samsung Internet（Android）

## 實作順序

### Phase 1: 基礎設施（優先）

1. 更新 `design-tokens.css` 添加深色主題變數
2. 建立 `ThemeToggle.astro` 組件
3. 整合到 `Header.astro`
4. 配置 `astro.config.mjs` 語法高亮

### Phase 2: 組件適配

5. 適配 TableOfContents
6. 適配 Footer
7. 適配其他組件（AdRow, SocialShare, BackToTop 等）

### Phase 3: 測試與優化

8. 執行完整測試檢查清單
9. 修復發現的問題
10. 效能優化和細節調整

## 未來改進方向

- [ ] 考慮添加「自動」選項在 UI 中（三態切換）
- [ ] 為不同內容類型提供獨立的配色微調
- [ ] 圖片自動調整亮度（CSS filter）
- [ ] 保存使用者偏好到雲端（需登入系統）
- [ ] A/B 測試不同配色方案的使用者偏好

## 參考資源

- [GitHub Dark Mode](https://github.com/)
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Shiki Dual Themes](https://shiki.style/guide/dual-themes)
- [prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

---

**設計確認日期：** 2026-01-31
**預計實作時間：** 1-2 個工作階段
**風險評估：** 低（基於現有設計令牌系統）
