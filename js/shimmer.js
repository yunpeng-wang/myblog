// shimmer.js
let running = false;

let winWidth;
let winHeight;
let particlesNum;
let ctx;
let randLow = 0.02;
let cvs = document.getElementById("canvas-shimmer");
let particles;

let colorMain = ["#dcdcdc", "#e8e8e8", "#bfbfbf", "#c9d1d9"];
let colorSub = [
  "#fceabb",
  "#fbeec1",
  "#f0e2b6",
  "#e5d8b0",
  "#f0f8ff",
  "#e6f0f7",
  "#d7e9f7",
];
let colorDecor = ["#cde3f3", "#f9d5ca", "#fbd1a2"];
let colorGroup = [colorMain, colorSub, colorDecor];

class MainDraw {
  constructor() {
    this.particleClass = 0; // 0 for main, 1 for sub, 2 for decor
    this.opacityState = 1; // -1 decrement, 1 increment, 0 random
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.dx = 0;
    this.dy = 0;
    this.opacity = 0;
    this.opacityTresh = 0;
    this.do = 0;
    this.color = null;

    this.initial();
  }

  static chooseColor(pc) {
    let selColorGroup = colorGroup[pc];
    return selColorGroup[MainDraw.rollDice(selColorGroup.length)];
  }
  static chooseParticleClass() {
    // possibility: 0.7 for main, 0.2 for sub, 0.1 for decor
    let ret;
    let p = Math.random();
    if (p >= 0.7 && p <= 0.9) {
      ret = 1;
    } else if (p > 0.9) {
      ret = 2;
    } else {
      ret = 0;
    }
    return ret;
  }
  static hexToRgbString(hex) {
    const intVal = parseInt(hex.slice(1), 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    return `${r},${g},${b}`;
  }
  static concatRGB(rgbString, opacity) {
    return `rgba(${rgbString},${opacity})`;
  }
  static createGradient(ctx, obj) {
    let grd = ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, obj.r);
    grd.addColorStop(0, MainDraw.concatRGB(obj.color, obj.opacity));
    grd.addColorStop(0.2, MainDraw.concatRGB(obj.color, obj.opacity));
    grd.addColorStop(1, MainDraw.concatRGB(obj.color, 0));

    return grd;
  }
  static getRandom(low, high) {
    return Math.random() * (high - low) + low; // range: [low, high)
  }
  static throwCoin() {
    return Math.random() < 0.5 ? true : false;
  }
  static rollDice(point) {
    return Math.floor(Math.random() * point);
  }

  initial() {
    this.particleClass = MainDraw.chooseParticleClass();
    this.opacityState = 1;
    this.x = MainDraw.getRandom(10, winWidth - 10);
    this.y = MainDraw.getRandom(10, winHeight);
    this.r = MainDraw.getRandom(1.1, 5.6 - 0.5 * this.particleClass);
    let low = randLow;
    this.dx =
      (MainDraw.getRandom(low, 6 * low) +
        this.particleClass * low * MainDraw.getRandom(50, 120)) *
      0.5;
    this.dy = this.dx * -1 * MainDraw.getRandom(1.5, 2.0);
    this.opacity = 0;
    this.opacityTresh = MainDraw.getRandom(0.2, 0.6 + 0.2 * this.particleClass);
    this.do = MainDraw.getRandom(5e-4, 0.002) + 0.001 * this.particleClass;
    this.color = MainDraw.hexToRgbString(
      MainDraw.chooseColor(this.particleClass)
    );
  }

  move() {
    this.x += this.dx * (MainDraw.throwCoin() ? 1 : -1);
    this.y += this.dy;
    if (
      this.x < winWidth / 5 ||
      this.x > (winWidth * 4) / 5 ||
      this.y < winHeight / 5
    ) {
      this.opacityState = -1;
    }
    if (this.x < 0 || this.x > winWidth || this.y < 0) {
      this.initial();
    }
  }

  fade() {
    if (this.opacity <= this.opacityTresh && this.opacity >= 0) {
      if (this.opacityState > 0) {
        this.opacity += this.do;
      } else if (this.opacityState < 0) {
        this.opacity -= this.do;
      } else {
        this.opacity += this.do * (MainDraw.throwCoin() ? 1 : -1);
      }
    }
    if (this.opacity > this.opacityTresh * 0.8) {
      this.opacityState = 0;
    }
    if (this.opacity < 0) {
      this.initial();
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = MainDraw.createGradient(ctx, this);
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}

function initialCanvas() {
  winWidth = document.documentElement.scrollWidth;
  winHeight = document.documentElement.scrollHeight;
  particlesNum = 0.216 * winWidth;
  cvs.setAttribute("width", winWidth);
  cvs.setAttribute("height", winHeight);
  ctx = cvs.getContext("2d");
}

function addParticles() {
  particles = [];
  for (let i = 0; i < particlesNum; i++) {
    particles[i] = new MainDraw();
  }
}

function mainAnime() {
  ctx.clearRect(0, 0, winWidth, winHeight);
  let len = particles.length;
  for (let i = 0; i < len; i++) {
    let particle = particles[i];
    particle.move();
    particle.fade();
    particle.draw(ctx);
  }
}

function animeLoop() {
  if (!running) return;
  mainAnime();
  window.requestAnimationFrame(animeLoop);
}

function updateAnimationState() {
  const isLight = !document.body.classList.contains("dark");
  if (isLight && !running) {
    running = true;
    animeLoop();
  } else if (!isLight && running) {
    running = false;
  }
}

// #start Main code
window.addEventListener("resize", initialCanvas, false);
initialCanvas();
addParticles();

const observer = new MutationObserver(updateAnimationState);

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});

updateAnimationState();
// #end Main code
