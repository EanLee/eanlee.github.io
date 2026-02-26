# 設計文件：部落格 UX / SEO / CTA 改善

**日期**：2026-02-26
**分支**：`improve/blog-ux-and-discovery`
**前提限制**：不修改文章內容

---

## 背景

依據四角度圓桌分析（`docs/analysis/blog-roundtable-analysis.md`），選出優先執行的四項改善：

1. 分類頁 meta description 補強（SEO）
2. 留言系統互動提示（讀者黏著）
3. CategoryGrid coming-soon → 可點擊跳轉（UX）
4. 首頁軟性 CTA — Facebook 主力（行銷）

---

## 任務 1：分類頁 meta description 補強

### 問題

`EpicLayout.astro` 的 `<BaseHead>` 傳入的是全站通用 `SITE_DESCRIPTION`，導致四個分類頁（軟體開發、管理經驗、閱讀心得、自我成長）的 meta description **完全相同**。

> 注意：`<h1>` 已存在（EpicLayout 第 47 行），不需補強。

### 解法

**檔案**：`src/layouts/EpicLayout.astro`

```diff
- <BaseHead title={`${epicTitle} | ${SITE_TITLE}`} description={SITE_DESCRIPTION} />
+ <BaseHead title={`${epicTitle} | ${SITE_TITLE}`} description={epicDescription} />
```

各分類頁已有各自的 `epicDescription`，透過 Props 傳入 EpicLayout，直接使用即可。

### 影響

- `software.astro`、`management.astro`、`growth.astro`、`reading.astro` 四頁的 meta description 自動使用各自的描述文字
- 不需修改任何分類頁本身

---

## 任務 2：留言系統互動提示

### 問題

`BlogPost.astro` 中，Giscus 留言系統直接放在 RelatedPosts 後，無任何視覺提示或邀請文字，讀者容易忽略。

### 解法

**檔案**：`src/layouts/BlogPost.astro`

在 `<Giscus />` 前插入互動呼籲區塊：

```html
<!-- 留言呼籲 -->
<div class="comment-cta">
  <h2 class="comment-cta-title">💬 留下你的想法</h2>
  <p class="comment-cta-desc">
    有問題、不同看法，或是你踩過類似的坑？歡迎留言討論，我會盡量回覆。
  </p>
</div>

<!-- 留言系統 -->
<Giscus />
```

搭配輕量 CSS（border-left 裝飾線、muted 色調，不搶主體文章視覺）。

---

## 任務 3：CategoryGrid coming-soon → 可點擊跳轉

### 問題

「閱讀心得」和「個人成長」分類在文章數為 0 時，CategoryGrid 套用 `.coming-soon` 樣式並設定 `pointer-events: none`，讀者完全無法點擊。

### 解法

**檔案 A**：`src/components/CategoryGrid.astro`

移除 `.coming-soon` 的 `pointer-events: none` 和 `cursor: default`，讓卡片正常連結到分類頁。保留視覺上的 opacity 差異（`opacity: 0.75`）和「即將推出」badge 作為說明，但恢復可點擊。

```css
/* 修改後 */
.category-card.coming-soon {
  opacity: 0.75;
  /* 移除: pointer-events: none; cursor: default; */
}
```

**檔案 B**：`src/layouts/EpicLayout.astro`

空態訊息升級為有溫度的提示，並加入 About 頁連結：

```html
<!-- 修改前 -->
<div class="no-posts">
  <p>暫無{epicTitle}相關文章</p>
</div>

<!-- 修改後 -->
<div class="no-posts">
  <p>✍️ 這個分類的文章正在整理中，敬請期待！</p>
  <p class="no-posts-sub">
    可以先到 <a href="/about/">關於我</a> 了解這個部落格的方向，
    或透過 <a href="https://facebook.com/276561129952456" target="_blank" rel="noopener">Facebook</a> 追蹤最新動態。
  </p>
</div>
```

---

## 任務 4（原 5）：首頁軟性 CTA — Facebook 主力

### 問題

首頁目前無任何追蹤 / 訂閱的引導，讀者看完文章或分類後沒有「下一步」。

### 解法

新增 **`src/components/FollowCTA.astro`** 組件，並在 `src/pages/index.astro` 加入於 **CategoryGrid 後、FeaturedProjects 前**。

#### 組件結構

```
┌─────────────────────────────────────────────────────┐
│  📬  喜歡這裡的內容？                               │
│  追蹤 Facebook 粉絲頁，第一時間收到文章更新        │
│                                                     │
│  [f  追蹤 Facebook 粉絲頁]   ← 主 CTA，大按鈕     │
│                                                     │
│  也可以透過：[RSS] · [X] · [GitHub]                │
└─────────────────────────────────────────────────────┘
```

#### 規格

| 元素 | 規格 |
|------|------|
| 容器 | `border: 1px solid var(--color-border)`，`border-radius: var(--radius-lg)`，`padding: var(--spacing-xl)` |
| 主 CTA | Facebook 藍（`#1877F2`），icon + 「追蹤 Facebook 粉絲頁」，`target="_blank"` |
| 次要連結 | RSS（`/rss.xml`）、X（`https://x.com/wosilee`）、GitHub（`https://github.com/EanLee`），文字+icon 小連結 |
| 行動版 | 按鈕全寬，次要連結橫排居中 |
| JS | 無（純靜態） |

#### index.astro 插入位置

```astro
<!-- Category Grid -->
<CategoryGrid allPosts={allPosts} />

<!-- Follow CTA -->          ← 新增
<FollowCTA />

<!-- Featured Projects -->
<div class="below-fold">
  <FeaturedProjects />
</div>
```

---

## 檔案異動清單

| 檔案 | 異動類型 |
|------|---------|
| `src/layouts/EpicLayout.astro` | 修改（2 處：BaseHead description、空態訊息） |
| `src/layouts/BlogPost.astro` | 修改（Giscus 前插入 comment-cta） |
| `src/components/CategoryGrid.astro` | 修改（移除 pointer-events: none） |
| `src/components/FollowCTA.astro` | 新增 |
| `src/pages/index.astro` | 修改（插入 FollowCTA） |

---

## 成功標準

- [ ] 四個分類頁各有唯一的 meta description
- [ ] 文章底部留言區有清楚的互動提示文字
- [ ] 「閱讀心得」與「個人成長」分類卡可正常點擊，進入空態頁顯示友善提示
- [ ] 首頁 CategoryGrid 下方有 FollowCTA，Facebook 主 CTA 可正常開啟
- [ ] 行動版版面正常
