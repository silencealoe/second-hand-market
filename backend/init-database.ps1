# 数据库初始化脚本
# 使用方法: .\init-database.ps1

Write-Host "=== 二手交易系统数据库初始化 ===" -ForegroundColor Green
Write-Host ""

# 读取 .env 文件获取数据库配置
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$dbPassword = ""
$dbUsername = "root"

if ($envContent) {
    foreach ($line in $envContent) {
        if ($line -match "^DB_PASSWORD=(.+)$") {
            $dbPassword = $matches[1].Trim()
        }
        if ($line -match "^DB_USERNAME=(.+)$") {
            $dbUsername = $matches[1].Trim()
        }
    }
}

Write-Host "数据库用户名: $dbUsername" -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($dbPassword)) {
    Write-Host "警告: .env 文件中未设置 DB_PASSWORD，将提示输入密码" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "正在执行数据库初始化..." -ForegroundColor Green
    Get-Content database/init.sql | mysql -u $dbUsername -p
} else {
    Write-Host "正在执行数据库初始化..." -ForegroundColor Green
    $env:MYSQL_PWD = $dbPassword
    Get-Content database/init.sql | mysql -u $dbUsername
    Remove-Item Env:\MYSQL_PWD
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ 数据库初始化成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "数据库名称: second_hand_market" -ForegroundColor Cyan
    Write-Host "已创建表: users, products, comments" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ 数据库初始化失败，请检查错误信息" -ForegroundColor Red
}

