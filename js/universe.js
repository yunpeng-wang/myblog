// universe.js
let running = false;

let winWidth;
let winHeight;
let starsNum;
let ctx;
let randLow = 0.05;
let cvs = document.getElementById("canvas-dark");
cvs.style.background = "radial-gradient(1600px at 50% 120%, #212750 10%, #070e21 100%)";
let showComet = false;
let colorGiant = "180,184,240";
let colorComet = "226,225,224";
let colorStars = "225,197,"; // random blue channel
let stars;

class MainDraw {
  constructor() {
    this.giant = false;
    this.comet = false;
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.dx = 0;
    this.dy = 0;
    this.fadingOut = null;
    this.fadingIn = true;
    this.opacity = 0;
    this.opacityTresh = 0;
    this.do = 0;

    setTimeout(() => {
      showComet = true;
    }, 50);

    this.initial();
  }

  static concatRGB(rgbString, opacity) {
    return `rgba(${rgbString},${opacity})`;
  }
  static bool2int(b) {
    return b ? 1 : 0;
  }
  static randColorStars(color) {
    let blue = Math.floor(Math.random() * 95) + 160;
    return color + blue;
  }
  static cometChance(x) {
    return Math.floor(1e3 * Math.random()) + 1 < 10 * x; // possibility p(x*10 / 1000) return true
  }
  static getRandom(low, high) {
    return Math.random() * (high - low) + low; // range: [low, high)
  }

  initial() {
    this.giant = MainDraw.cometChance(3);
    this.comet = !this.giant && showComet && MainDraw.cometChance(10);
    this.x = MainDraw.getRandom(10, winWidth);
    this.y = MainDraw.getRandom(0, winHeight);
    this.r = MainDraw.getRandom(1.1, 2.6);
    let low = randLow;
    let ci = MainDraw.bool2int(this.comet);
    this.dx =
      MainDraw.getRandom(low, 6 * low) +
      ci * low * MainDraw.getRandom(50, 120) +
      2 * low;
    this.dy =
      -MainDraw.getRandom(low, 6 * low) -
      ci * low * MainDraw.getRandom(50, 120);
    this.fadingOut = null;
    this.fadingIn = true;
    this.opacity = 0;
    this.opacityTresh = MainDraw.getRandom(0.2, 1 - 0.4 * ci);
    this.do = MainDraw.getRandom(5e-4, 0.002) + 0.001 * ci;
  }

  fadeIn() {
    if (this.fadingIn) {
      this.fadingIn = this.opacity <= this.opacityTresh;
      this.opacity += this.do;
    }
  }

  fadeOut() {
    if (this.fadingOut) {
      this.fadingOut = this.opacity >= 0;
      this.opacity -= this.do / 2;

      if (this.x < 0 || this.y > winHeight) {
        this.fadingOut = false;
        this.initial();
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    if (this.giant) {
      ctx.fillStyle = MainDraw.concatRGB(colorGiant, this.opacity);
      ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    } else if (this.comet) {
      ctx.fillStyle = MainDraw.concatRGB(colorComet, this.opacity);
      ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
      for (let t = 0; t < 30; t++) {
        ctx.fillStyle = MainDraw.concatRGB(
          colorComet,
          this.opacity * (1 - t / 20)
        );
        ctx.rect(
          this.x + (this.dx / 4) * t,
          this.y + (this.dy / 4) * t - 2,
          2,
          2
        );
        ctx.fill();
      }
    } else {
      ctx.fillStyle = MainDraw.concatRGB(
        MainDraw.randColorStars(colorStars),
        this.opacity
      );
      ctx.rect(this.x, this.y, this.r, this.r);
    }
    ctx.closePath();
    ctx.fill();
  }

  move() {
    this.x -= this.dx;
    this.y -= this.dy;
    if (this.fadingOut === false) {
      this.initial();
    }
    if (this.x < winWidth / 4 || this.y > winHeight - winHeight / 4) {
      this.fadingOut = true;
    }
  }
}

function initialCanvas() {
  winWidth = document.documentElement.scrollWidth;
  winHeight = document.documentElement.scrollHeight;
  starsNum = 0.216 * winWidth;
  cvs.setAttribute("width", winWidth);
  cvs.setAttribute("height", winHeight);
  ctx = cvs.getContext("2d");
}

function addStars() {
  stars = [];
  for (let i = 0; i < starsNum; i++) {
    stars[i] = new MainDraw();
  }
}

function mainAnime() {
  ctx.clearRect(0, 0, winWidth, winHeight);
  let len = stars.length;
  for (let i = 0; i < len; i++) {
    let star = stars[i];
    star.move();
    star.fadeIn();
    star.fadeOut();
    star.draw(ctx);
  }
}

function animeLoop() {
  if (!running) return;
  mainAnime();
  window.requestAnimationFrame(animeLoop);
}

function updateAnimationState() {
  const isDark = document.body.classList.contains("dark");
  if (isDark && !running) {
    running = true;
    animeLoop();
  } else if (!isDark && running) {
    running = false;
  }
}

// #start Main code
window.addEventListener("resize", initialCanvas, false);
initialCanvas();
addStars();

const observer = new MutationObserver(updateAnimationState);

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});

updateAnimationState();
// #end Main code
