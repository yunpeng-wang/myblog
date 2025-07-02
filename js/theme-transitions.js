document.addEventListener('DOMContentLoaded', function() {
  // 1. 添加性能优化样式
  const performanceStyle = document.createElement('style');
  performanceStyle.textContent = `
    .theme-transitioning * {
      will-change: background-color, color, border-color;
    }
    
    /* 为固定位置元素添加单独优化 */
    header, footer, .fixed-element {
      will-change: background-color, box-shadow;
    }
  `;
  document.head.appendChild(performanceStyle);
  
  // 2. 保存原始切换函数
  const originalThemeToggle = window.toggleTheme;
  
  // 3. 创建新的平滑切换函数
  window.toggleTheme = function() {
    // 添加过渡类
    document.documentElement.classList.add('theme-transitioning');
    
    // 设置超时确保过渡生效
    setTimeout(() => {
      // 调用原始切换函数
      originalThemeToggle();
      
      // 过渡结束后移除类
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--theme-transition-duration')) * 1000);
    }, 10);
  };
  
  // 4. 监听系统主题变化
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', e => {
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      const theme = e.matches ? 'dark' : 'light';
      document.body.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('pref-theme', theme);
      
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--theme-transition-duration')) * 1000);
    }, 10);
  });
  
  // 5. 添加过渡状态指示器（可选）
  const spinner = document.createElement('div');
  spinner.id = 'theme-transition-spinner';
  spinner.style = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid var(--primary);
    border-top-color: transparent;
    opacity: 0;
    pointer-events: none;
    z-index: 10000;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(spinner);
  
  // 监听过渡开始/结束
  document.documentElement.addEventListener('theme-transition-start', () => {
    spinner.style.opacity = '1';
    spinner.style.animation = 'theme-spinner 1s linear infinite';
  });
  
  document.documentElement.addEventListener('theme-transition-end', () => {
    spinner.style.opacity = '0';
    spinner.style.animation = 'none';
  });
  
  // 添加动画关键帧
  const spinnerStyle = document.createElement('style');
  spinnerStyle.textContent = `
    @keyframes theme-spinner {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinnerStyle);
});

// 创建自定义事件触发机制
const themeTransitionEvents = {
  start: new Event('theme-transition-start'),
  end: new Event('theme-transition-end')
};

// 修改切换函数以触发事件
(function() {
  const originalToggle = window.toggleTheme;
  
  window.toggleTheme = function() {
    document.documentElement.dispatchEvent(themeTransitionEvents.start);
    originalToggle();
    
    setTimeout(() => {
      document.documentElement.dispatchEvent(themeTransitionEvents.end);
    }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--theme-transition-duration')) * 1000);
  };
})();
