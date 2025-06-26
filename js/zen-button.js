// for zen-button.html
let spinStartTime = null;

function toggleZenMode() {
const html = document.documentElement;
const icon = document.getElementById("zen-icon");
const audio = document.getElementById("zen-audio");
const isOn = html.classList.toggle("zen-on");

html.style.setProperty("--zen-duration", "0.9s");
html.style.transition = "filter var(--zen-duration) ease";
html.classList.toggle("grayscale", isOn);

icon.classList.remove("rotate-forward", "rotate-back", "spinning");
void icon.offsetWidth; // Reflow

if (isOn) {
    // start spinning
    icon.classList.add("spinning");
    spinStartTime = Date.now();

    try {
    audio.volume = 0;
    audio.currentTime = 0;
    audio.play();

    // aduio fade in
    let vol = 0;
    const fadeIn = setInterval(() => {
        vol = Math.min(vol + 0.05, 1);
        audio.volume = vol;
        if (vol >= 1) clearInterval(fadeIn);
    }, 100);
    } catch (e) {
    console.warn("Autoplay failed or blocked", e);
    }
} else {
    // 计算角度，补到360°
    const elapsed = Date.now() - spinStartTime;
    const deg = (elapsed / 10000) * 360; // v1 = 10s = 10000ms
    const remaining = 360 - (deg % 360);
    const currentRotation = deg % 360;

    icon.style.animation = "none"; // 强制结束旧动画
    icon.style.transform = `rotate(${currentRotation}deg)`;
    void icon.offsetWidth;

    icon.style.transition = `transform var(--zen-spin-v2) linear`;
    icon.style.transform = `rotate(${currentRotation + remaining}deg)`;

    setTimeout(() => {
    icon.style.transition = "none";
    icon.style.transform = `rotate(0deg)`;
    }, 500); // v2 = 0.5s

    // aduio fade out
    let vol = audio.volume;
    const fadeOut = setInterval(() => {
    vol = Math.max(vol - 0.05, 0);
    audio.volume = vol;
    if (vol <= 0) {
        clearInterval(fadeOut);
        audio.pause();
    }
    }, 100);
}
sessionStorage.setItem("zenMode", isOn ? "on" : "off");
}

window.addEventListener("DOMContentLoaded", () => {
const html = document.documentElement;
const icon = document.getElementById("zen-icon");
const isOn = sessionStorage.getItem("zenMode") === "on";

if (isOn) {
    html.classList.add("zen-on", "grayscale");
    icon.classList.add("spinning");
    spinStartTime = Date.now();
}
});
