/* ==========================================================================
   CARTRIDGE - SHARED NAV
   Injects the header/tab-bar into #site-nav on every page. Edit tabs here
   once - every page picks up the change automatically.
   ========================================================================== */

(function () {
  "use strict";

  const mount = document.getElementById("site-nav");

  // Bail early if this page has no nav mount point
  if (!mount) return;

  // Tab definitions - add new tabs here as pages are built
  const tabs = [
    { label: "Dashboard", href: "dashboard.html" },
    { label: "Featured Web Games", href: "featured-web-games.html" },
    { label: "Game Solutions", href: "game-solutions.html" },
    { label: "Gameplay", href: "gameplay.html" }
  ];

  /**
   * Figures out which tab matches the current page so it can get
   * the --active styling. Falls back to no match on index.html (landing
   * page has no tab of its own).
   */
  function getCurrentFile() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf("/") + 1) || "index.html";
  }

  function buildNavHTML() {
    const currentFile = getCurrentFile();

    const tabsHTML = tabs
      .map(function (tab) {
        const isActive = tab.href === currentFile;
        const activeClass = isActive ? " site-nav__tab--active" : "";
        return (
          '<a class="site-nav__tab' + activeClass + '" href="' + tab.href + '">' +
          tab.label +
          "</a>"
        );
      })
      .join("");

    return (
      '<a class="site-nav__logo" href="index.html">CARTRIDGE</a>' +
      '<nav class="site-nav__tabs" aria-label="Primary">' +
      tabsHTML +
      "</nav>"
    );
  }

  mount.classList.add("site-nav");
  mount.innerHTML = buildNavHTML();

  // TODO: swap to a mobile-friendly nav (hamburger/drawer) when device-mobile
  // class is present on <body> - current layout is desktop-first
})();
