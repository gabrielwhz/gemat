/*
  Transição suave entre páginas.

  Como index.html, paginas/login.html e paginas/cadastro.html são
  documentos HTML separados, o navegador troca de um pro outro na marra
  por padrão — é isso que causava o "corte seco".

  A entrada (fade-in) é feita só com CSS, em style.css (animação
  pageFadeIn no body) — funciona mesmo se este script não carregar.
  Este script cuida apenas da saída: intercepta cliques em links internos,
  aplica um fade-out rápido e só então navega para a próxima página.

  Links externos, âncoras (#problema), abrir em nova aba, download e
  cliques com Ctrl/Cmd/Shift continuam funcionando normalmente, sem fade.
*/

(function () {
  const FADE_MS = 200;

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a');
    if (!link || !link.getAttribute('href')) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (err) {
      return;
    }

    // Só intercepta links do próprio site
    if (url.origin !== window.location.origin) return;

    const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;
    if (isSamePage && url.hash) return; // âncora na mesma página: deixa o scroll suave normal cuidar disso

    event.preventDefault();
    document.body.classList.add('page-leaving');
    window.setTimeout(() => {
      window.location.href = link.href;
    }, FADE_MS);
  });
})();