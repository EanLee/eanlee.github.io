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
| **H7** | og:image 傳遞修正（BlogPost.astro 傳 displayImage 至 BaseHead） | 10 min |
| **H8** | About 頁加聯絡 CTA（email / Calendly 接觸入口） | 30 min |
| **M1** | BlogPosting Author 豐富化（sameAs、jobTitle） | 15 min |
| **M4** | LatestPosts 加 `featured` 精選機制 | 45 min |
| **M5** | 搜尋框行動版文字恢復 | 10 min |
| **M8** | 系列卡片加描述文字（render `description` 欄位） | 20 min |
| **M10** | 系列最後一篇加「完結儀式」引導（訂閱 / 繼續探索） | 30 min |
| **M11** | 標籤頁加主題對應系列推薦（精準留存） | 45 min |
| **M12** | 字體 woff → woff2 格式升級（節省 ~18KB） | 30 min |
| **M13** | 系列 vs 獨立文章在卡片層級視覺區分 | 45 min |
| **M14** | /software/ 分類頁加 tag 篩選或次分類過濾器 | 90 min |
| **L1** | 文章底部「同系列推薦」卡片 | 60 min |
| **L2** | .NET 工程師學習路徑入口 | 90 min |
| **L3** | 全域 `* { transition }` 改選擇性應用 | 25 min |
| **L4** | 標籤命名規則統一 | 30 min |
| **L5** | CategoryGrid / SeriesShowcase 加提示說明 | 15 min |
| **L6** | logo 改 WebP + `fetchpriority="high"` | 20 min |
| **L7** | giscus.app preconnect 補齊 | 5 min |
| **L8** | About 頁加「下一步」CTA | 20 min |
| **L9** | `article:author` 改指向 URL | 10 min |
| **L10** | `og:site_name` meta tag 補充 | 5 min |
| **L11** | HomeHero 加「從這裡開始」引導 CTA | 20 min |
| **L12** | .NET 版本 badge（frontmatter `dotnetVersion` + 文章 Hero） | 60 min |
| **L13** | LatestPosts fallback 封面改用 Astro `<Image />` 組件 | 20 min |
| **L14** | `categories` 欄位廢棄宣告或整併至 epic/tags | 30 min |
| **L15** | EF Core PDF Lead Magnet 製作（現有文章重新包裝） | 2–3 wks |

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


### H7 · og:image 傳遞修正

**首次提出：** 2026-03-14 · **代碼位置：** `src/layouts/BlogPost.astro`（BaseHead 呼叫） · **工作量：** 10 min

**要做什麼：** `BlogPost.astro` 呼叫 `<BaseHead>` 時未傳入 `image` prop，導致每篇文章的社群分享預覽（Facebook、LinkedIn、Twitter）顯示佔位符 `/blog-placeholder-1.jpg`，而非文章封面圖。將 `displayImage` 的字串 URL 傳入 BaseHead 的 `image` prop 即可修正。

**預期優點：**
- 每篇文章的社群分享卡片顯示正確封面，點擊率預期提升 30–50%
- 修復 JSON-LD `image` 與 og:image 指向不一致的語意矛盾
- 消除潛在的 og:image 尺寸不符造成的 CLS

**預期缺點 / 風險：**
- 需確認 `displayImage` 傳入時為絕對 URL 字串而非 import 物件

**不做的理由：** 認為佔位符作為 fallback 是可接受的品牌策略
**建議決策點：** 這是已部署的 bug，影響每一篇文章的所有社群分享；建議本週內修正

---

### H8 · About 頁加聯絡 CTA

**首次提出：** 2026-03-14 · **代碼位置：** `src/content/pages/about.md`（或 about.astro） · **工作量：** 30 min

**要做什麼：** About 頁讀完後完全無行動號召——no email、no Calendly、no 聯絡按鈕。加入「有演講邀約、技術顧問或審稿需求，歡迎聯絡 →」CTA，搭配 email 或 Calendly 連結。

**預期優點：**
- About 頁是高意圖讀者的停留點，轉換意願高
- 開啟 B2B 接觸路徑（企業顧問、演講邀約）
- 對可觀測性 / 系統架構主題的 Senior 讀者有直接效益

**預期缺點 / 風險：**
- 若無法及時回覆聯絡，可能造成負面印象
- 需備好接觸後的回應流程

**不做的理由：** 目前尚未準備好承接顧問工作
**建議決策點：** 即使只是一個 email 連結，先讓有需要的讀者找到入口

---

### M10 · 系列最後一篇加「完結儀式」引導

**首次提出：** 2026-03-14 · **代碼位置：** `src/layouts/BlogPost.astro`（SeriesArticleNav 最後一篇邏輯） · **工作量：** 30 min

**要做什麼：** 當 `SeriesArticleNav` 偵測到「最後一篇」時，插入完結訊息：「你完成了這個系列！想繼續？→ 探索其他系列 / 訂閱 RSS 不錯過下一系列」。這是 Email 名單建立的最佳時機點。

**預期優點：**
- 讀完整個系列的讀者是投入度最高的訂閱候選人
- 提供自然的引導出口，避免讀者在系列結尾茫然離開
- 預留 Newsletter 訂閱框位置，H1 完成後可直接插入

**預期缺點 / 風險：**
- 若設計不好可能打破閱讀的沉浸感
- 需要確認「最後一篇」的判斷邏輯是否已存在

**建議決策點：** 精簡文字版（兩行 + 連結）風險最低，先做輕量版

---

### M11 · 標籤頁加主題對應系列推薦

**首次提出：** 2026-03-14 · **代碼位置：** `src/pages/tags/[...tag].astro` · **工作量：** 45 min

**要做什麼：** 標籤頁底部加入「對 [Tag] 感興趣？這個系列從頭帶你走完 →」的精準引導，連結至對應的系列頁面。例如 `/tags/Docker` 底部引導至「靈活使用 Docker」系列。

**預期優點：**
- 標籤頁訪客通常是主題精準讀者，轉換意願高
- 從單篇文章導流至完整學習路徑，增加深度閱讀
- 不同於首頁的廣泛推薦，這是主題比對式的精準留存

**預期缺點 / 風險：**
- 需要維護「標籤 → 系列」的對應關係
- 不是所有標籤都有對應系列

**建議決策點：** 只對有明確對應系列的主要標籤（Docker、EF Core、ASP.NET Core）實作

---

### M12 · 字體 woff → woff2 格式升級

**首次提出：** 2026-03-14 · **代碼位置：** `/public/fonts/`、`global.css`、`BaseHead.astro`、`FontLoader.astro` · **工作量：** 30 min

**要做什麼：** 將 `atkinson-regular.woff`（23.8KB）和 `atkinson-bold.woff`（23.0KB）轉換為 woff2 格式（預計壓縮至約 29KB，節省 ~18KB）。同步修改 global.css `@font-face src`、BaseHead preload `type`、FontLoader 的 format 字串。

**預期優點：**
- 字體傳輸體積減少 ~38%（18KB）
- 縮短 FOUT（字體替換閃爍）期間，改善感知效能
- LCP 改善預估 50–100ms

**預期缺點 / 風險：**
- 需要確認轉換工具（Fonttools 或線上轉換）的授權相容性
- 需同步更新三個檔案，遺漏任一個會導致字體載入失敗

**建議決策點：** 先在本地確認轉換後字體渲染無異，再替換線上版本

---

### M13 · 系列 vs 獨立文章在卡片層級視覺區分

**首次提出：** 2026-03-14 · **代碼位置：** `src/components/LatestPosts.astro`（卡片） · **工作量：** 45 min

**要做什麼：** 系列文章在列表卡片顯示時，加入「系列」標籤徽章或「第 N 篇 / 共 M 篇」提示，讓讀者在點進文章前就能判斷時間投入。

**預期優點：**
- 讀者可在列表層就決定「現在有沒有時間讀一個系列」
- 減少「點進去才發現是連載的一部分」的失落感
- 系列文章的「學習路徑」定位更清晰

**預期缺點 / 風險：**
- 若系列徽章設計不好，視覺會過於擁擠
- 需確認文章是否有 series 欄位來源

**建議決策點：** 先在 LatestPosts 的非 featured 卡片小縮圖旁加一個小 badge

---

### M14 · /software/ 分類頁加 tag 篩選或次分類過濾器

**首次提出：** 2026-03-14 · **代碼位置：** `/software/` 分類對應 layout · **工作量：** 90 min

**要做什麼：** `/software/` 分類目前有 60+ 篇文章平鋪在同一個列表，無任何次分類。加入 tag 篩選按鈕（Docker、EF Core、ASP.NET Core、系統架構等），讓讀者可以快速縮小範圍。

**預期優點：**
- 解決 /software/ 的「資訊過載」問題
- 讀者能找到聚焦的學習切入點
- 為未來文章數量繼續增長做好架構準備

**預期缺點 / 風險：**
- 實作需要 client-side 過濾 JS 或多個靜態子頁面，工作量非線性
- 標籤命名不統一（L4 未修）會讓過濾器效果打折

**建議決策點：** 先修 L4 標籤統一，再做 M14 過濾器；否則過濾器先天不足

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

### L10 · `og:site_name` meta tag 補充

**首次提出：** 2026-03-14 · **代碼位置：** `src/components/BaseHead.astro` · **工作量：** 5 min

**要做什麼：** 在 BaseHead 加入 `<meta property="og:site_name" content="伊恩的開發狂想" />`

**預期優點：** Facebook/LinkedIn 分享卡片顯示來源站台名稱，提升品牌識別度
**預期缺點 / 風險：** 幾乎無風險
**不做的理由：** 效益不顯著

---

### L11 · HomeHero 加「從這裡開始」引導 CTA

**首次提出：** 2026-03-14 · **代碼位置：** `src/components/HomeHero.astro` · **工作量：** 20 min

**要做什麼：** 在 HomeHero 加一個明確的 CTA 按鈕，指向最具代表性的入門系列，文案強調「這是給 .NET 工程師的」，幫助首次訪客在 5 秒內決定是否繼續。

**預期優點：** 提升首次訪客的點擊深度，減少直接離站率
**預期缺點 / 風險：** 明確定位句可能讓非目標讀者感覺不適合，但這是可接受的篩選
**建議決策點：** 搭配 A/B 測試最佳，但直接推出也可觀察流量變化

---

### L12 · .NET 版本 badge

**首次提出：** 2026-03-14 · **代碼位置：** frontmatter schema + 文章 Hero 組件 · **工作量：** 60 min

**要做什麼：** 新增 frontmatter 欄位 `dotnetVersion: "8.0"`，在文章 Hero 區顯示小 badge（如「.NET 8 適用」）。讓讀者在讀文章前就知道版本相容性。

**預期優點：**
- 消除「找到好文章但版本不對」的常見痛點
- 建立「版本資訊可信」的差異化印象

**預期缺點 / 風險：**
- 需為現有 60+ 篇文章補 `dotnetVersion` 欄位，工作量不小
- 欄位不填時需要有 fallback 處理

**建議決策點：** 先實作欄位和顯示邏輯，新文章開始填；舊文章分批補齊

---

### L13 · LatestPosts fallback 封面改用 Astro `<Image />` 組件

**首次提出：** 2026-03-14 · **代碼位置：** `src/components/LatestPosts.astro`（L102-118 fallback 分支） · **工作量：** 20 min

**要做什麼：** 目前 fallback 封面圖（無封面時的預設圖）走 `typeof coverImage === 'string'` 分支，輸出 raw `<img>` 標籤，不會自動產生 WebP 和 srcset。改為使用 Astro `<Image />` 組件。

**預期優點：** fallback 圖片也能享有 WebP 轉換和 srcset 的效能優化
**預期缺點 / 風險：** 需確認 Astro `<Image />` 對 `/public/` 路徑的靜態圖片的處理方式

---

### L14 · `categories` 欄位廢棄宣告或整併

**首次提出：** 2026-03-14 · **代碼位置：** 文章 frontmatter schema · **工作量：** 30 min

**要做什麼：** 確認 `categories` 欄位是否有任何頁面在讀取和展示。若無，在 frontmatter schema 中標記為廢棄，並從新文章的模板中移除；若有，統一整併至 `epic` 或 `tags`。

**預期優點：** 消除三維分類系統（epic / categories / tags）的語意混淆
**預期缺點 / 風險：** 若 categories 在某些地方有 SEO 效益（被 Googlebot 讀到），直接廢棄可能影響搜尋結果
**建議決策點：** 先確認 categories 欄位的實際影響範圍，再決定廢棄或整併

---

### L15 · EF Core PDF Lead Magnet 製作

**首次提出：** 2026-03-14 · **代碼位置：** `src/content/blog/Software/dotnet-ef-*`、`ef-core-*` 相關文章 · **工作量：** 2–3 週

**要做什麼：** 將現有 EF Core 系列文章（CLI 操作、SQL Server/PostgreSQL DbContext、T4 CodeTemplate、HasQueryFilter + Shadow Property）重新包裝為「EF Core .NET 8 工程師實戰手冊」PDF 電子書，作為 Newsletter 訂閱的 Lead Magnet。

**預期優點：**
- Newsletter 有了明確的訂閱誘因，轉換率預期提升 3–5 倍
- 不需新寫內容，主要是重新編排和補足缺口
- 建立可貨幣化的內容資產（未來可作為課程腳本）

**預期缺點 / 風險：**
- PDF 有版本時效性，需標明適用版本和最後更新日期
- 製作品質影響品牌形象，不能草率

**不做的理由：** 目前沒有 Newsletter 平台，PDF 無法發送
**建議決策點：** H1（Newsletter 框）完成後，L15 是下一個最高槓桿動作

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
| H6 · EnhancedAnalytics listener 洩漏修復 + 移除 console.log | 2026-02-28 | commit `2448d77a`，AbortController + signal 模式 |
| M6 · SiteNavigationElement Schema 補上 /series/ 和 /tags/ | 2026-02-28 | commit `6a37028e`，index.astro |
| M7 · /archives/ 補 CollectionPage Schema | 2026-02-28 | commit `302c667d`，archives.astro + GeneralLayout head slot |
| M9 · 空分類殼空態體驗 | 2026-03-14 | 不適用：動態路由不生成空殼頁；/reading/ 已 `return false` 隱藏，/growth/ 有 1 篇文章存在 |
