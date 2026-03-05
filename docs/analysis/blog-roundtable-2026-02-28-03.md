# eandev.com 圓桌討論記錄

**日期：** 2026-02-28
**參與者：** Alex（SEO）、Mia（行銷）、Sam（部落客）、Kai（學習者）、
            River（效能）、Jay（台灣社群）、Iris（資訊架構）、Chen（商業模式）

## 上次建議實作確認

| 項目 | 上次狀態 | 本次確認 | 備註 |
|------|---------|---------|------|
| H2 · Header 加「探索」下拉（/series/、/tags/） | ❌ 待處理 | ✅ 已完成 | Header.astro，commit `b6f61d2c` + `a67c3495` |
| H3 · FollowCTA 調整（RSS 升主、Facebook 降次） | ❌ 待處理 | ✅ 已完成 | FollowCTA.astro，commit `f7f95278` + `13dc1f84` |
| H4 · 首頁 Author sameAs 補齊（X、LinkedIn、Facebook） | ❌ 待處理 | ✅ 已完成 | index.astro，commit `819b29eb` |
| M2 · Giscus 延遲載入（IntersectionObserver + skeleton） | ❌ 待處理 | ✅ 已完成 | Giscus.astro，commit `686b66f6` + `30124167` |
| M3 · EnhancedAnalytics 改 requestIdleCallback | ❌ 待處理 | ✅ 已完成 | EnhancedAnalytics.astro，commit `dd66a2f7` |
| H1 · Newsletter 啟動 | ❌ 待處理 | ❌ 未實作 | 尚無 Email 訂閱入口 |
| M1 · BlogPosting Author 豐富化 | ❌ 待處理 | ❌ 未實作 | BlogPost.astro 未更新 |
| M4 · LatestPosts 加 featured 精選機制 | ❌ 待處理 | ❌ 未實作 | — |
| M5 · 搜尋框行動版文字恢復 | ❌ 待處理 | ❌ 未實作 | — |

## 本次討論

### 議題一：文章頁的「死巷」——讀完一篇之後呢？

**Sam：** 我今天看了六、七篇文章，每篇讀完都到了同一個地方——空白。Giscus 留言區、一個 RelatedPosts，然後就沒了。FollowCTA 只在首頁，文章頁的讀者根本不知道接下來要去哪裡、要怎麼追蹤你。

**Mia：** Sam 說的「空白」正是轉換漏斗的最大漏洞。我們把 RSS 升為主 CTA 了，但那個 CTA 只有在首頁。讀者從 Google 搜尋進來，落點是文章頁，他們永遠不會看到首頁的 FollowCTA。

**Jay：** 補一個台灣讀者的角度：.NET 工程師找到一篇技術文章，通常是搜尋進來的，不是從首頁進來的。如果他讀完覺得有用，他的下一個動作是「這個人還寫了什麼？」——然後就發現找不到訂閱入口。這個機會窗口很短，他關掉分頁就消失了。

**Chen：** Jay 說的「機會窗口」這個詞很準確。從商業角度，每一個「讀完文章的讀者」都是轉換成訂閱者的最高意願時刻。他剛剛得到價值，轉換意願最高。這個窗口不收 Email，等於在客流最旺的時候關著門。

**Sam：** Chen 說得對。但我要補一個實作現實：文章底部已經有三層東西——RelatedPosts、Giscus 留言呼籲、Giscus 本身。再加 FollowCTA 會不會太多？我建議找現有的位置插入，不要另開一塊。

**Mia：** Sam 提醒得好。我的想法是在 Giscus 留言區**上方**、留言呼籲文字**旁邊**加一個小的 RSS 訂閱行動——不需要完整的 FollowCTA 元件，一行「訂閱 RSS 不錯過新文章 →」就夠了。如果 Newsletter 之後啟動，這個位置也可以直接改成 Email 表單。

**Iris：** 我從架構角度支持 Mia 的「精簡版」方向。文章頁 FollowCTA 的定位跟首頁不一樣——首頁是第一次認識部落格，文章頁是已經得到價值後的自然延伸。兩者要的元件粒度不同，精簡反而更合適。

---

### 議題二：生產環境的技術債——console.log 和 listener 洩漏

**River：** 我今天在看 EnhancedAnalytics 的 requestIdleCallback 實作，整體架構沒問題，但有兩件事讓我很在意。第一：多處 `console.log` 留在生產版本裡，讀者打開 devtools 就看得到。第二，更嚴重的：scroll、click 等事件監聽器在 Astro 的 `astro:page-load` 裡重複掛載，每換一頁就累積一次，永遠不移除。這不只是性能問題，是記憶體洩漏。

**Kai：** River 說的 listener 洩漏，我感受到一個現象：在幾個頁面切換後，scroll 事件好像觸發了不只一次。scroll depth 可能重複計算，分析數據會失真。

**River：** Kai 你的直覺對了。每次 `astro:page-load` 觸發，`initNonCriticalAnalytics` 就重新 `addEventListener`，但舊的監聽器沒有對應的 `removeEventListener`。修法是在 `astro:before-swap` 清理，或用 `AbortController` 統一管理——我們在 Header 的鍵盤事件已經用了 `AbortController` 模式，直接複製過來就行。

**Alex：** River 說的分析數據失真我也在意，但我要補另一個角度——Google Search Console 的行為數據。如果滾動深度重複觸發，GA4 的「捲動」事件會有異常峰值，可能影響 Google 對「使用者真正閱讀深度」的判斷，間接影響 EEAT 評分。

**Sam：** 這讓我說一件優先順序的事：console.log 和 listener 洩漏是**已部署到生產的 bug**，不是未來改善項目。它現在就在線上跑。我認為這比 Schema 補齊更緊急，應該列為下次第一個動。

**Mia：** Sam 說的我同意。技術債不清，其他行銷工具的數據都不可信。Newsletter 的轉換追蹤、點擊率計算，都建立在乾淨的 GA4 數據上。現在先修好底層。

---

### 議題三：結構化資料的缺口

**Alex：** 確認一下本次完成的部分——H4 的 `sameAs` 補齊了、`isPartOf` 系列關聯也在上一輪完成，這些都很好。但我今天發現三個新缺口。第一：/series/ 和 /tags/ 頁面的 `SiteNavigationElement` Schema 還沒有把這兩個新頁面收進去。Header 導覽現在有「探索」連結指向它們，但 Googlebot 的語意層還不知道這兩個頁面是「導覽入口」。

**Iris：** Alex 說的 `SiteNavigationElement` 問題，我在資訊架構層也看到相同的問題。我們花了時間做 /series/ 和 /tags/ 的頁面，但如果 Schema 不收錄，Google 的理解還停在舊的導覽結構，新頁面的 SEO 效益會延遲。

**Alex：** Iris 說得對，而且這個修正成本很低——就是在現有的 `SiteNavigationElement` 陣列加兩個 `ListItem`，大概五分鐘。第二個缺口：/archives/ 頁面有文章列表但沒有 `CollectionPage` Schema。第三個：文章頁的 `article:author` meta tag 是 Open Graph 的作者姓名字串，應該指向 URL（如 `https://eandev.com/about/`）——這讓 Facebook 和 LinkedIn 在解析時無法建立作者 Entity 關聯。

**Mia：** Alex 說的 `article:author` 指向 URL，這跟社群分享有直接關係。LinkedIn 抓取文章時，如果 `article:author` 有 URL，有機會在分享卡片顯示作者 profile 連結。對 Newsletter 啟動前的品牌建立有幫助。

**Chen：** 我替 Alex 做個優先序判斷：`SiteNavigationElement` 更新（五分鐘，零風險）→ `article:author` URL（十分鐘，社群分享加分）→ `/archives/` CollectionPage（十五分鐘，SEO 語意補全）。這三件事都是低工作量、高語意價值，打包一次做完是最有效率的。

---

### 議題四：內容可發現性——空分類殼與系列卡片描述

**Iris：** 今天有件事讓我擔心。/categories/reading/ 有 0 篇文章，/categories/growth/ 有 1 篇。這兩個分類在首頁的 CategoryGrid 裡有連結、有標題、有按鈕，讀者點進去看到空空的或幾乎空的頁面，會很困惑。

**Kai：** Iris 說的「空殼」我非常有感。我走了一遍：從首頁 CategoryGrid 點「閱讀」，進去看到沒有文章，然後就不知道去哪。這是一個負面的第一印象時刻，比沒有這個分類入口更差。

**Sam：** Kai 說的「比沒有還差」我想稍微緩一下。分類存在、但暫時沒文章，是部落格成長的正常狀態。問題不是刪掉它，而是空態頁的體驗設計。我記得做過 `EpicLayout` 的空態引導，但那是技術文章分類——`reading` 和 `growth` 的空態是不是也需要類似處理？

**Iris：** Sam 的觀察提醒了我——`EpicLayout.astro` 的空態引導確實只對「有文章的分類」有效，空分類走的是不同的 layout 路徑，可能根本沒有空態設計。要查一下實際 render 出來是什麼。

**Jay：** 從台灣讀者習慣來說，`reading` 和 `growth` 這兩個英文分類名稱本身就是一個問題。技術讀者搜尋的是「Docker 教學」，不是「reading」。如果這兩個分類暫時沒有文章，倒不如先隱藏，等累積到 3–5 篇再開放。

**Kai：** 還有一個跟系列卡片相關的問題：/series/ 的每個系列卡片，我點進去之前完全不知道這個系列在講什麼。「Build Automated Deploy」是英文，沒有中文副標、沒有一句話描述。對第一次訪問的 .NET 工程師來說，他不知道要不要點進去。

**Iris：** Kai 說的系列卡片描述問題，對我來說是資訊架構的「第一層溝通失敗」。系列名稱是識別符，不是說明。說明應該是「這個系列教你用 GitHub Actions 把 ASP.NET Core 自動部署到 Azure」，一句話告訴讀者投資這個系列的回報是什麼。

**Sam：** Iris 說的這句描述，其實已經有寫——在 series frontmatter 的 `description` 欄位裡。問題是系列卡片元件沒有把它 render 出來。這是展示層的缺失，不是內容缺失。修起來快。

---

### 議題五：Newsletter——等多久算等太久？

**Chen：** 我想把 Newsletter 的討論放在最後，因為前面四個議題都有「立竿見影」的快速修法，但這個議題的長期複利效果是最高的。今天確認了什麼都沒有動——沒有平台、沒有表單、沒有第一封信。每晚一個月，就是少了一個月的名單累積。

**Jay：** Chen 說的「少了一個月的名單」，讓我換個方式量化一下。假設一個月有 100 個獨立訪客讀了文章、覺得有用，但沒有任何訂閱機制，這 100 人裡有 3–5 個本來會訂閱。兩年等於失去 60–100 個高意願讀者，而且是永遠找不回來的那種。

**Sam：** Jay 的算法我理解，但我要說一個很現實的問題：Newsletter 是要有人**寫**的。現在的創作節奏已經在拉，如果再加上「每個月要發一封信」的心理壓力，可能導致部落格文章的更新頻率下降。先有收信名單、再決定發信頻率，是比較合理的路徑。

**Mia：** Sam 說的「先有名單、再決定頻率」正是我想說的。Newsletter 啟動不等於要馬上發信。第一步只是：**在某個地方放一個 Email 輸入框**，開始收地址。Brevo 免費方案可以到 300 封/天，沒有月費，今天就可以做。

**Kai：** Mia 說的「只是一個輸入框」降低了我的預期門檻。但我想確認一件事：這個輸入框要放在哪裡？如果只有首頁才有，Google 搜尋進來的文章讀者永遠看不到——這跟議題一的 FollowCTA 問題是同一個根本問題。

**Chen：** Kai 和 Mia 的對話讓我看到最小可行路徑：一個 Brevo 嵌入式表單，放在文章底部 FollowCTA 旁邊（呼應議題一的結論），每篇文章都看得到。不需要專屬頁面、不需要第一封信、不需要月計畫——就是一個框，開始收地址。這是三年後諮詢服務受眾的第一塊磚。

**Alex：** 補一個 SEO 角度讓 Chen 的論點更完整：Email 名單跟 SEO 的交集是「回訪行為」。Google 會觀察讀者是否回頭找同一個網站。有 Newsletter 推播新文章，老讀者回來的機率高很多，這個回訪信號對 EEAT 有正向加分。

**Jay：** 我還想補一個 GitHub Discussions 的替代方案作為中間路徑。每次發文在 Discussions 發一則通知，讀者可以訂閱。台灣技術社群用 GitHub 的比例遠高於用 Email 訂閱的，這個方案的入門門檻可能更低。

**Mia：** Jay 的 GitHub Discussions 方案有趣，但有一個關鍵差異——Email 名單你擁有，GitHub Discussions 的訂閱者是 GitHub 擁有的。換平台或帳號出問題，觸及就沒了。Jay 說的可以做，但不能取代 Email 收集。

**Sam：** 好，我覺得這個議題到了一個可以收斂的地方。最小行動：找到 Brevo 或類似服務、生成嵌入表單代碼、放進文章頁 FollowCTA 區域。發信的頻率問題，等名單達到 50 人再決定。現在的目標是「開始收地址」，不是「開始寫信」。

---

## 本次行動清單

（同步更新至 action-items.md）

### 新增高優先
- **H5** · 文章頁加精簡 FollowCTA（RSS 訂閱 + 預留 Email 表單位置）
- **H6** · EnhancedAnalytics listener 洩漏修復 + 移除 console.log

### 新增中優先
- **M6** · SiteNavigationElement Schema 補上 /series/ 和 /tags/
- **M7** · /archives/ 補 CollectionPage Schema
- **M8** · 系列卡片加描述文字（render `description` 欄位）
- **M9** · 空分類殼空態體驗改善（reading、growth）

### 新增低優先
- **L6** · logo 改 WebP + `fetchpriority="high"`
- **L7** · giscus.app preconnect 補齊
- **L8** · About 頁加「下一步」CTA
- **L9** · `article:author` 改指向 URL

### 已完成（本次確認）
- ✅ H2 · Header 加「探索」下拉
- ✅ H3 · FollowCTA 調整（RSS 升主、Facebook 降次）
- ✅ H4 · 首頁 Author sameAs 補齊
- ✅ M2 · Giscus 延遲載入（CLS 改善）
- ✅ M3 · EnhancedAnalytics requestIdleCallback（TBT 改善）
