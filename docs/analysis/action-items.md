# eandev.com 行動清單

> 持久追蹤。每次圓桌討論後更新，標記完成。
> 優先序：🔴 高（反覆出現或影響大）· 🟡 中 · 🟢 低

---

## 待處理

| 優先 | 項目 | 首次提出 | 代碼位置 | 工作量 |
|------|------|---------|---------|-------|
| 🔴 | **Newsletter 啟動**（Email 訂閱入口 + 每月一封摘要） | 2026-02-27 | FollowCTA.astro + 首頁 | 2–4 hrs |
| 🔴 | **Header 加「探索」下拉**（系列 /series/、標籤 /tags/） | 2026-02-27 | src/components/Header.astro | 60 min |
| 🔴 | **FollowCTA 調整**：RSS 升為主 CTA，Email 為副，Facebook 降次 | 2026-02-28 | src/components/FollowCTA.astro | 20 min |
| 🔴 | **首頁 Author sameAs 補齊**（補 X、LinkedIn、Facebook，與 Footer 對齊） | 2026-02-28 | src/pages/index.astro L78-80 | 5 min |
| 🟡 | **BlogPosting Author 豐富化**（加 sameAs、jobTitle、description） | 2026-02-28 | src/layouts/BlogPost.astro L77-81 | 15 min |
| 🟡 | **Giscus 改 `client:visible`**（CLS 改善 ~0.20） | 2026-02-28 | src/components/Giscus.astro | 10 min |
| 🟡 | **EnhancedAnalytics 改 `requestIdleCallback`**（TBT 改善 ~100ms） | 2026-02-28 | src/components/EnhancedAnalytics.astro L349-356 | 20 min |
| 🟡 | **LatestPosts 加 `featured` 精選機制**（frontmatter 欄位 + 排序邏輯） | 2026-02-28 | src/components/LatestPosts.astro | 45 min |
| 🟡 | **搜尋框行動版文字恢復**（`.search-text` 在 768px 改為顯示） | 2026-02-27 | src/components/Search.astro / Header CSS | 10 min |
| 🟢 | **文章底部加「同系列推薦」卡片**（上一篇、下一篇、返回系列） | 2026-02-28 | src/layouts/BlogPost.astro | 60 min |
| 🟢 | **.NET 工程師學習路徑入口**（/series/ 或 About 頁加推薦閱讀順序） | 2026-02-28 | src/pages/series/index.astro 或 about.astro | 90 min |
| 🟢 | **全域 `* { transition }` 改選擇性應用**（移除表單元素過渡） | 2026-02-28 | src/styles/global.css L16-22 | 25 min |
| 🟢 | **標籤命名規則統一**（審查現有標籤一致性，建立命名規範） | 2026-02-28 | src/content/blog/ 各文章 frontmatter | 30 min |
| 🟢 | **CategoryGrid / SeriesShowcase 加提示說明**（分類 vs 系列的差異） | 2026-02-28 | src/pages/index.astro | 15 min |

---

## 已完成

| 項目 | 完成日期 | commit / 備註 |
|------|---------|------|
| og:image 補寬高屬性（width=1200、height=630） | 2026-02-28 | BaseHead.astro L188-190 |
| CollectionPage + ItemList Schema（/series/、/tags/） | 2026-02-28 | series/index.astro、tags/index.astro |
| 系列文章 isPartOf Schema | 2026-02-28 | commit `5798b56d`，BlogPost.astro L98-104 |
| FollowCTA 多層次 CTA（Facebook 主、RSS/X/GitHub 次） | 2026-02-28 | src/components/FollowCTA.astro |
| 留言互動呼籲（Giscus 上方三種互動動機） | 2026-02-28 | src/layouts/BlogPost.astro L223-226 |
| 分類空態頁引導（加導向 About / Facebook 的二級 CTA） | 2026-02-28 | src/layouts/EpicLayout.astro |
| 手機版目錄折疊（1024px 以下完整折疊） | 2026-02-28 | src/components/TableOfContents.astro |
| HomeHero 首頁定位說明（.NET、Cloud Native 等技術標籤） | 2026-02-28 | src/components/HomeHero.astro |
| 標籤總覽頁 /tags/ 建立 | 2026-02-28 | commit `89e2274f` |
| 系列文章總覽頁 /series/ 建立 | 2026-02-28 | src/pages/series/index.astro |
| AdSense 延遲載入（互動後載入，5 秒備用） | 2026-02-28 | src/components/BaseHead.astro |
| SectionHeader 共用元件抽取（首頁區塊標頭樣式統一） | 2026-02-28 | commit `872bdc7b` |
