# AuraAgent Windows x64 Auto-Launcher & Installer Script
Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host "       🌟 AURAAGENT - SISTEMA AGENTICO DE VENTAS (WIN64)        " -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host ""

$arch = (Get-CimInstance Win32_OperatingSystem).OSArchitecture
Write-Host "[1/3] Arquitectura del Sistema: $arch" -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVer = & node -v
    Write-Host "[2/3] Node.js detectado: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[X] Node.js no encontrado. Descargando instalador oficial LTS..." -ForegroundColor Yellow
    Start-Process "https://nodejs.org/en/download"
    Exit
}

# Check Dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[3/3] Instalando dependencias de Node.js..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[3/3] Dependencias listas." -ForegroundColor Green
}

Write-Host ""
Write-Host "Iniciando AuraAgent en http://localhost:3000..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"
npm run dev
