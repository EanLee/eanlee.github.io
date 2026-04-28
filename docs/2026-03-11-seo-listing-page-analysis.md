# SEO 列表頁結構化資料評估報告

**報告日期**：2026-03-11
**專案**：eanlee.github.io (Astro 5 SSG)
**分析範圍**：EpicLayout、SeriesLayout、categories/[...category] 三個列表版型

---

## 1. 現狀 SEO 品質評估

### 1.1 最嚴重問題（P0）

**SeriesLayout 和 Category 的 meta description 固定使用全域 `SITE_DESCRIPTION`**

| 版型 | 問題位置 | 影響 |
|------|---------|------|
| `SeriesLayout.astro` | 第 59 行 `description={SITE_DESCRIPTION}` | 所有系列頁面 description 完全相同 |
| `categories/[...category].astro` | 第 95 行 `description={SITE_DESCRIPTION}` | 所有分類頁面 description 完全相同 |

這導致 `<meta name="description">` 和 `og:description` 對所有列表頁完全一致，Google 判定為重複內容，CTR 大幅降低。

#### 修正方案（僅改一行）

```astro
<!-- SeriesLayout.astro 第 59 行 -->
<!-- Before -->
<BaseHead title={`${seriesTitle} | ${SITE_TITLE}`} description={SITE_DESCRIPTION} />

<!-- After -->
<BaseHead
  title={`${seriesTitle} | ${SITE_TITLE}`}
  description={`${seriesTitle} 系列文章，共 ${seriesPosts.length} 篇，依序帶你從基礎到實踐。${seriesPosts[0]?.data.description ?? ''}`}
/>
```

```astro
<!-- categories/[...category].astro 第 95 行 -->
<!-- Before -->
<BaseHead title={pageTitle + " - " + SITE_TITLE} description={SITE_DESCRIPTION} />

<!-- After -->
<BaseHead
  title={`${formattedCategory} | ${SITE_TITLE}`}
  description={`探索「${formattedCategory}」分類下的 ${categoryCount} 篇技術文章，涵蓋實作經驗與深度分析。`}
/>
```

---

### 1.2 JSON-LD 結構化資料覆蓋情況

| 版型 | 狀態 | 問題 |
|------|------|------|
| **EpicLayout** | ❌ 完全缺失 | 無任何 JSON-LD |
| **SeriesLayout** | ❌ 完全缺失 | 無任何 JSON-LD |
| **Category** | ⚠️ 部分實作 | CollectionPage 存在，但 ListItem 缺少 `item` 包裝和 `image` 欄位 |

#### Category 現有 JSON-LD 的問題（第 73-89 行）

```json
// 目前的 ListItem（不完整）
{
  "@type": "ListItem",
  "position": 1,
  "url": "...",   // ❌ 缺少 item 物件包裝
  "name": "..."   // ❌ 缺少 image 欄位
}

// 應改為
{
  "@type": "ListItem",
  "position": 1,
  "item": {
    "@type": "Article",
    "@id": "https://eanlee.github.io/post/xxx/",
    "url": "https://eanlee.github.io/post/xxx/",
    "name": "文章標題",
    "image": { "@type": "ImageObject", "url": "..." }
  }
}
```

---

### 1.3 og:image 問題

`BaseHead.astro` 的 `image` 參數預設為 `/blog-placeholder-1.jpg`，三個列表版型都沒有傳入自訂 `image`，所有列表頁的社群分享圖片完全相同。

---

### 1.4 title 格式不一致

| 版型 | 格式 |
|------|------|
| EpicLayout / SeriesLayout | `名稱 \| SITE_TITLE` （管線）|
| Category | `名稱 - SITE_TITLE` （破折號）|

建議統一為管線格式（`\|`），語意更清晰。

---

## 2. 結構化資料缺口與改善建議

### 2.1 EpicLayout 建議：CollectionPage + BreadcrumbList

```javascript
// EpicLayout.astro frontmatter 中加入
const epicJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": new URL(`/${epicName}/`, Astro.site).href,
      "name": `${epicTitle} | ${SITE_TITLE}`,
      "description": epicDescription,
      "url": new URL(`/${epicName}/`, Astro.site).href,
      "inLanguage": "zh-TW",
      "numberOfItems": epicPosts.length,
      "itemListElement": epicPosts.slice(0, 10).map((post, index) => {
        const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
        const coverUrl = getCoverImageUrl(post, Astro.site);
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Article",
            "@id": new URL(`/post/${path}/`, Astro.site).href,
            "url": new URL(`/post/${path}/`, Astro.site).href,
            "name": post.data.title,
            "description": post.data.description,
            "datePublished": post.data.date.toISOString(),
            ...(coverUrl ? {
              "image": {
                "@type": "ImageObject",
                "url": coverUrl,
                "width": 1200,
                "height": 630
              }
            } : {})
          }
        };
      })
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "首頁", "item": Astro.site.href },
        { "@type": "ListItem", "position": 2, "name": epicTitle, "item": new URL(`/${epicName}/`, Astro.site).href }
      ]
    }
  ]
};
```

```astro
<!-- EpicLayout.astro <head> 中加入 -->
<script type="application/ld+json" set:html={JSON.stringify(epicJsonLd)} />
```

---

### 2.2 SeriesLayout 建議：ItemList + BreadcrumbList

系列文章有順序性，應使用 `ItemList`（而非 `CollectionPage`），並加入 `itemListOrder`：

```javascript
// SeriesLayout.astro frontmatter 中加入
const seriesJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "@id": new URL(`/series/${seriesName}/`, Astro.site).href,
      "name": seriesTitle,
      "url": new URL(`/series/${seriesName}/`, Astro.site).href,
      "inLanguage": "zh-TW",
      "numberOfItems": seriesPosts.length,
      "itemListOrder": "https://schema.org/ItemListOrderAscending",
      "itemListElement": seriesPosts.map((post, index) => {
        const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
        const coverUrl = getCoverImageUrl(post, Astro.site);
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Article",
            "@id": new URL(`/post/${path}/`, Astro.site).href,
            "url": new URL(`/post/${path}/`, Astro.site).href,
            "name": post.data.title,
            "description": post.data.description,
            "datePublished": post.data.date.toISOString(),
            ...(coverUrl ? {
              "image": { "@type": "ImageObject", "url": coverUrl }
            } : {})
          }
        };
      })
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "首頁", "item": Astro.site.href },
        { "@type": "ListItem", "position": 2, "name": "系列文章", "item": new URL("/series/", Astro.site).href },
        { "@type": "ListItem", "position": 3, "name": seriesTitle, "item": new URL(`/series/${seriesName}/`, Astro.site).href }
      ]
    }
  ]
};
```

---

### 2.3 Cover Image URL 輔助函式

`config.ts` 中 `coverImage` 和 `cover` 支援兩種格式（Astro image() 物件或字串），需要統一處理：

```typescript
// 放在 SeriesLayout.astro 和 EpicLayout.astro 的 frontmatter 中
function getCoverImageUrl(post: any, site: URL): string | null {
  const cover = post.data.coverImage || post.data.cover;
  if (!cover) return null;
  if (typeof cover === "string") return new URL(cover, site).href;
  if (cover?.src) return new URL(cover.src, site).href;  // Astro image() 物件
  return null;
}
```

---

## 3. Cover Image 與 SEO 的關聯

### 直接影響

1. **JSON-LD `ListItem.image`**：無 cover 就無法填入 `image` 欄位，影響 Google Rich Results
2. **Google Discover**：偏好有 1200px 以上封面圖的文章，無圖失去 Discover 曝光機會
3. **社群分享（og:image）**：可動態設為各列表頁的第一篇文章封面圖

### 間接影響

4. **CTR 提升**：搜尋結果中顯示圖片預覽可提高點擊率
5. **E-E-A-T 信號**：有視覺內容的頁面被判定為更豐富的內容

### og:image 改善方案

讓列表頁的 og:image 使用第一篇文章的 cover：

```astro
<!-- EpicLayout.astro -->
{() => {
  const firstPostCover = getCoverImageUrl(epicPosts[0], Astro.site);
  return (
    <BaseHead
      title={`${epicTitle} | ${SITE_TITLE}`}
      description={epicDescription}
      image={firstPostCover ?? undefined}
    />
  );
}}
```

---

## 4. 完整優先改善清單

| 優先 | 問題 | 難度 | 影響 |
|------|------|------|------|
| **P0** | SeriesLayout `description` 固定用全域值 | 低（改 1 行） | 所有系列頁 CTR |
| **P0** | Category `description` 固定用全域值 | 低（改 1 行） | 所有分類頁 CTR |
| **P1** | EpicLayout 缺少 CollectionPage JSON-LD | 中 | Rich Results 覆蓋率 |
| **P1** | SeriesLayout 缺少 ItemList JSON-LD | 中 | Rich Results 覆蓋率 |
| **P2** | Category `ListItem` 缺少 `item` 包裝和 `image` | 低 | JSON-LD 品質 |
| **P2** | 所有列表頁 `og:image` 固定為佔位圖 | 中 | 社群分享 CTR |
| **P3** | title 格式不一致（`\|` vs `-`） | 低 | 品牌一致性 |
| **P3** | `og:site_name` 未設定 | 低 | 社群分享品質 |

---

## 5. 其他 SEO 建議

### Series 文章的 Prev/Next Link

系列文章應在 `<head>` 加入 `rel="prev"` / `rel="next"` 標記，幫助 Google 理解文章順序：

```astro
<!-- BlogPost.astro 中，若有 series -->
{prevPost && <link rel="prev" href={`/post/${prevPath}/`} />}
{nextPost && <link rel="next" href={`/post/${nextPath}/`} />}
```

### Sitemap 確認

確認 `sitemap.xml` 是否正確包含：
- 所有 `/categories/{category}/` 頁面
- 所有 `/series/{slug}/` 頁面
- 所有 Epic 頁面（`/software/`、`/management/` 等）

### hreflang

目前為純中文網站，無需設定 hreflang。若未來增加英文版才需考慮。
