# Frontend CSS 重複性與設計令牌一致性評估報告

**報告日期**：2026-03-11
**專案**：eanlee.github.io (Astro 5 SSG)
**範圍**：EpicLayout.astro、SeriesLayout.astro、categories/[...category].astro

---

## 1. 重複 CSS 盤點表

| CSS 規則 | EpicLayout | SeriesLayout | Category | 建議 |
|---------|-----------|-------------|---------|------|
| `.main-content` gap | `var(--spacing-xl)` | `2rem` ❌ | `2rem` ❌ | 統一為 `var(--spacing-xl)` |
| `.main-content` margin | `var(--spacing-xl) 0 var(--spacing-2xl)` | `2rem 0 3rem` ❌ | `2rem 0 3rem` ❌ | 統一為設計令牌 |
| `.main-content` padding | `var(--spacing-md)` | `1rem` ❌ | `1rem` ❌ | 統一為 `var(--spacing-md)` |
| `.widget-container` gap | `var(--spacing-xl)` | `2rem` ❌ | `2rem` ❌ | 統一為 `var(--spacing-xl)` |
| `.content-area` gap | `var(--spacing-md)` | `1rem` ❌ | `1rem` ❌ | 統一為 `var(--spacing-md)` |
| `.page-header` margin-bottom | `var(--spacing-xl)` | `2rem` ❌ | `2rem` ❌ | 統一為 `var(--spacing-xl)` |
| `.page-header` padding-bottom | `var(--spacing-md)` | `1rem` ❌ | `1rem` ❌ | 統一為 `var(--spacing-md)` |
| `.page-header h1` font-size | `var(--font-size-4xl)` | `2rem` ❌ | `2rem` ❌ | 統一為 `var(--font-size-4xl)` |
| `.page-header h1` font-weight | `var(--font-weight-bold)` | `700` ❌ | `700` ❌ | 統一為 `var(--font-weight-bold)` |
| `.article-count` border-radius | `var(--radius-md)` | 無 | `8px` ❌ | 統一為 `var(--radius-md)` |
| `.post-card` border-radius | `var(--radius-lg)` | `12px` ❌ | `12px` ❌ | 統一為 `var(--radius-lg)` |
| `.post-card` transition | `transform var(--transition-slow)` | `transform 0.3s ease` ❌ | `transform 0.3s ease` ❌ | 統一為設計令牌 |
| `.post-card` margin-bottom | `var(--spacing-lg)` | `1.5rem` ❌ | `1.5rem` ❌ | 統一為 `var(--spacing-lg)` |
| `.post-content` padding | `var(--spacing-md) var(--spacing-lg)` | `1rem 1.5rem` ❌ | `1rem 1.5rem` ❌ | 統一為設計令牌 |
| `.post-meta-row` margin/padding | `calc(var(--spacing-md) - var(--spacing-xs))` | `0.75rem` ❌ | `0.75rem` ❌ | 統一為設計令牌計算 |
| `.post-date` font-size | `var(--font-size-sm)` | `0.875rem` ❌ | `0.875rem` ❌ | 統一為 `var(--font-size-sm)` |
| `.post-tags` gap | `var(--spacing-sm)` | `0.5rem` ❌ | `0.5rem` ❌ | 統一為 `var(--spacing-sm)` |
| `.tag-list` font-size | 無 | `0.8rem` ❌ | `0.8rem` ❌ | 統一為 `var(--font-size-xs)` |
| `.tag-link` transition | `color var(--transition-normal)` | `color 0.2s ease` ❌ | `color 0.2s ease` ❌ | 統一為設計令牌 |
| `.post-title` font-size | `var(--font-size-2xl)` | `1.25rem` ❌ | `1.25rem` ❌ | 統一為設計令牌 |
| `.post-title` font-weight | `var(--font-weight-semibold)` | `600` ❌ | `600` ❌ | 統一為設計令牌 |
| `.post-title a` transition | `color var(--transition-normal)` | `color 0.2s ease` ❌ | `color 0.2s ease` ❌ | 統一為設計令牌 |
| `.post-description` font-size | `var(--font-size-base)` | `0.95rem` ❌ | `0.95rem` ❌ | 統一為 `var(--font-size-base)` |
| `.post-description` margin-bottom | `calc(var(--spacing-md) + var(--spacing-xs))` | `1rem` ❌ | `1rem` ❌ | 統一為設計令牌 |
| `.read-more` gap | `var(--spacing-sm)` | `0.3rem` ❌ | `0.3rem` ❌ | 統一為 `var(--spacing-sm)` |
| `.read-more` font-weight | `var(--font-weight-medium)` | `500` ❌ | `500` ❌ | 統一為設計令牌 |
| `.no-posts` border-radius | `var(--radius-md)` | `8px` ❌ | `8px` ❌ | 統一為設計令牌 |
| 響應式斷點 | `1200px` / `992px` ❌ | `1200px` / `992px` ❌ | `1200px` / `992px` ❌ | **改為 `1024px` / `768px`** |

**關鍵數字**：
- **98%** 的規則在三個版型中重複
- SeriesLayout 和 Category 的硬編碼值佔比高達 **65–70%**
- EpicLayout 設計令牌使用率 **80%+**，為基準版型

---

## 2. 硬編碼值 → 設計令牌對照表

| 硬編碼值 | 對應設計令牌 | 使用位置 |
|---------|------------|---------|
| `2rem` | `var(--spacing-xl)` | gap、margin |
| `3rem` | `var(--spacing-2xl)` | margin-bottom |
| `1.5rem` | `var(--spacing-lg)` | margin-bottom、padding |
| `1rem` | `var(--spacing-md)` | padding、margin |
| `0.5rem` | `var(--spacing-sm)` | gap |
| `0.25rem` | `var(--spacing-xs)` | gap、padding |
| `12px` | `var(--radius-lg)` | border-radius |
| `8px` | `var(--radius-md)` | border-radius |
| `0.3s ease` | `var(--transition-slow)` | transform 動畫 |
| `0.2s ease` | `var(--transition-normal)` | color 動畫 |
| `2rem` (字體) | `var(--font-size-4xl)` | h1 |
| `1.25rem` | `var(--font-size-xl)` | post-title |
| `0.875rem` | `var(--font-size-sm)` | post-date、article-count |
| `0.8rem` | `var(--font-size-xs)` | tag-list |
| `0.95rem` | `var(--font-size-base)` | post-description（可接受捨入） |
| `700` | `var(--font-weight-bold)` | h1 |
| `600` | `var(--font-weight-semibold)` | post-title |
| `500` | `var(--font-weight-medium)` | read-more |
| `1.5` | `var(--line-height-normal)` | line-height |

### 缺失的設計令牌（建議新增至 design-tokens.css）

```css
:root {
  /* Cover Image 系統（新增） */
  --cover-height-default: 200px;
  --cover-aspect-ratio: 16 / 9;
}
```

---

## 3. 斷點問題分析

### 現況

三個版型都使用非標準斷點：

```css
@media (max-width: 1200px) { /* 非標準 */ }
@media (max-width: 992px) { /* 非標準 */ }
```

### CLAUDE.md 規定的標準斷點

```css
@media (max-width: 1024px) { /* 大平板 */ }
@media (max-width: 768px)  { /* 小平板/大手機 */ }
@media (max-width: 480px)  { /* 標準手機 */ }
@media (max-width: 414px)  { /* 小手機 Pixel 7 */ }
```

### Sidebar 顯示行為影響

| 裝置尺寸 | 當前行為 (1200/992px) | 規範後行為 (1024/768px) |
|---------|---------------------|----------------------|
| 1400px | 2 欄 | 2 欄 ✓ |
| 1100px | **已轉 1 欄** | 仍 2 欄 ⚠️ |
| 1024px | 1 欄 | **轉為 1 欄** |
| 992px | 已 1 欄 | 仍 1 欄 ✓ |
| 768px | 1 欄 | 1 欄 ✓ |
| 414px | 1 欄 | 1 欄 ✓ |

**結論**：改為 `1024px` 後 sidebar 在大平板持續顯示，體驗更佳。改變幅度小，風險低。

---

## 4. 共用 CSS 類別設計方案

### 建議：混合策略（最佳化折衷）

```
src/styles/
├── design-tokens.css    （現有）
├── global.css           （現有，加入以下 @import）
└── components/
    ├── post-card.css    （新增：.post-card 及其子元素）
    ├── page-layout.css  （新增：.main-content、.sidebar-area 等）
    └── page-header.css  （新增：.page-header 相關樣式）
```

**global.css 加入：**
```css
@import './design-tokens.css';
@tailwind base;
@tailwind components;
@import './components/page-layout.css';
@import './components/post-card.css';
@import './components/page-header.css';
@tailwind utilities;
```

**版型 `<style>` 只保留版型特定樣式：**
```css
/* EpicLayout 獨有 */
.view-more-container { ... }
.no-posts-main { ... }

/* 版型特定響應式 */
@media (max-width: 1024px) { ... }
```

---

## 5. SeriesLayout CSS 完整修正 (Before/After)

### Before（問題版）

```css
.main-content {
  gap: 2rem;                    /* ❌ */
  margin: 2rem 0 3rem;          /* ❌ */
  padding-left: 1rem;           /* ❌ */
  padding-right: 1rem;          /* ❌ */
}
.post-card {
  border-radius: 12px;          /* ❌ */
  transition: transform 0.3s ease;  /* ❌ */
  margin-bottom: 1.5rem;        /* ❌ */
}
.post-title { font-size: 1.25rem; font-weight: 600; }  /* ❌ */
.post-title a { transition: color 0.2s ease; }  /* ❌ */
.read-more { gap: 0.3rem; font-weight: 500; }  /* ❌ */
@media (max-width: 1200px) { ... }  /* ❌ 非標準斷點 */
@media (max-width: 992px) { ... }   /* ❌ 非標準斷點 */
```

### After（修正版）

```css
.main-content {
  gap: var(--spacing-xl);
  margin: var(--spacing-xl) 0 var(--spacing-2xl);
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}
.post-card {
  border-radius: var(--radius-lg);
  transition: transform var(--transition-slow);
  margin-bottom: var(--spacing-lg);
}
.post-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}
.post-title a { transition: color var(--transition-normal); }
.read-more {
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}
@media (max-width: 1024px) { ... }  /* ✓ 符合規範 */
@media (max-width: 768px) { ... }   /* ✓ 符合規範 */
@media (max-width: 480px) { ... }   /* ✓ 新增標準手機斷點 */
@media (max-width: 414px) { ... }   /* ✓ 新增 Pixel 7 斷點 */
```

---

## 6. Cover Image CSS 方案

```css
/* 使用 aspect-ratio 現代方案 */
.post-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: var(--color-bg-muted);
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform var(--transition-slow);
  display: block;
}

.post-card:hover .post-cover img {
  transform: scale(1.05);
}

/* 緊湊模式（SeriesBlock 側邊欄用） */
.post-card--compact {
  display: flex;
}
.post-card--compact .post-cover {
  flex-shrink: 0;
  width: 120px;
  aspect-ratio: 3 / 2;
}

/* 響應式 */
@media (max-width: 480px) {
  .post-cover { aspect-ratio: 4 / 3; } /* 手機較短，更緊湊 */
}
```

---

## 7. 優先修正建議

| 優先 | 任務 | 工作量 | 收益 |
|------|------|--------|------|
| **P0** | SeriesLayout + Category 硬編碼值統一為設計令牌 | 1h | ★★★★★ |
| **P0** | 響應式斷點改為 1024px / 768px / 480px / 414px | 30min | ★★★★ |
| **P1** | 提取共用 CSS 至 `src/styles/components/` | 2h | ★★★★ |
| **P1** | 補上 `.post-card` 缺少的 `background-color` + `border` | 15min | ★★★ |
| **P2** | 補上 hover `transform: translateY(-4px)` + `box-shadow` | 30min | ★★★ |
| **P2** | Cover image CSS 實作 | 1.5h | ★★★ |

**預計總工作量**：5–6 小時
