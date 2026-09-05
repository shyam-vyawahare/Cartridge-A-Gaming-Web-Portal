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

  function getRootPrefix() {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const fileName = pathParts[pathParts.length - 1];
    const directoryDepth = fileName && fileName.includes(".") ? pathParts.length - 1 : pathParts.length;
    return "../".repeat(directoryDepth);
  }

  function buildNavHTML() {
    const currentFile = getCurrentFile();
    const rootPrefix = getRootPrefix();

    const tabsHTML = tabs
      .map(function (tab) {
        const isActive = tab.href === currentFile;
        const activeClass = isActive ? " site-nav__tab--active" : "";
        return (
          '<a class="site-nav__tab' + activeClass + '" href="' + rootPrefix + tab.href + '">' +
          tab.label +
          "</a>"
        );
      })
      .join("");

    return (
      '<a class="site-nav__logo" href="' + rootPrefix + 'index.html">CARTRIDGE</a>' +
      '<button class="site-nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav-tabs">' +
      '<span class="visually-hidden">Toggle navigation</span>' +
      '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>' +
      "</button>" +
      '<nav class="site-nav__tabs" id="site-nav-tabs" aria-label="Primary">' +
      tabsHTML +
      "</nav>"
    );
  }

  mount.classList.add("site-nav");
  mount.innerHTML = buildNavHTML();

  const toggle = mount.querySelector(".site-nav__toggle");
  const tabsMenu = mount.querySelector(".site-nav__tabs");
  const isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  tabsMenu.setAttribute("aria-hidden", String(Boolean(isMobile)));

  toggle.addEventListener("click", function () {
    const isOpen = mount.classList.toggle("site-nav--open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    tabsMenu.setAttribute("aria-hidden", String(!isOpen));
  });

  tabsMenu.addEventListener("click", function (event) {
    if (event.target.classList.contains("site-nav__tab")) {
      mount.classList.remove("site-nav--open");
      toggle.setAttribute("aria-expanded", "false");
      tabsMenu.setAttribute("aria-hidden", "true");
    }
  });
})();
