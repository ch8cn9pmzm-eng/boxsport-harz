/* Boxsport Harz – kombinierter Service Worker (OneSignal Web Push v16 + PWA-Cache)
 * Einzige Registrierung für Scope "/". Nicht parallel zu /sw.js registrieren.
 */
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
importScripts("/sw.js");
