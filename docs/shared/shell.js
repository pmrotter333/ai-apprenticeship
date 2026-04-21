/* ============================================================
   AI Apprenticeship — Shared Navigation Shell
   shell.js
   ============================================================
   Injects consistent header/nav and footer into every spoke page.
   Call Shell.init() at the bottom of each page's <body>.
   ============================================================ */

const Shell = (() => {

  function nav(activePage) {
    return `
<header class="site-header">
  <div class="site-header__inner">
    <a href="../index.html" class="site-logo">AI Apprenticeship</a>
    <nav class="site-nav" aria-label="Primary">
      <a href="../methodology/index.html"${activePage === 'methodology' ? ' aria-current="page"' : ''}>Framework</a>
      <a href="../projects/index.html"${activePage === 'projects' ? ' aria-current="page"' : ''}>Projects</a>
      <a href="../about/index.html"${activePage === 'about' ? ' aria-current="page"' : ''}>About</a>
    </nav>
  </div>
</header>`;
  }

  function footer() {
    return `
<footer class="site-footer">
  <div class="site-footer__inner">
    <a href="https://github.com/pmrotter333/ai-apprenticeship" target="_blank" rel="noopener">GitHub</a>
    <a href="../methodology/index.html">Framework</a>
    <a href="../projects/index.html">Projects</a>
    <a href="../index.html">Home</a>
  </div>
</footer>`;
  }

  function init(activePage = '') {
    const headerTarget = document.getElementById('site-header');
    const footerTarget = document.getElementById('site-footer');
    if (headerTarget) headerTarget.outerHTML = nav(activePage);
    if (footerTarget) footerTarget.outerHTML = footer();
  }

  return { init };
})();
