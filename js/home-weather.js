// for weather in home-widget.html
const icons = [
  "sun.png",
  "rain.png",
  "thunder.png",
  "cloud.png",
  "snow.png",
  "wind.png",
  "overcast.png",
];

const img = document.getElementById("weather-icon");
const key = "weatherIcon";

let icon = sessionStorage.getItem(key);

// 如果没有缓存，就随机一个
if (!icon) {
  icon = icons[Math.floor(Math.random() * icons.length)];
  sessionStorage.setItem(key, icon);
}

img.src = `/images/icons/${icon}`;
img.alt = icon.replace(".png", ""); // 语义化
