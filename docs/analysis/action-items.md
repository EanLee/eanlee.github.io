# eandev.com 行動清單

> 持久追蹤。每次圓桌討論後更新，標記完成。
>
> **快速選取用法：** 告訴我 ID（如「做 H1、M3、L2」），我會直接實作對應項目。
> 優先序：🔴 H（高）· 🟡 M（中）· 🟢 L（低）

---

## 快速索引

| ID | 項目 | 工作量 |
|----|------|--------|
| **H1** | Newsletter 啟動（Email 收集表單先行，發信頻率後決定） | 2–4 hrs |
| **H5** | 文章頁加精簡 FollowCTA（RSS + 預留 Email 框位置） | 30 min |
| **H6** | EnhancedAnalytics listener 洩漏修復 + 移除 console.log | 30 min |
| **M1** | BlogPosting Author 豐富化（sameAs、jobTitle） | 15 min |
| **M4** | LatestPosts 加 `featured` 精選機制 | 45 min |
| **M5** | 搜尋框行動版文字恢復 | 10 min |
| **M6** | SiteNavigationElement Schema 補上 /series/ 和 /tags/ | 10 min |
| **M7** | /archives/ 補 CollectionPage Schema | 15 min |
| **M8** | 系列卡片加描述文字（render `description` 欄位） | 20 min |
| **M9** | 空分類殼空態體驗改善（reading、growth） | 30 min |
| **L1** | 文章底部「同系列推薦」卡片 | 60 min |
| **L2** | .NET 工程師學習路徑入口 | 90 min |
| **L3** | 全域 `* { transition }` 改選擇性應用 | 25 min |
| **L4** | 標籤命名規則統一 | 30 min |
| **L5** | CategoryGrid / SeriesShowcase 加提示說明 | 15 min |
| **L6** | logo 改 WebP + `fetchpriority="high"` | 20 min |
| **L7** | giscus.app preconnect 補齊 | 5 min |
| **L8** | About 頁加「下一步」CTA | 20 min |
| **L9** | `article:author` 改指向 URL | 10 min |

---

## 待處理（詳細）

### H1 · Newsletter 啟動

**首次提出：** 2026-02-27 · **反覆出現：** 4 次

**要做什麼：** 選擇 Email 平台（Brevo 免費方案起步）、生成嵌入式表單代碼、放入文章頁 FollowCTA 區域；首頁可同步加訂閱框。發信頻率問題等名單達 50 人再決定。

**預期優點：**
- 唯一真正屬於自己的讀者管道，不受演算法控制
- Email 開信率 30–40%，遠高於社群觸及率
- 累積 Email 名單是三年後諮詢服務的種子受眾
- Google 觀察「回訪行為」，Newsletter 推播的老讀者回訪對 EEAT 有加分

**預期缺點 / 風險：**
- 需要持續維護，若中斷比沒有更傷品牌形象
- 初期訂閱者極少，可能讓人覺得做了也沒什麼用

**不做的理由：** 創作精力有限，寧可把時間用在寫文章而不是發信
**建議決策點：** 第一步只是「放一個表單」，不強制發信頻率；先有名單，再決定頻率

---

### H5 · 文章頁加精簡 FollowCTA

**首次提出：** 2026-02-28 · **代碼位置：** `src/layouts/BlogPost.astro`（Giscus 留言區上方） · **工作量：** 30 min

**要做什麼：** 在每篇文章底部、Giscus 留言區上方，加一個精簡的訂閱行動——不需要完整的 FollowCTA 元件，一行「訂閱 RSS 不錯過新文章 →」加上（未來）Email 輸入框的預留位置即可

**預期優點：**
- 搜尋進入文章頁的讀者（佔大多數）現在也能看到訂閱入口
- 讀完文章時轉換意願最高，這是最佳呼籲時機
- 預留 Email 框位置，H1（Newsletter）完成後可直接插入，無需重構

**預期缺點 / 風險：**
- 文章底部已有三層（RelatedPosts、留言呼籲、Giscus），再加一層可能過密
- 若 Newsletter 啟動前只有 RSS CTA，效果有限

**不做的理由：** 認為首頁 FollowCTA 已足夠，讀者會自己去首頁找
**建議決策點：** 精簡版（一行文字 + 連結）風險最低，先做輕量版、後續補全

---

### H6 · EnhancedAnalytics listener 洩漏修復

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/EnhancedAnalytics.astro` L349–L360 · **工作量：** 30 min

**要做什麼：**
1. 移除所有 `console.log` 除錯輸出（生產版本不應有）
2. 在 `astro:before-swap` 清理所有 `scroll`、`click`、`copy` 等事件監聽器，或改用 `AbortController` 統一管理（參考 Header.astro 的既有模式）

**預期優點：**
- 消除 Astro SPA 換頁時的記憶體洩漏
- GA4 分析數據正確（scroll depth、點擊事件不重複觸發）
- 移除 console.log 避免讀者看到除錯輸出

**預期缺點 / 風險：**
- 清理邏輯需要仔細對應每個監聽器的掛載和移除，容易漏掉
- 若 cleanup 時機不對，可能在合法的跨頁事件被攔截前就清理

**不做的理由：** 影響僅限分析數據，不影響讀者直接體驗
**建議決策點：** 這是生產 bug，應優先處理；使用 AbortController 模式最簡潔

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

### M6 · SiteNavigationElement Schema 補上 /series/ 和 /tags/

**首次提出：** 2026-02-28 · **代碼位置：** `src/pages/index.astro`（SiteNavigationElement JSON-LD） · **工作量：** 10 min

**要做什麼：** 在首頁 JSON-LD 的 `SiteNavigationElement` 陣列中，新增 /series/ 和 /tags/ 兩個 `ListItem`，讓 Googlebot 知道這兩個頁面是網站的導覽入口

**預期優點：**
- Googlebot 能語意理解新的導覽結構（與 Header 的「探索」連結對齊）
- /series/ 和 /tags/ 頁面的 SEO 效益不會延遲

**預期缺點 / 風險：** 幾乎無風險，純新增

**不做的理由：** Schema 效果難以直接量化

---

### M7 · /archives/ 補 CollectionPage Schema

**首次提出：** 2026-02-28 · **代碼位置：** `src/pages/archives.astro`（或對應路徑） · **工作量：** 15 min

**要做什麼：** /archives/ 頁面有完整文章列表，但沒有 `CollectionPage` + `ItemList` Schema，補齊讓 Google 理解這是一個「集合頁」

**預期優點：**
- 與 /series/ 和 /tags/ 已有的 CollectionPage Schema 一致
- 潛在的 Rich Results 機會

**預期缺點 / 風險：** 工作量低，風險幾乎為零

**不做的理由：** 效益難量化，/archives/ 的搜尋流量有限

---

### M8 · 系列卡片加描述文字

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/SeriesShowcase.astro`（或系列卡片元件） · **工作量：** 20 min

**要做什麼：** 系列首頁和系列卡片目前只顯示系列名稱。`description` 欄位在 series frontmatter 中已有資料，需要讓卡片元件 render 出來（一行說明文字）

**預期優點：**
- 讀者在點進系列前就能判斷這個系列是否適合自己
- 降低「進去又出來」的跳出率

**預期缺點 / 風險：**
- 若部分系列的 `description` 欄位是空的，需要先補資料

**建議決策點：** 先確認所有系列都有 `description`，再改元件

---

### M9 · 空分類殼空態體驗改善

**首次提出：** 2026-02-28 · **代碼位置：** reading/growth 分類頁的 layout · **工作量：** 30 min

**要做什麼：** /categories/reading/（0 篇）和 /categories/growth/（1 篇）目前點進去體驗很差。選項 A：空態頁加引導文字（如「這個分類正在建立中，先看看技術文章？→」），選項 B：在首頁 CategoryGrid 暫時隱藏文章數為 0 的分類

**預期優點：**
- 消除「空白頁」的負面第一印象
- 引導讀者去有內容的地方，減少離站

**預期缺點 / 風險：**
- 隱藏分類需要判斷邊界（幾篇才顯示？），可能造成未來維護混亂
- 空態文字若寫得不好反而尷尬

**建議決策點：** 短期選 A（加引導文字），長期等文章累積到 3–5 篇再開放正式入口

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

**要做什麼：** 審查現有標籤，建立命名規範（如：EF Core 還是 EF-Core？），對不一致的標籤進行統一修正

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

### L6 · logo 改 WebP + `fetchpriority="high"`

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/Header.astro`（logo img 標籤） · **工作量：** 20 min

**要做什麼：** 將 Header 的 logo 圖片：(1) 轉為 WebP 格式縮小體積，(2) 加上 `fetchpriority="high"` 提示瀏覽器優先載入，改善 LCP

**預期優點：**
- WebP 體積比 PNG 小約 30–50%
- `fetchpriority="high"` 讓 LCP 元素（若 logo 是 LCP）更快出現

**預期缺點 / 風險：**
- 需要確認 logo 是否真的是 LCP 元素（用 Lighthouse 確認）
- 若 logo 不是 LCP，`fetchpriority="high"` 效益有限

**建議決策點：** 先用 Lighthouse 確認 LCP 元素再決定

---

### L7 · giscus.app preconnect 補齊

**首次提出：** 2026-02-28 · **代碼位置：** `src/components/BaseHead.astro` · **工作量：** 5 min

**要做什麼：** 在 BaseHead 加上 `<link rel="preconnect" href="https://giscus.app">` 和 `<link rel="dns-prefetch" href="https://giscus.app">`

**預期優點：** 讀者滾動到留言區時，Giscus 的 DNS 解析已完成，縮短初始化時間約 100–200ms

**預期缺點 / 風險：** 幾乎無風險，純加快載入

**不做的理由：** Giscus 已改為延遲載入，preconnect 效益相對降低

---

### L8 · About 頁加「下一步」CTA

**首次提出：** 2026-02-28 · **代碼位置：** `src/pages/about.astro`（或對應路徑） · **工作量：** 20 min

**要做什麼：** About 頁讀完後，讀者不知道下一步要去哪裡。加一個明確的行動呼籲：「看看系列文章 →」或「訂閱 RSS →」

**預期優點：**
- About 頁通常是讀者想進一步了解作者時的停留點，轉換意願高
- 引導至系列文章可增加深度閱讀機率

**預期缺點 / 風險：** About 頁本身不是高流量頁面，效益有限

**不做的理由：** 優先做文章頁（H5）效益更高

---

### L9 · `article:author` 改指向 URL

**首次提出：** 2026-02-28 · **代碼位置：** `src/layouts/BlogPost.astro`（Open Graph meta tags） · **工作量：** 10 min

**要做什麼：** `<meta property="article:author">` 目前值為作者姓名字串，改為作者個人頁面 URL（如 `https://eandev.com/about/`）

**預期優點：**
- Facebook 和 LinkedIn 解析時能建立作者 Entity 關聯
- LinkedIn 分享卡片有機會顯示作者 profile 連結

**預期缺點 / 風險：** 效果取決於社群平台的爬取邏輯，難以量化

**不做的理由：** 對一般讀者不可見，優先順序低

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
| H4 · 首頁 Author sameAs 補齊（X、LinkedIn、Facebook） | 2026-02-28 | commit `819b29eb` |
| H3 · FollowCTA 調整（RSS 升主、Facebook 降次、aria-label） | 2026-02-28 | commit `f7f95278`、`13dc1f84` |
| M2 · Giscus 改 IntersectionObserver 延遲載入（CLS 改善） | 2026-02-28 | commit `686b66f6`、`30124167` |
| M3 · EnhancedAnalytics 改 requestIdleCallback（TBT 改善） | 2026-02-28 | commit `dd66a2f7` |
| H2 · Header 加「探索」下拉選單（/series/、/tags/） | 2026-02-28 | commit `b6f61d2c`、`a67c3495` |
