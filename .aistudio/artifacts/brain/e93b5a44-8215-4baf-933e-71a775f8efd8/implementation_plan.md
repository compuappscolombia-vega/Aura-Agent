# AuraAgent - Reorganización de Navegación Responsiva y Bloqueo por Cierre de Sesión

Plan de rediseño integral de la barra de navegación para erradicar el desbordamiento horizontal y la dispersión de elementos, junto con el blindaje de la sesión para que al cerrar sesión el sistema se bloquee de inmediato redirigiendo a la pantalla completa de autenticación.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas con el usuario:**
> - **Navegación limpia y unificada:** Se reemplaza la sobrecarga de 11 botones individuales en la barra superior por una estructura limpia: logo y selector de modelo activo a la izquierda, barra central de pestañas principales (Operaciones en Vivo, Integración X, Habilidades, CRM, Bóveda), y zona derecha con menú desplegable unificado ("Herramientas y Descargas") más el botón de perfil/sesión.
> - **Cierre de sesión con bloqueo total del sistema:** Al cerrar sesión, la sesión actual se purga de la memoria y almacenamiento (`localStorage`), se bloquea el acceso a todas las pantallas operativas y se presenta una vista de bienvenida/login a pantalla completa con soporte de registro e inicio de sesión. Ningún usuario podrá ver ni operar el chat ni el CRM sin estar autenticado.

---

### 1. Overview & Core Concept

- **Qué hace:**
  1. **Control de Acceso Estricto (Auth Gatekeeper):** Al arrancar la aplicación sin sesión o al hacer clic en "Cerrar Sesión", la aplicación desmonta la vista interna y muestra la pantalla completa de bienvenida y autenticación (`AuthLoginModal` / `AuthGateScreen`), permitiendo identificarse con X, Google o registrar un nuevo perfil de creadora/admin.
  2. **Barra de Navegación Responsiva y Profesional:** Cumple con la regla de tres zonas (Marca + Pestañas de Navegación + Menú de Herramientas y Perfil), garantizando un diseño visual fluido en resoluciones móviles, tablets y monitores de escritorio sin cortes ni desbordamientos horizontales.
  3. **Menú Unificado de Herramientas:** Agrupa acciones secundarias ("Compartir con la Modelo", "Manual PDF Oficial", "Instalador Win64 & APK", "Registrar Nuevo Perfil" y "Restablecer Diálogo") dentro de un menú desplegable accesible y pulido con iconos y descripciones breves.

- **Público Objetivo:** Creadoras de contenido, administradores de agencia y supervisores que requieren un panel rápido, privado, seguro y visualmente impecable en cualquier dispositivo.

---

### 2. User Experience & Visual Design

- **Flujo de Usuario al Cerrar Sesión:**
  1. El usuario hace clic en su perfil en la barra superior y selecciona "Cerrar Sesión".
  2. El estado `currentUserSession` pasa a `null` y se limpia `localStorage.removeItem('aura_current_session')`.
  3. La interfaz principal de operaciones se oculta de inmediato.
  4. Se muestra la pantalla completa de autenticación con selector de método (Iniciar Sesión con X, Google, o Registro de Creadora/Admin).
  5. Una vez autenticado exitosamente, se restaura la sesión y se da acceso fluido al panel correspondiente con su modelo asignada.

- **Diseño de la Barra Superior:**
  - **Zona Izquierda (Marca y Modelo):** Logo compacto de AuraAgent, indicador de estado sutil y botón de selección de modelo activo con avatar e indicador de estado.
  - **Zona Central (Pestañas de Navegación):** Segmented control horizontal con scroll táctil en móviles para las 5 secciones primarias:
    - *Operaciones en Vivo*
    - *Integración X*
    - *Entrenamiento*
    - *CRM & Leads*
    - *Voz & Bóveda*
  - **Zona Derecha (Acciones y Perfil):**
    - Botón desplegable *"Herramientas"* (con badge y menú flotante para descargas, manual, compartir y registro).
    - Avatar del usuario conectado con menú contextual para ver rol, cambiar cuenta y botón explícito de *"Cerrar Sesión"*.

- **Alineación con Frontend Design Guidelines:**
  - Eliminación de cápsulas redundantes y textos desbordados.
  - Mantener paleta oscura slate-950 con acentos sutiles en índigo, rosa y esmeralda.
  - Transiciones suaves de entrada y salida con soporte para vista responsiva completa.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Eliminar Sesión Mock por Defecto en Primera Carga / Cierre de Sesión**
  - *Enfoque:* Si no existe una sesión válida guardada en `localStorage`, la app inicia en estado desautenticado (`currentUserSession === null`) y renderiza la pantalla de autenticación completa.
  - *Por qué:* Resuelve directamente el problema reportado de que al cerrar sesión el sistema no se cerraba ni protegía los datos.

- **Decisión 2: Menú Desplegable "Más Herramientas" en Header**
  - *Enfoque:* Consolidar los botones secundarios (Manual PDF, APK/Win64, Compartir, Registrar) en un dropdown accesible con click-outside listener.
  - *Por qué:* Evita que 6 botones adicionales fuercen a la barra superior a desbordarse horizontalmente en pantallas menores a 1600px.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       AuraAgent App                         │
│                                                             │
│  ¿currentUserSession === null?                              │
│       ├── SÍ ──► [ Pantalla Completa de Inicio / Registro ] │
│       │          (X OAuth, Google, Registro Creadora/Admin) │
│       │                                                     │
│       └── NO ──► [ Interfaz Operativa Principal ]           │
│                   ├── Header Responsivo (3 zonas limpias)   │
│                   │    ├── Marca & Modelo Activo            │
│                   │    ├── Segmented Tabs de Navegación     │
│                   │    └── Dropdown Herramientas + Perfil   │
│                   │                                         │
│                   └── Vista Activa                          │
│                        ├── Live Ops (Chat & HUD)            │
│                        ├── Integración X                    │
│                        ├── Lab de Entrenamiento             │
│                        ├── CRM & Subscripciones             │
│                        └── Bóveda de Voz & Multimedia       │
└─────────────────────────────────────────────────────────────┘
```

- **Mapeo de Componentes a Modificar:**
  - `src/App.tsx`: Modificar la inicialización de `currentUserSession` para no forzar una sesión por defecto falsa, implementar el render condicional tipo Gatekeeper a pantalla completa cuando `!currentUserSession`, reestructurar el `<header>` en un diseño responsivo con pestañas limpias y menú desplegable, y asegurar que el logout limpie el estado y muestre la pantalla de acceso.
  - `src/components/AuthLoginModal.tsx`: Ajustar para que cuando se use como pantalla completa mantenga un diseño atractivo, centrado y profesional con tabs de "Iniciar Sesión" y "Registrar Modelo/Admin".
