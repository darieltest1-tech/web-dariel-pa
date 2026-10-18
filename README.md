# Idk X dariel — IPA (Capacitor)

La interfaz va DENTRO de la app (offline, sin barra de navegador). El procesado (UnityPy / Supabase / keys)
sigue en tu servidor: https://web-darielnew-2-0.onrender.com

## Pasos
1. Sube esta carpeta a un repo de GitHub.
2. (Opcional) Pon tu icono 1024x1024 en `assets/icon.png` (y `assets/splash.png`).
3. Para actualizar la UI: reemplaza `web/dairel.html` por tu versión nueva.
4. Actions -> "Build IPA" -> Run workflow -> descarga el artifact `IdkXdariel-ipa`.
5. Firma/instala con Sideloadly, AltStore o tu método habitual (el .ipa sale sin firmar).

Cambiar nombre / Bundle ID: `capacitor.config.json` (`appName`, `appId`).
Cambiar servidor: `API_BASE` en `native/native-bridge.js`.
