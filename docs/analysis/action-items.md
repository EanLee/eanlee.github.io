# eandev.com 行動清單

> 持久追蹤。每次圓桌討論後更新，標記完成。
>
> **快速選取用法：** 告訴我 ID（如「做 H1、M3、L2」），我會直接實作對應項目。
> 優先序：🔴 H（高）· 🟡 M（中）· 🟢 L（低）

---

## 快速索引

| ID | 項目 | 工作量 |
|----|------|--------|
| **H1** | Newsletter 啟動（Email 訂閱入口 + 每月一封） | 2–4 hrs |
| **H2** | Header 加「探索」下拉（/series/、/tags/） | 60 min |
| **H3** | FollowCTA 調整（RSS 升主、Email 副、Facebook 降次） | 20 min |
| **H4** | 首頁 Author sameAs 補齊（X、LinkedIn、Facebook） | 5 min |
| **M1** | BlogPosting Author 豐富化（sameAs、jobTitle） | 15 min |
| **M2** | Giscus 改 `client:visible` 延遲載入（CLS -0.20） | 10 min |
| **M3** | EnhancedAnalytics 改 `requestIdleCallback`（TBT -100ms） | 20 min |
| **M4** | LatestPosts 加 `featured` 精選機制 | 45 min |
| **M5** | 搜尋框行動版文字恢復 | 10 min |
| **L1** | 文章底部「同系列推薦」卡片 | 60 min |
| **L2** | .NET 工程師學習路徑入口 | 90 min |
| **L3** | 全域 `* { transition }` 改選擇性應用 | 25 min |
| **L4** | 標籤命名規則統一 | 30 min |
| **L5** | CategoryGrid / SeriesShowcase 加提示說明 | 15 min |

---

## 待處理（詳細）

### H1 · Newsletter 啟動

**首次提出：** 2026-02-27 · **反覆出現：** 3 次

**要做什麼：** 選擇 Email 平台（Substack / Brevo）、首頁加訂閱表單、每月發一封摘要整理當月最好的 2–3 篇文章

**預期優點：**
- 唯一真正屬於自己的讀者管道，不受 Facebook 演算法控制
- Email 開信率 30–40%，遠高於社群觸及率 1–5%
- 累積 Email 名單是三年後諮詢服務的種子受眾
- 讓讀者形成「定期回訪」習慣，而不是靠演算法偶遇

**預期缺點 / 風險：**
- 需要持續維護，若中斷比沒有更傷品牌形象
- 每月一封也是額外的時間承諾（估計 1–2 小時）
- 初期訂閱者極少，可能讓人覺得做了也沒什麼用

**不做的理由：** 創作精力有限，寧可把時間用在寫文章而不是發信
**建議決策點：** 先選平台、加表單，不強制發信頻率；「有訂閱者但沒發信」優於「沒有任何機制」

---

### H2 · Header 加「探索」下拉

**首次提出：** 2026-02-27 · **反覆出現：** 3 次 · **代碼位置：** `src/components/Header.astro`

**要做什麼：** 加一個「探索」下拉選單，放入系列文章（/series/）和標籤（/tags/）的連結

**預期優點：**
- 讀者在任何頁面都能找到系列入口，不需滾到首頁 SeriesShowcase
- Googlebot 爬取路徑更清晰（內部連結強化）
- 把「系列文章」這個核心資產提升到全站導覽層級

**預期缺點 / 風險：**
- Header 目前已有 6 個項目，再加一個接近視覺過載臨界點
- 下拉選單需要 JS 或 CSS 實作，增加複雜度
- 行動版下拉選單體驗需要額外處理

**不做的理由：** 認為現有 SeriesShowcase 的入口已足夠，Header 保持精簡
**建議決策點：** 可評估「探索」能否合併取代現有「所有文章」，而非純粹新增

---

### H3 · FollowCTA 調整

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/FollowCTA.astro` · **工作量：** 20 min

**要做什麼：** 主按鈕從 Facebook 改為 RSS（或 Email 訂閱），Facebook 降為次要連結

**預期優點：**
- RSS 更符合台灣技術讀者（25–40 歲 .NET 工程師）的習慣
- 減少對 Facebook 演算法的依賴

**預期缺點 / 風險：**
- Facebook 粉絲頁仍有既有受眾，降序可能減少粉絲頁新追蹤
- 若 Newsletter（H1）尚未啟動，「Email 副 CTA」會導向不存在的東西

**不做的理由：** Facebook 粉絲頁已有既有受眾，不想打亂現有管道
**建議決策點：** H1 完成後再做；或先把 Facebook 改為「同等權重」而非絕對主 CTA

---

### H4 · 首頁 Author sameAs 補齊

**首次提出：** 2026-02-28 · **代碼位置：** `src/pages/index.astro` L78-80 · **工作量：** 5 min

**要做什麼：** 首頁 JSON-LD 的 Author sameAs 從只有 GitHub，補上 X、LinkedIn、Facebook（與 Footer.astro 對齊）

**預期優點：**
- Google 建立 Author Entity 時，全站說法一致，EEAT 信號更強
- 零風險，純正向的低工作量修正

**預期缺點 / 風險：** 無實質缺點

**不做的理由：** 幾乎沒有。

---

### M1 · BlogPosting Author 豐富化

**首次提出：** 2026-02-28 · **代碼位置：** `src/layouts/BlogPost.astro` L77-81 · **工作量：** 15 min

**要做什麼：** 每篇文章的 BlogPosting Schema 的 author 欄位補上 sameAs、jobTitle、description

**預期優點：**
- 每篇文章都能關聯到完整的作者身份，強化文章層級的 EEAT 信號
- Google 的「人物」卡片有機會出現

**預期缺點 / 風險：**
- 對一般讀者完全不可見，效果難以量化
- 未來作者資訊有變，需記得同步更新

**不做的理由：** 效益難量化，優先做有直接讀者感知的改善

---

### M2 · Giscus 改 `client:visible` 延遲載入

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/Giscus.astro` · **工作量：** 10 min

**要做什麼：** Giscus 從頁面載入時立即初始化，改為讀者滾動到留言區時才載入

**預期優點：**
- CLS 預期改善約 0.20（目前 ~0.25，目標 < 0.1）
- Google Core Web Vitals 分數提升

**預期缺點 / 風險：**
- 讀者滾到留言區後有短暫的載入延遲（約 1–2 秒）

**建議決策點：** 加 loading placeholder 骨架屏，讓「正在載入」有視覺反饋

---

### M3 · EnhancedAnalytics 改 `requestIdleCallback`

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/EnhancedAnalytics.astro` L349-356 · **工作量：** 20 min

**要做什麼：** 363 行分析代碼從同步執行改為瀏覽器空閒時初始化

**預期優點：**
- TBT 預期改善 80–150ms

**預期缺點 / 風險：**
- 可能漏掉頁面載入後「極早期」的使用者互動事件
- `requestIdleCallback` 舊瀏覽器需要 fallback

**建議決策點：** 主要事件（外部連結點擊）維持即時監聽，只把「初始化選取器」延遲

---

### M4 · LatestPosts 加 `featured` 精選機制

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/LatestPosts.astro` · **工作量：** 45 min

**要做什麼：** frontmatter 加 `featured: true` 欄位，LatestPosts 優先顯示 featured 文章，再按時間序補足 6 篇

**預期優點：**
- 首頁展示的是「作者認為最重要的文章」，而不是「最近發布的文章」
- 避免「短文擠掉深度文」的問題

**預期缺點 / 風險：**
- 需要手動維護 featured 文章清單
- featured 文章長期不更新，首頁會顯得「過時」

**建議決策點：** 只選 3–5 篇最具代表性的文章加 `featured: true`

---

### M5 · 搜尋框行動版文字恢復

**首次提出：** 2026-02-27 · **反覆出現：** 2 次 · **工作量：** 10 min

**要做什麼：** Header 搜尋按鈕在行動版（768px 以下）目前只顯示放大鏡圖示，文字「搜尋」被隱藏，改為保留文字

**預期優點：** 降低讀者發現搜尋功能的認知門檻

**預期缺點 / 風險：** 行動版 Header 空間有限，加文字可能擠壓其他元素排版

**不做的理由：** 放大鏡圖示可識別性高，且空間限制是實際問題

---

### L1 · 文章底部「同系列推薦」卡片

**首次提出：** 2026-02-28 · **工作量：** 60 min

**要做什麼：** 文章頁面底部加「同系列其他文章」區塊，顯示上一篇、下一篇、返回系列目錄

**預期優點：**
- 讀完一篇的讀者有明確「下一步」，減少離站率
- 系列文章整體停留時間增加

**預期缺點 / 風險：**
- 非系列文章此功能無用
- 可能稀釋 FollowCTA 的視覺注意力

**不做的理由：** 認為 RelatedPosts 組件已有類似功能

---

### L2 · .NET 工程師學習路徑入口

**首次提出：** 2026-02-28 · **工作量：** 90 min

**要做什麼：** /series/ 頁或 About 頁加「推薦學習順序」區塊（Docker → CI/CD → Message Queue 等）

**預期優點：**
- 初訪 .NET 工程師知道「從哪裡開始」
- 差異化價值：iT邦幫忙沒有這種策展式學習路徑

**預期缺點 / 風險：**
- 需要作者花時間思考並定期更新
- 學習路徑有主觀性，不同需求的讀者路徑不同

**建議決策點：** 只列「最常見入門路徑」一條，不需窮舉

---

### L3 · 全域 `* { transition }` 改選擇性應用

**首次提出：** 2026-02-28 · **代碼位置：** `src/styles/global.css` L16-22 · **工作量：** 25 min

**要做什麼：** 移除所有元素的 transition 規則，改為只套用在卡片、按鈕、連結上

**預期優點：** TBT 預期改善 20–50ms

**預期缺點 / 風險：**
- 需逐一確認哪些元素保留，測試工作量大於修改本身
- 改善幅度對使用者不可感知（< 50ms）

**不做的理由：** 改善幅度有限，風險大於收益

---

### L4 · 標籤命名規則統一

**首次提出：** 2026-02-28 · **工作量：** 30 min

**要做什麼：** 審查現有標籤，建立命名規範，對不一致的標籤進行統一修正

**預期優點：** 標籤導覽效果更好（同一主題不會有多個標籤頁）

**預期缺點 / 風險：**
- 重新命名標籤會改變 URL，可能產生死連結
- 需批量修改多篇文章的 frontmatter

**不做的理由：** 目前文章數不多，問題尚不明顯

---

### L5 · CategoryGrid / SeriesShowcase 加提示說明

**首次提出：** 2026-02-28 · **代碼位置：** `src/pages/index.astro` · **工作量：** 15 min

**要做什麼：** 兩個區塊之間加一行說明（分類 = 主題瀏覽，系列 = 學習路徑）

**預期優點：** 消除讀者對兩個區塊差異的困惑

**預期缺點 / 風險：** 說明文字若寫不好反而增加認知負擔

**不做的理由：** 多數讀者能自然理解差異

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
