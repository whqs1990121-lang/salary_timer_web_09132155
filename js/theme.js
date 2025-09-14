// 主题管理模块
const themeManager = {
    // 当前主题
    currentTheme: 'light',
    
    // 初始化主题
    init: function() {
        // 从本地存储加载主题
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        }
        
        // 监听系统主题变化
        this.watchSystemTheme();
    },
    
    // 应用主题
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // 更新主题图标
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.src = theme === 'light' ? 'assets/icons/moon.png' : 'assets/icons/sun.png';
        }
        
        // 保存到本地存储
        localStorage.setItem('theme', theme);
    },
    
    // 切换主题
    toggleTheme: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        return newTheme;
    },
    
    // 监听系统主题变化
    watchSystemTheme: function() {
        // 检查浏览器是否支持主题媒体查询
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // 如果用户没有设置明确的主题偏好，跟随系统主题
            if (!localStorage.getItem('theme')) {
                this.applyTheme(darkModeQuery.matches ? 'dark' : 'light');
            }
            
            // 监听系统主题变化
            darkModeQuery.addEventListener('change', (e) => {
                // 只有当用户没有明确设置主题偏好时，才跟随系统变化
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
};

// 页面加载完成后初始化主题
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});