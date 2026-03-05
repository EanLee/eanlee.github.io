# 設計文件：系列文章首頁入口 + isPartOf Schema

**日期**：2026-02-28
**分支**：fix/css-design-token-consistency（目前）→ 建議獨立分支
**設計來源**：IA 視角（Iris）— 先有落地頁，再有入口

---

## 背景與動機

圓桌討論（2026-02-27 / 2026-02-28）識別出兩個問題：

1. **系列文章可發現性差**：`/series/{slug}/` 頁面已完整實作，但首頁和導覽列沒有任何入口，讀者無法主動發現系列文章這個資產。
2. **系列 isPartOf Schema 缺失**：系列文章之間缺少結構化資料連結，Google 無法理解單篇文章與系列索引頁的層級關係。

**IA 核心原則（Iris）**：先建落地頁 `/series/`，再做首頁入口。不然入口沒有落地頁，是有展示沒有著陸的半成品。

---

## 設計決策記錄

| 問題 | 決策 | 理由 |
|------|------|------|
| 入口位置：首頁 vs 導覽列？ | **首頁** | 導覽列已有 6 項，再加會過於擁擠 |
| 總覽頁分組方式？ | **按 epic 分組** | 長期架構正確，多 epic 時自動清晰 |
| 系列狀態標籤？ | **不標記**，只顯示文章數 + 最後更新時間 | 任何狀態 badge 都暗示其他系列「完結」，製造錯誤預期 |
| 首頁系列顯示範圍？ | **全部 6 個**，不過濾 | 文章數和更新時間本身傳達深度，讀者自行判斷；移除任意閾值 |
| 共用資料邏輯？ | **抽出 `src/utils/series.ts`** | 首頁組件與總覽頁邏輯相同，不重複 |

---

## 架構概覽

```
src/
├── consts.ts                          ← 加 EPIC_LABELS
├── utils/
│   └── series.ts                      ← 新建：共用資料邏輯
├── pages/
│   ├── index.astro                    ← 插入 SeriesShowcase
│   └── series/
│       ├── index.astro                ← 新建：系列總覽落地頁
│       └── [...slug].astro            ← 不變
├── components/
│   └── SeriesShowcase.astro           ← 新建：首頁組件
└── layouts/
    └── BlogPost.astro                 ← 加 isPartOf Schema
```

---

## Section 1：資料架構

### `src/consts.ts` — 新增 EPIC_LABELS

```typescript
export const EPIC_LABELS: Record<string, string> = {
  software:   "軟體開發",
  management: "管理經驗",
  reading:    "閱讀心得",
  growth:     "自我成長",
};
```

**設計原則**：epic 顯示名稱集中管理，組件不硬編碼。未來新增 epic 只改此處。

---

### `src/utils/series.ts` — 新建

```typescript
import type { CollectionEntry } from "astro:content";

export interface SeriesInfo {
  seriesPath: string;    // URL segment，e.g. "build-automated-deploy"
  seriesTitle: string;   // frontmatter series 欄位值
  epic: string;          // e.g. "software"
  count: number;         // 文章篇數
  latestDate: Date;      // 系列中最新文章的日期
}

/**
 * 從所有部落格文章推導系列資訊列表。
 * seriesPath 從 post.id 的路徑結構推算：
 * "software/series/build-automated-deploy/article/index.md"
 *  → segments[-3] = "build-automated-deploy"
 */
export function getSeriesData(posts: CollectionEntry<"blog">[]): SeriesInfo[] {
  const seriesMap = new Map<string, SeriesInfo>();

  for (const post of posts) {
    if (!post.data.series) continue;

    const segments = post.id.split("/");
    const seriesPath = segments[segments.length - 3].toLowerCase();
    const epic = (post.data.epic || segments[0]).toLowerCase();

    if (!seriesMap.has(seriesPath)) {
      seriesMap.set(seriesPath, {
        seriesPath,
        seriesTitle: post.data.series,
        epic,
        count: 0,
        latestDate: post.data.date,
      });
    }

    const entry = seriesMap.get(seriesPath)!;
    entry.count++;
    if (post.data.date > entry.latestDate) {
      entry.latestDate = post.data.date;
    }
  }

  // 預設按文章數降序排列
  return Array.from(seriesMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * 將系列列表按 epic 分組，回傳有序的 [epic, SeriesInfo[]] 陣列。
 * 順序：軟體開發 → 管理經驗 → 閱讀心得 → 自我成長 → 其他
 */
export function groupSeriesByEpic(
  seriesList: SeriesInfo[]
): [string, SeriesInfo[]][] {
  const EPIC_ORDER = ["software", "management", "reading", "growth"];
  const grouped = new Map<string, SeriesInfo[]>();

  for (const series of seriesList) {
    if (!grouped.has(series.epic)) grouped.set(series.epic, []);
    grouped.get(series.epic)!.push(series);
  }

  // 按預定義順序排序，未知 epic 排在最後
  return [...grouped.entries()].sort(([a], [b]) => {
    const ai = EPIC_ORDER.indexOf(a);
    const bi = EPIC_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
```

**多 epic 相容性**：`groupSeriesByEpic` 的 EPIC_ORDER 陣列決定分組順序，未知 epic 自動排在最後，不需要修改程式碼即可支援新 epic。

---

## Section 2：`/series/index.astro` — 系列總覽落地頁

**URL**：`/series/`
**用途**：所有 `/series/{slug}/` 的上層落地頁；`SeriesShowcase` 的「全部系列 →」連結目標

### 視覺結構

```
[H1] 系列文章
[副標] 按主題組織的完整學習路徑

── 軟體開發 ─────────────────────────────────

┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ 從零打造 CI/CD 自動 │ │ 靈活使用 Docker      │ │ 軟體開發基本功       │
│ 化部署              │ │                      │ │                      │
│ 13 篇               │ │ 4 篇                 │ │ 3 篇                 │
│ 更新於 2023-08      │ │ 更新於 2022-11       │ │ 更新於 2022-06       │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘

┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ Message Queue        │ │ Side Project         │ │ Cloud                │
│ 2 篇                 │ │ 2 篇                 │ │ 1 篇                 │
│ 更新於 2022-04       │ │ 更新於 2022-10       │ │ 更新於 2022-03       │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘

── 管理經驗 ─────────────────────────────────  ← 未來有系列時自動出現
...
```

### SEO

加 `CollectionPage + ItemList Schema`，格式與現有 `/categories/` 頁面一致：

```javascript
{
  "@type": "CollectionPage",
  name: "系列文章 - 伊恩的開發狂想",
  url: new URL("/series/", Astro.site).href,
  numberOfItems: allSeries.length,
  itemListElement: allSeries.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: new URL(`/series/${s.seriesPath}/`, Astro.site).href,
    name: s.seriesTitle,
  })),
}
```

---

## Section 3：`SeriesShowcase.astro` — 首頁組件

**插入位置**：`index.astro` 中，`CategoryGrid` 之後、`FollowCTA` 之前

### Props 介面

```typescript
interface Props {
  posts: CollectionEntry<"blog">[];  // 從 index.astro 傳入全部文章
}
```

### 視覺結構

```
[標題] 系列文章          [連結] 全部系列 →（連到 /series/）

── 軟體開發 ──────────────────────────────

[卡片] [卡片] [卡片]    ← 該 epic 的所有系列
[卡片] [卡片] [卡片]

── （其他 epic，未來自動出現）──

[文字] 也可以用標籤探索文章 →（連到 /tags/）
```

### 設計細節

- **無過濾**：全部 6 個系列均顯示，不設文章數閾值
- **無 badge**：不顯示任何狀態標籤（進行中 / 完結）
- **資料呈現**：文章數 + 最後更新時間，讓讀者自行判斷深度
- **卡片連結**：連到 `/series/{seriesPath}/`
- **響應式**：桌面 3 欄，平板 2 欄，手機 1 欄（與 CategoryGrid 一致）

---

## Section 4：BlogPost.astro — isPartOf Schema

在 `BlogPost.astro` 的 `jsonLd` 物件新增：

```javascript
// series 和 seriesPath 已於 frontmatter 解析區段推導，直接使用
const jsonLd = {
  // ...現有所有欄位不變...
  ...(series && seriesPath && {
    isPartOf: {
      "@type": "CollectionPage",
      "@id": new URL(`/series/${seriesPath}/`, Astro.site).href,
      name: series,
    },
  }),
};
```

**多 epic 相容**：`seriesPath` 是目錄名（如 `build-automated-deploy`），URL 格式 `/series/{seriesPath}/` 對所有 epic 的系列一致，不需要額外處理。

**觸發條件**：`series`（frontmatter 欄位）和 `seriesPath`（從 URL 推導）都存在時才加入，非系列文章不受影響。

---

## 實作順序

按依賴關係排列：

```
1. src/consts.ts          ← EPIC_LABELS（其他全部依賴）
2. src/utils/series.ts    ← 資料邏輯（index.astro 和 SeriesShowcase 依賴）
3. src/layouts/BlogPost.astro  ← isPartOf Schema（獨立，可先做）
4. src/pages/series/index.astro  ← 總覽頁（需要 utils/series.ts）
5. src/components/SeriesShowcase.astro  ← 首頁組件（需要 utils/series.ts）
6. src/pages/index.astro  ← 插入 SeriesShowcase（需要組件）
```

步驟 3（isPartOf Schema）與步驟 1-2 無依賴關係，可平行進行。

---

## 影響評估

| 層面 | 影響 |
|------|------|
| 現有系列頁 `/series/{slug}/` | 不變 |
| 現有 BlogPost frontmatter | 不變 |
| 多 epic 系列（未來） | 自動相容，無需改程式碼 |
| SEO | isPartOf 改善系列層級關係；新 /series/ 頁加 CollectionPage Schema |
| 效能 | `getSeriesData()` 在 build time 執行（Astro SSG），不影響執行期效能 |

---

*設計審核：IA 視角（Iris）— 落地頁優先、長期架構可擴展*
*記錄於 2026-02-28*
