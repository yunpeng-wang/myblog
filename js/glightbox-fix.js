document.addEventListener('DOMContentLoaded', function () {
  // 初始化 lightbox
  if (typeof GLightbox !== "function") {
    console.error("GLightbox unloaded, initialization failed.");
    return;
  }

  const lightbox = GLightbox({ selector: '.glightbox' });
  const mainEl = document.querySelector('main.main');

  lightbox.on('open', () => {
    const glb = document.getElementById('glightbox-body');
    const scrollY = window.scrollY || window.pageYOffset;
    document.documentElement.style.setProperty('--scroll-offset', `-${scrollY}px`);
    document.documentElement.style.setProperty('--viewport-top', `${scrollY}px`);
    document.body.style.overflow = 'hidden';

    if (mainEl) {
      mainEl.inert = true;                   // 阻止 focus 及交互
      mainEl.setAttribute('aria-hidden', 'true');
    }
    if (glb) {
      glb.removeAttribute('aria-hidden');
      glb.inert = false;
      glb.focus({ preventScroll: true });
    }
    //console.log('Glightbox opened at scroll position:', scrollY);
  });

  lightbox.on('close', () => {
    document.body.style.overflow = '';
    if (mainEl) {
      mainEl.inert = false;
      mainEl.removeAttribute('aria-hidden');
    }
    //console.log('Glightbox closed');
  });
});