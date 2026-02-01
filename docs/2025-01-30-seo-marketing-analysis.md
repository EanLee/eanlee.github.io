# SEO 與行銷策略分析報告

## 分析日期
2025-01-30

---

## 1. SEO 優化分析

### ✅ 已做得很好的部分

#### 技術 SEO 基礎設施
- ✅ **Sitemap 實作完善**: 使用 @astrojs/sitemap 自動生成,包含完整的頁面索引
- ✅ **Robots.txt 正確配置**: 允許所有爬蟲並指向 sitemap
- ✅ **Google AdSense 已整合**: ads.txt 檔案正確配置 (pub-7903108559996033)
- ✅ **Canonical URL 實作**: BaseHead.astro 中正確設定 canonical 標籤
- ✅ **延遲載入優化**: AdSense 和 Google Analytics 都採用延遲載入策略
- ✅ **網路預連線**: 使用 preconnect 和 dns-prefetch 優化外部資源載入

#### Meta Tags 實作
- ✅ **基礎 Meta Tags 完整**: title, description, keywords 都有實作
- ✅ **Open Graph 標籤**: 支援 Facebook 社交分享
- ✅ **Twitter Cards**: 支援 Twitter 分享預覽
- ✅ **響應式設計**: viewport meta tag 正確設定

#### URL 結構
- ✅ **清晰的 URL 結構**: `/post/software/`, `/series/`, `/tags/`, `/categories/`
- ✅ **大量 301 重定向**: 妥善處理舊 URL 結構遷移（40+ 重定向）

---

### ⚠️ 需要改進的關鍵問題

#### 🔴 問題 1: 結構化資料 (Schema.org) 嚴重不足

**現狀**:
- BlogPost.astro 雖有 `itemscope` 和 `itemtype`,但實作不完整
- 缺少關鍵的結構化資料屬性
- 無法在搜尋結果中顯示豐富摘要

**影響**:
- 無法顯示 Rich Snippets（作者、發布日期、評分）
- 錯失 15-30% 的 CTR 提升機會
- 搜尋排名可能受影響

**建議實作**:

在 `BlogPost.astro` 的 `<head>` 區塊加入：

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "image": new URL(displayImage || '/blog-placeholder-1.jpg', Astro.site).href,
  "datePublished": date,
  "dateModified": lastmod || date,
  "author": {
    "@type": "Person",
    "name": "Ean Lee",
    "url": "https://eandev.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "EanDev",
    "logo": {
      "@type": "ImageObject",
      "url": new URL('/favicon.ico', Astro.site).href
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": Astro.url.href
  },
  "keywords": keywords?.join(', '),
  "articleSection": categories?.join(', '),
  "wordCount": entry.body.split(/\s+/).length,
  "inLanguage": "zh-TW"
})} />
```

**預期效果**:
- 2-4 週內開始顯示豐富摘要
- CTR 提升 15-30%
- 搜尋排名提升

---

#### 🔴 問題 2: 圖片 SEO 優化不足

**問題**:
1. 封面圖片缺少 `alt` 屬性的內容 SEO
2. 圖片檔名可能不具描述性
3. 缺少圖片的結構化資料
4. 沒有 width/height 導致 CLS

**影響**:
- 圖片搜尋流量損失
- Core Web Vitals（CLS）分數受影響
- 可訪問性問題

**建議修正**:

在 `BlogPost.astro` 第 56-60 行：
```astro
{displayImage && (
  <img
    src={displayImage}
    alt={`${title} - ${description || '文章封面圖片'}`}
    width="1200"
    height="630"
    class="hero-image-bg"
    loading="eager"
  />
)}
```

在 `LatestPosts.astro` 中：
```astro
<img
  src={coverImage}
  alt={`${post.data.title} - ${post.data.description || '文章封面'}`}
  width="800"
  height="600"
  loading="lazy"
/>
```

---

#### 🔴 問題 3: 內部連結結構待加強

**問題**:
- 文章間缺少相關文章推薦
- 麵包屑導航缺失
- 系列文章導航雖有實作,但可以更明顯

**影響**:
- 內部連結權重分散不均
- 用戶難以發現相關內容
- 爬蟲難以理解網站結構

**建議實作**:

**A. 麵包屑導航組件** (`Breadcrumbs.astro`):
```astro
<nav aria-label="Breadcrumb" class="breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">首頁</span>
      </a>
      <meta itemprop="position" content="1" />
    </li>
    {epic && (
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href={`/${epic}/`}>
          <span itemprop="name">{epicNames[epic]}</span>
        </a>
        <meta itemprop="position" content="2" />
      </li>
    )}
    {series && (
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href={`/series/${series}/`}>
          <span itemprop="name">{series}</span>
        </a>
        <meta itemprop="position" content="3" />
      </li>
    )}
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">{title}</span>
      <meta itemprop="position" content="4" />
    </li>
  </ol>
</nav>
```

**B. 相關文章推薦** (`RelatedPosts.astro`):
```astro
---
// 根據標籤相似度找出相關文章
const relatedPosts = allPosts
  .filter(p => p.slug !== currentSlug)
  .map(p => ({
    ...p,
    score: p.data.tags?.filter(t => currentTags?.includes(t)).length || 0
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
---

{relatedPosts.length > 0 && (
  <section class="related-posts">
    <h2>相關文章</h2>
    <div class="related-grid">
      {relatedPosts.map(post => (
        <article>
          <a href={`/post/${post.slug}/`}>
            <h3>{post.data.title}</h3>
            <p>{post.data.description}</p>
          </a>
        </article>
      ))}
    </div>
  </section>
)}
```

---

#### 🟡 問題 4: Meta Description 品質不一

**問題**:
- 部分文章的 description 可能過短或過長
- 沒有限制 description 長度在 150-160 字元

**影響**:
- 搜尋結果顯示不完整或被截斷
- CTR 降低

**建議**:
```typescript
// 在 BaseHead.astro 中加入
const optimizedDescription = description
  ? (description.length > 160
      ? description.substring(0, 157) + '...'
      : description.length < 50
        ? description + ' - 伊恩的開發狂想，分享軟體開發與管理經驗'
        : description)
  : '伊恩的開發狂想 - 分享軟體開發、架構設計、團隊管理的實戰經驗與心得';
```

---

#### 🟡 問題 5: Sitemap 缺少 lastmod

**問題**:
- Sitemap 沒有包含 `<lastmod>` 標籤
- 無法告訴 Google 內容更新時間

**影響**:
- Google 無法優先爬取更新的內容
- 內容更新不易被發現

**建議**:
在 `astro.config.mjs` 中配置：
```javascript
sitemap({
  filter: (page) => !page.includes('/tags/') && !page.includes('/categories/'),
  customPages: [
    'https://eandev.com/software/',
    'https://eandev.com/management/',
    'https://eandev.com/reading/',
    'https://eandev.com/growth/'
  ],
  serialize(item) {
    // 可以從文章 frontmatter 讀取 lastmod
    return {
      ...item,
      changefreq: 'weekly',
      priority: item.url.includes('/post/') ? 0.9 : 0.7
    };
  }
})
```

---

## 2. 內容行銷策略

### ✅ 現有優勢

- ✅ **內容聚焦**: 軟體開發、DevOps、架構等技術主題明確
- ✅ **系列文章架構**: 有完整的系列文章組織
- ✅ **中文技術內容**: 在繁體中文技術社群有競爭優勢
- ✅ **豐富的文章數量**: 約 70+ 篇技術文章
- ✅ **定期更新**: 最新文章 2025-01-30

---

### ⚠️ 需要加強的部分

#### 🔴 問題 6: 關鍵字策略不明確

**建議行動**:

**1. 建立關鍵字地圖**
```markdown
# 關鍵字地圖範例

## 主要關鍵字 (高搜尋量)
- Docker 教學
- EF Core 使用
- CI/CD 實作
- .NET Core 開發

## 次要關鍵字 (中搜尋量)
- Docker Compose 設定
- Entity Framework 查詢優化
- GitHub Actions 自動化
- ASP.NET Core JWT 認證

## 長尾關鍵字 (低競爭)
- Docker PostgreSQL 初始化腳本
- EF Core Include 效能優化
- Jenkins Pipeline 部署到 AWS
- .NET 6 最小 API 實作
```

**2. 關鍵字密度優化**
- 在標題 H1 中包含主關鍵字
- 在前 100 字中自然使用關鍵字
- 在 H2 小標中適當重複關鍵字變體
- 目標密度: 1-2%（自然出現）

**3. 競爭對手分析**
- 使用 Ahrefs/SEMrush 分析同領域部落格
- 找出內容缺口 (Content Gap)
- 針對低競爭、高搜尋量關鍵字創作內容

**建議工具**:
- Google Keyword Planner（免費）
- Ubersuggest（免費版）
- Answer The Public（找問題型關鍵字）

---

#### 🟡 問題 7: 內容更新頻率與深度

**建議策略**:

**1. 內容更新計畫**
```markdown
## 季度審查計畫

### Q1 (1-3月)
- [ ] 審查所有 Docker 相關文章
- [ ] 更新過時的套件版本
- [ ] 加入新的最佳實踐

### Q2 (4-6月)
- [ ] 審查 .NET 相關文章
- [ ] 更新到最新 .NET 版本

### Q3 (7-9月)
- [ ] 審查 CI/CD 文章
- [ ] 加入新工具介紹

### Q4 (10-12月)
- [ ] 年度回顧
- [ ] 規劃下一年主題
```

**2. 內容深度提升檢查清單**
```markdown
每篇文章應包含:
- [ ] 字數: 1500-2500 字
- [ ] 程式碼範例: 至少 3 個
- [ ] 截圖或圖表: 至少 5 張
- [ ] H2 標題: 5-7 個
- [ ] 實際案例: 至少 1 個
- [ ] 常見問題解答: 2-3 個
- [ ] 延伸閱讀: 3-5 個連結
```

**3. 內容形式多樣化**
- 加入資訊圖表 (Infographics)
- 考慮嵌入 YouTube 影片（如果有）
- 製作可下載的 PDF 速查表
- 加入互動式程式碼範例（CodePen/JSFiddle）

---

#### 🟡 問題 8: 內容 SEO 最佳化流程

**建議**: 每篇新文章發布前檢查清單

```markdown
## SEO 發布檢查清單

### 標題與描述
- [ ] H1 標題包含主關鍵字且少於 60 字元
- [ ] Meta Description 150-160 字元,包含 CTA
- [ ] URL slug 簡短且包含關鍵字（英文）

### 圖片優化
- [ ] 至少 3 張圖片,都有描述性 alt 文字
- [ ] 圖片檔名包含關鍵字（如 docker-compose-example.png）
- [ ] 圖片壓縮至 100KB 以下
- [ ] 封面圖尺寸為 1200x630（Open Graph 標準）

### 內容結構
- [ ] 5-7 個 H2 標題,至少 2 個包含關鍵字變體
- [ ] 字數超過 1000 字
- [ ] 包含結論段落和 CTA
- [ ] 前 100 字包含主關鍵字

### 連結優化
- [ ] 內部連結至少 3 個（指向相關文章）
- [ ] 外部連結至少 2 個（權威來源）
- [ ] 所有連結文字具描述性（避免「點此」）

### Frontmatter 設定
- [ ] 設定 title
- [ ] 設定 description (50-160 字)
- [ ] 設定 keywords (5-8 個)
- [ ] 設定 tags (3-5 個)
- [ ] 設定 categories
- [ ] 設定 coverImage
- [ ] 設定 date
- [ ] 如有更新,設定 lastmod

### 結構化資料
- [ ] 確認 JSON-LD 正確生成
- [ ] 使用 Google Rich Results Test 驗證
```

---

## 3. 用戶獲取與留存策略

### ⚠️ 主要問題

#### 🔴 問題 9: 缺少明確的 CTA (Call-to-Action)

**現狀**:
- 文章底部有社交分享按鈕（良好）
- 但缺少訂閱、追蹤等轉換機制

**建議實作**:

**A. Email 訂閱表單** (`NewsletterSignup.astro`):
```astro
<div class="newsletter-box">
  <h3>📬 訂閱技術週報</h3>
  <p>每週收到最新的軟體開發文章、架構設計心得與實戰經驗</p>
  <form
    action="https://buttondown.email/api/emails/embed-subscribe/eandev"
    method="post"
    class="newsletter-form"
  >
    <input
      type="email"
      name="email"
      placeholder="your@email.com"
      required
      aria-label="Email 地址"
    />
    <button type="submit">免費訂閱</button>
  </form>
  <small>訂閱即表示同意接收技術文章更新，隨時可取消訂閱</small>
</div>
```

**推薦 Email 服務**:
- **Buttondown** - 免費版支援 1000 訂閱者，Markdown 友善
- **ConvertKit** - 適合技術部落格，免費版 1000 訂閱者
- **Substack** - 內建讀者管理和付費訂閱

**B. RSS Feed 強化**:
```astro
<!-- 在 Header.astro 加入 RSS 圖示 -->
<a href="/rss.xml" class="rss-link" aria-label="訂閱 RSS">
  <svg><!-- RSS 圖標 --></svg>
</a>
```

**C. 社交媒體追蹤**:
```astro
<!-- 在 Footer.astro 或文章底部 -->
<div class="follow-section">
  <h3>追蹤更新</h3>
  <div class="social-links">
    <a href="https://github.com/eanlee" class="social-btn github">
      GitHub
    </a>
    <a href="https://twitter.com/eanlee" class="social-btn twitter">
      Twitter
    </a>
    <a href="https://www.linkedin.com/in/eanlee" class="social-btn linkedin">
      LinkedIn
    </a>
  </div>
</div>
```

---

#### 🟡 問題 10: 缺少互動機制

**建議實作**:

**1. 留言系統 - Giscus** (基於 GitHub Discussions):
```astro
<!-- Comments.astro -->
<script src="https://giscus.app/client.js"
  data-repo="eanlee/eanlee.github.io"
  data-repo-id="YOUR_REPO_ID"
  data-category="Comments"
  data-category-id="YOUR_CATEGORY_ID"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="top"
  data-theme="light"
  data-lang="zh-TW"
  crossorigin="anonymous"
  async>
</script>
```

**優點**:
- 完全免費
- 不需要資料庫
- GitHub 用戶可直接留言
- 支援 Markdown
- 無廣告

**2. 閱讀時間估算**:
```astro
<!-- 在文章開頭顯示 -->
<div class="article-meta">
  <time datetime={date}>{formatDate(date)}</time>
  <span class="separator">•</span>
  <span class="reading-time">
    ⏱️ {readingTime} 分鐘閱讀
  </span>
</div>
```

**3. 文章評分系統**:
```astro
<div class="article-feedback">
  <p>這篇文章對你有幫助嗎？</p>
  <div class="feedback-buttons">
    <button onclick="sendFeedback('helpful')" aria-label="有幫助">
      👍 有幫助
    </button>
    <button onclick="sendFeedback('not-helpful')" aria-label="沒有幫助">
      👎 沒有幫助
    </button>
  </div>
</div>

<script>
function sendFeedback(type) {
  gtag('event', 'article_feedback', {
    feedback_type: type,
    article_path: window.location.pathname
  });
  // 顯示感謝訊息
}
</script>
```

---

#### 🟡 問題 11: 社群經營策略

**內容分發渠道建議**:

**1. 技術社群平台**
| 平台 | 策略 | 頻率 |
|------|------|------|
| **PTT Soft_Job** | 精選文章分享，避免洗版 | 每週 1 篇 |
| **iT邦幫忙** | 同步發布所有文章 | 每篇新文章 |
| **Medium** | 精選長文，建立個人品牌 | 每月 2-3 篇 |
| **Dev.to** | 英文版本（如有） | 選擇性 |

**2. 社交媒體策略**
| 平台 | 內容類型 | 最佳發布時間 |
|------|---------|-------------|
| **Twitter** | 文章摘要 + 連結、技術心得 | 週間 9-10am, 8-9pm |
| **LinkedIn** | 完整技術見解、職涯心得 | 週二、週四 7-8am |
| **Facebook 技術社團** | 參與討論、適時分享 | 根據社團活躍度 |

**3. 建立品牌識別**
- 設計個人 Logo（可用 Canva 或 Figma）
- 統一的視覺風格（配色、字體）
- 建立完整的 About Me 頁面
- 建立個人簡介短文（50 字、150 字、300 字版本）

---

## 4. 分析與追蹤

### ✅ 已實作

- ✅ **Google Analytics 4**: 已正確配置 (G-4HXSCXTZKZ)
- ✅ **延遲載入優化**: 用戶互動後才載入,符合 Core Web Vitals

---

### ⚠️ 需要加強

#### 🔴 問題 12: GA4 事件追蹤不足

**建議實作自訂事件**:

```javascript
// 在 src/components/EnhancedAnalytics.astro
<script is:inline>
// 1. 追蹤社交分享
document.querySelectorAll('[data-social-share]').forEach(button => {
  button.addEventListener('click', (e) => {
    const platform = e.currentTarget.dataset.platform;
    gtag('event', 'share', {
      method: platform,
      content_type: 'article',
      item_id: window.location.pathname
    });
  });
});

// 2. 追蹤外部連結點擊
document.querySelectorAll('a[href^="http"]').forEach(link => {
  if (!link.href.includes(window.location.hostname)) {
    link.addEventListener('click', (e) => {
      gtag('event', 'outbound_click', {
        link_url: e.target.href,
        link_domain: new URL(e.target.href).hostname,
        link_text: e.target.textContent
      });
    });
  }
});

// 3. 追蹤閱讀深度
let scrollDepths = [25, 50, 75, 100];
let tracked = [];
window.addEventListener('scroll', () => {
  const scrollPercent =
    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

  scrollDepths.forEach(depth => {
    if (scrollPercent >= depth && !tracked.includes(depth)) {
      gtag('event', 'scroll_depth', {
        percent_scrolled: depth,
        article_title: document.title
      });
      tracked.push(depth);
    }
  });
});

// 4. 追蹤代碼複製
document.querySelectorAll('.copy-button').forEach(btn => {
  btn.addEventListener('click', () => {
    gtag('event', 'code_copy', {
      language: btn.dataset.language || 'unknown'
    });
  });
});

// 5. 追蹤 TOC 點擊
document.querySelectorAll('.toc a').forEach(link => {
  link.addEventListener('click', (e) => {
    gtag('event', 'toc_navigation', {
      section: e.target.textContent,
      target_id: e.target.href.split('#')[1]
    });
  });
});
</script>
```

---

#### 🟡 問題 13: Google Search Console 未整合

**行動步驟**:

**1. 驗證網站所有權**
```html
<!-- 在 BaseHead.astro 加入 -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

**2. 定期監控指標** (建議每週查看):
- **點擊次數趨勢** - 了解流量變化
- **平均排名位置** - 追蹤 SEO 成效
- **點擊率 (CTR)** - 評估標題和描述吸引力
- **曝光次數** - 了解覆蓋範圍

**3. 提交 Sitemap**:
```
https://eandev.com/sitemap-index.xml
```

**4. 修正索引問題**:
- 檢查「涵蓋範圍」報告
- 修正 404 錯誤
- 改善移動裝置可用性
- 修正結構化資料錯誤

---

#### 🟡 問題 14: 效能監控

**建議實作 Core Web Vitals 追蹤**:

```javascript
// 在 PerformanceMonitor.astro 中加入
import {onCLS, onFID, onLCP, onINP, onFCP, onTTFB} from 'web-vitals';

function sendToAnalytics({name, delta, id, rating}) {
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(name === 'CLS' ? delta * 1000 : delta),
    event_label: id,
    rating: rating, // 'good', 'needs-improvement', 'poor'
    non_interaction: true,
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**目標分數**:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

---

#### 🟢 問題 15: 熱圖與用戶行為分析

**推薦工具: Microsoft Clarity** (完全免費):

**實作**:
```astro
<!-- 在 BaseHead.astro 加入 -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

**優點**:
- 完全免費，無流量限制
- 熱圖 (Heatmaps) - 了解用戶點擊位置
- 會話錄製 (Session Recordings) - 觀看用戶行為
- 無需擔心 GDPR（符合隱私法規）
- 自動過濾機器人流量

---

## 5. 優先行動計畫

### 🔴 高優先級 (本週執行)

**投資**: 5-7 小時
**預期回報**: 2-4 週內自然流量 +15-25%

1. ✅ **加入 JSON-LD 結構化資料** (1-2 小時)
2. ✅ **完善圖片 alt 和尺寸屬性** (30 分鐘)
3. ✅ **提交 Google Search Console** (30 分鐘)
4. ✅ **實作麵包屑導航** (2-3 小時)
5. ✅ **優化 Meta Description** (1 小時)

---

### 🟡 中優先級 (下週執行)

**投資**: 10-15 小時
**預期回報**: 跳出率降低 20-30%，停留時間增加

6. ✅ **加入 Email 訂閱表單** (2-3 小時)
7. ✅ **整合 Giscus 留言系統** (2-3 小時)
8. ✅ **加強 GA4 事件追蹤** (3-4 小時)
9. ✅ **實作相關文章推薦** (4-6 小時)
10. ✅ **整合 Microsoft Clarity** (30 分鐘)

---

### 🟢 低優先級 (持續優化)

**投資**: 持續進行
**預期回報**: 長期品牌建立和流量增長

11. ✅ **建立關鍵字地圖** (2-3 天)
12. ✅ **內容更新計畫** (季度執行)
13. ✅ **社群經營策略** (每週投入)
14. ✅ **定期 Lighthouse 審計** (每月 1 次)

---

## 6. 預期成效時間軸

| 時間軸 | 預期成效 | 關鍵指標 |
|--------|---------|---------|
| **1-2 週** | 搜尋結果開始顯示豐富摘要 | Google Search Console 曝光 +10% |
| **4-6 週** | 自然流量增加 15-25% | GA4 自然搜尋流量 |
| **3 個月** | 關鍵字排名明顯提升 | 5-10 個關鍵字進入前 10 名 |
| **6 個月** | 整體自然流量翻倍 | 月訪客從 X 成長到 2X |
| **1 年** | 建立品牌權威 | Email 訂閱者 500+，社群追蹤 1000+ |

---

## 7. 成功指標 (KPI)

### 流量指標
- 自然搜尋流量 (目標: 每月成長 10%)
- 直接流量 (目標: 每月成長 5%)
- 社交媒體流量 (目標: 每月成長 15%)

### 參與度指標
- 平均停留時間 (目標: > 3 分鐘)
- 跳出率 (目標: < 60%)
- 每次訪問頁數 (目標: > 2 頁)

### 轉換指標
- Email 訂閱率 (目標: 2-3% 的訪客)
- 社交分享次數 (目標: 每篇文章 > 10 次)
- 留言互動 (目標: 每篇文章 > 3 則留言)

### SEO 指標
- Google Search Console 曝光次數 (目標: 每月成長 20%)
- 平均排名 (目標: < 20)
- 點擊率 CTR (目標: > 3%)

---

這份 SEO 與行銷策略分析報告提供了全面的改善方向，建議按照優先級逐步執行，並持續追蹤成效，根據數據調整策略。
