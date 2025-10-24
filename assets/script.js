// Highlight active nav link by filename
(function(){
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav .links a').forEach(a=>{
    const href = (a.getAttribute('href')||'').toLowerCase();
    if ((path === '' && href.endsWith('index.html')) || href.endsWith(path)) {
      a.classList.add('active');
    }
  });
})();
