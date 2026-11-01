/*! Boxsport Harz – PWA Install-Hilfe & GoatCounter-Events */
(function () {
  var deferredPrompt = null;
  var IOS_HINT_ID = "bh-ios-install-hint";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
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

  function hideInstallButtons() {
    var nodes = document.querySelectorAll(".bh-app-install, [data-bh-install]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.display = "none";
      nodes[i].setAttribute("hidden", "hidden");
      nodes[i].setAttribute("aria-hidden", "true");
    }
  }

  function ensureIosStyles() {
    if (document.getElementById("bh-ios-install-style")) return;
    var style = document.createElement("style");
    style.id = "bh-ios-install-style";
    style.textContent =
      "#" + IOS_HINT_ID + "{position:fixed;inset:0;z-index:99999;background:rgba(18,18,20,.72);display:flex;align-items:flex-end;justify-content:center;padding:16px;box-sizing:border-box;}" +
      "#" + IOS_HINT_ID + " .bh-ios-card{background:#fff;color:#121214;border-radius:12px;max-width:420px;width:100%;padding:18px 18px 16px;border-bottom:4px solid #FFCE00;box-shadow:0 12px 40px rgba(0,0,0,.35);font-family:Arial,Helvetica,Verdana,sans-serif;}" +
      "#" + IOS_HINT_ID + " h2{margin:0 0 10px;font-size:20px;color:#121214;}" +
      "#" + IOS_HINT_ID + " ol{margin:0 0 14px 18px;padding:0;font-size:15px;line-height:1.45;}" +
      "#" + IOS_HINT_ID + " li{margin:0 0 8px;}" +
      "#" + IOS_HINT_ID + " .bh-ios-close{display:inline-block;background:#DD0000;color:#fff;border:0;border-bottom:3px solid #FFCE00;padding:10px 16px;font-weight:bold;font-size:15px;cursor:pointer;border-radius:4px;}" +
      "#" + IOS_HINT_ID + " .bh-ios-close:hover{background:#a80000;}";
    document.head.appendChild(style);
  }

  function showIosHint() {
    if (document.getElementById(IOS_HINT_ID)) return;
    ensureIosStyles();
    var wrap = document.createElement("div");
    wrap.id = IOS_HINT_ID;
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "App auf dem iPhone installieren");
    wrap.innerHTML =
      '<div class="bh-ios-card">' +
      "<h2>App auf dem iPhone / iPad</h2>" +
      "<ol>" +
      "<li>Tippe unten auf das <strong>Teilen</strong>-Symbol (Quadrat mit Pfeil nach oben).</li>" +
      "<li>Wähle <strong>Zum Home-Bildschirm</strong>.</li>" +
      "<li>Bestätige mit <strong>Hinzufügen</strong>.</li>" +
      "</ol>" +
      "<p style=\"margin:0 0 12px;font-size:13px;line-height:1.4;color:#444;\">Hinweis: In Safari öffnen – in anderen Browsern auf dem iPhone fehlt dieser Menüpunkt oft.</p>" +
      '<button type="button" class="bh-ios-close">Verstanden</button>' +
      "</div>";
    function close() {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      document.removeEventListener("keydown", onKey);
    }
    function onKey(ev) {
      if (ev.key === "Escape") close();
    }
    wrap.addEventListener("click", function (ev) {
      if (ev.target === wrap) close();
    });
    wrap.querySelector(".bh-ios-close").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(wrap);
    gcEvent("app-ios-hinweis", "App iOS-Hinweis angezeigt");
  }

  function installClick(ev) {
    var el = ev.currentTarget;
    gcEvent("app-button-klick", "App-Install-Button geklickt");

    if (deferredPrompt) {
      ev.preventDefault();
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
      });
      return;
    }

    if (isIos() && !isStandalone()) {
      ev.preventDefault();
      showIosHint();
      return;
    }

    // Fallback: zur App-Seite (wenn der Button ein Link ist, normalen Link folgen)
    var href = el.getAttribute("href");
    if (!href || href === "#" || href.indexOf("javascript:") === 0) {
      ev.preventDefault();
      window.location.href = "App.html";
    }
  }

  function bindButtons() {
    var nodes = document.querySelectorAll(".bh-app-install, [data-bh-install]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("click", installClick);
    }
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    hideInstallButtons();
    gcEvent("app-installiert", "App installiert");
  });

  ready(function () {
    if (isStandalone()) {
      hideInstallButtons();
      try {
        if (!sessionStorage.getItem("bh-app-start-sent")) {
          sessionStorage.setItem("bh-app-start-sent", "1");
          gcEvent("app-start", "App gestartet (Standalone)");
        }
      } catch (e) {
        gcEvent("app-start", "App gestartet (Standalone)");
      }
    }
    bindButtons();
  });
})();
