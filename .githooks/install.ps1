# Git Hooks 安裝腳本
# 將自定義的 pre-commit hook 安裝到 .git/hooks/ 目錄

Write-Host "🔧 開始安裝 Git Hooks..." -ForegroundColor Cyan

# 檢查是否在 Git repository 中
if (-not (Test-Path ".git")) {
    Write-Host "❌ 錯誤：當前目錄不是 Git repository" -ForegroundColor Red
    exit 1
}

# 創建 .git/hooks 目錄（如果不存在）
$hooksDir = ".git/hooks"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    Write-Host "📁 創建 hooks 目錄: $hooksDir" -ForegroundColor Green
}

# 複製 PowerShell 版本的 pre-commit hook
$sourceHook = ".githooks/pre-commit.ps1"
$targetHook = "$hooksDir/pre-commit"

if (Test-Path $sourceHook) {
    # 創建 wrapper 腳本來執行 PowerShell hook
    $wrapperContent = @"
#!/bin/bash
# Git Pre-commit Hook Wrapper
# 執行 PowerShell 版本的 pre-commit hook

# 檢查是否有 PowerShell
if command -v pwsh &> /dev/null; then
    # 使用 PowerShell Core
    pwsh -File ".githooks/pre-commit.ps1"
elif command -v powershell.exe &> /dev/null; then
    # 使用 Windows PowerShell
    powershell.exe -ExecutionPolicy Bypass -File ".githooks/pre-commit.ps1"
else
    echo "⚠️  找不到 PowerShell，跳過 lastmod 更新"
    exit 0
fi
"@
    
    # 寫入 wrapper 腳本
    Set-Content -Path $targetHook -Value $wrapperContent -Encoding UTF8
    Write-Host "✅ 已安裝 pre-commit hook wrapper" -ForegroundColor Green
    
    # 設置執行權限（在 Windows 上）
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        # Windows 環境下不需要特別設置權限
        Write-Host "💡 Windows 環境，無需設置執行權限" -ForegroundColor Yellow
    } else {
        # Unix-like 系統設置執行權限
        chmod +x $targetHook
        Write-Host "🔑 已設置執行權限" -ForegroundColor Green
    }
    
    Write-Host "🎉 Git Hook 安裝完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 功能說明：" -ForegroundColor Cyan
    Write-Host "  • 在每次 commit 前自動執行" -ForegroundColor White
    Write-Host "  • 檢查是否有 .md 檔案異動" -ForegroundColor White
    Write-Host "  • 自動更新或新增 lastmod 欄位" -ForegroundColor White
    Write-Host "  • 使用當前時間戳（台北時區）" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 測試安裝：" -ForegroundColor Cyan
    Write-Host "  1. 修改任一 .md 檔案" -ForegroundColor White
    Write-Host "  2. git add ." -ForegroundColor White
    Write-Host "  3. git commit -m 'test'" -ForegroundColor White
    Write-Host "  4. 觀察 lastmod 是否自動更新" -ForegroundColor White
    
} else {
    Write-Host "❌ 錯誤：找不到源 hook 檔案 $sourceHook" -ForegroundColor Red
    exit 1
}
