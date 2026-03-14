# eandev.com 圓桌討論記錄

**日期：** 2026-03-14
**參與者：** Alex（SEO）、Mia（行銷）、Sam（部落客）、Kai（學習者）、
            River（效能）、Jay（台灣社群）、Iris（資訊架構）、Chen（商業模式）

---

## 上次建議實作確認

| 項目 | 上次狀態 | 本次確認 | 備註 |
|------|---------|---------|------|
| H5 · 文章頁精簡 FollowCTA | ❌ 待處理 | ❌ 未實作 | BlogPost.astro 全文無 FollowCTA 引用 |
| H1 · Newsletter 啟動 | ❌ 待處理 | ❌ 未實作 | 全站無 email capture 機制 |
| M1 · BlogPosting Author 豐富化 | ❌ 待處理 | ❌ 未實作 | author 僅有 name + url，無 sameAs/jobTitle |
| M4 · LatestPosts featured 機制 | ❌ 待處理 | ❌ 未實作 | 仍為 `posts.slice(0, limit)` 純日期排序 |
| M5 · 搜尋框行動版文字 | ❌ 待處理 | ❌ 未實作 | `Search.astro` L186 仍有 `display: none` |
| M8 · 系列卡片加描述文字 | ❌ 待處理 | ⚠️ 部分 | SeriesBlock 有 description，SeriesShowcase 首頁無 |
| M9 · 空分類殼空態 | ❌ 待處理 | ⚠️ 不適用 | 動態路由不生成空殼頁；/reading/ 已 `return false` 隱藏 |
| L1 · 文章底部同系列推薦 | ❌ 待處理 | ⚠️ 部分替代 | RelatedPosts 已優先同系列，但缺乏脈絡強度 |
| L2 · .NET 學習路徑入口 | ❌ 待處理 | ❌ 未實作 | — |
| L3 · 全域 transition 改選擇性 | ❌ 待處理 | ❌ 未實作 | `global.css` L16-22 `* { transition }` 依然存在 |
| L4 · 標籤命名規則統一 | ❌ 待處理 | ❌ 未實作 | 混用問題更加清晰（大小寫、kebab vs 中文） |
| L5 · CategoryGrid 說明文字 | ❌ 待處理 | ❌ 未實作 | SectionHeader 無 subtitle prop |
| L6 · logo WebP + fetchpriority | ❌ 待處理 | ❌ 未實作 | Header.astro 仍使用 `.ico` 格式，無尺寸宣告 |
| L7 · giscus.app preconnect | ❌ 待處理 | ❌ 未實作 | BaseHead 的 preconnect 清單無 giscus.app |
| L8 · About 頁下一步 CTA | ❌ 待處理 | ❌ 未實作 | about.md 最後只有「— 伊恩」簽名 |
| L9 · article:author 改 URL | ❌ 待處理 | ❌ 未實作 | BaseHead.astro L196 仍為字串 `'Ean Lee'` |

---

## 本次討論

### 議題一：已部署的 Bug——文章封面沒有出現在社群分享預覽

**Alex：** 今天發現一個比 M1、L9 更緊急的問題。`BlogPost.astro` 呼叫 `<BaseHead>` 時沒有傳入 `image` prop，所以每一篇文章在 Facebook、LinkedIn、Twitter 分享時，顯示的縮圖是 `/blog-placeholder-1.jpg`，而不是文章的封面圖。你們最近花了很多工夫補封面圖（60 篇 frontmatter 更新），但分享出去的時候讀者看到的還是佔位符。這是代碼層的漏洞，不是內容問題。

**Mia：** 等等，Alex 說的這件事讓我很震驚。上次我們討論 FollowCTA 放在文章頁——但如果連社群分享的縮圖都是佔位符，整個品牌的第一印象就已經壞掉了。我花時間規劃 Newsletter 轉換，結果每次有人分享文章到 LinkedIn，看到的是一張空白預設圖？這直接砍掉了分享卡片的點擊率，保守估計至少降 30–50%。

**Sam：** Alex 說的這個 bug，修起來多複雜？

**Alex：** 五分鐘。`BlogPost.astro` 第 116–123 行的 BaseHead 呼叫加一個 `image={displayImage}` 就完成了。問題在於 `displayImage` 是 `<Image>` 組件的 import 對象，不是字串 URL，要稍微處理一下。但邏輯上很簡單，就是把現在已經用在 `jsonLd.image` 的那個 URL 也傳給 BaseHead。

**River：** 我補一個效能角度：沒有傳 `image` 的副作用不只是社群分享。BaseHead 的 og:image 是 `1200×630` 的宣告，但實際顯示佔位符的尺寸可能不同，在某些情況下會造成 CLS。加上文章本身的 `displayImage` 通常是 PNG/JPG，BaseHead 的 preload 也沒有對應，是個雙重漏洞。

**Chen：** Alex 說的這件事讓我想到更大的問題：你們做了那麼多 SEO Schema、補了封面圖、修了 lastmod——但唯獨這個「讓圖真的出現在分享卡片」的問題沒有修，所有的曝光機會都被打了折扣。這是應該本週就修的事情，不是下次規劃的事情。

---

### 議題二：批次更新 lastmod 的意外代價

**Sam：** 我看了最近 20 筆 commit，有件事讓我不安。這次把 60+ 篇文章的 `lastmod` 批次更新為同一天——如果這些文章沒有實質內容改動，每一個 RSS 訂閱者的閱讀器都會把這 60 篇當作「新文章」推送給他們。你知道這意味著什麼嗎？一個認真訂閱 RSS 的讀者，明天打開閱讀器，看到 60 篇「新文章」，其中大部分他可能已讀過，或者根本看不出哪裡不同。這種體驗第一次還能忍，第二次就會取消訂閱。

**Jay：** Sam 說的這件事，我從台灣社群的角度補一刀。用 RSS 追蹤技術部落格的工程師，通常是最「認真」的讀者。他們是種子讀者，是最可能分享你文章、在社群留言的人。如果 RSS 體驗變差，失去的不是隨機流量，是信任基底。

**Iris：** Sam 和 Jay 說的是使用者端的問題，我要說架構端的問題：如果未來想做「最近更新文章」這個功能，或者在 RSS 裡標注「已更新」，現在這 60 篇都有同一個 lastmod，排序完全失去意義。這個批次操作破壞了 `lastmod` 作為「信號」的可靠性。

**Alex：** 我補 SEO 的角度——Google 確實會參考 `lastmod` 判斷爬取優先序。但批次把 60 篇的 lastmod 全設成同一天，Google 爬蟲可能會把它當作「網站大幅改版」的信號，短期內安排大量重新爬取，消耗爬取配額，反而可能影響新文章的索引速度。這種結果是得不償失的。

**Sam：** 好，我想要有一個具體的規範：`lastmod` 只有在內容**實質改動**（修正錯誤資訊、補充新章節、更新版本相容說明）時才動。單純加封面圖、修 frontmatter、補標籤——這些都不應該觸碰 `lastmod`。這個規則應該寫進 CLAUDE.md，不然下次還會重演。

**Mia：** Sam 說的規範我同意，但我想往前看：這次批次更新已經發生了，有沒有什麼方式可以降低傷害？

**River：** 技術上，RSS feed 是靜態生成的。如果 `lastmod` 已經寫進文章 frontmatter，短期沒有辦法選擇性退回，只能接受這次的「噪音推送」，然後從下次開始嚴格管控。最小動作是在 CLAUDE.md 補上這條規則，避免下次再犯。

---

### 議題三：文章頁出口封死——H5 第三次出現

**Kai：** 我今天又一次走了一遍讀者路徑：從 Google 搜尋進文章，讀完，然後……什麼都沒有。這是第三次在圓桌上討論 H5 了。文章頁的結構是：SocialShare → SeriesArticleNav → RelatedPosts → comment-cta → Giscus。全部結束，沒有訂閱入口。

**Mia：** Kai 說「第三次了」，我想直接講一個數字。如果每個月有 100 個人讀完文章、覺得有用，這 100 人裡有 3–5 個本來願意訂閱 RSS 或留下 email，我們持續讓他們空手離開已經三個月了，保守估計損失了 9–15 個高意願讀者，他們永遠不會再回來。這不是規劃問題，是執行問題。

**Jay：** Mia 說的「永遠不會再回來」這個表述很準確。台灣技術讀者的閱讀行為是這樣的：他搜尋到一篇文章，讀完，感覺有用，然後有一個 3–5 秒的視窗決定要不要「留下來」。這個視窗沒有入口，他關掉分頁就消失了。H5 就是這個視窗的出口。

**Sam：** 我要說一個讓這個問題更尷尬的事：FollowCTA 組件已經存在、功能完整、在首頁運作正常。把它加進 BlogPost.astro 真的只需要幾行。這不是「需要設計決策」的問題，是「需要有人去做」的問題。

**River：** 我確認了：`FollowCTA.astro` 組件在 `index.astro` L176 有完整引用，複製到 `BlogPost.astro` 的 Giscus 上方，5 分鐘就能完成。如果擔心重量，BlogPost 可以傳一個 `compact` prop 讓它顯示精簡版。

**Iris：** 我補一個架構觀點：文章頁的 FollowCTA 和首頁的 FollowCTA 定位不同——首頁是第一次認識，文章頁是讀完後的自然延伸。精簡版反而更符合「脈絡」，不需要把所有社群連結都塞進去，一行「訂閱 RSS 不錯過下一篇 →」加上未來預留的 email 框就夠了。

**Alex：** Iris 說的「脈絡」提醒了我 SEO 的角度：文章頁放 FollowCTA 還有一個額外的效益——讓 Googlebot 在爬取文章時能偵測到作者的 social profile 連結，這對 EEAT 的 Author Entity 識別有微幅加分。雖然是 SEO 角度，但支持 Iris 說的精簡版方向。

---

### 議題四：Newsletter 的加速折舊

**Chen：** 我想把數字說清楚，不是要製造焦慮。這個部落格現在有 60+ 篇深度技術文章，處於搜尋引擎有機流量最快速增長的黃金階段。這個階段通常在網站成熟後 18–24 個月趨平，也就是說現在是建立 email 名單最便宜的時候。每延誤一個月，邊際成本就在提高。

**Jay：** Chen 說的「黃金階段」我用社群的語言翻譯一下：現在如果有人在 PTT Soft_Job 問「哪裡學 .NET DevOps」，eandev.com 有機會被推薦。但如果三年後問同樣的問題，記憶裡留下的是那個時候有在發 Newsletter 的人，不是當時什麼都沒做的人。

**Mia：** 我要把「Newsletter 啟動」拆得更小，因為我懷疑執行的阻力在於「不知道從哪裡開始、不想承諾發信頻率」。最小可行步驟是：第一步，Brevo 免費帳號（300 封/天，零月費），第二步，生成嵌入式表單，第三步，放進 BlogPost.astro 的 FollowCTA 旁邊。這三步加起來兩小時，不需要第一封信，不需要月計畫，只需要一個框。

**Sam：** Mia 說的「先放框」方向我支持，但我要說 Chen 提的「EF Core PDF 作為 lead magnet」讓這件事變得更有意義。如果 Newsletter 訂閱的誘因是「訂閱就送 EF Core .NET 工程師實戰手冊 PDF」，轉換率會比空白的「訂閱就好」高出 3–5 倍。現在的問題是：先有框、再有 PDF，還是兩件事同時做？

**Chen：** Sam 說的是對的，但我有一個更現實的判斷：這兩件事同步執行的風險是「兩件都做到一半」。我的建議是拆開時間軸——第一個月：只做 Newsletter 框（Mia 說的兩小時版本），開始收地址；第二個月：做 EF Core PDF，名單裡的早期訂閱者直接收到第一封「這是你訂閱的禮物」。這樣兩件事都能完整執行，而且 PDF 有「首發讀者」的感知價值。

**Kai：** 身為一個潛在訂閱者，我想說：如果訂閱 Newsletter 可以拿到一份「EF Core .NET 實戰手冊」PDF，我真的會填那個表單。這不是理論，是真實的讀者動機。

---

### 議題五：EF Core 系列已具備產品化條件

**Chen：** 我今天翻了一遍文章目錄，EF Core 相關的深度文章至少有 6 篇：CLI 操作、SQL Server DbContext、PostgreSQL DbContext、T4 CodeTemplate 自定義、HasQueryFilter + Shadow Property、系列總覽頁。這是一個完整的實戰知識體系，從工具到架構模式都有了。PDF 電子書的骨架已經在這裡，需要的只是「重新包裝」而非「新寫內容」。預估 4 週可以完成，不需要新增創作負擔。

**Iris：** Chen 說的 EF Core 集群，對我來說還有另一層意義。`/software/` 分類現在有 60+ 篇文章，全部平鋪在同一個列表，沒有次分類。EF Core 系列本身就是 `/software/` 的第一個自然聚落，做一個 EF Core 集中入口頁，不只是商業包裝，也是讓讀者在 /software/ 這個大分類裡找到路的 IA 解決方案。

**Alex：** 從 SEO 角度，一個獨立的 `/dotnet-ef-core/` 主題頁面（或 `/series/ef-core/`）會讓 Google 能把這些分散的 EF Core 文章識別為一個「知識集群」，提升整個系列文章在 EF Core 相關關鍵字的排名。這是 Topical Authority 建立的核心動作，iT 邦的個別文章做不到這件事。

**Jay：** 補一個社群角度：台灣 .NET 社群定期會有人問「哪裡有完整的 EF Core 中文資源？」。如果你有一個可以直接貼出去的學習路徑頁（/series/ef-core/ 加上每篇的讀者對象和難度），這個連結本身就可以在 Facebook .NET 社團、Dcard 工程板反覆被引用。這是 iT 邦的個別系列文做不到的事情——因為那個 URL 是 iT 邦的，不是作者的。

**Mia：** 把 Alex 和 Jay 的觀點合起來，我有一個行動序列：**EF Core 主題頁（SEO + 社群分享）→ 頁面底部加 Newsletter 訂閱框（lead magnet）→ 訂閱後寄出 PDF（確認信 = 第一封 Newsletter）**。這三步串起來，每一步都在做不同的事，但最終的目的地是同一個——把 EF Core 讀者轉化為訂閱者，再把訂閱者培養成未來課程或諮詢的種子受眾。

**Sam：** 我想在這裡說一個警示：產品化的前提是作者願意維護。如果 EF Core PDF 裡有錯誤或過時資訊，損害的不只是這份 PDF，是整個部落格的信任度。建議在 PDF 封面就標明「.NET 8 適用」和「最後更新：YYYY-MM」，讓讀者知道這是有時效性的文件，也給自己一個合理的維護週期。

---

## 本次行動清單

（同步更新至 action-items.md）

### 新增高優先
- **H7** · og:image 傳遞修正（BlogPost.astro 傳 displayImage URL 至 BaseHead image prop）
- **H8** · About 頁加聯絡 CTA（email/Calendly 接觸入口）

### 新增中優先
- **M10** · 系列最後一篇加「完結儀式」引導（訂閱 / 繼續探索其他系列）
- **M11** · 標籤頁加主題對應系列推薦（精準留存）
- **M12** · 字體 woff → woff2 格式升級（節省 ~18KB）
- **M13** · 系列 vs 獨立文章在卡片層級視覺區分（badge / 篇數標示）
- **M14** · /software/ 分類頁加 tag 篩選或次分類過濾器

### 新增低優先
- **L10** · `og:site_name` meta tag 補充（一行修正）
- **L11** · HomeHero 加「從這裡開始」引導 CTA（指向最具代表性系列）
- **L12** · .NET 版本 badge（frontmatter `dotnetVersion` + 文章 Hero 顯示）
- **L13** · LatestPosts fallback 封面改用 Astro `<Image />` 組件（非 raw img）
- **L14** · `categories` 欄位廢棄宣告或整併至 epic/tags
- **L15** · EF Core PDF Lead Magnet 製作（現有文章重新包裝）

### 新增規範（寫入 CLAUDE.md）
- `lastmod` 只有在**內容實質改動**時才更新（修正錯誤資訊、補充新章節、版本相容說明）；補封面圖、修 frontmatter 欄位、調標籤，不應觸碰 `lastmod`

### 已完成（本次確認）
- M9 · 空分類殼：不適用（動態路由不生成空殼頁，/reading/ 已 `return false` 隱藏）

---

> **本次優先建議執行順序（依急迫性）：**
> 1. H7 · og:image 傳遞修正（5–10 分鐘，但影響每篇文章的所有社群分享）
> 2. H5 · 文章頁精簡 FollowCTA（5–30 分鐘，已拖三次）
> 3. 寫入 CLAUDE.md 的 lastmod 規範（防止下次重演）
> 4. H8 · About 頁聯絡 CTA（2 天內，高意圖讀者每天都在流失）
> 5. H1 · Newsletter 框（2 小時，Brevo 免費版，先收地址）
