# Git Hooks - 自動更新 Markdown lastmod

這個 Git hook 會在每次 commit 前自動檢查並更新有異動的 Markdown 檔案的 `lastmod` front matter。

## 功能特色

- ✅ 自動檢測 staged 的 .md 檔案
- ✅ 智能更新或新增 `lastmod` 欄位
- ✅ 使用台北時區的 ISO 8601 格式時間戳
- ✅ 保持 front matter 格式完整性
- ✅ 自動重新 stage 更新後的檔案

## 安裝方式

### 方法一：使用安裝腳本 (推薦)

```powershell
# 在專案根目錄執行
./.githooks/install.ps1
```

### 方法二：手動安裝

1. 複製 hook 檔案到 Git hooks 目錄：
   ```powershell
   Copy-Item .githooks/pre-commit.ps1 .git/hooks/pre-commit
   ```

2. 在 Unix-like 系統上設置執行權限：
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

## 使用範例

### 更新現有 lastmod

```yaml
---
title: 文章標題
date: 2023-01-01T10:00:00+08:00
lastmod: 2023-06-01T15:30:00+08:00  # 會自動更新為當前時間
---
```

### 新增 lastmod 欄位

```yaml
---
title: 文章標題
date: 2023-01-01T10:00:00+08:00
# lastmod 會自動新增到 front matter 末尾
---
```

## 工作流程

1. 修改任何 `.md` 檔案
2. 執行 `git add .`
3. 執行 `git commit -m "your message"`
4. Hook 自動執行：
   - 檢查 staged 的 .md 檔案
   - 更新或新增 `lastmod` 欄位
   - 重新 stage 更新後的檔案
   - 繼續完成 commit

## 測試驗證

```powershell
# 1. 修改一個 .md 檔案
echo "# 測試內容" >> test.md

# 2. 加入到 staging area
git add test.md

# 3. 提交並觀察 lastmod 更新
git commit -m "test: 測試 lastmod 自動更新"
```

## 故障排除

### Hook 沒有執行
- 檢查 `.git/hooks/pre-commit` 檔案是否存在
- 確認檔案有執行權限
- 檢查 PowerShell 是否可用

### lastmod 沒有更新
- 確認檔案有 front matter（以 `---` 開始和結束）
- 檢查檔案編碼是否為 UTF-8
- 查看 hook 執行時的輸出訊息

### 時區問題
- Hook 使用系統時區，確保系統時區設置正確
- 可以修改 `pre-commit.ps1` 中的時間格式

## 自定義設置

### 修改時間格式
在 `pre-commit.ps1` 中修改這一行：
```powershell
$currentTimestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
```

### 排除特定檔案
在 PowerShell 腳本中加入過濾條件：
```powershell
$modifiedMdFiles = git diff --cached --name-only --diff-filter=AM | 
    Where-Object { $_ -match '\.md$' -and $_ -notmatch 'README\.md' }
```

## 卸載

```powershell
# 刪除 hook 檔案
Remove-Item .git/hooks/pre-commit -Force
```

## 注意事項

- Hook 只處理已 staged 的檔案
- 只更新有 front matter 的 Markdown 檔案
- 更新後會自動重新 stage 檔案
- 建議在團隊使用前先測試確認
