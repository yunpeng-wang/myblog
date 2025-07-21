// Modify the SVG animation on the homepage. 
// This modification works only on mobile devices.
// The animation for desktop is created using CSS.

import { animate, svg, stagger } from "./anime.esm.min.js";

const socialIconSvg = document.querySelectorAll(".social-icons a svg");
const svgLen = socialIconSvg.length;
const isProbablyTouch =
  window.matchMedia("(pointer: coarse)").matches ||
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0;

function createRandomInterval(min, max) {
  // get intervel in [min, max)
  return Math.random() * (max - min) + min;
}

function addClass(arr, className) {
  arr.forEach((element) => {
    element.classList.add(className);
  });
}

function deleteClass(arr, className) {
  arr.forEach((element) => {
    element.classList.remove(className);
  });
}

function doRandomAnime() {
  let i = Math.floor(Math.random() * svgLen);
  let selSvg = socialIconSvg[i];
  let svgChild = selSvg.querySelectorAll("path, rect, polygon");

  addClass(svgChild, "svg-anime-mobile");

  animate(svg.createDrawable(".svg-anime-mobile"), {
    draw: ["0 1", "1 1", "0 0", "0 1"],
    ease: "inOutElastic(.5, .4)",
    duration: 2000,
    delay: stagger(100),
    loop: false,
  });

  deleteClass(svgChild, "svg-anime-mobile");

  setTimeout(doRandomAnime, createRandomInterval(5, 10) * 1000);
}

if (isProbablyTouch) {
  doRandomAnime();
}
