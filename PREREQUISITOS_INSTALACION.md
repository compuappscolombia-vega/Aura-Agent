# 🛠️ Requisitos de Instalación y Ejecución de AuraAgent

Guía oficial para ejecutar **AuraAgent** en Windows 64-bits, navegadores y dispositivos móviles.

---

## 📋 1. Requisitos Previos Obligatorios

| Componente | Requisito Mínimo | Recomendado |
| :--- | :--- | :--- |
| **Sistema Operativo** | Windows 10 (64-bits) / Windows 11 | Windows 11 x64 |
| **Node.js** | v18.0.0 o superior | **Node.js v20 LTS o v22 LTS** ([Descargar aquí](https://nodejs.org/)) |
| **Navegador** | Chrome 100+ / Edge 100+ | Google Chrome o Microsoft Edge |
| **Memoria RAM** | 4 GB | 8 GB |
| **Puerto Local** | Puerto `3000` libre | `http://localhost:3000` |

> ⚠️ **Importante**: Al instalar Node.js desde [nodejs.org](https://nodejs.org/), asegúrate de marcar la casilla *"Add to PATH"* (Agregar a las variables de entorno).

---

## 🚀 2. Ejecución en Windows 64-bits (1 Clic)

1. Haz doble clic en el archivo **`AuraAgent_Windows_x64.bat`**.
2. El instalador inteligente realizará automáticamente:
   - Verificación de arquitectura de 64 bits.
   - Detección de Node.js y npm.
   - Instalación automática de módulos si es la primera vez (`npm install`).
   - Verificación y liberación del puerto 3000.
   - Inicio del servidor full-stack Express + Vite.
   - Apertura automática de tu navegador en `http://localhost:3000`.

---

## 🎙️ 3. Clonación de Voz Ultra-Realista (Sin Guion Obligatorio)

- **Modo Libre:** La modelo **NO** tiene que leer ningún guion forzado. Puede subir o grabar cualquier nota de voz de WhatsApp de 5 a 15 segundos (conversación natural, risas, anécdotas).
- **Extracción de Fondeo Acústico:** AURA no solo extrae el tono de voz, sino también el ambiente acústico físico (habitación, dormitorio, cafetería, lluvia, terraza) para que la voz **NUNCA** suene en un vacío digital anecoico.

---

## 📱 4. Acceso desde Celulares o Dispositivos Móviles

Para abrir AuraAgent en un teléfono móvil dentro de la misma red WiFi:
1. Averigua la IP local de tu computador (ejecuta `ipconfig` en Windows, ej: `192.168.1.50`).
2. Abre el navegador de tu celular y entra a: `http://192.168.1.50:3000`.
3. Puedes agregarlo a la pantalla de inicio como una App (PWA).
