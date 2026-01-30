# Startup script for Library Management System

Write-Host "Starting Library Management System..." -ForegroundColor Cyan

# Check for .env in server
if (-not (Test-Path "server/.env")) {
    Write-Host "Creating default .env for server..." -ForegroundColor Yellow
    "PORT=5000`nDB_HOST=localhost`nDB_USER=root`nDB_PASSWORD=`nDB_NAME=library_system`nJWT_SECRET=supersecretkeylibrary" | Out-File -FilePath "server/.env" -Encoding utf8
}

Write-Host "`n[1/2] Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

Write-Host "[2/2] Starting Frontend Client..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"

Write-Host "`nSystem is starting up! Check the new windows." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:5000"
Write-Host "`nLogin Credentials:" -ForegroundColor White
Write-Host "Username: admin"
Write-Host "Password: password123"
