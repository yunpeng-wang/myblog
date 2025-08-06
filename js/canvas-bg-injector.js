(function () {
  const STORAGE_KEY = 'canvas-bg-scripts';

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    const { dark, light } = JSON.parse(stored);
    [dark, light].forEach(loadScript);
    return;
  }

  const darkScripts = [
    '/js/universe.js'
  ];
  const lightScripts = [
    '/js/petals.js'
  ];

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const selected = {
    dark: pick(darkScripts),
    light: pick(lightScripts)
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  [selected.dark, selected.light].forEach(loadScript);

  function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.type = "module";
    // script.onload = () => console.log(`🪐 Canvas BG script loaded: ${src}`);
    document.head.appendChild(script);
  }
})();
