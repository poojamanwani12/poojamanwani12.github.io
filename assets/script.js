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

// --- Carousel init (3-at-once, responsive, autoplay) ---
(function () {
  const carousels = document.querySelectorAll('.carousel');
  if (!carousels.length) return;

  carousels.forEach(setupCarousel);

  function setupCarousel(car) {
    const track = car.querySelector('.car-track');
    const slides = Array.from(car.querySelectorAll('.car-slide'));
    const prev = car.querySelector('.prev');
    const next = car.querySelector('.next');
    const autoplay = car.getAttribute('data-autoplay') === 'true';
    const intervalMs = parseInt(car.getAttribute('data-interval') || '3000', 10);

    let current = 0;
    let timer = null;

    // Clone edges for seamless looping
    const clonesBefore = slides.slice(-3).map(cloneSlide);
    const clonesAfter = slides.slice(0, 3).map(cloneSlide);

    clonesBefore.forEach(c => track.insertBefore(c, track.firstChild));
    clonesAfter.forEach(c => track.appendChild(c));

    function cloneSlide(slide) {
      const c = slide.cloneNode(true);
      c.classList.add('is-clone');
      return c;
    }

    // Calculate sizes on load & resize
    function getVisibleCount() {
      const w = car.offsetWidth;
      if (w <= 560) return 1;
      if (w <= 980) return 2;
      return 3;
    }

    function slideWidth() {
      // any slide will do after layout
      const el = track.querySelector('.car-slide');
      return el ? el.getBoundingClientRect().width + 12 /*gap*/ : 0;
    }

    function setPosition() {
      const sw = slideWidth();
      if (!sw) return;
      const visible = getVisibleCount();
      // Start offset equals number of clonesBefore (3)
      const offsetIndex = current + clonesBefore.length;
      const translate = -offsetIndex * sw;
      track.style.transform = `translate3d(${translate}px,0,0)`;
    }

    function goto(index) {
      const total = slides.length;
      current = index;
      setPosition();

      // Handle jump for infinite effect
      const visible = getVisibleCount();
      // Left overflow
      if (current < 0) {
        current = total - visible;
        freezeThen(() => setPosition());
      }
      // Right overflow
      if (current > total - visible) {
        current = 0;
        freezeThen(() => setPosition());
      }
    }

    function freezeThen(cb) {
      // Disable transition, jump, then re-enable for seamless effect
      const t = track.style.transition;
      track.style.transition = 'none';
      cb();
      // Force reflow
      // eslint-disable-next-line no-unused-expressions
      track.offsetHeight;
      track.style.transition = t || 'transform .6s ease';
    }

    function nextSlide() { goto(current + 1); }
    function prevSlide() { goto(current - 1); }

    // Controls
    if (next) next.addEventListener('click', nextSlide);
    if (prev) prev.addEventListener('click', prevSlide);

    // Autoplay
    function start() {
      if (!autoplay) return;
      stop();
      timer = setInterval(nextSlide, intervalMs);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // Init
    window.addEventListener('resize', setPosition);
    // Ensure a transition is defined
    if (!track.style.transition) track.style.transition = 'transform .6s ease';
    // Give layout a tick
    requestAnimationFrame(() => {
      setPosition();
      start();
    });
  }
})();

