# Git Hook: Pre-commit (PowerShell 版本)
# 功能：在 commit 之前，自動更新有異動的 .md 檔案的 lastmod front matter

# 取得當前時間戳 (ISO 8601 格式，台北時區)
$currentTimestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"

# 檢查是否有 .md 檔案被修改或新增
$modifiedMdFiles = git diff --cached --name-only --diff-filter=AM | Where-Object { $_ -match '\.md$' }

if (-not $modifiedMdFiles) {
    Write-Host "✅ 沒有 Markdown 檔案異動，跳過 lastmod 更新" -ForegroundColor Green
    exit 0
}

Write-Host "🔍 發現 Markdown 檔案異動，開始更新 lastmod..." -ForegroundColor Yellow

# 處理每個被修改的 .md 檔案
foreach ($file in $modifiedMdFiles) {
    if (Test-Path $file) {
        Write-Host "📝 處理檔案: $file" -ForegroundColor Cyan
        
        try {
            # 讀取檔案內容
            $content = Get-Content $file -Raw -Encoding UTF8
            
            # 除錯：顯示檔案開頭
            $firstLines = ($content -split "`n")[0..5] -join "`n"
            Write-Host "  📋 檔案開頭內容：" -ForegroundColor Magenta
            Write-Host "  $firstLines" -ForegroundColor Gray
            
            # 檢查是否有 front matter（更寬鬆的匹配）
            if ($content -match '(?s)^---\s*\n(.*?)\n---\s*\n(.*)$') {
                $frontMatter = $matches[1].Trim()
                $body = $matches[2]
                
                # 檢查是否已有 lastmod
                if ($frontMatter -match 'lastmod:\s*.*') {
                    # 更新現有的 lastmod
                    $frontMatter = $frontMatter -replace 'lastmod:\s*.*', "lastmod: $currentTimestamp"
                    Write-Host "  ✓ 更新現有的 lastmod" -ForegroundColor Green
                } else {
                    # 在 front matter 最後加入 lastmod
                    $frontMatter = $frontMatter + "`nlastmod: $currentTimestamp"
                    Write-Host "  ✓ 新增 lastmod 欄位" -ForegroundColor Green
                }
                
                # 重新組合檔案內容
                $newContent = "---`n" + $frontMatter + "`n---`n" + $body
                
                # 寫回檔案 (確保沒有 BOM)
                [System.IO.File]::WriteAllText($file, $newContent, [System.Text.UTF8Encoding]::new($false))
                
                # 重新加入到 staging area
                git add $file
                
                Write-Host "  ✅ 檔案已更新並重新 staged" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  檔案沒有有效的 front matter，跳過" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "  ❌ 處理檔案時發生錯誤: $_" -ForegroundColor Red
        }
    }
}

Write-Host "✅ lastmod 更新完成" -ForegroundColor Green
exit 0
