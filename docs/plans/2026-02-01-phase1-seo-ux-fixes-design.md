# Phase 1: SEO 與 UX 關鍵問題修復設計文件

**日期：** 2026-02-01
**狀態：** 設計完成，待實作
**預估影響：** CLS < 0.05、Accessibility +3-5 分、SEO 警告消除

---

## 背景

根據部落格全面分析報告，Phase 1 包含四個關鍵修復項目：

1. ✅ 修復 sitemap 產生問題
2. ⏭️ 批次加入圖片 alt 文字（已跳過 - 狀況良好）
3. ✅ 修復色彩對比度問題
4. ✅ 優化 CLS（圖片加 aspect-ratio）

**決策：** 採用漸進式修復方法，分三個階段執行。

---

## 實作方法

### 方法 A：漸進式修復 ⭐（已選擇）

**優點：**
- 風險低，每個階段可獨立驗證
- 出問題容易回滾
- 可以邊做邊測試
- 符合 atomic commit 原則

**階段劃分：**
1. 基礎設施修復（sitemap + 色彩）
2. 組件優化（LazyImage）
3. 驗證與測試

---

## 階段 1：基礎設施修復

### 1.1 Sitemap 配置優化

**問題：**
- `robots.txt` 指向 `sitemap-index.xml`
- 實際生成的是 `sitemap-0.xml`
- `/sitemap.xml` 和 `/sitemap-index.xml` 都返回 404

**解決方案：**

修改 `astro.config.mjs` 中的 sitemap 整合：

```javascript
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://eandev.com",
  integrations: [
    sitemap({
      // 方案 A: 使用 i18n 強制生成 index（如果支援）
      i18n: {
        defaultLocale: 'zh-TW',
        locales: {
          'zh-TW': 'zh-TW'
        }
      }
    }),
    // ...
  ]
});
```

**替代方案（如果方案 A 不可行）：**

**方案 B：** 建立 Astro endpoint 手動生成 sitemap-index

```typescript
// src/pages/sitemap-index.xml.ts
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://eandev.com/sitemap-0.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

**方案 C：** 後處理腳本在建置後生成

```javascript
// scripts/generate-sitemap-index.mjs
import { writeFileSync } from 'fs';
import { glob } from 'glob';

const sitemaps = await glob('dist/sitemap-*.xml');
const index = generateIndex(sitemaps);
writeFileSync('dist/sitemap-index.xml', index);
```

更新 `package.json`：
```json
{
  "scripts": {
    "build": "astro check && astro build && node scripts/generate-sitemap-index.mjs && pagefind --site dist"
  }
}
```

**預期結果：**
- ✅ `/sitemap-index.xml` 存在並列出所有 sitemap
- ✅ `/sitemap-0.xml` 仍然存在（向後相容）
- ✅ `robots.txt` 正確指向 sitemap-index.xml（已正確）

---

### 1.2 色彩對比度優化

**當前狀況：**
- `--text-muted: #768390` → 對比度 4.84（剛好及格 WCAG AA）
- `--border-light: #373e47` → 對比度 1.73（低於 UI 組件標準 3:1）
- `--text-light: #adbac7` → 對比度 9.48（優秀）
- `--link-color: #6b8aff` → 對比度 5.98（良好）

**優化目標：**
- `text-muted` ≥ 5.5（舒適超過標準）
- `border-light` ≥ 3.0（符合 UI 組件標準）

**修改 `src/styles/design-tokens.css`：**

```css
:root {
  /* 文字色系 - 提升 text-muted 對比度 */
  --color-text-muted: #8694a3;  /* 從 #768390 調亮 → 對比度約 5.5 */
  --text-muted: #8694a3;         /* 同步更新 */

  /* 邊框色系 - 提升 border-light 對比度 */
  --color-border-light: #444c56; /* 從 #373e47 調亮 → 對比度約 3.2 */
}

/* prose 系統同步更新 */
.prose {
  --prose-blockquote: #8694a3; /* 從 #768390 更新 */
}
```

**驗證方法：**

使用對比度計算器：
```javascript
function getContrast(fg, bg) {
  // WCAG 2.1 對比度公式
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
```

**影響範圍：**
- 所有使用 `--text-muted` 的次要文字（日期、meta 資訊等）
- 所有使用 `--border-light` 的邊框（卡片邊框、分隔線）
- Blockquote 引用文字顏色

---

## 階段 2：組件優化

### 2.1 LazyImage 組件升級

**目標：** 完全消除圖片載入造成的 CLS

**新增 API：**

```typescript
interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;  // 新增：例如 "16/9", "4/3", "1/1"
  class?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
}
```

**實作修改 `src/components/LazyImage.astro`：**

```astro
---
const {
  aspectRatio,
  width,
  height,
  ...props
} = Astro.props;

// 計算容器樣式優先級：
// 1. 明確指定的 aspectRatio
// 2. 從 width/height 計算
// 3. Fallback 到最小高度
const containerStyle = aspectRatio
  ? `aspect-ratio: ${aspectRatio};`
  : (width && height)
    ? `aspect-ratio: ${width} / ${height};`
    : 'min-height: 200px;';
---

<picture class={`lazy-image ${className}`} style={containerStyle}>
  <!-- 現有的 source 和 img 元素 -->
  <img
    {...imgProps}
    style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;"
    class="lazy-img"
  />
</picture>

<style>
  .lazy-image {
    position: relative;
    display: block;
    width: 100%;
    overflow: hidden;
    background-color: var(--color-bg-muted);
    border-radius: var(--radius-md);
    /* aspect-ratio 從 inline style 注入 */
  }

  .lazy-img {
    /* 改為絕對定位填滿容器 */
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-md);
    transition: opacity var(--transition-normal);
    opacity: 0;
  }

  /* 其他樣式保持不變 */
</style>
```

**使用範例：**

```astro
<!-- 方式 1: 明確指定比例（推薦） -->
<LazyImage
  src="/images/hero.jpg"
  alt="封面圖片"
  aspectRatio="16/9"
  loading="eager"
/>

<!-- 方式 2: 使用寬高自動計算 -->
<LazyImage
  src="/images/thumbnail.jpg"
  alt="縮圖"
  width={400}
  height={300}
/>

<!-- 方式 3: Fallback 最小高度 -->
<LazyImage
  src="/images/content.jpg"
  alt="內容圖片"
/>
```

---

### 2.2 圖片使用遷移策略

**分階段遷移：**

#### 第一階段：關鍵位置優化（立即改善 CLS）

手動更新高影響位置：

**1. 文章封面圖** (`src/layouts/BlogPost.astro`)

```astro
{displayImage && (
  <div class="hero-container">
    <LazyImage
      src={displayImage}
      alt={title}
      aspectRatio="16/9"
      loading="eager"
      class="hero-image-bg"
    />
  </div>
)}
```

**2. 最新文章縮圖** (`src/components/LatestPosts.astro`)

```astro
<div class="card-thumbnail">
  <LazyImage
    src={post.data.image || defaultImage}
    alt={post.data.title}
    aspectRatio="1/1"
    width={120}
    height={120}
  />
</div>
```

**3. 系列文章卡片** (`src/components/SeriesBlock.astro`)

```astro
<LazyImage
  src={series.thumbnail}
  alt={series.title}
  aspectRatio="4/3"
  class="series-thumbnail"
/>
```

**4. Epic/Category 卡片** (`src/components/CategoryGrid.astro`)

```astro
<LazyImage
  src={category.image}
  alt={category.name}
  aspectRatio="16/9"
/>
```

#### 第二階段：Markdown 圖片處理（選擇性）

**方案 A - Rehype 插件（如需要）**

```javascript
// remark-image-aspect.mjs
import { visit } from 'unist-util-visit';

export function remarkImageAspect() {
  return (tree) => {
    visit(tree, 'image', (node) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      // 為內容圖片添加預設樣式
      node.data.hProperties.style = 'aspect-ratio: 16/9; width: 100%; height: auto;';
    });
  };
}
```

**方案 B - 保持現狀（推薦）**
- Markdown 圖片使用 min-height fallback
- 只優化組件中的圖片
- 觀察 Lighthouse 分數改善後再決定

**建議：** 先執行第一階段，觀察效果後決定是否需要第二階段。

---

## 階段 3：驗證與測試

### 3.1 自動化驗證腳本

建立 `scripts/validate-phase1.mjs`：

```javascript
import fs from 'fs';
import { glob } from 'glob';

// 檢查項目
const checks = {
  async sitemap() {
    const exists = fs.existsSync('dist/sitemap-index.xml');
    console.log(`✓ sitemap-index.xml: ${exists ? 'PASS' : 'FAIL'}`);
    return exists;
  },

  async colorContrast() {
    const css = fs.readFileSync('src/styles/design-tokens.css', 'utf-8');
    const textMuted = css.match(/--text-muted:\s*(#[0-9a-f]{6})/i)?.[1];
    const borderLight = css.match(/--border-light:\s*(#[0-9a-f]{6})/i)?.[1];

    // 計算對比度（需實作 getContrast 函數）
    const textContrast = calculateContrast(textMuted, '#0f1419');
    const borderContrast = calculateContrast(borderLight, '#0f1419');

    const textPass = textContrast >= 5.5;
    const borderPass = borderContrast >= 3.0;

    console.log(`✓ text-muted contrast: ${textContrast.toFixed(2)} ${textPass ? 'PASS' : 'FAIL'}`);
    console.log(`✓ border-light contrast: ${borderContrast.toFixed(2)} ${borderPass ? 'FAIL'}`);

    return textPass && borderPass;
  },

  async aspectRatio() {
    const files = await glob('src/{components,layouts}/**/*.astro');
    let hasAspectRatio = 0;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('aspectRatio=')) {
        hasAspectRatio++;
      }
    }

    console.log(`✓ Components with aspectRatio: ${hasAspectRatio}`);
    return hasAspectRatio >= 4; // 至少 4 個關鍵組件
  }
};

// 執行所有檢查
async function validate() {
  console.log('🔍 Phase 1 驗證開始...\n');

  const results = await Promise.all(
    Object.entries(checks).map(async ([name, fn]) => {
      const pass = await fn();
      return { name, pass };
    })
  );

  const allPass = results.every(r => r.pass);

  console.log(`\n${allPass ? '✅' : '❌'} 總體結果: ${allPass ? 'PASS' : 'FAIL'}`);
  process.exit(allPass ? 0 : 1);
}

validate();
```

**使用方式：**
```bash
npm run build
node scripts/validate-phase1.mjs
```

---

### 3.2 效能測試基準

**修復前測試：**

```bash
# 建置並啟動預覽
npm run build && npm run preview &

# 執行 Lighthouse（首頁）
npx lighthouse http://localhost:4321 \
  --only-categories=performance,accessibility,seo \
  --output=json \
  --output-path=./reports/lighthouse-before.json

# 測試文章頁面
npx lighthouse http://localhost:4321/post/software/aspnet-core-authenticaiton-jwt/ \
  --output=json \
  --output-path=./reports/lighthouse-article-before.json
```

**修復後測試：**

```bash
# 再次執行相同測試
npx lighthouse http://localhost:4321 \
  --output=json \
  --output-path=./reports/lighthouse-after.json
```

**比對結果：**

```bash
# 使用 jq 比對關鍵指標
jq '.audits."cumulative-layout-shift".numericValue' reports/lighthouse-before.json
jq '.audits."cumulative-layout-shift".numericValue' reports/lighthouse-after.json
```

**預期改善目標：**
- ✅ **CLS**：從 ~0.1 降至 < 0.05（良好）
- ✅ **Accessibility**：分數提升 2-5 分
- ✅ **SEO**：sitemap 警告消失
- ✅ **Performance**：LCP 可能略有改善（圖片骨架屏）

---

### 3.3 手動測試清單

**功能測試：**
- [ ] `/sitemap-index.xml` 可訪問且格式正確
- [ ] `/sitemap-0.xml` 仍然可訪問（向後相容）
- [ ] `robots.txt` 指向正確（已正確）
- [ ] Google Search Console 接受新 sitemap（部署後測試）

**視覺測試：**
- [ ] `--text-muted` 文字可讀性良好，不過亮
- [ ] `--border-light` 邊框清晰可見，不突兀
- [ ] 整體視覺風格保持一致
- [ ] 深色主題各元素協調

**CLS 測試：**
- [ ] 首頁載入無明顯跳動
- [ ] 文章頁面封面圖載入穩定
- [ ] 最新文章卡片縮圖無跳動
- [ ] 系列文章卡片圖片穩定

**跨裝置測試：**
- [ ] 桌面（1920x1080）
- [ ] 平板（768x1024）
- [ ] 手機（414x896 - Pixel 7）
- [ ] 小手機（375x667）

---

## 實作順序

### Commit 1: 修復 sitemap 配置

```bash
# 修改檔案
- astro.config.mjs（或 src/pages/sitemap-index.xml.ts）
- package.json（如使用後處理腳本）

# Commit 訊息
fix: 產生 sitemap-index.xml 以符合 robots.txt 設定

- 使用 Astro endpoint 手動生成 sitemap-index.xml
- 確保 /sitemap-index.xml 可訪問
- 保持 /sitemap-0.xml 向後相容
```

### Commit 2: 優化色彩對比度

```bash
# 修改檔案
- src/styles/design-tokens.css

# Commit 訊息
fix: 提升文字和邊框色彩對比度以符合 WCAG AA 標準

- text-muted: #768390 → #8694a3 (對比度 4.84 → 5.5)
- border-light: #373e47 → #444c56 (對比度 1.73 → 3.2)
- 同步更新 prose-blockquote 顏色
```

### Commit 3: LazyImage 組件支援 aspect-ratio

```bash
# 修改檔案
- src/components/LazyImage.astro

# Commit 訊息
feat: LazyImage 組件新增 aspect-ratio 支援以優化 CLS

- 新增 aspectRatio prop 支援自定義比例
- 自動從 width/height 計算比例
- Fallback 使用 min-height 確保相容性
```

### Commit 4: 更新關鍵位置使用 aspect-ratio

```bash
# 修改檔案
- src/layouts/BlogPost.astro
- src/components/LatestPosts.astro
- src/components/SeriesBlock.astro
- src/components/CategoryGrid.astro

# Commit 訊息
fix: 為關鍵圖片位置添加 aspect-ratio 以消除 CLS

- 文章封面圖使用 16/9 比例
- 縮圖使用 1/1 比例
- 系列卡片使用 4/3 比例
- 預期改善 Core Web Vitals CLS 指標
```

### Commit 5: 新增驗證腳本

```bash
# 新增檔案
- scripts/validate-phase1.mjs
- .gitignore (新增 reports/)

# Commit 訊息
chore: 新增 Phase 1 自動化驗證腳本

- 檢查 sitemap 生成
- 驗證色彩對比度
- 確認 aspect-ratio 使用
```

---

## 成功指標

**量化指標：**
- Lighthouse Performance: 維持 90+
- Lighthouse Accessibility: +3-5 分
- Lighthouse SEO: 100 分（修復 sitemap 警告）
- CLS: < 0.05
- 色彩對比度: text-muted ≥ 5.5、border-light ≥ 3.0

**質化指標：**
- 圖片載入流暢無跳動
- 文字清晰易讀
- 邊框清晰可見
- Google Search Console 無 sitemap 錯誤

---

## 風險與緩解

**風險 1：色彩調整影響品牌視覺**
- 緩解：調整幅度小（10-15%），保持整體風格
- 回滾：如不滿意可輕易還原

**風險 2：aspect-ratio 導致圖片變形**
- 緩解：使用 `object-fit: cover` 確保圖片不變形
- 測試：多種圖片比例測試

**風險 3：LazyImage 修改破壞現有功能**
- 緩解：保持向後相容，未指定 aspectRatio 時使用 fallback
- 測試：確保載入動畫和錯誤處理仍正常

**風險 4：sitemap 方案不可行**
- 緩解：準備三種替代方案（i18n、endpoint、後處理）
- 驗證：本地測試確認可行後再部署

---

## 後續計畫

Phase 1 完成後，進入 Phase 2（中優先級改進）：

1. 實作相關文章推薦
2. 新增 RSS 訂閱入口
3. 實作手機版 TOC
4. 顯示預估閱讀時間
5. 啟用 View Transitions API

---

## 參考資料

- [WCAG 2.1 對比度標準](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Core Web Vitals - CLS](https://web.dev/cls/)
- [Astro Sitemap 整合文件](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [MDN: aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)
