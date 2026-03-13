(function () {
  /**
   * Removes the 'preload' class from <body> after the page has fully loaded,
   * enabling CSS transitions without a flash of unstyled content on first paint.
   */
  window.addEventListener('load', function () {
    document.body.classList.remove('preload');
  });
})();
