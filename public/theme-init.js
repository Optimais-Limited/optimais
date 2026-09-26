/* Runs synchronously in <head> so the saved theme is applied before first paint. Default: dark. */
(function () {
  var theme = "dark";
  try {
    var saved = localStorage.getItem("optimais-theme");
    if (saved === "light" || saved === "dark") theme = saved;
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", theme);
})();
