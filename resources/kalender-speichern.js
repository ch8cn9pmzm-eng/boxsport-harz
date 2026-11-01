/*! Boxsport Harz – „In Kalender speichern“ (ICS + Google) */
(function () {
  var MENU_ID = "bh-cal-menu";
  var STYLE_ID = "bh-cal-menu-style";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
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

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent =
      "#" + MENU_ID + "{position:absolute;z-index:99990;min-width:220px;max-width:min(320px,calc(100vw - 24px));background:#fff;color:#121214;border:2px solid #121214;border-bottom:4px solid #FFCE00;border-radius:6px;box-shadow:0 10px 28px rgba(0,0,0,.28);padding:8px;font-family:Arial,Helvetica,Verdana,sans-serif;}" +
      "#" + MENU_ID + " a{display:block;padding:10px 12px;margin:0 0 4px 0;text-decoration:none;color:#121214;font-size:15px;font-weight:bold;border-radius:4px;}" +
      "#" + MENU_ID + " a:last-child{margin-bottom:0;}" +
      "#" + MENU_ID + " a:hover,#" + MENU_ID + " a:focus{background:#f4f4f5;color:#a80000;}" +
      "#" + MENU_ID + " .bh-cal-menu-label{font-size:12px;color:#55555b;padding:2px 8px 8px 8px;font-weight:normal;}";
    document.head.appendChild(s);
  }

  function closeMenu() {
    var m = document.getElementById(MENU_ID);
    if (m && m.parentNode) m.parentNode.removeChild(m);
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKey);
  }

  function onDocClick(ev) {
    var m = document.getElementById(MENU_ID);
    if (!m) return;
    if (m.contains(ev.target)) return;
    if (ev.target.closest && ev.target.closest(".bh-cal-save")) return;
    closeMenu();
  }

  function onKey(ev) {
    if (ev.key === "Escape") closeMenu();
  }

  function openMenu(btn) {
    ensureStyles();
    closeMenu();
    var ics = btn.getAttribute("data-ics");
    var google = btn.getAttribute("data-google");
    var title = btn.getAttribute("data-title") || "Termin";
    if (!ics || !google) return;

    var menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "In Kalender speichern");
    menu.innerHTML =
      '<div class="bh-cal-menu-label">Termin speichern</div>' +
      '<a role="menuitem" class="bh-cal-opt-ics" href="' + ics + '" download>ICS-Datei herunterladen</a>' +
      '<a role="menuitem" class="bh-cal-opt-gcal" href="' + google + '" target="_blank" rel="noopener noreferrer">Google Kalender</a>';

    document.body.appendChild(menu);

    var rect = btn.getBoundingClientRect();
    var top = rect.bottom + window.scrollY + 6;
    var left = rect.left + window.scrollX;
    menu.style.top = top + "px";
    menu.style.left = left + "px";
    // keep on screen
    requestAnimationFrame(function () {
      var mr = menu.getBoundingClientRect();
      if (mr.right > window.innerWidth - 8) {
        menu.style.left = Math.max(8, window.scrollX + window.innerWidth - mr.width - 8) + "px";
      }
      if (mr.bottom > window.innerHeight - 8) {
        var above = rect.top + window.scrollY - mr.height - 6;
        if (above > window.scrollY) menu.style.top = above + "px";
      }
    });

    menu.querySelector(".bh-cal-opt-ics").addEventListener("click", function () {
      gcEvent("kalender-speichern", "Kalender speichern: ICS – " + title);
      setTimeout(closeMenu, 50);
    });
    menu.querySelector(".bh-cal-opt-gcal").addEventListener("click", function () {
      gcEvent("kalender-speichern", "Kalender speichern: Google – " + title);
      setTimeout(closeMenu, 50);
    });

    setTimeout(function () {
      document.addEventListener("click", onDocClick, true);
      document.addEventListener("keydown", onKey);
    }, 0);
  }

  function onSaveClick(ev) {
    ev.preventDefault();
    openMenu(ev.currentTarget);
  }

  ready(function () {
    var nodes = document.querySelectorAll(".bh-cal-save");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("click", onSaveClick);
    }
  });
})();
