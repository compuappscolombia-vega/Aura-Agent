@echo off
chcp 65001 >nul
title AuraAgent - Sistema Agentico de Ventas y Fidelización [Win64]
color 0C

echo ===============================================================================
echo                🌟 AURAAGENT - SISTEMA AGENTICO DE VENTAS Y FIDELIZACIÓN
echo                                 Versión Windows 64-bits
echo ===============================================================================
echo.
echo [1/4] Verificando arquitectura del sistema...
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo     [✓] Arquitectura Windows 64-bits confirmada.
) else if "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    echo     [✓] Arquitectura Windows 64-bits confirmada (WOW64).
) else (
    echo     [!] Advertencia: Este ejecutable está optimizado para Windows 64-bits.
)

echo.
echo [2/4] Verificando entorno de ejecución Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo     [X] ERROR: Node.js no está instalado en este sistema.
    echo     Por favor descarga e instala Node.js (LTS v20 o v22) desde:
    echo     https://nodejs.org/
    echo.
    echo     Presiona cualquier tecla para abrir el sitio de descarga...
    pause >nul
    start https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo     [✓] Node.js detectado: %NODE_VERSION%

echo.
echo [3/4] Verificando dependencias del motor agentico...
if not exist "node_modules\" (
    echo     Instalando módulos requeridos por primera vez (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo     [X] Error al instalar dependencias. Intentando con --legacy-peer-deps...
        call npm install --legacy-peer-deps
    )
) else (
    echo     [✓] Dependencias locales verificadas.
)

echo.
echo [4/4] Iniciando Servidor AuraAgent en http://localhost:3000...
echo.
echo ===============================================================================
echo   🚀 SERVIDOR AURAAGENT INICIADO
echo   • URL Local:    http://localhost:3000
echo   • Síntesis Voz: Hiperrealista (Aura Voice Engine activo)
echo   • X API v2:     Account Activity Webhook preparado
echo   • Cierre VIP:   Automatizado a OnlyFans
echo ===============================================================================
echo.
echo Abriendo AuraAgent en tu navegador predeterminado...
timeout /t 3 >nul
start http://localhost:3000

echo Para detener el servidor presiona Ctrl + C en esta ventana.
echo.
call npm run dev

pause
