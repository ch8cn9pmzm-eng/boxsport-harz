/*! Boxsport Harz – OneSignal Push-Opt-in (App.html + Startseite) */
(function () {
  function gcEvent(path, title) {
    var sent = false;
    function send() {
      if (sent) return true;
      if (window.goatcounter && typeof window.goatcounter.count === "function") {
        try {
          window.goatcounter.count({ path: path, title: title || path, event: true });
          sent = true;
          return true;
        } catch (e) {}
      }
      return false;
    }
    if (send()) return;
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (send() || n > 60) clearInterval(t);
    }, 100);
  }

  function setStatus(text) {
    var el = document.getElementById("bh-push-status");
    if (el) el.textContent = text;
  }

  function setButton(enabled, label) {
    var nodes = document.querySelectorAll("#bh-push-enable, .bh-push-enable");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].disabled = !enabled;
      if (label) nodes[i].textContent = label;
    }
  }

  function isStandalone() {
    try {
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
    } catch (e) {}
    return !!(window.navigator && window.navigator.standalone);
  }

  function isIos() {
    var ua = window.navigator.userAgent || "";
    var iOS = /iPad|iPhone|iPod/.test(ua);
    var iPadOS = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
    return iOS || iPadOS;
  }

  function refreshStatus(OneSignal) {
    try {
      if (!OneSignal.Notifications.isPushSupported()) {
        setStatus("Status: Dieses Gerät/dieser Browser unterstützt keine Web-Push-Nachrichten.");
        setButton(false, "🔔 Nicht verfügbar");
        return;
      }
      if (isIos() && !isStandalone()) {
        setStatus("Status: Auf dem iPhone bitte zuerst „Zum Home-Bildschirm“ und dann die App öffnen.");
      }
      var permission = OneSignal.Notifications.permission;
      var optedIn = !!(OneSignal.User && OneSignal.User.PushSubscription && OneSignal.User.PushSubscription.optedIn);
      if (permission && optedIn) {
        setStatus("Status: Benachrichtigungen sind aktiv.");
        setButton(false, "🔔 Aktiviert");
      } else if (permission === false && typeof Notification !== "undefined" && Notification.permission === "denied") {
        setStatus("Status: Im Browser blockiert. Bitte in den Einstellungen erlauben.");
        setButton(false, "🔔 Blockiert");
      } else {
        setStatus("Status: Noch nicht aktiviert.");
        setButton(true, "🔔 Benachrichtigungen aktivieren");
      }
    } catch (e) {
      setStatus("Status: Prüfung fehlgeschlagen.");
    }
  }

  function markHowto() {
    var howto = document.querySelectorAll(".bh-app-howto");
    if (!howto.length) return;
    var show = isIos() || !window.matchMedia;
    // Always keep visible (short fallback), but emphasize on iOS
    for (var i = 0; i < howto.length; i++) {
      if (isIos() && !isStandalone()) {
        howto[i].classList.add("bh-app-howto-emphasis");
        howto[i].hidden = false;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markHowto);
  } else {
    markHowto();
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function (OneSignal) {
    function onSubChange(event) {
      try {
        if (event && event.current && event.current.optedIn && !(event.previous && event.previous.optedIn)) {
          gcEvent("push-optin", "Push-Benachrichtigungen aktiviert");
        }
      } catch (e) {}
      refreshStatus(OneSignal);
    }
    try {
      OneSignal.User.PushSubscription.addEventListener("change", onSubChange);
    } catch (e) {}
    try {
      OneSignal.Notifications.addEventListener("permissionChange", function () {
        refreshStatus(OneSignal);
      });
    } catch (e) {}
    refreshStatus(OneSignal);

    var nodes = document.querySelectorAll("#bh-push-enable, .bh-push-enable");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("click", async function () {
        setStatus("Status: Berechtigung wird angefragt …");
        try {
          if (OneSignal.Slidedown && typeof OneSignal.Slidedown.promptPush === "function") {
            await OneSignal.Slidedown.promptPush({ force: true });
          } else if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === "function") {
            await OneSignal.Notifications.requestPermission();
          }
          if (OneSignal.User && OneSignal.User.PushSubscription && typeof OneSignal.User.PushSubscription.optIn === "function") {
            await OneSignal.User.PushSubscription.optIn();
          }
        } catch (e) {
          setStatus("Status: Aktivierung abgebrochen oder fehlgeschlagen.");
        }
        refreshStatus(OneSignal);
        try {
          if (OneSignal.User && OneSignal.User.PushSubscription && OneSignal.User.PushSubscription.optedIn) {
            gcEvent("push-optin", "Push-Benachrichtigungen aktiviert");
          }
        } catch (e) {}
      });
    }
  });
})();
