# MongoDB Installation Script for Windows
# Run this script as Administrator

Write-Host "🗄️  MongoDB Installation Script for Minnie's Farm Resort" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Create MongoDB directories
$mongoPath = "C:\Program Files\MongoDB"
$dataPath = "C:\data\db"
$logPath = "C:\data\log"

Write-Host "📁 Creating MongoDB directories..." -ForegroundColor Yellow

try {
    if (-not (Test-Path $dataPath)) {
        New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
        Write-Host "✅ Created data directory: $dataPath" -ForegroundColor Green
    }
    
    if (-not (Test-Path $logPath)) {
        New-Item -ItemType Directory -Path $logPath -Force | Out-Null
        Write-Host "✅ Created log directory: $logPath" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error creating directories: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if MongoDB is already installed
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($mongoService) {
    Write-Host "✅ MongoDB service already exists" -ForegroundColor Green
    
    if ($mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB is already running" -ForegroundColor Green
    } else {
        Write-Host "🔄 Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
        Write-Host "✅ MongoDB service started" -ForegroundColor Green
    }
} else {
    Write-Host "❌ MongoDB not found. Please install MongoDB manually:" -ForegroundColor Red
    Write-Host "1. Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "2. Select Windows MSI package" -ForegroundColor Yellow
    Write-Host "3. Run the installer with default settings" -ForegroundColor Yellow
    Write-Host "4. Make sure to install MongoDB as a Service" -ForegroundColor Yellow
}

# Test MongoDB connection
Write-Host "🔍 Testing MongoDB connection..." -ForegroundColor Yellow

$mongoExe = "C:\Program Files\MongoDB\Server\*\bin\mongo.exe"
$mongoPath = Get-ChildItem -Path $mongoExe -ErrorAction SilentlyContinue | Select-Object -First 1

if ($mongoPath) {
    Write-Host "✅ MongoDB executable found at: $($mongoPath.FullName)" -ForegroundColor Green
    
    # Test connection
    try {
        $testResult = & $mongoPath.FullName --eval "db.runCommand('ping')" --quiet 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MongoDB connection successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ MongoDB connection failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error testing MongoDB connection: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ MongoDB executable not found" -ForegroundColor Red
}

Write-Host "`n🎉 MongoDB setup check completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If MongoDB is not installed, download and install it manually" -ForegroundColor White
Write-Host "2. Run: cd backend && npm install" -ForegroundColor White
Write-Host "3. Create .env file with MongoDB connection string" -ForegroundColor White
Write-Host "4. Run: npm run init-db" -ForegroundColor White
Write-Host "5. Run: npm run dev" -ForegroundColor White

Read-Host "`nPress Enter to exit"
