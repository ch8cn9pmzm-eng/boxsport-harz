/*! Boxsport Harz – Mobile-Navigation & kleine UX-Helfer (2026-11-01) */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function collectLinks(selector) {
    var nodes = document.querySelectorAll(selector);
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      var href = a.getAttribute("href");
      if (!href) continue;
      out.push({
        href: href,
        text: (a.textContent || "").replace(/\s+/g, " ").trim(),
        active: /\b(main_nav_active_item|sub_nav_active_item)\b/.test(a.className || "")
      });
    }
    return out;
  }

  function buildList(items) {
    var ul = document.createElement("ul");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.text) continue;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.text;
      if (item.active) a.className = "is-active";
      li.appendChild(a);
      ul.appendChild(li);
    }
    return ul;
  }

  function wrapContentTables() {
    var content = document.getElementById("content_container") || document.querySelector(".content");
    if (!content) return;
    var tables = content.querySelectorAll("table");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      if (table.closest(".bh-table-scroll")) continue;
      if (table.id === "layout_table") continue;
      var wrap = document.createElement("div");
      wrap.className = "bh-table-scroll";
      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-label", "Tabelle seitlich scrollbar");
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    }
  }

  function lazyImages() {
    var imgs = document.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
      if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
    }
  }

  function setupMenu() {
    var header = document.getElementById("header");
    if (!header || document.getElementById("bh-menu-toggle")) return;

    var mainLinks = collectLinks("#main_nav_list a");
    var subLinks = collectLinks(".sub_nav_list a");
    if (!mainLinks.length && !subLinks.length) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "bh-menu-toggle";
    btn.className = "bh-menu-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "bh-mobile-panel");
    btn.setAttribute("aria-label", "Menü öffnen");
    btn.innerHTML = "<span></span><span></span><span></span>";

    var panel = document.createElement("nav");
    panel.id = "bh-mobile-panel";
    panel.className = "bh-mobile-panel";
    panel.setAttribute("hidden", "");
    panel.setAttribute("aria-label", "Mobile Navigation");

    if (mainLinks.length) {
      var l1 = document.createElement("div");
      l1.className = "bh-mobile-label";
      l1.textContent = "Menü";
      panel.appendChild(l1);
      panel.appendChild(buildList(mainLinks));
    }
    if (subLinks.length) {
      var l2 = document.createElement("div");
      l2.className = "bh-mobile-label";
      l2.textContent = "Vereine & Termine";
      panel.appendChild(l2);
      panel.appendChild(buildList(subLinks));
    }

    header.appendChild(btn);
    // Panel im Header vor dem Key-Visual einfügen (unter Logo/Slogan, über Banner)
    var keyVisual = document.getElementById("key_visual");
    if (keyVisual && keyVisual.parentNode === header) {
      header.insertBefore(panel, keyVisual);
    } else if (header.parentNode) {
      if (header.nextSibling) header.parentNode.insertBefore(panel, header.nextSibling);
      else header.parentNode.appendChild(panel);
    }

    function setOpen(open) {
      document.body.classList.toggle("bh-nav-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      if (open) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    }

    btn.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("bh-nav-open"));
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    // Bei Desktop-Breite Menü schließen
    if (window.matchMedia) {
      var mq = window.matchMedia("(min-width: 901px)");
      var onChange = function (ev) {
        if (ev.matches) setOpen(false);
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  ready(function () {
    setupMenu();
    wrapContentTables();
    lazyImages();
  });
})();
