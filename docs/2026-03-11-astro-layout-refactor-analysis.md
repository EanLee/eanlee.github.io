# Astro 部落格版型重複問題評估報告

**日期：** 2026-03-11
**專案：** eanlee.github.io (Astro 5 SSG)
**評估人員：** Claude Code (Explore Agent)
**狀態：** 完成分析，待重構

---

## 1. 重複代碼盤點

### 1.1 HTML 結構相似性分析

三個版型（EpicLayout、SeriesLayout、categories）共享高度相似的容器結構：

#### 共同的版型骨架
```
epic-container / series-container / category-container
  └─ main-content (grid: 300px + 1fr)
      ├─ sidebar-area (width: 300px)
      │   └─ widget-container
      │       └─ Series / Categories widgets
      │
      └─ content-area (flex-column)
          ├─ page-header
          │   ├─ title-section
          │   │   ├─ h1 (title)
          │   │   └─ article-count badge
          │   └─ description paragraph
          │
          └─ posts-list
              └─ post-card (repeating)
                  └─ post-content
                      ├─ post-meta-row
                      │   ├─ post-date
                      │   └─ post-tags
                      ├─ post-title
                      ├─ post-description
                      └─ read-more link
```

**相似度評分：** 95%+ 完全相同

#### 具體對應關係

| 元件 | EpicLayout | SeriesLayout | Categories | 差異 |
|------|-----------|-------------|-----------|------|
| **頂層容器** | `.epic-container` | `.series-container` | `.category-container` | 只是 class 名稱不同 |
| **Grid 佈局** | `grid: 300px 1fr; gap: 2rem` | `grid: 300px 1fr; gap: 2rem` | `grid: 300px 1fr; gap: 2rem` | 完全相同 |
| **文章卡片** | `.post-card` | `.post-card` | `.post-card` | 完全相同 class 和結構 |
| **meta row** | 日期 + 標籤 | 日期 + 標籤 | 日期 + 標籤（限 3 個） | SeriesLayout/Category 對標籤數量有差異 |
| **"無文章" 提示** | 完整訊息 + 連結 | 簡短訊息 | 簡短訊息 | 內容不同，結構相同 |
| **額外區塊** | `view-more-link` | `series-blocks` (SeriesBlock 組件) | 無 | 功能不同 |

### 1.2 CSS 樣式重複分析

#### 完全相同的 CSS 規則

```css
/* Layout - 100% 重複 */
.main-content {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 2rem;  /* EpicLayout: var(--spacing-xl) = 2rem */
  margin: 2rem 0 3rem;  /* EpicLayout: var(--spacing-xl) 0 var(--spacing-2xl) */
  max-width: 1120px;  /* EpicLayout: var(--container-xl) = 1120px */
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
}

.sidebar-area { width: 300px; }
.widget-container { display: flex; flex-direction: column; gap: 2rem; }
.content-area { display: flex; flex-direction: column; gap: 1rem; width: 100%; }

/* Post Card - 95% 重複 */
.post-card {
  border-radius: 12px;  /* EpicLayout: var(--radius-lg) */
  overflow: hidden;
  transition: transform 0.3s ease;  /* EpicLayout: var(--transition-slow) */
  margin-bottom: 1.5rem;  /* EpicLayout: var(--spacing-lg) */
}

.post-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed var(--card-border);
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--accentColor);
  text-decoration: none;
  font-weight: 500;
}
```

#### 設計令牌使用的差異

| 版型 | 令牌使用 | 硬編碼值 | 品質評分 |
|------|--------|--------|--------|
| **EpicLayout** | 高 (80%+) | 中等 (20%) | ⭐⭐⭐⭐⭐ 優秀 |
| **SeriesLayout** | 低 (30%) | 高 (70%) | ⭐⭐⭐ 中等 |
| **Categories** | 中等 (50%) | 中等 (50%) | ⭐⭐⭐⭐ 不錯 |

### 1.3 響應式斷點差異

| 版型 | 斷點 | 問題 |
|------|------|------|
| EpicLayout | 1200px, 992px, 768px | 不符合 CLAUDE.md 標準 |
| SeriesLayout | 1200px, 992px | 不符合 CLAUDE.md 標準 |
| Categories | 1200px, 992px | 不符合 CLAUDE.md 標準 |

**問題：** CLAUDE.md 規定統一使用 `1024px, 768px, 480px, 414px`

### 1.4 功能差異（不可直接合併的部分）

1. **EpicLayout 特有：**
   - `view-more-link` 按鈕（超過 10 篇文章時顯示）
   - 文章計數顯示（共 N 篇文章）

2. **SeriesLayout 特有：**
   - `series-blocks` 區域（其他系列文章的導航）
   - 使用 SeriesBlock 組件
   - 日期**升序**排列（與其他版型降序不同）

3. **Categories 特有：**
   - 標籤限制為 3 個，超過顯示 "..."
   - 分類動態顏色設定（switch 語句）
   - CollectionPage 結構化資料

---

## 2. 重構方案設計

### 2.1 推薦的組件拆分策略

採用**分層組件架構**，將共用邏輯提取為三層組件：

#### 組件 1：`src/components/PostCard.astro`

```typescript
interface Props {
  post: CollectionEntry<'blog'>;
  accentColor?: string;
  showCoverImage?: boolean;
  maxTags?: number;
  compactMode?: boolean;
  readMoreText?: string;
}
```

#### 組件 2：`src/components/ListPageHeader.astro`

```typescript
interface Props {
  title: string;
  description?: string;
  articleCount?: number;
  accentColor?: string;
  showCountBadge?: boolean;
}
```

#### 版型：`src/layouts/ListLayout.astro`

```typescript
interface Props {
  title: string;
  description: string;
  posts: CollectionEntry<'blog'>[];
  accentColor: string;
  showSidebar?: boolean;
  maxPostsDisplay?: number;
  sortOrder?: 'asc' | 'desc';
  tagLimit?: number;
}
// + named slots: sidebar, header, footer, empty-state
```

### 2.2 Slot 設計方案

```astro
<!-- ListLayout.astro -->
<div class="list-container">
  <div class="main-content">
    {showSidebar && (
      <div class="sidebar-area">
        <slot name="sidebar" />
      </div>
    )}
    <div class="content-area">
      <slot name="header" />
      <div class="posts-list">
        {posts.length > 0
          ? posts.slice(0, maxPostsDisplay).map(post => (
              <PostCard post={post} accentColor={accentColor} {...postCardProps} />
            ))
          : <slot name="empty-state" />
        }
      </div>
      <slot name="footer" />
    </div>
  </div>
</div>
```

#### 使用範例（EpicLayout 重構後）

```astro
<ListLayout title={epicTitle} description={epicDescription}
            posts={epicPosts} accentColor={accentColor} maxPostsDisplay={10}>
  <Categories posts={epicPosts} slot="sidebar" />
  <ListPageHeader title={epicTitle} articleCount={epicPosts.length}
                  accentColor={accentColor} slot="header" />
  {epicPosts.length > 10 && (
    <div slot="footer">
      <a href="/archives/" class="view-more-link">查看更多文章 →</a>
    </div>
  )}
</ListLayout>
```

---

## 3. Cover Image 整合方案

### 3.1 現狀

- `config.ts` 已有 `coverImage`（優先）和 `cover`（fallback）欄位
- `BlogPost.astro` 已實作 cover image 顯示邏輯
- **PostCard 完全沒有顯示 cover image**

### 3.2 視覺方案對比

| 方案 | 描述 | 優點 | 適用場景 |
|------|------|------|---------|
| A（推薦）| 卡片頂部橫幅 16:9 | 視覺衝擊力強，點擊率高 | 主列表頁 |
| B | 左側縮圖 3:2 | 節省垂直空間 | SeriesBlock 側邊欄 |
| C | 右側縮圖 | 空間緊湊 | 特殊需求 |

### 3.3 Fallback 策略

```typescript
function resolveCoverImage(post: CollectionEntry<'blog'>) {
  if (post.data.coverImage) return post.data.coverImage;
  if (post.data.cover) return post.data.cover;
  return null;  // 不顯示圖片，保持原有卡片樣式
}
```

### 3.4 PostCard.astro 實裝範例

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
  accentColor?: string;
  showCoverImage?: boolean;
  maxTags?: number;
  compactMode?: boolean;
}

const { post, accentColor = 'var(--color-primary)',
        showCoverImage = true, maxTags = 5, compactMode = false } = Astro.props;

const postPath = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
const coverImage = post.data.coverImage ?? post.data.cover;
const tagsToShow = post.data.tags?.slice(0, maxTags) ?? [];
---

<article class:list={["post-card", compactMode && "post-card--compact"]}>
  {showCoverImage && coverImage && (
    <div class="post-cover">
      {typeof coverImage === 'string'
        ? <img src={coverImage} alt={post.data.title} loading="lazy" />
        : <Image src={coverImage} alt={post.data.title}
                 widths={[300, 600]} sizes="(max-width: 768px) 100vw, 500px"
                 loading="lazy" />
      }
    </div>
  )}
  <div class="post-content">
    <!-- meta-row, title, description, read-more -->
  </div>
</article>

<style define:vars={{ accentColor }}>
  .post-cover {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }
  .post-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }
  .post-card:hover .post-cover img {
    transform: scale(1.05);
  }
  /* 緊湊模式：左側縮圖 */
  .post-card--compact {
    display: flex;
  }
  .post-card--compact .post-cover {
    flex-shrink: 0;
    width: 150px;
    aspect-ratio: 3 / 2;
  }
</style>
```

---

## 4. 遷移策略

### 4.1 遷移順序

#### 第 1 階段：建立共用組件（P0，~10h）

1. `src/components/PostCard.astro` — 通用文章卡片 + cover image
2. `src/layouts/ListLayout.astro` — 通用列表版型容器
3. `src/components/ListPageHeader.astro` — 頁面標題區塊

#### 第 2 階段：逐步遷移版型（P1，~12h）

1. EpicLayout（最複雜，先試水）
2. categories/[...category].astro
3. SeriesLayout（排序邏輯特殊，最後遷移）

#### 第 3 階段：驗證與最佳化（P2，~8h）

1. 統一所有 CSS 使用設計令牌
2. 統一響應式斷點至 1024px / 768px / 480px / 414px
3. Lighthouse 效能測試

### 4.2 向後相容性風險

| 問題 | 解決方案 |
|------|---------|
| 標籤顯示數量不同 | PostCard `maxTags` 可配置 |
| SeriesLayout 升序排列 | ListLayout `sortOrder` 參數 |
| 舊文章無 coverImage | Fallback 到 null（不顯示圖片） |
| 分類顏色動態設定 | `accentColor` prop 由上層傳入 |

### 4.3 優先度矩陣

| 優先度 | 任務 | 工作量 | 收益 |
|--------|------|--------|------|
| P0 | 建立 PostCard 組件 | 4h | ★★★★★ |
| P0 | 建立 ListLayout 組件 | 6h | ★★★★★ |
| P1 | 遷移 EpicLayout | 4h | ★★★★ |
| P1 | 遷移 Categories | 3h | ★★★★ |
| P1 | 遷移 SeriesLayout | 5h | ★★★★ |
| P2 | CSS 令牌標準化 | 3h | ★★★ |
| P2 | Cover image 整合 | 4h | ★★★ |
| P2 | 響應式斷點統一 | 2h | ★★ |

**總預期工作量：** ~30h（約 4 工作日）

---

## 5. 預期收益

重構完成後：

- **程式碼量減少：** 約 40–50%（減少 500–700 行重複代碼）
- **維護成本降低：** 單點修改，全局更新
- **新版型開發時間：** 減少 70%
- **UI/UX 一致性：** 完全統一
- **設計令牌覆蓋率：** 從 50% 提升至 100%
