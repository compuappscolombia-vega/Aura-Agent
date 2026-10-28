# 📖 Manual Oficial y Dossier Ejecutivo: AuraAgent (v2.5)
### Sistema Agéntico Autónomo de Ventas, Fidelización y Conversión VIP para Creadoras y Agencias

---

## 🚀 Acceso Rápido y Enlaces en Vivo
* **Aplicación en Vivo (Compartir con la Modelo):**  
  [https://ais-pre-lokv3iokjsaaw7piecrjod-227172514263.us-east1.run.app](https://ais-pre-lokv3iokjsaaw7piecrjod-227172514263.us-east1.run.app)
* **Archivo PDF Oficial Completo:**  
  Archivo `AuraAgent_Manual_Oficial.pdf` en la raíz del proyecto (3.9 MB, 14 páginas a color con capturas).
* **Cómo ver la App en AI Studio:**  
  En la parte superior de la ventana de AI Studio, haz clic en el ícono del **ojo `👁️`** (a la izquierda de `</> Code`).

---

## 1. ¿Qué es AuraAgent?
**AuraAgent** es una plataforma agéntica de inteligencia artificial con psicología conversacional, síntesis de voz hiperrealista, bóveda de fotos cotidianas protegidas y embudo de conversión comercial automatizado a OnlyFans y contenido VIP.

No es un simple chatbot corporativo. AuraAgent encarna la personalidad viva de modelos reales (*Valeria Gómez, Elena Russo, Mia Soler, Camila Torres*):
* **Cero frases robóticas:** Tiene prohibido decir *"¡Hola! ¿Cómo estás? ¿En qué te ayudo hoy?"*.
* **Complicidad:** Bromea, reacciona a fotos, historias cotidianas y comentarios con picardía y alta autoestima.
* **Notas de Voz:** Genera audios con tono dulce, risas y cadencia íntima.
* **Bóveda Casual:** Envía fotos de café matutino, gimnasio, descanso en casa y playa para construir cercanía antes de cobrar.

---

## 2. ¿Con qué Objetivo fue Creado?
1. **Evitar el agotamiento de la modelo (Burnout):** Contestar 500 DMs diarios manualmente es imposible. AuraAgent atiende 24/7 en cualquier huso horario sin descanso.
2. **Reemplazar a los chatters humanos deficientes:** Los redactores externos suelen perder el tono o equivocarse. AuraAgent mantiene coherencia biográfica y memoria a largo plazo.
3. **Embudo de Cierre en 3 Fases (Evita el Spam):**
   * **Fase 1: Gancho y Espejo (Confianza < 45%):** Conexión y juego verbal; no habla de dinero.
   * **Fase 2: Micro-Intimidad (Confianza 45% - 74%):** Comparte fotos y audios; despierta intriga sobre su contenido sin censura.
   * **Fase 3: Cierre Asertivo VIP (Confianza ≥ 75%):** Explica que en X le censuran todo e invita al OnlyFans privado con enlace directo y descuento especial.

---

## 3. Funciones Principales

### A. Operaciones en Vivo (Chat & DMs)
* Puntos de entrada en X: Story de Café Matcha, Story de Rutina Gym, DM Espontáneo o Chat Limpio.
* Fotos casuales dinámicas y notas de voz íntimas.
* Sugerencias de respuestas rápidas para probar la reacción del bot.

### B. Medidor de Confianza y VIP (Trust Score Meter)
* Mide en tiempo real: Trust Score (0-100%), Reciprocidad, Fluidez y Sentimiento.
* Bloquea la venta hasta que el usuario alcance el umbral óptimo de apego.

### C. Cerebro Agéntico & Adaptive Neural Memory
* **Detección de estados emocionales en tiempo real:**
  * 🥺 **Triste / Bajón:** Refugio empático y cariño; bloquea ventas.
  * 🧊 **Cortante / Seco:** Respuestas cortas con intriga pícara.
  * 😏 **Coqueto / Seductor:** Eleva la tensión con picardía y audios.
  * 🧐 **Serio / Formal:** Lenguaje cuidado antes de entrar en confianza.
  * 😤 **Enojado / Molesto:** Desactiva la tensión con calma desarmante.
  * 😄 **Contento:** Comparte risas y anécdotas de complicidad.
* **Memoria de hechos aprendidos:** Recuerda profesión, viajes, mascotas y preferencias.

### D. Integración X (Twitter) & Webhooks
* **API oficial Account Activity de X:** Endpoint `/api/webhooks/twitter-x` con verificación CRC HMAC-SHA256.
* **External Inbound API:** Endpoint `/api/webhooks/external/dm-inbound` para conectar n8n, Make, Zapier o scripts vía POST JSON con cabecera `x-aura-secret`.
* Firma criptográfica `X-Aura-Signature`.

### E. Laboratorio de Entrenamiento (Training Lab)
* Calibración del porcentaje de confianza para cierre (ej: 75%), precio de membresía y enlace de OnlyFans.

### F. Panel CRM & Pipeline de Suscriptores
* Clasificación de prospectos: Frío → Rapport → Tibio → VIP Listo → Convertido.
* Métricas de ingresos mensuales recurrentes (MRR).

### G. Catálogo Multimodelo
* Administración de múltiples modelos para agencias (*Valeria Gómez, Elena Russo, Mia Soler, Camila Torres*).

---

## 4. ¿Cómo se Usa AuraAgent?
1. **Seleccionar Modelo:** En el selector superior o abriendo el Catálogo.
2. **Definir Enlace OnlyFans:** En la pestaña *Entrenar Habilidades*.
3. **Probar Respuestas:** En *Operaciones en Vivo* usando los botones emocionales o enviando audios.
4. **Compartir con la Modelo:** Clic en el botón verde **`Compartir con la Modelo`** para enviarle el link por WhatsApp o Telegram.
5. **Monitorear Resultados:** En *Panel & CRM* para revisar los suscriptores convertidos.

---

## 5. Rendimiento en Computador (Desktop)
* Interfaz panorámica de doble columna (Chat + Telemetría simultánea).
* Atajos de teclado: `Alt+1` Operaciones, `Alt+2` Twitter Hub, `Alt+3` Training, `Alt+4` CRM, `Enter` Enviar.
