# Blog UX / SEO / CTA 改善 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 改善部落格的 SEO meta description、留言互動引導、分類卡可點擊性，以及新增首頁 Facebook 主力 CTA。

**Architecture:** 四個獨立、互不依賴的小改動。Task 1-3 為現有檔案的局部修改，Task 4 新增一個靜態組件並插入首頁。所有改動均為純 HTML/CSS/Astro，無 JavaScript 新增。

**Tech Stack:** Astro 5.x、Tailwind CSS、CSS custom properties（設計令牌）

---

## Task 1：分類頁 meta description 補強

**Goal:** 讓四個分類頁各有唯一的 meta description，而非共用全站描述。

**Files:**
- Modify: `src/layouts/EpicLayout.astro:8,30`

### Step 1：移除 SITE_DESCRIPTION import

`src/layouts/EpicLayout.astro` 第 8 行，移除 `SITE_DESCRIPTION`：

```diff
- import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
+ import { SITE_TITLE } from '../consts';
```

### Step 2：將 BaseHead description 改為 epicDescription

同檔第 30 行：

```diff
- <BaseHead title={`${epicTitle} | ${SITE_TITLE}`} description={SITE_DESCRIPTION} />
+ <BaseHead title={`${epicTitle} | ${SITE_TITLE}`} description={epicDescription} />
```

### Step 3：驗證 TypeScript 無錯誤

```bash
cd /c/Repos/eanlee.github.io
npx astro check
```

期望輸出：0 errors

### Step 4：Commit

```bash
git add src/layouts/EpicLayout.astro
git commit -m "fix: 修正分類頁使用各自的 meta description 而非全站通用描述"
```

---

## Task 2：留言系統互動提示

**Goal:** 在 Giscus 留言框上方加入邀請讀者互動的提示文字。

**Files:**
- Modify: `src/layouts/BlogPost.astro:193-195`

### Step 1：在 Giscus 前插入 comment-cta 區塊

`src/layouts/BlogPost.astro` 找到以下段落（約第 193 行）：

```html
              <!-- 留言系統 -->
              <Giscus />
```

替換為：

```html
              <!-- 留言互動提示 -->
              <div class="comment-cta">
                <h2 class="comment-cta-title">💬 留下你的想法</h2>
                <p class="comment-cta-desc">有問題、不同看法，或是你踩過類似的坑？歡迎留言討論，我會盡量回覆。</p>
              </div>

              <!-- 留言系統 -->
              <Giscus />
```

### Step 2：在同檔的 `<style>` 區塊末尾加入樣式

在 BlogPost.astro 的 `<style>` 區塊內加入：

```css
  /* 留言互動提示 */
  .comment-cta {
    margin: var(--spacing-2xl) 0 var(--spacing-lg);
    padding: var(--spacing-lg);
    border-left: 3px solid var(--color-primary, #4299e1);
    background: color-mix(in srgb, var(--color-primary, #4299e1) 6%, transparent);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .comment-cta-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: 0 0 var(--spacing-xs);
    color: var(--color-text);
  }

  .comment-cta-desc {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.6;
  }
```

### Step 3：驗證 TypeScript 無錯誤

```bash
npx astro check
```

期望輸出：0 errors

### Step 4：Commit

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat: 新增文章留言區互動提示，引導讀者留言討論"
```

---

## Task 3：CategoryGrid coming-soon → 可點擊跳轉

**Goal:** 移除「即將推出」分類卡的 `pointer-events: none`，讓讀者可以點進分類頁；同時升級空態頁面的提示文字。

**Files:**
- Modify: `src/components/CategoryGrid.astro:189-192`
- Modify: `src/layouts/EpicLayout.astro:103-107`

### Step 1：CategoryGrid — 移除 coming-soon 的點擊禁用

`src/components/CategoryGrid.astro` 找到以下樣式（約第 189-192 行）：

```css
  .category-card.coming-soon {
    opacity: 0.7;
    cursor: default;
    pointer-events: none;
  }
```

替換為：

```css
  .category-card.coming-soon {
    opacity: 0.75;
  }
```

### Step 2：EpicLayout — 升級空態提示訊息

`src/layouts/EpicLayout.astro` 找到以下段落（約第 103-107 行）：

```html
              <div class="no-posts">
                <p>暫無{epicTitle}相關文章</p>
              </div>
```

替換為：

```html
              <div class="no-posts">
                <p class="no-posts-main">✍️ 這個分類的文章正在整理中，敬請期待！</p>
                <p class="no-posts-sub">
                  可以先到 <a href="/about/">關於我</a> 了解這個部落格的方向，
                  或透過 <a href="https://www.facebook.com/276561129952456" target="_blank" rel="noopener noreferrer">Facebook</a> 追蹤最新動態。
                </p>
              </div>
```

### Step 3：在 EpicLayout `<style>` 區塊補充空態樣式

在 EpicLayout.astro 的 `<style>` 區塊中找到 `.no-posts` 的現有樣式（若有）或在末尾加入：

```css
  .no-posts {
    text-align: center;
    padding: var(--spacing-3xl) var(--spacing-xl);
    color: var(--color-text-muted);
  }

  .no-posts-main {
    font-size: var(--font-size-lg);
    font-weight: 500;
    margin: 0 0 var(--spacing-md);
  }

  .no-posts-sub {
    font-size: var(--font-size-base);
    margin: 0;
    line-height: 1.7;
  }

  .no-posts-sub a {
    color: var(--color-primary, #4299e1);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .no-posts-sub a:hover {
    opacity: 0.8;
  }
```

### Step 4：驗證 TypeScript 無錯誤

```bash
npx astro check
```

期望輸出：0 errors

### Step 5：Commit

```bash
git add src/components/CategoryGrid.astro src/layouts/EpicLayout.astro
git commit -m "feat: 分類卡「即將推出」改為可點擊跳轉，並升級空態頁提示"
```

---

## Task 4：首頁軟性 CTA — Facebook 主力

**Goal:** 在首頁 CategoryGrid 後新增 FollowCTA 組件，以 Facebook 為主 CTA，RSS、X、GitHub 為輔助連結。

**Files:**
- Create: `src/components/FollowCTA.astro`
- Modify: `src/pages/index.astro:5-10,163-167`

### Step 1：建立 FollowCTA.astro 組件

建立 `src/components/FollowCTA.astro`，完整內容如下：

```astro
---
---

<section class="follow-cta">
  <div class="cta-inner">
    <div class="cta-text">
      <p class="cta-headline">📬 喜歡這裡的內容？</p>
      <p class="cta-sub">追蹤 Facebook 粉絲頁，第一時間收到文章更新</p>
    </div>

    <div class="cta-actions">
      <!-- 主 CTA：Facebook -->
      <a
        href="https://www.facebook.com/276561129952456"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-facebook"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        追蹤 Facebook 粉絲頁
      </a>

      <!-- 次要連結 -->
      <div class="secondary-links">
        <span class="secondary-label">也可以透過：</span>
        <a href="/rss.xml" target="_blank" rel="noopener noreferrer" class="secondary-link" title="RSS 訂閱">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 11a9 9 0 0 1 9 9"/>
            <path d="M4 4a16 16 0 0 1 16 16"/>
            <circle cx="5" cy="19" r="1"/>
          </svg>
          RSS
        </a>
        <a href="https://x.com/wosilee" target="_blank" rel="noopener noreferrer" class="secondary-link" title="X (Twitter)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </a>
        <a href="https://github.com/EanLee" target="_blank" rel="noopener noreferrer" class="secondary-link" title="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .follow-cta {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    background: color-mix(in srgb, var(--color-primary, #4299e1) 4%, var(--color-bg-secondary));
  }

  .cta-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xl);
    flex-wrap: wrap;
  }

  .cta-headline {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 var(--spacing-xs);
  }

  .cta-sub {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin: 0;
  }

  .cta-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-md);
    flex-shrink: 0;
  }

  /* Facebook 主 CTA 按鈕 */
  .btn-facebook {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 0.65rem 1.4rem;
    background-color: #1877F2;
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 600;
    text-decoration: none;
    transition: opacity var(--transition-fast, 0.15s ease);
    white-space: nowrap;
  }

  .btn-facebook:hover {
    opacity: 0.88;
  }

  /* 次要連結列 */
  .secondary-links {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .secondary-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .secondary-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--transition-fast, 0.15s ease);
  }

  .secondary-link:hover {
    color: var(--color-text);
  }

  /* 行動版 */
  @media (max-width: 768px) {
    .cta-inner {
      flex-direction: column;
      align-items: flex-start;
    }

    .cta-actions {
      align-items: flex-start;
      width: 100%;
    }

    .btn-facebook {
      width: 100%;
      justify-content: center;
    }

    .secondary-links {
      justify-content: flex-start;
    }
  }
</style>
```

### Step 2：在 index.astro 加入 import

`src/pages/index.astro` 的 frontmatter import 區塊（約第 5-10 行），在 `CategoryGrid` import 後加入：

```diff
  import CategoryGrid from "../components/CategoryGrid.astro";
+ import FollowCTA from "../components/FollowCTA.astro";
```

### Step 3：在 index.astro 插入組件

同檔找到以下段落（約第 163-167 行）：

```astro
        <!-- Category Grid -->
        <CategoryGrid allPosts={allPosts} />

        <!-- Featured Projects - 延遲渲染 -->
        <div class="below-fold">
```

插入 FollowCTA：

```astro
        <!-- Category Grid -->
        <CategoryGrid allPosts={allPosts} />

        <!-- Follow CTA -->
        <FollowCTA />

        <!-- Featured Projects - 延遲渲染 -->
        <div class="below-fold">
```

### Step 4：驗證 TypeScript 無錯誤

```bash
npx astro check
```

期望輸出：0 errors

### Step 5：啟動 dev server 視覺確認

```bash
npm run dev
```

確認清單：
- [ ] 首頁 CategoryGrid 下方出現 CTA 區塊
- [ ] Facebook 按鈕為藍色（#1877F2），hover 時略微變暗
- [ ] 次要連結（RSS、X、GitHub）正常顯示
- [ ] 行動版（視窗縮小到 375px）Facebook 按鈕全寬，次要連結靠左

### Step 6：Commit

```bash
git add src/components/FollowCTA.astro src/pages/index.astro
git commit -m "feat: 新增首頁 FollowCTA 組件，Facebook 為主 CTA"
```

---

## 最終驗證

```bash
npx astro check
```

確認所有 commit 已完成：

```bash
git log --oneline -5
```

期望看到 4 個新 commit：
1. `fix: 修正分類頁使用各自的 meta description 而非全站通用描述`
2. `feat: 新增文章留言區互動提示，引導讀者留言討論`
3. `feat: 分類卡「即將推出」改為可點擊跳轉，並升級空態頁提示`
4. `feat: 新增首頁 FollowCTA 組件，Facebook 為主 CTA`
