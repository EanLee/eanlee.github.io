# Obsidian to Astro 自動轉換系統 - 設置指南

## 📖 目錄

- [概述](#概述)
- [系統架構](#系統架構)
- [目錄結構](#目錄結構)
- [相關檔案說明](#相關檔案說明)
- [初始設置步驟](#初始設置步驟)
- [日常使用流程](#日常使用流程)
- [轉換規則](#轉換規則)
- [注意事項](#注意事項)
- [故障排除](#故障排除)
- [進階功能](#進階功能)

---

## 概述

本系統實現了從 Obsidian Markdown 格式到 Astro Blog 格式的自動轉換流程。

### 核心特點

- ✅ **單分支設計** - 所有檔案在 main 分支，避免分支混淆
- ✅ **自動化轉換** - 推送即觸發 GitHub Action 自動轉換
- ✅ **格式轉換** - Wiki Links、圖片路徑、高亮等自動轉換
- ✅ **SEO 優化** - 自動補充 slug、lastmod 等欄位
- ✅ **Leaf Bundle** - 每篇文章獨立目錄，圖片集中管理

### 工作流程

```
┌─────────────────┐
│ Obsidian 編輯   │
│ publish/        │
└────────┬────────┘
         │
         │ git push
         ↓
┌─────────────────┐
│ GitHub Action   │
│ 自動觸發        │
└────────┬────────┘
         │
         ├─→ 轉換格式 (converter.ts)
         ├─→ 建置 Astro
         └─→ 部署到 Pages

         ↓
┌─────────────────┐
│ 網站自動更新    │
│ eandev.com      │
└─────────────────┘
```

---

## 系統架構

### 檔案分離原則

| 目錄 | 用途 | 是否提交到 Git | 編輯方式 |
|------|------|----------------|----------|
| `obsidian-vault/` | Obsidian 原始格式 | ✅ 是 | 手動編輯 |
| `src/content/blog/` | Astro 格式 | ❌ 否 | 自動生成 |

### 轉換流程圖

```
Obsidian 格式                          Astro 格式
=====================================  =====================================
obsidian-vault/                        src/content/blog/
├─ publish/                            ├─ Software/
│  ├─ Software/                        │  ├─ docker-tutorial/
│  │  └─ docker-tutorial.md            │  │  ├─ index.md
│  ├─ growth/                          │  │  └─ images/
│  └─ management/                      │  │     └─ docker-logo.png
├─ draft/                              │  └─ aspnet-guide/
│  └─ work-in-progress.md              │     ├─ index.md
└─ images/                             │     └─ images/
   ├─ docker-logo.png                  ├─ growth/
   └─ aspnet-diagram.png               └─ management/
```

---

## 目錄結構

### 完整目錄樹

```
eanlee.github.io/
│
├─ obsidian-vault/              # Obsidian Vault（你編輯的地方）
│  ├─ publish/                  # 要發布的文章
│  │  ├─ Software/              # 分類：軟體開發
│  │  ├─ growth/                # 分類：成長
│  │  └─ management/            # 分類：管理
│  ├─ draft/                    # 草稿（不會被轉換）
│  └─ images/                   # 共用圖片庫
│
├─ src/content/blog/            # Astro 格式（自動生成，不要手動編輯！）
│  ├─ Software/
│  │  └─ {slug}/
│  │     ├─ index.md
│  │     └─ images/
│  ├─ growth/
│  └─ management/
│
├─ .github/
│  └─ workflows/
│     └─ convert-and-deploy.yml # GitHub Action 工作流程
│
├─ converter.ts                 # TypeScript 轉換工具
├─ .gitignore                   # Git 忽略配置
├─ astro.config.mjs             # Astro 配置
├─ package.json                 # 專案依賴
└─ README.md                    # 專案說明
```

### 目錄說明

#### `obsidian-vault/publish/`
- **用途**：存放要發布的文章
- **結構**：`{分類}/{文章檔名}.md`
- **範例**：`Software/docker-tutorial.md`
- **規則**：
  - 分類名稱使用英文（Software, growth, management）
  - 檔名使用 kebab-case（小寫，單字用 `-` 連接）
  - 使用 `.md` 副檔名

#### `obsidian-vault/draft/`
- **用途**：存放草稿
- **特性**：不會被轉換和發布
- **使用**：文章完成後移到 `publish/`

#### `obsidian-vault/images/`
- **用途**：共用圖片庫
- **特性**：所有文章的圖片都放這裡
- **支援格式**：`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp`

#### `src/content/blog/`
- **用途**：Astro 格式的文章（自動生成）
- **⚠️ 重要**：不要手動編輯此目錄！
- **結構**：`{分類}/{slug}/index.md`
- **管理**：由 GitHub Action 自動管理

---

## 相關檔案說明

### 1. `converter.ts`

**位置**：專案根目錄
**語言**：TypeScript
**用途**：將 Obsidian 格式轉換為 Astro 格式

#### 主要功能

```typescript
// 1. 掃描文章
getAllMarkdownFiles('obsidian-vault/publish')

// 2. 解析 Front Matter
parseFrontMatter(content)

// 3. 提取圖片引用
extractImageReferences(markdown)

// 4. 轉換內容
// - ../../images/pic.png → ./images/pic.png
// - ![[pic.png]] → ![pic](./images/pic.png)
// - [[link]] → [link](../link/)
// - ==text== → <mark>text</mark>

// 5. 複製圖片到文章目錄

// 6. 輸出 Leaf Bundle 格式
```

#### 使用方式

```bash
# 本地測試
ts-node converter.ts

# 在 GitHub Action 中自動執行
```

### 2. `.github/workflows/convert-and-deploy.yml`

**位置**：`.github/workflows/`
**類型**：GitHub Actions Workflow
**用途**：自動轉換、建置、部署

#### 觸發條件

```yaml
# 1. 當推送到 main 分支
# 2. 且修改了以下路徑：
#    - obsidian-vault/publish/**
#    - obsidian-vault/images/**
#    - converter.ts
#    - .github/workflows/convert-and-deploy.yml

# 3. 或手動觸發 (workflow_dispatch)
```

#### 執行步驟

```yaml
1. 📥 檢出代碼
2. 🔧 設定 Node.js 20
3. 📦 安裝 TypeScript 環境
4. 🔄 運行 converter.ts
5. 🔍 驗證轉換結果
6. 🔎 偵測套件管理器 (npm/yarn/pnpm)
7. ⚙️  設定 GitHub Pages
8. 📦 安裝 Astro 依賴
9. 🏗️  建置 Astro 網站
10. 📤 上傳建置產物
11. 🚀 部署到 GitHub Pages
```

### 3. `.gitignore`

**位置**：專案根目錄
**用途**：定義不追蹤的檔案

#### 關鍵配置

```gitignore
# 自動生成的內容（重要！）
src/content/blog/

# 本地測試檔案
convert.js
```

**為什麼要排除 `src/content/blog/`？**

- ✅ 避免手動編輯和自動生成衝突
- ✅ 減少 Git 歷史記錄大小
- ✅ 保持倉庫乾淨，只存放原始檔案

---

## 初始設置步驟

### 前置需求

- ✅ Git 已安裝
- ✅ Node.js 20+ 已安裝
- ✅ 有 GitHub 帳號和倉庫權限

### Step 1: 停止追蹤自動生成的目錄

```bash
# 進入專案目錄
cd eanlee.github.io

# 確認在 main 分支
git checkout main
git pull origin main

# 停止追蹤 src/content/blog/（檔案不會被刪除）
git rm -r --cached src/content/blog/

# 提交變更
git add .gitignore
git commit -m "chore: 停止追蹤自動生成的 blog 目錄"
```

### Step 2: 建立 Obsidian Vault 目錄結構

```bash
# 建立目錄
mkdir -p obsidian-vault/publish/Software
mkdir -p obsidian-vault/publish/growth
mkdir -p obsidian-vault/publish/management
mkdir -p obsidian-vault/draft
mkdir -p obsidian-vault/images

# 驗證目錄結構
tree obsidian-vault -L 2

# 應該看到：
# obsidian-vault/
# ├── publish/
# │   ├── Software/
# │   ├── growth/
# │   └── management/
# ├── draft/
# └── images/
```

### Step 3: 提交轉換工具和 Workflow

```bash
# 檢查新增的檔案
git status

# 應該看到：
# - converter.ts
# - .github/workflows/convert-and-deploy.yml
# - obsidian-vault/ (目錄)

# 提交
git add converter.ts
git add .github/workflows/convert-and-deploy.yml
git add obsidian-vault/
git commit -m "feat: 新增 Obsidian vault 結構與轉換工具"
```

### Step 4: 創建測試文章

```bash
# 創建測試文章
cat > obsidian-vault/publish/Software/test-converter.md << 'EOF'
---
title: 測試轉換器功能
description: 驗證 Obsidian 到 Astro 的轉換是否正常運作
date: 2024-12-16
tags: [Test, Converter, Obsidian, Astro]
categories: [Software]
---

# 測試轉換器

這是一篇測試文章，用來驗證 Obsidian 到 Astro 的轉換功能。

## 圖片測試

下面是一張測試圖片：

![測試圖片](../../images/test-image.png)

## Wiki 連結測試

參考其他文章：[[Docker 教學]]

連結到外部：[[aspnet-guide|ASP.NET 指南]]

## 高亮測試

這是 ==重要的內容== 需要被高亮顯示。

在文章中標記 ==關鍵概念== 很有用。

## 列表測試

### 無序列表

- 項目 1
- 項目 2
  - 子項目 2.1
  - 子項目 2.2
- 項目 3

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 代碼測試

### Bash

```bash
# 運行 Docker 容器
docker run -d --name nginx-test nginx:latest
docker ps
```

### JavaScript

```javascript
// 簡單的 Hello World
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```

## 引用測試

> 這是一段引用文字。
>
> 可以包含多個段落。

## 表格測試

| 功能 | Obsidian | Astro |
|------|----------|-------|
| Wiki Links | `[[link]]` | `[link](url)` |
| 圖片 | `![[img.png]]` | `![](./images/img.png)` |
| 高亮 | `==text==` | `<mark>text</mark>` |

## 結論

如果你看到這篇文章正確顯示，代表轉換成功了！🎉

### 轉換驗證清單

- [ ] 圖片正確顯示
- [ ] Wiki 連結已轉換為標準連結
- [ ] 高亮標記正確轉換
- [ ] 代碼區塊正確顯示
- [ ] Front Matter 包含所有必要欄位
EOF

echo "✅ 測試文章已創建"
```

### Step 5: 添加測試圖片

```bash
# 方法 1：複製現有圖片
cp /path/to/your/image.png obsidian-vault/images/test-image.png

# 方法 2：如果沒有圖片，創建佔位提示
cat > obsidian-vault/images/README.md << 'EOF'
# 圖片目錄

請將文章中使用的圖片放在這個目錄。

## 支援的格式

- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)
- BMP (.bmp)

## 注意事項

- 所有文章共用這個圖片庫
- 建議使用描述性的檔名
- 圖片會自動複製到各文章的 images/ 子目錄
EOF

echo "⚠️  請手動添加一張圖片到 obsidian-vault/images/test-image.png"
```

### Step 6: 本地測試轉換

```bash
# 安裝 TypeScript 和 ts-node（如果還沒安裝）
npm install -g typescript ts-node @types/node

# 運行轉換工具
ts-node converter.ts

# 預期輸出：
# ╔════════════════════════════════════════════════╗
# ║  Obsidian to Astro Converter                  ║
# ╚════════════════════════════════════════════════╝
#
# 🗑️  清空目標目錄: src/content/blog
#
# 📚 找到 1 篇文章
#
# 📄 處理: obsidian-vault/publish/Software/test-converter.md
#    類別: Software
#    Slug: test-converter
#    📷 找到 1 張圖片
#       ✓ test-image.png
#    ✅ 已轉換: src/content/blog/Software/test-converter/index.md
#
# ╔════════════════════════════════════════════════╗
# ║  轉換完成                                      ║
# ╚════════════════════════════════════════════════╝
#
# 總計: 1 篇文章
# 成功: 1 篇
# 失敗: 0 篇
# 分類: Software
#
# ✅ 所有文章轉換成功！
```

### Step 7: 驗證轉換結果

```bash
# 檢查輸出目錄結構
ls -R src/content/blog/

# 應該看到：
# src/content/blog/Software/test-converter/
# ├── index.md
# └── images/
#     └── test-image.png

# 查看轉換後的 Front Matter
head -n 15 src/content/blog/Software/test-converter/index.md

# 應該包含：
# ---
# title: 測試轉換器功能
# description: 驗證 Obsidian 到 Astro 的轉換是否正常運作
# date: 2024-12-16
# tags:
#   - Test
#   - Converter
#   - Obsidian
#   - Astro
# categories:
#   - Software
# slug: test-converter
# lastmod: 2024-12-16  (自動添加)
# ---

# 檢查圖片路徑轉換
grep "!\[" src/content/blog/Software/test-converter/index.md

# 應該看到：
# ![測試圖片](./images/test-image.png)

# 檢查 Wiki 連結轉換
grep "\[.*\](" src/content/blog/Software/test-converter/index.md | head -5

# 應該看到類似：
# [Docker 教學](../docker-教學/)
# [ASP.NET 指南](../aspnet-guide/)

# 檢查高亮轉換
grep "<mark>" src/content/blog/Software/test-converter/index.md

# 應該看到：
# 這是 <mark>重要的內容</mark> 需要被高亮顯示。
```

### Step 8: 提交並推送到 GitHub

```bash
# 查看變更狀態
git status

# 應該只看到 obsidian-vault/ 的檔案
# src/content/blog/ 不應該出現（已被 .gitignore 排除）

# 提交 Obsidian 原始檔案
git add obsidian-vault/
git commit -m "feat: 新增測試文章驗證轉換功能"

# 推送到 GitHub
git push origin main
```

### Step 9: 觀察 GitHub Action 執行

```bash
# 1. 開啟瀏覽器，前往 GitHub 倉庫
# https://github.com/EanLee/eanlee.github.io

# 2. 點擊 "Actions" 頁籤

# 3. 找到 "轉換並部署" workflow

# 4. 點擊最新的執行記錄

# 5. 查看各步驟的執行狀況：
#    ✅ 轉換 Obsidian 文章為 Astro 格式
#    ✅ 驗證轉換結果
#    ✅ 建置 Astro 網站
#    ✅ 部署到 GitHub Pages

# 6. 如果看到綠色勾勾，表示成功！
```

### Step 10: 驗證部署結果

```bash
# 等待幾分鐘後，訪問你的網站
# https://eandev.com/post/software/test-converter/

# 應該能看到：
# ✅ 測試文章正確顯示
# ✅ 圖片正確載入
# ✅ 連結正常運作
# ✅ 高亮效果正確
```

---

## 日常使用流程

### 📝 撰寫新文章

#### 1. 在 Obsidian 中創建文章

```markdown
在 Obsidian 中操作：

1. 在 obsidian-vault/draft/ 中開始寫作
2. 撰寫過程中需要的圖片放到 obsidian-vault/images/
3. 使用 ../../images/圖片名稱.png 引用圖片
4. 文章完成後，移動到 obsidian-vault/publish/{分類}/
```

#### 2. Front Matter 範本

```markdown
---
title: 文章標題（必填）
description: 文章描述，會顯示在搜尋結果（建議 150-160 字）
date: 2024-12-16（必填，發布日期）
tags: [Docker, Container, DevOps]
categories: [Software]
keywords: [Docker, 容器化, 部署]
slug: docker-tutorial（可選，預設使用檔名）
---

文章內容...
```

#### 3. 圖片引用格式

```markdown
<!-- 標準 Markdown -->
![圖片說明](../../images/圖片檔名.png)

<!-- Obsidian Wiki 格式（也支援） -->
![[圖片檔名.png]]
```

#### 4. 文章間連結

```markdown
<!-- Obsidian Wiki Links -->
[[另一篇文章]]
[[文章標題|顯示文字]]

<!-- 會自動轉換為 -->
[另一篇文章](../另一篇文章/)
[顯示文字](../文章標題/)
```

### 🚀 發布文章

```bash
# 1. 確認文章和圖片都已準備好
ls obsidian-vault/publish/Software/your-article.md
ls obsidian-vault/images/your-image.png

# 2. 提交到 Git
git add obsidian-vault/
git status  # 確認檔案正確

# 3. 提交（使用 conventional commit 格式）
git commit -m "feat: 新增 Docker 教學文章"

# 4. 推送到 GitHub
git push origin main

# 5. 自動執行（無需手動操作）
# ✅ GitHub Action 自動轉換
# ✅ 自動建置 Astro
# ✅ 自動部署到網站

# 6. 幾分鐘後，文章上線！
```

### ✏️ 更新現有文章

```bash
# 1. 在 Obsidian 中編輯文章
# 編輯 obsidian-vault/publish/Software/docker-tutorial.md

# 2. 如果更新圖片
# 替換或新增 obsidian-vault/images/ 中的圖片

# 3. 提交變更
git add obsidian-vault/
git commit -m "docs: 更新 Docker 教學內容"
git push origin main

# 4. 自動重新轉換和部署
# lastmod 欄位會自動更新為今天的日期
```

### 🗑️ 刪除文章

```bash
# 1. 從 Obsidian vault 中刪除文章
rm obsidian-vault/publish/Software/old-article.md

# 2. 提交刪除
git add obsidian-vault/
git commit -m "chore: 移除過時的文章"
git push origin main

# 3. 重新轉換時，舊文章會被清除
# （因為 converter.ts 會先清空 src/content/blog/）
```

---

## 轉換規則

### Front Matter 轉換

| Obsidian 欄位 | Astro 欄位 | 說明 |
|--------------|-----------|------|
| `title` | `title` | 直接複製 |
| `date` | `date` | 直接複製 |
| `tags: [a, b]` | `tags:`<br>`  - a`<br>`  - b` | 轉為多行格式 |
| - | `slug` | 自動補充（使用檔名） |
| - | `lastmod` | 自動補充（當前日期） |

### 內容轉換規則

#### 1. 圖片路徑

| Obsidian | Astro | 說明 |
|----------|-------|------|
| `![](../../images/pic.png)` | `![](./images/pic.png)` | 相對路徑調整 |
| `![[pic.png]]` | `![pic](./images/pic.png)` | Wiki 轉標準 + 添加 alt |
| `![[folder/pic.png]]` | `![pic](./images/pic.png)` | 取檔名 |

#### 2. 內部連結

| Obsidian | Astro | 說明 |
|----------|-------|------|
| `[[article]]` | `[article](../article/)` | 基本轉換 |
| `[[article\|text]]` | `[text](../article/)` | 保留顯示文字 |
| `[[Article Name]]` | `[Article Name](../article-name/)` | 轉 kebab-case |
| `[[article.md]]` | `[article](../article/)` | 移除 .md |

#### 3. 格式標記

| Obsidian | Astro | 說明 |
|----------|-------|------|
| `==highlight==` | `<mark>highlight</mark>` | 高亮轉 HTML |

#### 4. 保持不變

- ✅ 標題 (`#`, `##`, `###`)
- ✅ 列表 (`-`, `1.`)
- ✅ 代碼區塊 (` ``` `)
- ✅ 引用 (`>`)
- ✅ 表格 (`|`)
- ✅ 粗體、斜體 (`**`, `*`)

### 目錄結構轉換

```
Obsidian                          Astro
================================  ================================
publish/Software/article.md       src/content/blog/Software/article/
                                  ├─ index.md
                                  └─ images/
                                     └─ (文章使用的圖片)

images/pic1.png                   (複製到文章目錄)
images/pic2.png                   (複製到文章目錄)
```

---

## 注意事項

### ⚠️ 重要提醒

#### 1. 不要手動編輯 `src/content/blog/`

```bash
# ❌ 錯誤做法
vim src/content/blog/Software/article/index.md
# 變更會在下次轉換時被覆蓋！

# ✅ 正確做法
vim obsidian-vault/publish/Software/article.md
git push
# 讓 GitHub Action 自動轉換
```

#### 2. 圖片路徑必須正確

```markdown
<!-- ✅ 正確 -->
![Docker Logo](../../images/docker-logo.png)

<!-- ❌ 錯誤 - 少一層 .. -->
![Docker Logo](../images/docker-logo.png)

<!-- ❌ 錯誤 - 多一層 .. -->
![Docker Logo](../../../images/docker-logo.png)

<!-- ❌ 錯誤 - 絕對路徑 -->
![Docker Logo](/images/docker-logo.png)
```

**路徑計算：**
```
從: obsidian-vault/publish/Software/article.md
到: obsidian-vault/images/pic.png

需要:
1. ../ (從 Software/ 往上到 publish/)
2. ../ (從 publish/ 往上到 obsidian-vault/)
3. images/pic.png

結果: ../../images/pic.png
```

#### 3. 圖片檔案必須存在

```bash
# 在 Obsidian 中引用圖片前，確認檔案存在
ls obsidian-vault/images/your-image.png

# 如果不存在，轉換時會警告：
# ⚠️  圖片不存在: your-image.png
```

#### 4. 提交前確認檔案

```bash
# 使用 git status 確認
git status

# ✅ 應該看到
modified:   obsidian-vault/publish/Software/article.md
modified:   obsidian-vault/images/new-image.png

# ❌ 不應該看到
modified:   src/content/blog/...
```

#### 5. Front Matter 格式

```yaml
# ✅ 正確 - 陣列使用多行格式
tags:
  - Docker
  - DevOps

# ✅ 也正確 - 單行陣列
tags: [Docker, DevOps]

# ❌ 錯誤 - 缺少標題
---
date: 2024-12-16
---

# ✅ 正確 - 必須有標題
---
title: 文章標題
date: 2024-12-16
---
```

### 📋 檢查清單

#### 發布前檢查

- [ ] 文章有完整的 Front Matter（title, date）
- [ ] 圖片路徑使用 `../../images/`
- [ ] 所有引用的圖片檔案都存在
- [ ] 文章分類正確（Software/growth/management）
- [ ] 檔名使用 kebab-case（小寫，用 `-` 連接）
- [ ] commit message 使用 conventional commit 格式

#### 推送後檢查

- [ ] GitHub Action 執行成功（綠色勾勾）
- [ ] 網站上文章正確顯示
- [ ] 圖片正確載入
- [ ] 連結正常運作

---

## 故障排除

### 問題 1: GitHub Action 失敗

#### 錯誤：找不到文章

```
⚠️  未找到任何 Markdown 文章
```

**原因：** `obsidian-vault/publish/` 是空的或文章未提交

**解決：**
```bash
# 確認文章存在
ls obsidian-vault/publish/**/*.md

# 確認已提交
git status
git add obsidian-vault/
git commit -m "feat: 新增文章"
git push
```

#### 錯誤：圖片不存在

```
✗ 圖片不存在: docker-logo.png
```

**原因：** 圖片檔案不在 `obsidian-vault/images/`

**解決：**
```bash
# 檢查圖片是否存在
ls obsidian-vault/images/docker-logo.png

# 如果不存在，添加圖片
cp /path/to/image.png obsidian-vault/images/docker-logo.png
git add obsidian-vault/images/
git commit -m "assets: 新增圖片"
git push
```

#### 錯誤：TypeScript 執行失敗

```
ts-node: command not found
```

**原因：** GitHub Action 的 TypeScript 環境未正確安裝

**解決：** 確認 workflow 中有安裝步驟
```yaml
- name: 📦 安裝 TypeScript 環境
  run: |
    npm install -g typescript ts-node @types/node
```

### 問題 2: 本地測試失敗

#### 錯誤：找不到 ts-node

```bash
# 安裝 TypeScript 工具
npm install -g typescript ts-node @types/node

# 驗證安裝
ts-node --version
```

#### 錯誤：模組導入失敗

```typescript
// 如果遇到模組錯誤，確認專案有 @types/node
npm install --save-dev @types/node

// 檢查 tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "moduleResolution": "node"
  }
}
```

### 問題 3: 轉換後格式錯誤

#### 圖片沒有顯示

**檢查：**
```bash
# 1. 檢查原始檔案的路徑
grep "!\[" obsidian-vault/publish/Software/article.md
# 應該是: ../../images/pic.png

# 2. 檢查圖片是否存在
ls obsidian-vault/images/pic.png

# 3. 檢查轉換後的路徑
grep "!\[" src/content/blog/Software/article/index.md
# 應該是: ./images/pic.png

# 4. 檢查圖片是否被複製
ls src/content/blog/Software/article/images/pic.png
```

#### Wiki 連結沒有轉換

**檢查：**
```bash
# 查看原始格式
grep "\[\[" obsidian-vault/publish/Software/article.md

# 查看轉換後格式
grep "\[.*\](" src/content/blog/Software/article/index.md

# 如果沒有轉換，可能是：
# 1. Wiki link 格式不正確
# 2. 包含特殊字元
```

### 問題 4: 部署後網站錯誤

#### 404 錯誤

**原因：** URL 路徑不正確

**檢查：**
```bash
# 確認 slug
cat src/content/blog/Software/article/index.md | grep "slug:"

# URL 應該是
# https://eandev.com/post/software/{slug}/

# 如果是 404，檢查：
# 1. 分類是否正確（Software, growth, management）
# 2. slug 是否符合 URL 規則
```

#### 圖片 404

**檢查：**
```bash
# 1. 確認圖片在文章目錄中
ls src/content/blog/Software/article/images/

# 2. 確認 Astro 配置
# astro.config.mjs 應該正確處理圖片
```

### 問題 5: Git 衝突

#### 誤提交了 src/content/blog/

```bash
# 如果不小心提交了自動生成的內容

# 1. 從 Git 移除（但保留檔案）
git rm -r --cached src/content/blog/

# 2. 確認 .gitignore 正確
cat .gitignore | grep "src/content/blog"

# 3. 提交修正
git commit -m "fix: 移除自動生成的內容"
git push
```

---

## 進階功能

### 自訂轉換邏輯

如果需要自訂轉換規則，編輯 `converter.ts`：

```typescript
// 範例：添加自訂轉換規則

// 在 convertFile() 函數中，轉換內容部分添加：

// 轉換自訂語法: ((footnote)) -> <sup>footnote</sup>
newContent = newContent.replace(
  /\(\(([^)]+)\)\)/g,
  '<sup>$1</sup>'
);

// 轉換引用格式: > [!note] -> <div class="note">
newContent = newContent.replace(
  /^> \[!note\]\s*\n((?:> .*\n)*)/gm,
  (match, content) => {
    const text = content.replace(/^> /gm, '');
    return `<div class="note">\n${text}</div>\n`;
  }
);
```

### 批量更新 lastmod

```bash
# 創建腳本批量更新所有文章的 lastmod
cat > update-lastmod.sh << 'EOF'
#!/bin/bash

# 找到所有文章並更新 lastmod
find obsidian-vault/publish -name "*.md" | while read file; do
  echo "更新: $file"
  # 使用 sed 更新或添加 lastmod
  # (此處需要更複雜的邏輯，建議用 TypeScript 實現)
done
EOF

chmod +x update-lastmod.sh
```

### 增量轉換

如果文章很多，可以實現增量轉換（只轉換變更的文章）：

```typescript
// 在 converter.ts 中添加增量轉換邏輯
// 比較檔案修改時間，只轉換較新的文章

import * as fs from 'fs';

function shouldConvert(sourceFile: string, targetFile: string): boolean {
  if (!fs.existsSync(targetFile)) {
    return true; // 目標不存在，需要轉換
  }

  const sourceTime = fs.statSync(sourceFile).mtime;
  const targetTime = fs.statSync(targetFile).mtime;

  return sourceTime > targetTime; // 來源較新，需要轉換
}
```

### 自動化測試

```bash
# 創建測試腳本
cat > test-converter.sh << 'EOF'
#!/bin/bash

echo "🧪 測試轉換工具..."

# 1. 運行轉換
ts-node converter.ts

# 2. 檢查輸出
if [ ! -d "src/content/blog" ]; then
  echo "❌ 失敗: 輸出目錄不存在"
  exit 1
fi

# 3. 計算文章數
article_count=$(find src/content/blog -name "index.md" | wc -l)
echo "✅ 轉換了 $article_count 篇文章"

# 4. 驗證圖片
image_count=$(find src/content/blog -name "*.png" -o -name "*.jpg" | wc -l)
echo "✅ 複製了 $image_count 張圖片"

echo "🎉 測試完成"
EOF

chmod +x test-converter.sh
./test-converter.sh
```

---

## 總結

### ✅ 優勢

1. **簡單** - 單分支，不用切換
2. **自動化** - 推送即轉換部署
3. **安全** - 原始檔案和生成檔案分離
4. **靈活** - 可自訂轉換規則
5. **SEO友好** - 自動補充必要欄位

### 📚 相關資源

- [Obsidian 官方文檔](https://help.obsidian.md/)
- [Astro 官方文檔](https://docs.astro.build/)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)

### 🆘 需要幫助？

如果遇到問題：

1. 查看 [故障排除](#故障排除) 章節
2. 檢查 GitHub Actions 執行日誌
3. 運行本地測試確認轉換邏輯
4. 檢查 Git 狀態確認檔案正確

---

**最後更新：** 2024-12-16
**版本：** 1.0.0
**維護者：** EanLee
