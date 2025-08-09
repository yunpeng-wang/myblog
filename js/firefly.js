let running = false;

let winWidth;
let winHeight;
let xLeftBoundary;
let xRightBoundary;
let yUpperBoundary;
let yBottomBoundary;
let insectNum;
let insects;
let cvs = document.getElementById("canvas-dark");
cvs.style.background =
  "radial-gradient(1600px at 50% 120%, #1b3c2b 0%, #0e2a24 40%, #050910 100%)";

class Firefly {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;

    this.t0 = 0;

    this.multi = 0;

    this.coreRadius = 0;
    this.glowRadius = 0;
    this.scatterRadius = 0;
    this.baseCoreAlpha = 0;
    this.baseGlowAlpha = 0;
    this.baseScatterAlpha = 0;
    this.breathFreq = 0;
    this.breathStrength = 0;
    this.flickerIntensity = 0;
    this.flickerInterval = 0;
    this.flickerSmooth = 0;

    this.breathFactor = 0;
    this.flickerCurrent = 0;
    this.flickerTarget = 0;
    this.lastFlickerChange = 0;

    this.initial();
  }

  static randInterval_float(min, max) {
    return Math.random() * (max - min) + min;
  }

  static throwCoin() {
    return Math.random() < 0.5 ? 1 : -1;
  }

  initial() {
    this.x = Firefly.randInterval_float(0, winWidth);
    this.y = Firefly.randInterval_float(0, winHeight);
    this.dx = Firefly.randInterval_float(-0.3, 0) * Firefly.throwCoin();
    this.dy = Firefly.randInterval_float(-0.3, 0) * Firefly.throwCoin();

    this.t0 = performance.now();

    this.multi = Firefly.randInterval_float(1, 3);

    this.coreRadius = this.multi * 1;
    this.glowRadius = this.multi * 4;
    this.scatterRadius = (this.multi / 1.5) * 20;
    this.baseCoreAlpha = this.multi * 0.3;
    this.baseGlowAlpha = this.multi * 0.1 + 0.2;
    this.baseScatterAlpha = this.multi * 0.03;
    this.breathFreq = Firefly.randInterval_float(0.35, 0.65);
    this.breathStrength = Firefly.randInterval_float(0.1, 0.2);
    this.flickerIntensity = Firefly.randInterval_float(0.1, 0.4);
    this.flickerInterval = Math.floor(Firefly.randInterval_float(100, 1000));
    this.flickerSmooth = Firefly.randInterval_float(0.14, 0.24);

    this.breathFactor = 0;
    this.flickerCurrent = 0;
    this.flickerTarget = 0;
    this.lastFlickerChange = 0;
  }

  update() {
    const now = performance.now();
    const t = (now - this.t0) / 1000;
    const breath = (Math.sin(2 * Math.PI * this.breathFreq * t) + 1) * 0.5;
    this.breathFactor = 1 + (breath - 0.5) * 2 * this.breathStrength;

    if (now - this.lastFlickerChange > this.flickerInterval) {
      this.lastFlickerChange = now;
      this.flickerTarget = (Math.random() * 2 - 1) * this.flickerIntensity;
    }
    this.flickerCurrent +=
      (this.flickerTarget - this.flickerCurrent) * this.flickerSmooth;

    this.x += this.dx;
    this.y += this.dy;
  }

  draw(ctx) {
    const coreR = this.coreRadius;
    const glowR = this.glowRadius * this.breathFactor;
    const scatterR = this.scatterRadius * (1 + (this.breathFactor - 1) * 0.6);

    // adjust transparency
    const coreAlpha = Math.min(
      Math.max(this.baseCoreAlpha * (1 + this.flickerCurrent), 0),
      1.6
    );
    const glowAlpha = Math.min(
      Math.max(
        this.baseGlowAlpha *
          this.breathFactor *
          (1 + this.flickerCurrent * 0.6),
        0
      ),
      0.95
    );
    const scatterAlpha = Math.min(
      Math.max(
        this.baseScatterAlpha *
          this.breathFactor *
          (1 + this.flickerCurrent * 0.4),
        0
      ),
      0.25
    );

    // outer layer
    let scatterGrad = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      scatterR
    );
    scatterGrad.addColorStop(0, `rgba(200,255,200,${scatterAlpha})`);
    scatterGrad.addColorStop(1, `rgba(200,255,200,0)`);
    ctx.fillStyle = scatterGrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, scatterR, 0, Math.PI * 2);
    ctx.fill();

    // mid layer
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 24;
    ctx.shadowColor = `rgba(173,255,47,${glowAlpha})`;
    let glowGrad = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      glowR
    );
    glowGrad.addColorStop(0, `rgba(144,238,144,${glowAlpha})`);
    glowGrad.addColorStop(1, `rgba(144,238,144,0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // inner layer - core
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(255,255,200,${coreAlpha})`;
    let coreGrad = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      coreR
    );
    coreGrad.addColorStop(0, `rgba(173,255,47,${coreAlpha})`);
    coreGrad.addColorStop(1, `rgba(173,255,47,0.16)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  maintain() {
    if (
      (this.y <= yUpperBoundary && this.dy < 0) ||
      (this.y >= yBottomBoundary && this.dy > 0)
    ) {
      this.dy *= -1;
    }
    if (
      (this.x <= xLeftBoundary && this.dx < 0) ||
      (this.x >= xRightBoundary && this.dx > 0)
    ) {
      this.dx *= -1;
    }
  }
}

function initialCanvas() {
  winWidth = document.documentElement.scrollWidth;
  winHeight = document.documentElement.scrollHeight;

  let xRatio;
  let yRatio;
  if (winWidth > winHeight) {
    xRatio = 6;
    yRatio = 8;
  } else {
    xRatio = 8;
    yRatio = 6;
  }
  xLeftBoundary = winWidth / xRatio;
  xRightBoundary = winWidth - xLeftBoundary;
  yUpperBoundary = winHeight / yRatio;
  yBottomBoundary = winHeight - yUpperBoundary;

  insectNum = 0.05 * winWidth;
  cvs.setAttribute("width", winWidth);
  cvs.setAttribute("height", winHeight);
  ctx = cvs.getContext("2d");
}

function addInsects() {
  insects = [];
  for (let i = 0; i < insectNum; i++) {
    insects[i] = new Firefly();
  }
}

function mainAnime() {
  ctx.clearRect(0, 0, winWidth, winHeight);
  let len = insects.length;
  for (let i = 0; i < len; i++) {
    let insect = insects[i];
    insect.update();
    insect.draw(ctx);
    insect.maintain();
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
addInsects();

const observer = new MutationObserver(updateAnimationState);

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});

updateAnimationState();
// #end Main code
