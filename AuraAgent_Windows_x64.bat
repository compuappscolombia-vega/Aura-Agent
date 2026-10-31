@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title AuraAgent - Sistema Agentico de Ventas y Fidelización [Win64]
color 0C

:: Asegurar que el directorio de trabajo sea la carpeta donde reside este archivo .bat
cd /d "%~dp0"

echo ===============================================================================
echo                🌟 AURAAGENT - SISTEMA AGÉNTICO DE VENTAS Y FIDELIZACIÓN
echo                      Versión Oficial Windows 64-bits (x64)
echo ===============================================================================
echo.

:: [1/5] Verificación de Arquitectura del Sistema
echo [1/5] Verificando arquitectura del sistema...
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo     [✓] Arquitectura Windows 64-bits nativa confirmada (AMD64).
) else if "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    echo     [✓] Arquitectura Windows 64-bits confirmada (WOW64).
) else (
    echo     [!] Advertencia: Tu sistema no reporta AMD64 (%PROCESSOR_ARCHITECTURE%).
    echo         AuraAgent continuará la verificación...
)

:: [2/5] Verificación de Node.js y NPM
echo.
echo [2/5] Verificando entorno de ejecución Node.js y NPM...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo     ==================================================================
    echo     [X] ERROR CRÍTICO: Node.js no está instalado o no está en el PATH.
    echo     ==================================================================
    echo     Para ejecutar AuraAgent en Windows necesitas Node.js (v18, v20 o v22 LTS).
    echo.
    echo     Descárgalo gratis en: https://nodejs.org/
    echo     (Recuerda marcar "Add to PATH" durante la instalación).
    echo.
    echo     Presiona cualquier tecla para abrir la página oficial de Node.js...
    pause >nul
    start https://nodejs.org/
    echo.
    echo     Una vez instalado Node.js, vuelve a hacer doble clic en este archivo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VERSION=%%v
for /f "tokens=*" %%m in ('npm -v 2^>nul') do set NPM_VERSION=%%m
echo     [✓] Node.js detectado: %NODE_VERSION%
echo     [✓] NPM detectado:     v%NPM_VERSION%

:: [3/5] Verificación de Variables de Entorno (.env)
echo.
echo [3/5] Verificando configuración local (.env)...
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        echo     [✓] Archivo .env inicializado desde plantilla .env.example
    ) else (
        type nul > ".env"
        echo     [✓] Archivo .env preparado.
    )
) else (
    echo     [✓] Archivo .env verificado.
)

:: [4/5] Verificación e Instalación de Dependencias
echo.
echo [4/5] Verificando dependencias del motor agéntico (node_modules)...
if not exist "node_modules\" (
    echo     Instalando módulos requeridos por primera vez (npm install)...
    echo     Esto puede tardar entre 30 y 90 segundos dependiendo de tu conexión...
    call npm install
    if %errorlevel% neq 0 (
        echo     [!] Reintentando instalación con --legacy-peer-deps...
        call npm install --legacy-peer-deps
    )
    if %errorlevel% neq 0 (
        echo.
        echo     [X] Error instalando dependencias de Node.js.
        echo     Revisa tu conexión a internet o ejecuta 'npm install' manualmente en la terminal.
        pause
        exit /b 1
    )
    echo     [✓] Dependencias instaladas con éxito.
) else (
    echo     [✓] Dependencias locales verificadas (node_modules listo).
)

:: [5/5] Comprobación del Puerto 3000
echo.
echo [5/5] Comprobando disponibilidad del puerto 3000...
netstat -ano | findstr /R /C:":3000 " >nul 2>nul
if %errorlevel% equ 0 (
    echo     [!] El puerto 3000 parece estar ocupado por otra aplicación o servidor previo.
    echo         Intentando iniciar el servicio de todos modos...
) else (
    echo     [✓] Puerto 3000 disponible para AuraAgent.
)

:: Iniciar Servidor Full-Stack
echo.
echo ===============================================================================
echo   🚀 INICIANDO SERVIDOR AURAAGENT FULL-STACK
echo   -----------------------------------------------------------------------------
echo   • URL Local:        http://localhost:3000
echo   • Motor de Voz:     Aura Hiperrealista + Fondeo Acústico de Sala Activo
echo   • Clonación:        Modo Libre (Sin guion forzado - WhatsApp Audio)
echo   • Integración X:    Account Activity & Direct Messages Live Mirror
echo   • Cierre Comercial: Automatizado a OnlyFans VIP
echo ===============================================================================
echo.
echo Abriendo AuraAgent en tu navegador predeterminado en 3 segundos...

:: Abrir navegador en segundo plano tras breve pausa
start /b cmd /c "timeout /t 3 >nul && start http://localhost:3000"

echo.
echo Presiona Ctrl + C en esta ventana cuando desees apagar el servidor.
echo.

:: Ejecutar el servidor con tsx / npm run dev
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo ===============================================================================
    echo [X] El servidor se detuvo con código de error: %errorlevel%
    echo Revisa si hay otro proceso usando el puerto 3000 o ejecuta:
    echo     npm install
    echo     npm run dev
    echo ===============================================================================
    pause
)
