let srcImage = new Image();
srcImage.src = "/images/resources/sakura.webp";

let cvs = document.getElementById("canvas-light");
cvs.style.background =
  "radial-gradient(1600px at 50% -20%, hsl(338, 77%, 94%) 10%, #fff8f0 60%, #efefef 100%)";
let winWidth;
let winHeight;
let imgNum;
let imgList;
let ctx;
let running = false;
let loaded = false;
let oneDeg = Math.PI / 180;

class Sakura {
  constructor(img) {
    this.img = img;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.dx = 0;
    this.dy = 0;
    this.dw = 0;
    this.size = 0;
    this.opacity = 0;
    this.opacityRate = 0;
    this.opacityThre = 0;
    this.opacityState = true;

    this.initial();
  }

  static randInterval_float(min, max) {
    return Math.random() * (max - min) + min;
  }
  static tuneYpos(maxY) {
    let ret;
    let yRatio = maxY / 5.0;
    let yPos = [0, yRatio, yRatio * 2, yRatio * 3, yRatio * 4];
    let rand = Math.random();
    if (rand < 0.05) {
      ret = Sakura.randInterval_float(yPos[3], yPos[4]);
    } else if (rand >= 0.05 && rand < 0.2) {
      ret = Sakura.randInterval_float(yPos[2], yPos[3]);
    } else if (rand >= 0.2 && rand < 0.5) {
      ret = Sakura.randInterval_float(yPos[1], yPos[2]);
    } else {
      ret = Sakura.randInterval_float(yPos[0], yPos[1]);
    }
    return ret;
  }

  initial() {
    this.x = Sakura.randInterval_float(0, winWidth);
    this.y = Sakura.tuneYpos(winHeight);
    this.w = Sakura.randInterval_float(0, 6);

    this.dx = Sakura.randInterval_float(-0.8, 0.8);
    this.dy = Sakura.randInterval_float(0.4, 1.0);
    this.dw = Sakura.randInterval_float(-oneDeg, oneDeg) * 0.5;

    this.size = Sakura.randInterval_float(5, 20);
    this.opacity = 0.1;
    this.opacityRate = Sakura.randInterval_float(0.002, 0.004);
    this.opacityThre = Sakura.randInterval_float(0.4, 0.9);
    this.opacityState = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.w);
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(
      this.img,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size
    );
    ctx.restore();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.w += this.dw;
    if (this.x > winWidth || this.x < 0 || this.y > winHeight || this.y < 0) {
      this.initial();
    }
    if (this.opacity <= 0 && !this.opacityState) {
      this.initial();
    }
    if (
      this.x > (winWidth * 5) / 6 ||
      this.x < winWidth / 6 ||
      this.y > (winHeight * 5) / 6 ||
      this.y < winHeight / 6
    ) {
      this.opacityState = false;
    }
  }

  fade() {
    if (this.opacityState) {
      if (this.opacity < this.opacityThre) {
        this.opacity += this.opacityRate;
      }
    } else {
      this.opacity -= this.opacityRate;
    }
  }
}

function initialCanvas() {
  winWidth = document.documentElement.scrollWidth;
  winHeight = document.documentElement.scrollHeight;
  imgNum = 0.05 * winWidth;
  cvs.setAttribute("width", winWidth);
  cvs.setAttribute("height", winHeight);
  ctx = cvs.getContext("2d");
}

function createImgObj() {
  imgList = [];
  for (let i = 0; i < imgNum; i++) {
    imgList.push(new Sakura(srcImage));
  }
}

function mainAnime() {
  ctx.clearRect(0, 0, winWidth, winHeight);
  let len = imgList.length;
  for (let i = 0; i < len; i++) {
    let obj = imgList[i];
    obj.draw(ctx);
    obj.fade();
    obj.update();
  }
}

function animeLoop() {
  if (!running) return;
  mainAnime();
  window.requestAnimationFrame(animeLoop);
}

function updateAnimationState() {
  const islight = !document.body.classList.contains("dark");
  if (islight && !running) {
    running = true;
    if (loaded) {
      animeLoop();
    }
  } else if (!islight && running) {
    running = false;
  }
}

// #start Main code
const ro = new ResizeObserver(initialCanvas);
ro.observe(document.documentElement);

window.addEventListener("resize", initialCanvas, false);
initialCanvas();
createImgObj();

const observer = new MutationObserver(updateAnimationState);

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});

srcImage.onload = () => {
  loaded = true;
  updateAnimationState();
};
// #end Main code
