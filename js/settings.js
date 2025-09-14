// 设置管理对象
const settingsManager = {
    // 状态变量
    workSettings: {
        daysPerWeek: 5,
        hoursPerDay: 8,
        vacationDays: 15
    },
    
    displaySettings: {
        theme: 'light',
        decimalPlaces: 2,
        useThousandSeparator: true
    },
    
    currencySettings: {
        defaultInputCurrency: 'CNY',
        defaultDisplayCurrency: 'CNY'
    },
    
    exchangeRateSettings: {
        updateFrequency: 'daily',
        offlineMode: false
    },
    
    // 汇率数据
    exchangeRates: {
        CNY: 1,
        USD: 0.1394,
        GBP: 0.1079,
        JPY: 15.1823,
        EUR: 0.1281,
        HKD: 1.0853
    },
    
    // 上次更新时间
    ratesLastUpdated: null,
    
    // 初始化
    init: function() {
        // 加载设置
        this.loadSettings();
        
        // 初始化UI
        this.initUI();
        
        // 添加事件监听
        this.addEventListeners();
    },
    
    // 加载设置
    loadSettings: function() {
        // 加载工作设置
        const workSettings = localStorage.getItem('workSettings');
        if (workSettings) {
            this.workSettings = JSON.parse(workSettings);
        }
        
        // 加载显示设置
        const displaySettings = localStorage.getItem('displaySettings');
        if (displaySettings) {
            this.displaySettings = JSON.parse(displaySettings);
        }
        
        // 加载货币设置
        const currencySettings = localStorage.getItem('currencySettings');
        if (currencySettings) {
            this.currencySettings = JSON.parse(currencySettings);
        }
        
        // 加载汇率设置
        const exchangeRateSettings = localStorage.getItem('exchangeRateSettings');
        if (exchangeRateSettings) {
            this.exchangeRateSettings = JSON.parse(exchangeRateSettings);
        }
        
        // 加载汇率数据
        const exchangeRates = localStorage.getItem('exchangeRates');
        if (exchangeRates) {
            this.exchangeRates = JSON.parse(exchangeRates);
        }
        
        // 加载上次更新时间
        const ratesLastUpdated = localStorage.getItem('ratesLastUpdated');
        if (ratesLastUpdated) {
            this.ratesLastUpdated = ratesLastUpdated;
        }
        
        // 应用主题
        document.documentElement.setAttribute('data-theme', this.displaySettings.theme);
    },
    
    // 初始化UI
    initUI: function() {
        // 工作时间设置
        document.getElementById('daysPerWeekSelect').value = this.workSettings.daysPerWeek;
        document.getElementById('hoursPerDaySelect').value = this.workSettings.hoursPerDay;
        document.getElementById('vacationDaysSelect').value = this.workSettings.vacationDays;
        
        // 显示设置
        document.getElementById('themeText').textContent = this.displaySettings.theme === 'light' ? '亮色' : '暗色';
        document.getElementById('decimalPlacesSelect').value = this.displaySettings.decimalPlaces;
        document.getElementById('thousandSeparatorSwitch').checked = this.displaySettings.useThousandSeparator;
        
        // 货币设置
        document.getElementById('defaultInputCurrencySelect').value = this.currencySettings.defaultInputCurrency;
        document.getElementById('defaultDisplayCurrencySelect').value = this.currencySettings.defaultDisplayCurrency;
        
        // 汇率设置
        document.getElementById('updateFrequencySelect').value = this.exchangeRateSettings.updateFrequency;
        document.getElementById('offlineModeSwitch').checked = this.exchangeRateSettings.offlineMode;
        
        // 上次更新时间
        document.getElementById('lastUpdatedText').textContent = this.ratesLastUpdated ? this.formatDateTime(new Date(this.ratesLastUpdated)) : '未更新';
    },
    
    // 添加事件监听
    addEventListeners: function() {
        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // 查看汇率
        document.getElementById('viewRatesBtn').addEventListener('click', () => {
            window.location.href = 'exchange.html';
        });
        
        // 更新汇率
        document.getElementById('updateRatesBtn').addEventListener('click', () => {
            this.updateExchangeRates();
        });
        
        // 保存设置
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });
    },
    
    // 切换主题
    toggleTheme: function() {
        const newTheme = this.displaySettings.theme === 'light' ? 'dark' : 'light';
        this.displaySettings.theme = newTheme;
        
        // 更新UI
        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('themeText').textContent = newTheme === 'light' ? '亮色' : '暗色';
    },
    
    // 更新汇率
    updateExchangeRates: function() {
        // 这里应该是实际的汇率API调用
        // 由于Web环境限制，这里模拟更新过程
        
        // 显示加载中
        this.showToast('正在更新汇率...');
        
        // 模拟网络请求延迟
        setTimeout(() => {
            // 模拟获取到的汇率数据
            const rates = {
                CNY: 1,
                USD: 0.1394,
                GBP: 0.1079,
                JPY: 15.1823,
                EUR: 0.1281,
                HKD: 1.0853
            };
            
            // 更新数据
            this.exchangeRates = rates;
            this.ratesLastUpdated = new Date().toISOString();
            
            // 更新UI
            document.getElementById('lastUpdatedText').textContent = this.formatDateTime(new Date(this.ratesLastUpdated));
            
            // 保存到本地存储
            localStorage.setItem('exchangeRates', JSON.stringify(rates));
            localStorage.setItem('ratesLastUpdated', this.ratesLastUpdated);
            
            // 显示成功提示
            this.showToast('汇率已更新');
        }, 1500);
    },
    
    // 保存设置
    saveSettings: function() {
        // 获取工作时间设置
        this.workSettings.daysPerWeek = parseInt(document.getElementById('daysPerWeekSelect').value);
        this.workSettings.hoursPerDay = parseInt(document.getElementById('hoursPerDaySelect').value);
        this.workSettings.vacationDays = parseInt(document.getElementById('vacationDaysSelect').value);
        
        // 获取显示设置
        this.displaySettings.decimalPlaces = parseInt(document.getElementById('decimalPlacesSelect').value);
        this.displaySettings.useThousandSeparator = document.getElementById('thousandSeparatorSwitch').checked;
        
        // 获取货币设置
        this.currencySettings.defaultInputCurrency = document.getElementById('defaultInputCurrencySelect').value;
        this.currencySettings.defaultDisplayCurrency = document.getElementById('defaultDisplayCurrencySelect').value;
        
        // 获取汇率设置
        this.exchangeRateSettings.updateFrequency = document.getElementById('updateFrequencySelect').value;
        this.exchangeRateSettings.offlineMode = document.getElementById('offlineModeSwitch').checked;
        
        // 保存到本地存储
        localStorage.setItem('workSettings', JSON.stringify(this.workSettings));
        localStorage.setItem('displaySettings', JSON.stringify(this.displaySettings));
        localStorage.setItem('currencySettings', JSON.stringify(this.currencySettings));
        localStorage.setItem('exchangeRateSettings', JSON.stringify(this.exchangeRateSettings));
        
        // 显示成功提示
        this.showToast('设置已保存');
    },
    
    // 显示提示
    showToast: function(message) {
        // 检查是否已存在提示
        let toast = document.querySelector('.toast');
        
        // 如果已存在，先移除
        if (toast) {
            document.body.removeChild(toast);
        }
        
        // 创建提示元素
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // 添加到页面
        document.body.appendChild(toast);
        
        // 添加显示类
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 2秒后移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 2000);
    },
    
    // 格式化日期时间
    formatDateTime: function(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    settingsManager.init();
});