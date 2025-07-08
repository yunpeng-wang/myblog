const socialIconSvg = document.querySelectorAll(".social-icons a svg")
const svgLen = socialIconSvg.length

function createRandomInterval(min, max) {
    // get intervel in [min, max)
    return (Math.random() * (max -min)) + min
}

function doRandomAnime() {
    let count = Math.random() < 0.9 ? 1 : 2; // 90% 只动 1 个，30% 动 2 个
    let selected = new Set();

    while (selected.size < count) {
        let i = Math.floor(Math.random() * svgLen);
        selected.add(i);
    }

    for (let i of selected) {
        let selSvg = socialIconSvg[i];
        selSvg.classList.add("svg-anime-mobile");

        selSvg.addEventListener("animationend", function handler() {
            selSvg.classList.remove("svg-anime-mobile");
            selSvg.removeEventListener("animationend", handler);
        });
    }
    setTimeout(doRandomAnime, createRandomInterval(1.5, 2.5) * 1000);
}

doRandomAnime();

