# Database Setup PowerShell Script
# This script helps set up the library_system database

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Library Management System - DB Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue

if ($mysqlService -eq $null) {
    Write-Host "❌ MySQL80 service not found!" -ForegroundColor Red
    Write-Host "Please install MySQL or check the service name." -ForegroundColor Yellow
    exit 1
}

if ($mysqlService.Status -ne "Running") {
    Write-Host "❌ MySQL is not running!" -ForegroundColor Red
    Write-Host "Starting MySQL service..." -ForegroundColor Yellow
    Start-Service MySQL80
    Start-Sleep -Seconds 3
}

Write-Host "✅ MySQL is running" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Setup Options:" -ForegroundColor Cyan
Write-Host "1. Run Node.js setup script (requires correct MySQL password in .env)"
Write-Host "2. Open MySQL Workbench instructions"
Write-Host "3. Show manual SQL commands"
Write-Host "4. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nRunning Node.js setup script..." -ForegroundColor Yellow
        node setup-db.js
    }
    "2" {
        Write-Host "`n📖 MySQL Workbench Instructions:" -ForegroundColor Cyan
        Write-Host "1. Open MySQL Workbench"
        Write-Host "2. Connect to your local MySQL instance"
        Write-Host "3. File > Open SQL Script"
        Write-Host "4. Select: server\setup-tables.sql"
        Write-Host "5. Click the lightning bolt icon to execute"
        Write-Host "6. Verify tables are created"
        Write-Host ""
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "3" {
        Write-Host "`n📝 Manual SQL Commands:" -ForegroundColor Cyan
        Write-Host "Copy and paste these commands in MySQL Workbench or command line:"
        Write-Host ""
        Get-Content "server\setup-tables.sql" | Write-Host -ForegroundColor Gray
        Write-Host ""
        Write-Host "Press any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✅ Setup process completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify database connection in .env file"
Write-Host "2. Restart the server: npm start"
Write-Host "3. Test the application"
