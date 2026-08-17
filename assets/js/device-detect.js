/* ==========================================================================
   CARTRIDGE - DEVICE DETECTION
   Shows a one-time modal asking Mobile or Desktop, remembers the choice
   in localStorage, and exposes it as a class on <body> for CSS/JS hooks.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "cartridge_device_preference";
  const modal = document.getElementById("device-check-modal");

  // Bail early if this page has no modal markup (safety check for future pages)
  if (!modal) return;

  /**
   * Applies the chosen device mode to <body> so CSS can react
   * e.g. .has-hover enables the cartridge tile hover-lift effect
   */
  function applyDeviceMode(mode) {
    document.body.classList.remove("device-mobile", "device-desktop", "has-hover");

    if (mode === "desktop") {
      document.body.classList.add("device-desktop", "has-hover");
    } else {
      document.body.classList.add("device-mobile");
    }
  }

  /**
   * Saves the user's choice and hides the modal
   */
  function setDevicePreference(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (err) {
      // localStorage may be unavailable (private browsing, storage full, etc.)
      // Fail silently - device mode still applies for this session via applyDeviceMode
      console.warn("Cartridge: could not save device preference", err);
    }
    applyDeviceMode(mode);
    modal.setAttribute("hidden", "");
  }

  /**
   * On load: check for a saved preference. If found, apply it and skip the modal.
   * If not found, show the modal and wait for a choice.
   */
  function init() {
    let savedMode = null;

    try {
      savedMode = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Cartridge: could not read device preference", err);
    }

    if (savedMode === "mobile" || savedMode === "desktop") {
      applyDeviceMode(savedMode);
      modal.setAttribute("hidden", "");
    } else {
      modal.removeAttribute("hidden");
    }
  }

  // Wire up the two choice buttons inside the modal
  modal.querySelectorAll("[data-device]").forEach(function (button) {
    button.addEventListener("click", function () {
      setDevicePreference(button.getAttribute("data-device"));
    });
  });

  // TODO: add a "change device mode" link/button somewhere (settings tab?)
  // so users aren't locked into their first choice permanently

  init();
})();
