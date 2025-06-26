// for custom-mainbg.html
document.addEventListener("DOMContentLoaded", () => {
    const themes = [
    {
        name: "set1",
        birds: [
        {
            light: { src: '/images/main_bg/crane_light.webp', x: 0.88, y: 0.73, width:70 },
            dark:  { src: '/images/main_bg/crane_dark.webp', x: -0.18, y: 0.73, width:70  }
        },
        {
            light: { src: '/images/main_bg/twobirds_light.webp', x: -0.3, y: 0.3, width:70  },
            dark:  { src: '/images/main_bg/twobirds_dark.webp', x: 1.0, y: 0.3, width:70  }
        }
        ]
    },
    {
        name: "set2",
        birds: [
        {
            light: { src: '/images/main_bg/lion_light.webp', x: -0.3, y: 0.75, width:70  },
            dark:  { src: '/images/main_bg/lion_dark.webp', x: 1.1, y: 0.4, width:70  }
        },
        {
            light: { src: '/images/main_bg/gazelle_light.webp', x: 0.95, y: 0.74, width:70  },
            dark:  { src: '/images/main_bg/gazelle_dark.webp', x: -0.35, y: 0.4, width:70  }
        }
        ]
    },
    {
        name: "set3",
        birds: [
        {
            light: { src: '/images/main_bg/eagle_light.webp', x: 1.0, y: 0.3, width:60  },
            dark:  { src: '/images/main_bg/hawk_dark.webp', x: -0.21, y: 0.7, width:60  }
        },
        {
            light: { src: '/images/main_bg/mouse_light.webp', x: -0.25, y: 0.8, width:40  },
            dark:  { src: '/images/main_bg/rat_dark.webp', x: -0.25, y: 0.8, width:40  }
        }
        ]
    }
    ];
    const sel_theme = themes[Math.floor(Math.random() * themes.length)];

    function isMobile() {
        return Math.min(window.innerWidth, window.innerHeight) < 600;  // 你可以根据实际调大或调小这个数值
    }
    
    function waitForProfileInner(callback, retries = 20) {
        const el = document.querySelector(".profile_inner");
        if (el) {
            callback(el);
        } else if (retries > 0) {
            setTimeout(() => waitForProfileInner(callback, retries - 1), 200);
        } else {
            console.warn("⚠️ .profile_inner not found after retries.");
        }
    }

    function updateBirdLayerBounds() {
        const header = document.querySelector("header");
        const footer = document.querySelector("footer");
        const birdLayer = document.querySelector(".bg-bird-layer");
        if (!header || !footer || !birdLayer) return;

        const headerHeight = header.offsetHeight;
        const footerHeight = footer.offsetHeight;

        document.documentElement.style.setProperty('--real-header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--real-footer-height', `${footerHeight}px`);
    }

    function updateBackground() {
        if(!(isMobile())){
            const isDark = document.body.classList.contains("dark");
            const birdLayer = document.querySelector(".bg-bird-layer");
            const anchor = document.querySelector(".profile_inner");
            const rect = anchor.getBoundingClientRect();

            birdLayer.innerHTML = "";
            
            sel_theme.birds.forEach(b => {
                const config = isDark ? b.dark : b.light;
                const img = document.createElement("img");
                img.src = config.src;
                img.style.position = "absolute";
                img.style.top = `${rect.top + rect.height * config.y}px`;
                img.style.left = `${rect.left + rect.width * config.x}px`;
                img.style.width = (config.width || 60) + "px";
                img.style.opacity = config.opacity ?? 0.8;
                img.style.zIndex = config.z ?? "auto";
                birdLayer.appendChild(img);
            });
        }
    }

    updateBirdLayerBounds()
    waitForProfileInner(() => {
        updateBackground();
    });

    // 监听 body class 变化（主题切换）
    const observer = new MutationObserver(updateBackground);
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"]
    });

    // 监听屏幕大小变化（横竖切换）
    window.addEventListener('resize', () => {
        updateBirdLayerBounds();
        updateBackground();
    });
});
