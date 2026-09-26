/* Wires up .theme-toggle buttons on the static pages (the React app uses <ThemeToggle />). */
(function () {
  var KEY = "optimais-theme";
  var root = document.documentElement;

  function current() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }

  function apply(mode) {
    root.setAttribute("data-theme", mode);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    sync();
  }

  function sync() {
    var light = current() === "light";
    var buttons = document.querySelectorAll(".theme-toggle");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", light ? "true" : "false");
      buttons[i].setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
      buttons[i].setAttribute("title", light ? "Switch to dark mode" : "Switch to light mode");
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".theme-toggle");
    if (btn) apply(current() === "light" ? "dark" : "light");
  });

  window.addEventListener("storage", function (e) {
    if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) {
      root.setAttribute("data-theme", e.newValue);
      sync();
    }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();
})();
