@echo off
chcp 65001 >nul
echo === 二手交易系统数据库初始化 ===
echo.

echo 正在执行数据库初始化...
echo 请输入 MySQL root 密码:
mysql -u root -p < database\init.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ 数据库初始化成功！
    echo.
    echo 数据库名称: second_hand_market
    echo 已创建表: users, products, comments
) else (
    echo.
    echo ✗ 数据库初始化失败，请检查错误信息
)

pause

