# UX/UI 版型視覺優化評估報告

**報告日期**：2026-03-11
**專案**：eanlee.github.io (Astro 5 SSG)
**分析範圍**：EpicLayout、SeriesLayout、categories、BlogPost 版型

---

## 1. 現狀分析

### 三個版型的共同視覺問題

1. **卡片邊界模糊**：`.post-card` 缺少 `background-color` 與 `border`，視覺上更像條列清單而非卡片
2. **Hover 動畫無效**：`transition: transform` 已設置，但 hover 狀態無對應 `transform` 值，動畫實際上不起作用
3. **設計令牌使用不一致**：EpicLayout 已改用設計令牌，其他兩個版型仍大量硬編碼，視覺一致性脆弱
4. **邊框顏色混用**：`--card-border` 與 `--color-border-light` 在不同版型中混用

### 無 Cover Image 的體驗影響

- **文章頁（BlogPost.astro）** 有精緻的 hero image 區塊，甚至有 fallback 隨機圖片機制
- **列表頁卡片完全無圖**，讀者從列表點入文章時視覺落差過大
- 研究顯示有縮圖的文章列表點擊率通常高出純文字版 **30–40%**

### Series 版型特殊問題

- 文章按日期升序排列（有學習順序），但卡片沒有序號標示
- 讀者無法一眼看出「這是第幾篇」

---

## 2. Cover Image 顯示方案比較

### 方案 A：卡片頂部橫幅（推薦）

```
┌─────────────────────────────────────┐
│   [cover image  16:9  200px 高]     │
├─────────────────────────────────────┤
│ 2024年3月  標籤1, 標籤2             │
│ 文章標題（大）                       │
│ 文章摘要描述兩行左右...              │
│ 閱讀更多 →                          │
└─────────────────────────────────────┘
```

**優點**：視覺衝擊力最強、與 BlogPost hero image 形成連貫體驗、容易實作
**缺點**：增加卡片高度，頁面更長
**適用**：主列表頁（EpicLayout、SeriesLayout、Categories）

---

### 方案 B：右側縮圖

```
┌──────────────────────────┬──────────┐
│ 日期  標籤               │ [圖 4:3] │
│ 標題                     │          │
│ 摘要...                  │          │
│ 閱讀更多 →               │          │
└──────────────────────────┴──────────┘
```

**優點**：節省垂直空間
**缺點**：中文閱讀習慣（左→右）不符，圖片在右側較難吸引目光
**適用**：不推薦用於主列表

---

### 方案 C：左側縮圖（緊湊模式）

```
┌──────────┬────────────────────────────┐
│ [圖 3:2] │ 日期  標籤                 │
│          │ 標題                        │
│          │ 摘要...                     │
│          │ 閱讀更多 →                  │
└──────────┴────────────────────────────┘
```

**優點**：節省垂直空間，適合快速瀏覽
**缺點**：縮圖尺寸小，圖片細節難以辨認
**適用**：SeriesBlock 側邊欄（緊湊模式 `--compact`）

---

### 方案 D：條件式顯示（不推薦）

有圖顯示頂部橫幅，無圖保持現狀。
**問題**：卡片高度不一致，頁面視覺跳動感強（UX 反模式）

---

## 3. 最佳方案推薦

### 推薦：改良版方案 A

**所有卡片固定 200px 圖片區塊，有圖顯示圖片，無圖顯示 `accentColor` 漸層 fallback。**

#### 理由

1. 與 BlogPost.astro 的 hero image 體驗一致，形成前後連貫的閱讀旅程
2. 無圖 fallback 使用各 epic/category 專屬顏色，視覺個性鮮明不空洞
3. `coverImage` 與 `cover` 欄位已在 content schema 定義，實作成本低
4. 卡片高度完全一致，消除視覺跳動感

#### 行動裝置

| 裝置 | cover 高度 | 摘要文字處理 |
|------|-----------|------------|
| 桌面 (>768px) | 200px | 最多 3 行，超過截斷 |
| 平板 (768px) | 180px | 最多 2 行 |
| 手機 (480px) | 160px | 最多 2 行 |
| 小手機 (414px) | 140px | 最多 2 行 |

---

## 4. 其他 UX 優化建議

### 卡片 Hover 效果（目前無效）

現有 `transition: transform` 但無實際 transform，需補上：

```css
.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.post-card:hover .post-cover img {
  transform: scale(1.03);
}
```

### Series 版型特殊需求：序號標示

系列文章有學習順序，建議在卡片左上角加入序號：

```astro
{seriesPosts.map((post, index) => (
  <article class="post-card">
    <div class="post-sequence">{String(index + 1).padStart(2, '0')}</div>
    <!-- ... -->
  </article>
))}
```

```css
.post-sequence {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  min-width: 2rem;
  height: 2rem;
  background-color: var(--accentColor);
  color: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  z-index: 1;
}
```

### Category vs Epic 差異化設計

| 版型 | 差異化建議 |
|------|-----------|
| **Category** | 可在卡片顯示所屬 epic 名稱，協助讀者定位脈絡 |
| **Epic** | 考慮在頁首加入標籤雲（Tags Cloud），讓讀者快速掌握知識全貌 |
| **Series** | 加入進度條或序號，強調「學習路徑」概念 |

---

## 5. CSS 建議（完整使用設計令牌）

```css
/* 補上缺失的卡片基礎樣式 */
.post-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--transition-slow),
    box-shadow var(--transition-slow);
  position: relative;  /* 為序號 absolute 定位用 */
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Cover Image 容器 */
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
  display: block;
  transition: transform var(--transition-slow);
}

.post-card:hover .post-cover img {
  transform: scale(1.03);
}

/* Fallback 漸層（需透過 define:vars 注入 accentColor） */
.post-cover-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--accentColor) 0%,
    color-mix(in srgb, var(--accentColor) 60%, #0f1419) 100%
  );
  opacity: 0.85;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Series 序號 */
.post-sequence {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  min-width: 2rem;
  height: 2rem;
  padding: 0 var(--spacing-xs);
  background-color: var(--accentColor);
  color: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* 摘要文字截斷 */
.post-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .post-description { -webkit-line-clamp: 2; }
}
```

---

## 6. 實作優先序

| 優先 | 項目 | 難度 | 收益 |
|------|------|------|------|
| **P0** | 補上卡片背景色與邊框 | 低 | ★★★★★ |
| **P0** | 統一三個版型 CSS 至設計令牌 | 低 | ★★★★★ |
| **P1** | 補上 hover `transform` + `box-shadow` | 低 | ★★★★ |
| **P1** | 加入 cover image 區塊（含漸層 fallback） | 中 | ★★★★ |
| **P2** | Series 卡片加序號 | 低 | ★★★ |
| **P2** | Category 卡片顯示所屬 epic | 中 | ★★★ |
| **P3** | Epic 頁首標籤雲 | 高 | ★★ |

**預估總工作量**：4–6 小時
