# UX & SEO Layout Improvements 實作計畫

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不修改任何文章內容的前提下，實作七項 Layout 層的 UX 與 SEO 改善。

**Architecture:** 所有改動限於 `src/components/`、`src/layouts/`、`src/pages/` 三個目錄的 Astro 元件與頁面。不碰 `src/content/` 下的任何 Markdown 文章。

**Tech Stack:** Astro 4.x、TypeScript、`astro:content` getCollection API、CSS 原生變數（design-tokens.css）

**Branch:** `feat/ux-seo-layout-improvements`

---

## 優先順序摘要

| # | 任務 | 影響面向 | 工時估計 |
|---|------|---------|---------|
| 1 | 相關文章推薦區塊（RelatedPosts）| UX + SEO | 40 分鐘 |
| 2 | OG 圖片加寬高屬性 | SEO（社群分享）| 5 分鐘 |
| 3 | Series rel="prev/next" 屬性 | SEO（系列爬取）| 5 分鐘 |
| 4 | 手機版 TOC 折疊按鈕 | UX（手機閱讀）| 30 分鐘 |
| 5 | 分類頁 CollectionPage Schema | SEO（Rich Results）| 15 分鐘 |
| 6 | 標籤頁 CollectionPage Schema | SEO（Rich Results）| 10 分鐘 |
| 7 | 文章新鮮度警示 | UX + 信任度 | 20 分鐘 |

---

## Task 1：相關文章推薦區塊（RelatedPosts）

**Files:**
- Create: `src/components/RelatedPosts.astro`
- Modify: `src/layouts/BlogPost.astro`（第 170-176 行，在 Giscus 前插入元件）

**背景：** 這是四個分析視角唯一的共同優先項。目前文章讀完後直接進入 Giscus，缺乏繼續閱讀的引導。

### Step 1：建立 RelatedPosts.astro 元件

```astro
---
// src/components/RelatedPosts.astro
import { getCollection } from "astro:content";

interface Props {
  currentSlug: string;
  tags?: string[];
  categories?: string[];
  series?: string;
}

const { currentSlug, tags = [], categories = [], series } = Astro.props;

const allPosts = await getCollection("blog");

// 排除目前這篇文章
const otherPosts = allPosts.filter(
  (p) => p.id.slice(0, p.id.lastIndexOf("/")).toLowerCase() !== currentSlug
);

// 優先邏輯：1) 同系列 → 2) 共同 tag 最多 → 3) 同分類
let related: typeof otherPosts = [];

if (series) {
  const seriesPosts = otherPosts.filter((p) => p.data.series === series);
  related = seriesPosts.slice(0, 4);
}

if (related.length < 3 && tags.length > 0) {
  const lowerTags = tags.map((t) => t.toLowerCase());
  const byTags = otherPosts
    .filter((p) => !related.some((r) => r.id === p.id))
    .filter((p) => p.data.tags?.some((t) => lowerTags.includes(t.toLowerCase())))
    .sort((a, b) => {
      const aMatch = a.data.tags?.filter((t) => lowerTags.includes(t.toLowerCase())).length ?? 0;
      const bMatch = b.data.tags?.filter((t) => lowerTags.includes(t.toLowerCase())).length ?? 0;
      return bMatch - aMatch;
    });
  related = [...related, ...byTags].slice(0, 4);
}

if (related.length < 3 && categories.length > 0) {
  const lowerCats = categories.map((c) => c.toLowerCase());
  const byCat = otherPosts
    .filter((p) => !related.some((r) => r.id === p.id))
    .filter((p) => p.data.categories?.some((c) => lowerCats.includes(c.toLowerCase())))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  related = [...related, ...byCat].slice(0, 4);
}

// 最終限制 3 篇
related = related.slice(0, 3);
---

{related.length > 0 && (
  <section class="related-posts">
    <h2 class="related-title">延伸閱讀</h2>
    <div class="related-grid">
      {related.map((post) => {
        const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
        return (
          <a href={`/post/${path}/`} class="related-card">
            <div class="related-card-body">
              <div class="related-meta">
                {post.data.tags?.slice(0, 2).map((tag) => (
                  <span class="related-tag">{tag}</span>
                ))}
              </div>
              <h3 class="related-card-title">{post.data.title}</h3>
              {post.data.description && (
                <p class="related-card-desc">
                  {post.data.description.length > 80
                    ? post.data.description.slice(0, 80) + "..."
                    : post.data.description}
                </p>
              )}
            </div>
          </a>
        );
      })}
    </div>
  </section>
)}

<style>
  .related-posts {
    margin: var(--spacing-2xl) 0 var(--spacing-xl);
    padding-top: var(--spacing-xl);
    border-top: 1px solid rgba(var(--gray-light), 0.5);
  }

  .related-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.9rem;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--spacing-md);
  }

  .related-card {
    display: block;
    padding: var(--spacing-md);
    border: 1px solid rgba(var(--gray-light), 0.3);
    border-radius: var(--radius-md);
    text-decoration: none;
    background-color: var(--color-bg-secondary);
    transition: border-color var(--transition-normal), transform var(--transition-normal);
  }

  .related-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  .related-meta {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
    margin-bottom: var(--spacing-xs);
  }

  .related-tag {
    font-size: 0.7rem;
    color: var(--color-primary);
    background-color: rgba(var(--accent-rgb), 0.1);
    padding: 0.1em 0.4em;
    border-radius: var(--radius-sm);
  }

  .related-card-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-xs);
    line-height: 1.4;
  }

  .related-card-desc {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .related-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

### Step 2：在 BlogPost.astro 引入並插入元件

在 `src/layouts/BlogPost.astro` 頂部 import 區加入：
```astro
import RelatedPosts from "../components/RelatedPosts.astro";
```

在第 17 行的 props 解構中，確認已有 `tags`、`categories`、`series`（已有）。

在文章內容區塊（`src/layouts/BlogPost.astro` 第 168-175 行）的 `<Giscus />` 前插入：
```astro
<!-- 延伸閱讀 -->
<RelatedPosts
  currentSlug={Astro.url.pathname.replace(/^\/post\//, "").replace(/\/$/, "")}
  tags={tags}
  categories={categories}
  series={series}
/>
```

### Step 3：build 確認無 TypeScript 錯誤

```bash
npm run build
```

預期：build 成功，無 type 錯誤。

### Step 4：Commit

```bash
git add src/components/RelatedPosts.astro src/layouts/BlogPost.astro
git commit -m "feat: 新增相關文章推薦區塊（RelatedPosts）"
```

---

## Task 2：OG 圖片加寬高屬性

**Files:**
- Modify: `src/components/BaseHead.astro`（第 25 行附近的 props 定義，以及 OG meta 標籤區）

**背景：** 目前 OG image 沒有寬高規格，Facebook/LinkedIn 需要額外請求才能得知尺寸，影響社群分享預覽渲染速度。

### Step 1：找到 BaseHead.astro 中的 OG image meta 標籤

先搜尋 og:image 標籤位置：
```bash
grep -n "og:image" src/components/BaseHead.astro
```

### Step 2：在現有 `og:image` 標籤後加入寬高

找到類似這樣的行：
```html
<meta property="og:image" content={...} />
```

在其後加入：
```html
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="twitter:image:width" content="1200" />
<meta property="twitter:image:height" content="630" />
```

同時在現有 `og:locale` 缺失的地方加入（若不存在）：
```html
<meta property="og:locale" content="zh_TW" />
```

### Step 3：Commit

```bash
git add src/components/BaseHead.astro
git commit -m "fix: 補充 OG 圖片寬高規格與 og:locale 標籤"
```

---

## Task 3：Series rel="prev/next" 屬性

**Files:**
- Modify: `src/components/series-article-nav.astro`（第 52-69 行的 prev/next anchor 標籤）

**背景：** 系列文章的前後導航 anchor 目前只是普通連結，加上 `rel="prev"` / `rel="next"` 後，搜尋引擎能正確理解系列的閱讀順序。

### Step 1：找到 prev link

`series-article-nav.astro` 第 54-57 行：
```astro
<a class="no-underline" href={getPostPath(previousPost)}>
```

改為：
```astro
<a class="no-underline" rel="prev" href={getPostPath(previousPost)}>
```

### Step 2：找到 next link

第 64-67 行：
```astro
<a class="no-underline" href={getPostPath(nextPost)}>
```

改為：
```astro
<a class="no-underline" rel="next" href={getPostPath(nextPost)}>
```

### Step 3：Commit

```bash
git add src/components/series-article-nav.astro
git commit -m "fix: 補充系列文章 Prev/Next 連結的 rel 屬性"
```

---

## Task 4：手機版 TOC 折疊按鈕

**Files:**
- Modify: `src/components/TableOfContents.astro`（HTML 結構、CSS、JavaScript）

**背景：** 目前 TOC 在 `@media (max-width: 1023px)` 設定 `display: none`，手機用戶完全無法使用。改為折疊按鈕，保留功能，只改呈現方式。

### Step 1：修改 HTML 結構，加入 toggle button

將現有的 HTML：
```html
<div class="toc-wrapper">
  <h3 class="toc-header">目錄</h3>
  <nav id="toc-nav" class="toc-nav"></nav>
</div>
```

改為：
```html
<div class="toc-wrapper">
  <button class="toc-toggle" aria-expanded="false" aria-controls="toc-nav" id="toc-toggle-btn">
    <span class="toc-toggle-icon">☰</span>
    <span class="toc-header">目錄</span>
    <span class="toc-toggle-arrow">▾</span>
  </button>
  <nav id="toc-nav" class="toc-nav" hidden></nav>
</div>
```

注意：桌面版（>1024px）的 `toc-toggle` 按鈕要隱藏，直接顯示 `toc-header` 的 h3。為了不改動結構，桌面版用 CSS 讓 button 表現如同靜態標題。

### Step 2：在 `<script>` 區加入 toggle 邏輯

在既有的 `initTOC()` 函式內，加入以下邏輯（在 `tocNav.innerHTML = ''` 之前）：

```javascript
// 手機版折疊按鈕
const toggleBtn = document.getElementById('toc-toggle-btn');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    if (isExpanded) {
      tocNav.setAttribute('hidden', '');
    } else {
      tocNav.removeAttribute('hidden');
    }
  });
}
```

### Step 3：更新 CSS

在 `<style>` 區，將現有的 `@media (max-width: 1023px)` 的 `display: none` 改為：

```css
/* 桌面版：隱藏 toggle button，顯示一般標題樣式 */
.toc-toggle {
  display: none; /* 桌面版不顯示按鈕 */
}

.toc-header {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: block; /* 桌面版直接顯示 */
}

/* 手機版 */
@media (max-width: 1023px) {
  .toc-wrapper {
    /* 移除 display: none，改為可見但折疊 */
    position: static;
    max-height: none;
    overflow-y: visible;
    padding-left: 0;
    margin: var(--spacing-md) 0;
    border: 1px solid rgba(var(--gray-light), 0.3);
    border-radius: var(--radius-md);
  }

  .toc-header {
    display: none; /* 手機版由 button 取代 */
  }

  .toc-toggle {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .toc-toggle-icon {
    font-size: 1rem;
  }

  .toc-toggle-arrow {
    margin-left: auto;
    transition: transform var(--transition-normal);
  }

  .toc-toggle[aria-expanded="true"] .toc-toggle-arrow {
    transform: rotate(180deg);
  }

  #toc-nav:not([hidden]) {
    padding: 0 var(--spacing-md) var(--spacing-md);
  }
}
```

### Step 4：確認桌面版 `toc-nav` 預設不被 `hidden` 影響

桌面版的 `toc-nav` 有 `hidden` 屬性（HTML 初始設定），需要在桌面版用 CSS 覆蓋：

```css
@media (min-width: 1024px) {
  #toc-nav {
    display: block !important; /* 強制桌面版顯示，覆蓋 hidden attribute */
  }
}
```

### Step 5：build 確認

```bash
npm run build
```

### Step 6：Commit

```bash
git add src/components/TableOfContents.astro
git commit -m "feat: 手機版 TOC 改為折疊按鈕（< 1024px）"
```

---

## Task 5：分類頁 CollectionPage Schema

**Files:**
- Modify: `src/pages/categories/[...category].astro`

**背景：** 分類頁目前沒有結構化資料，搜尋引擎不清楚這是文章彙整頁。加上 `CollectionPage` JSON-LD 後，有機會在 SERP 觸發更豐富的結果。

### Step 1：在 frontmatter 區加入 JSON-LD 資料準備

在 `[...category].astro` 的 `---` frontmatter 區（約第 70 行之前），加入：

```typescript
// CollectionPage 結構化資料
const categoryJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `${formattedCategory} - 伊恩的開發狂想`,
  description: `探索「${formattedCategory}」分類下的 ${categoryCount} 篇文章`,
  url: new URL(`/categories/${category}/`, Astro.site).href,
  numberOfItems: categoryCount,
  itemListElement: filteredPosts.slice(0, 10).map((post, index) => {
    const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
    return {
      "@type": "ListItem",
      position: index + 1,
      url: new URL(`/post/${path}/`, Astro.site).href,
      name: post.data.title,
    };
  }),
};
```

### Step 2：在 `<head>` 區插入 JSON-LD script

在 `<BaseHead .../>` 之後加入：
```astro
<script type="application/ld+json" set:html={JSON.stringify(categoryJsonLd)} />
```

### Step 3：Commit

```bash
git add src/pages/categories/[...category].astro
git commit -m "feat: 分類頁加入 CollectionPage JSON-LD 結構化資料"
```

---

## Task 6：標籤頁 CollectionPage Schema

**Files:**
- Modify: `src/pages/tags/[...tag].astro`

**背景：** 與 Task 5 相同邏輯，適用於 tag 頁面。

### Step 1：在 frontmatter 加入 JSON-LD 資料

在 `[...tag].astro` frontmatter 區（約第 48 行之前），加入：

```typescript
// CollectionPage 結構化資料
const tagJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `${originalTag} - 伊恩的開發狂想`,
  description: `探索所有標記為「${originalTag}」的文章，共 ${filteredPosts.length} 篇`,
  url: new URL(`/tags/${tag}/`, Astro.site).href,
  numberOfItems: filteredPosts.length,
  itemListElement: filteredPosts.slice(0, 10).map((post, index) => {
    const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
    return {
      "@type": "ListItem",
      position: index + 1,
      url: new URL(`/post/${path}/`, Astro.site).href,
      name: post.data.title,
    };
  }),
};
```

### Step 2：在 `<head>` 區插入 JSON-LD

在 `<BaseHead .../>` 之後加入：
```astro
<script type="application/ld+json" set:html={JSON.stringify(tagJsonLd)} />
```

### Step 3：Commit

```bash
git add src/pages/tags/[...tag].astro
git commit -m "feat: 標籤頁加入 CollectionPage JSON-LD 結構化資料"
```

---

## Task 7：文章新鮮度警示

**Files:**
- Modify: `src/layouts/BlogPost.astro`（date/lastmod 顯示區，約第 133-142 行）

**背景：** 技術文章版本過時是常見問題。在 Layout 層加入警示，讓讀者知道文章可能需要對照最新文檔。此功能完全不修改文章內容。

**規則：** 若 `date` 距今超過 **730 天（2 年）**，顯示橘色警示標語。

### Step 1：在 frontmatter 區計算文章年齡

在 `BlogPost.astro` 的 frontmatter 區（`---` 之前），加入：

```typescript
// 文章新鮮度：超過 2 年顯示警示
const TWO_YEARS_MS = 730 * 24 * 60 * 60 * 1000;
const articleAge = Date.now() - date.getTime();
const isStale = articleAge > TWO_YEARS_MS;
const staleYear = date.getFullYear();
```

### Step 2：在 `.title-overlay` 內（date 區塊之後）加入警示

在文章 Hero 區塊（約第 133-145 行之後），加入：

```astro
{isStale && (
  <div class="stale-warning">
    ⚠️ 此文章發布於 {staleYear} 年，部分工具版本或語法可能已更新，建議對照官方文檔確認。
  </div>
)}
```

### Step 3：加入對應 CSS

在 `<style>` 區加入：

```css
.stale-warning {
  margin-top: var(--spacing-sm);
  padding: 0.4em 0.8em;
  background-color: rgba(237, 137, 54, 0.2);
  border: 1px solid rgba(237, 137, 54, 0.5);
  border-radius: var(--radius-sm);
  color: #ed8936;
  font-size: 0.8em;
  line-height: 1.5;
  text-align: center;
}
```

### Step 4：build 確認

```bash
npm run build
```

### Step 5：Commit

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat: 超過兩年的文章顯示新鮮度警示"
```

---

## 最終驗證

完成所有 Task 後執行：

```bash
npm run build && npm run preview
```

逐一確認：
- [ ] 文章頁面底部（Giscus 上方）出現「延伸閱讀」區塊，最多 3 篇
- [ ] 社群分享預覽（可用 [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/) 測試）出現正確圖片尺寸
- [ ] 系列文章的 `<a rel="prev">` 和 `<a rel="next">` 存在（瀏覽器 DevTools 確認）
- [ ] 手機版（< 1024px）TOC 顯示為可折疊的「☰ 目錄」按鈕
- [ ] `/categories/software/` 和 `/tags/docker/` 頁面的 `<script type="application/ld+json">` 包含 `CollectionPage` 類型
- [ ] 超過兩年的舊文章出現橘色警示標語，新文章不出現
