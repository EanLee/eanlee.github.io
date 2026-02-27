# CSS Design Token Consistency 修正計畫

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修正全站 CSS 設計令牌的命名與使用問題，消除硬編碼顏色值和未定義的令牌引用。

**Architecture:** 本站為深色主題（body 背景 `#0f1419`），設計令牌定義於 `src/styles/design-tokens.css`。問題分兩類：(1) 使用了不存在的令牌名稱（如 `--border-muted`、`--text-color`）；(2) 使用了假設淺色背景的硬編碼顏色值（如 `#333`、`#555`）卻在深色頁面中使用，造成低對比度。

**Tech Stack:** Astro 4.x、CSS Custom Properties、`design-tokens.css`

**Token 對照表（本計畫的核心參考）：**

| 舊值 / 問題 | 替換為 | 原因 |
|------------|--------|------|
| `--border-muted` | `var(--color-border-light)` | 令牌名稱不存在 |
| `--text-color` | `var(--text-primary)` | 令牌名稱已廢棄 |
| `--title-color` | `var(--text-primary)` | 局部定義，應用全局令牌 |
| `--meta-color` | `var(--text-muted)` | 局部定義，應用全局令牌 |
| `--gray-light`（用於 `rgba()`） | `--color-gray-light`（RGB 格式）| 名稱缺少 `--color-` 前綴 |
| `#333` | `var(--text-primary)` `#e6edf3` | 深色背景需淺色文字 |
| `#555` | `var(--text-secondary)` `#adbac7` | 深色背景次要文字 |
| `#666` | `var(--text-muted)` `#8694a3` | 深色背景靜音文字 |
| `#718096` | `var(--text-muted)` | Tailwind gray-500 → 系統令牌 |
| `#4682b4` | `var(--link-color)` | 連結顏色應用令牌 |
| `#eaeaea` | `var(--color-border-light)` | 淺色邊框 → 深色主題邊框 |
| `#e2e8f0` | `var(--card-border)` | 淺色虛線邊框 → 深色卡片邊框 |
| `#f9f9f9` | `var(--color-bg-secondary)` | 淺灰背景 → 深色次要背景 |

**驗證指令：**
```bash
npx astro check
```
預期：0 errors, 0 warnings

---

## Task 1：新增缺失的 Warning 令牌

**Files:**
- Modify: `src/styles/design-tokens.css`（在 `--color-primary-dark` 之後新增）

**背景：** `BlogPost.astro` 的新鮮度警示使用硬編碼的 `rgba(237, 137, 54, ...)` 和 `#ed8936`，應定義為全局警示令牌。

### Step 1：在 design-tokens.css 中新增 warning 令牌

在 `--color-primary-dark: #5b7cff;` 行之後加入：

```css
  /* 警示色系 */
  --color-warning: #ed8936;
  --color-warning-bg: rgba(237, 137, 54, 0.2);
  --color-warning-border: rgba(237, 137, 54, 0.5);
```

### Step 2：更新 BlogPost.astro 使用令牌

找到 `src/layouts/BlogPost.astro` 中的 `.stale-warning` CSS，替換硬編碼顏色：

```css
/* 將 */
background-color: rgba(237, 137, 54, 0.2);
border: 1px solid rgba(237, 137, 54, 0.5);
color: #ed8936;

/* 改為 */
background-color: var(--color-warning-bg);
border: 1px solid var(--color-warning-border);
color: var(--color-warning);
```

### Step 3：驗證

```bash
npx astro check 2>&1 | tail -5
```
預期：0 errors

### Step 4：Commit

```bash
git add src/styles/design-tokens.css src/layouts/BlogPost.astro
git commit -m "feat: 新增 color-warning 系列設計令牌並更新新鮮度警示"
```

---

## Task 2：修正 --border-muted（4 個檔案）

**Files:**
- Modify: `src/components/CategoryGrid.astro:250`
- Modify: `src/components/FeaturedProjects.astro:169`
- Modify: `src/components/LatestPosts.astro:593`
- Modify: `src/layouts/ProjectDetail.astro:297,328,400`

**背景：** `--border-muted` 未定義於設計令牌系統，應使用 `--color-border-light`。

### Step 1：批次替換四個檔案

用搜尋取代將每個檔案中的 `var(--border-muted)` → `var(--color-border-light)`：

**CategoryGrid.astro 第 250 行：**
```css
/* 從 */
border-top: 1px solid var(--border-muted);
/* 改為 */
border-top: 1px solid var(--color-border-light);
```

**FeaturedProjects.astro 第 169 行：**
```css
border-top: 1px solid var(--color-border-light);
```

**LatestPosts.astro 第 593 行：**
```css
border-bottom: 1px solid var(--color-border-light);
```

**ProjectDetail.astro 第 297、328、400 行（共 3 處）：**
```css
border: 1px solid var(--color-border-light);   /* 297 */
border-bottom: 1px solid var(--color-border-light);  /* 328 */
border-top: 1px solid var(--color-border-light);  /* 400 */
```

### Step 2：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 3：Commit

```bash
git add src/components/CategoryGrid.astro src/components/FeaturedProjects.astro src/components/LatestPosts.astro src/layouts/ProjectDetail.astro
git commit -m "fix: 修正 --border-muted 為正確的 --color-border-light 令牌"
```

---

## Task 3：修正 SeriesBlock.astro 的局部令牌

**Files:**
- Modify: `src/components/SeriesBlock.astro`

**背景：** SeriesBlock 使用了三個未定義的局部令牌：`--title-color`（第 108、211 行）、`--meta-color`（第 173、249 行）、`--text-color`（第 222 行）。

### Step 1：讀取 SeriesBlock.astro 確認行號

確認以下行：
- 第 108 行：`color: var(--title-color);`
- 第 173 行：`color: var(--meta-color);`
- 第 211 行：`color: var(--title-color);`
- 第 222 行：`color: var(--text-color);`
- 第 249 行：`color: var(--meta-color);`

同時確認第 250 行是否有 `background-color: #f9f9f9;`。

### Step 2：替換所有問題令牌

```css
/* --title-color → --text-primary（第 108、211 行）*/
color: var(--text-primary);

/* --meta-color → --text-muted（第 173、249 行）*/
color: var(--text-muted);

/* --text-color → --text-primary（第 222 行）*/
color: var(--text-primary);

/* #f9f9f9 → --color-bg-secondary（第 250 行）*/
background-color: var(--color-bg-secondary);
```

### Step 3：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 4：Commit

```bash
git add src/components/SeriesBlock.astro
git commit -m "fix: 修正 SeriesBlock 的未定義 CSS 令牌與硬編碼顏色"
```

---

## Task 4：修正 widget 元件的 --text-color

**Files:**
- Modify: `src/components/widget/categories.astro:65`
- Modify: `src/components/widget/series.astro:83`

**背景：** 兩個 sidebar widget 使用未定義的 `--text-color`。

### Step 1：修正 widget/categories.astro 第 65 行

```css
/* 從 */
color: var(--text-color);
/* 改為 */
color: var(--text-primary);
```

### Step 2：修正 widget/series.astro 第 83 行

```css
color: var(--text-primary);
```

### Step 3：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 4：Commit

```bash
git add src/components/widget/categories.astro src/components/widget/series.astro
git commit -m "fix: 修正 sidebar widget 的 --text-color 為 --text-primary"
```

---

## Task 5：修正 BlogPost.astro 的 --gray-light 和 --text-color

**Files:**
- Modify: `src/layouts/BlogPost.astro`（第 431、476、590、600、791、796、833 行）

**背景：** BlogPost 使用了 `--gray-light`（缺少 `--color-` 前綴，會導致 `rgba()` 失效，因為 `--color-gray-light` 的值是 RGB 格式 `229, 233, 240`）。此外第 796 行有未定義的 `--text-color`。

### Step 1：確認行號並替換

以下所有 `rgba(var(--gray-light), ...)` → `rgba(var(--color-gray-light), ...)`：

```css
/* 第 431 行 */
border-bottom: 1px solid rgba(var(--color-gray-light), 0.8);

/* 第 476 行 */
background-color: rgba(var(--color-gray-light), 0.3);

/* 第 590 行 */
border: 1px solid rgba(var(--color-gray-light), 0.8);

/* 第 600 行 */
background-color: rgba(var(--color-gray-light), 0.3);

/* 第 791 行 */
border-top: 1px solid rgba(var(--color-gray-light), 0.5);

/* 第 833 行 */
background-color: rgba(var(--color-gray-light), 0.2);
```

第 796 行 `--text-color`：
```css
color: var(--text-primary);
```

### Step 2：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 3：Commit

```bash
git add src/layouts/BlogPost.astro
git commit -m "fix: 修正 BlogPost 的 --gray-light 前綴與 --text-color 令牌"
```

---

## Task 6：修正 archives.astro 的所有未定義令牌

**Files:**
- Modify: `src/pages/archives.astro`（第 106、112、130、144、169、175 行）

**背景：** archives 頁面使用了多個未定義令牌，但有 fallback 值（如 `var(--title-color, #333)`）。替換後移除 fallback，直接使用正確令牌。

### Step 1：確認並替換

```css
/* 第 106 行：--title-color → --text-primary */
color: var(--text-primary);

/* 第 112 行：--meta-color → --text-muted */
color: var(--text-muted);

/* 第 130 行：--gray-light → --color-gray-light */
border-bottom: 1px dashed rgba(var(--color-gray-light), 0.5);

/* 第 144 行：--meta-color → --text-muted */
color: var(--text-muted);

/* 第 169 行：--meta-color → --text-muted */
color: var(--text-muted);

/* 第 175 行：--text-color → --text-primary */
color: var(--text-primary);
```

### Step 2：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 3：Commit

```bash
git add src/pages/archives.astro
git commit -m "fix: 修正 archives 頁面的未定義 CSS 令牌"
```

---

## Task 7：修正 SeriesLayout.astro 的顏色問題

**Files:**
- Modify: `src/layouts/SeriesLayout.astro`

**背景：** SeriesLayout 混用了淺色主題色值（`#333`、`#555`、`#666` 是深色文字，在深色背景上幾乎不可見）和未定義令牌（`#718096`、`#4682b4`、`#eaeaea`、`#e2e8f0`、`#f9f9f9`）。

**此頁面使用 `define:vars={{ accentColor }}` 自訂每系列強調色（這是正確的設計，不需修改）。**

### Step 1：讀取 SeriesLayout.astro 確認各問題行號

grep 確認：
```bash
grep -n "#333\|#555\|#666\|#718096\|#4682b4\|#eaeaea\|#e2e8f0\|#f9f9f9" src/layouts/SeriesLayout.astro
```

### Step 2：替換所有問題色值

| 查找 | 替換為 |
|------|--------|
| `color: #666` | `color: var(--text-muted)` |
| `color: #333` | `color: var(--text-primary)` |
| `color: #555` | `color: var(--text-secondary)` |
| `color: #718096` | `color: var(--text-muted)` |
| `color: #4682b4` | `color: var(--link-color)` |
| `border-bottom: 1px solid #eaeaea` | `border-bottom: 1px solid var(--color-border-light)` |
| `border-bottom: 1px dashed #e2e8f0` | `border-bottom: 1px dashed var(--card-border)` |
| `background-color: #f9f9f9` | `background-color: var(--color-bg-secondary)` |

### Step 3：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 4：Commit

```bash
git add src/layouts/SeriesLayout.astro
git commit -m "fix: 修正 SeriesLayout 的硬編碼淺色主題顏色為深色主題令牌"
```

---

## Task 8：修正 tags/[...tag].astro 的顏色問題

**Files:**
- Modify: `src/pages/tags/[...tag].astro`

**背景：** 標籤頁使用 `define:vars={{ accentColor }}` 設定每頁橘紅色強調色（`#ff6b6b`，正確設計），但其他文字、邊框、背景使用了淺色主題的硬編碼值。

### Step 1：讀取並確認問題行號

```bash
grep -n "#333\|#555\|#666\|#718096\|#4682b4\|#eaeaea\|#e2e8f0\|#f9f9f9" src/pages/tags/\[...tag\].astro
```

### Step 2：替換

| 查找 | 替換為 |
|------|--------|
| `color: #666` | `color: var(--text-muted)` |
| `color: #333` | `color: var(--text-primary)` |
| `color: #555` | `color: var(--text-secondary)` |
| `color: #718096` | `color: var(--text-muted)` |
| `color: #4682b4` | `color: var(--link-color)` |
| `border-bottom: 1px solid #eaeaea` | `border-bottom: 1px solid var(--color-border-light)` |
| `border-bottom: 1px dashed #e2e8f0` | `border-bottom: 1px dashed var(--card-border)` |
| `background-color: #f9f9f9` | `background-color: var(--color-bg-secondary)` |

### Step 3：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 4：Commit

```bash
git add "src/pages/tags/[...tag].astro"
git commit -m "fix: 修正標籤頁的硬編碼淺色主題顏色為深色主題令牌"
```

---

## Task 9：修正 categories/[...category].astro 的顏色問題

**Files:**
- Modify: `src/pages/categories/[...category].astro`

**背景：** 分類頁與標籤頁問題相同。`define:vars={{ accentColor }}` 設計為每分類不同強調色（software=藍、management=綠、reading=橙、growth=紫），屬於正確設計，不需修改。

### Step 1：讀取並確認問題行號

```bash
grep -n "#333\|#555\|#666\|#718096\|#4682b4\|#eaeaea\|#e2e8f0\|#f9f9f9" "src/pages/categories/[...category].astro"
```

### Step 2：替換

套用與 Task 8 相同的對照表。

### Step 3：驗證

```bash
npx astro check 2>&1 | tail -5
```

### Step 4：Commit

```bash
git add "src/pages/categories/[...category].astro"
git commit -m "fix: 修正分類頁的硬編碼淺色主題顏色為深色主題令牌"
```

---

## 最終驗證

完成所有 Task 後執行完整驗證：

```bash
npx astro check
```

預期：
- 0 errors
- 0 warnings

逐一確認沒有殘留的問題令牌：

```bash
grep -rn "\-\-border-muted\|--text-color\|--title-color\|--meta-color\|--gray-light\b" src/ --include="*.astro" --include="*.css"
```

預期：無輸出。

確認硬編碼色值已清除（關鍵頁面）：

```bash
grep -n "#333\|#555\|#666\|#718096\|#4682b4\|#f9f9f9\|#eaeaea\|#e2e8f0" src/pages/tags/\[...tag\].astro src/pages/categories/\[...category\].astro src/layouts/SeriesLayout.astro src/components/SeriesBlock.astro
```

預期：無輸出。
