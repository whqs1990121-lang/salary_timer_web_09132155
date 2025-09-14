// 汇率转换对象
const exchangeManager = {
    // 状态变量
    fromCurrency: 'CNY',
    toCurrency: 'USD',
    amount: 100,
    
    // 汇率数据
    exchangeRates: {
        CNY: 1,
        USD: 0.1394,
        GBP: 0.1079,
        JPY: 15.1823,
        EUR: 0.1281,
        HKD: 1.0853
    },
    
    // 货币符号映射
    currencySymbols: {
        CNY: '¥',
        USD: '$',
        GBP: '£',
        JPY: '¥',
        EUR: '€',
        HKD: 'HK$'
    },
    
    // 上次更新时间
    lastUpdated: null,
    
    // 初始化
    init: function() {
        // 加载汇率数据
        this.loadExchangeRates();
        
        // 初始化UI
        this.initUI();
        
        // 添加事件监听
        this.addEventListeners();
        
        // 计算初始转换结果
        this.convertCurrency();
        
        // 加载主题
        this.loadTheme();
    },
    
    // 加载汇率数据
    loadExchangeRates: function() {
        // 从本地存储加载汇率数据
        const exchangeRates = localStorage.getItem('exchangeRates');
        if (exchangeRates) {
            this.exchangeRates = JSON.parse(exchangeRates);
        }
        
        // 加载上次更新时间
        const lastUpdated = localStorage.getItem('ratesLastUpdated');
        if (lastUpdated) {
            this.lastUpdated = lastUpdated;
            document.getElementById('lastUpdatedText').textContent = `更新于: ${this.formatDateTime(new Date(lastUpdated))}`;
        }
    },
    
    // 初始化UI
    initUI: function() {
        // 设置输入金额
        document.getElementById('amountInput').value = this.amount;
        
        // 设置源货币和目标货币
        document.getElementById('fromCurrencySelect').value = this.fromCurrency;
        document.getElementById('toCurrencySelect').value = this.toCurrency;
        
        // 填充汇率表
        this.updateRatesTable();
    },
    
    // 添加事件监听
    addEventListeners: function() {
        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'settings.html';
        });
        
        // 金额输入
        document.getElementById('amountInput').addEventListener('input', (e) => {
            this.amount = parseFloat(e.target.value) || 0;
            this.convertCurrency();
        });
        
        // 源货币选择
        document.getElementById('fromCurrencySelect').addEventListener('change', (e) => {
            this.fromCurrency = e.target.value;
            this.convertCurrency();
        });
        
        // 目标货币选择
        document.getElementById('toCurrencySelect').addEventListener('change', (e) => {
            this.toCurrency = e.target.value;
            this.convertCurrency();
        });
        
        // 交换货币按钮
        document.getElementById('swapBtn').addEventListener('click', () => {
            this.swapCurrencies();
        });
        
        // 更新汇率按钮
        document.getElementById('updateRatesBtn').addEventListener('click', () => {
            this.updateExchangeRates();
        });
    },
    
    // 加载主题
    loadTheme: function() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    },
    
    // 货币转换
    convertCurrency: function() {
        if (this.amount <= 0) {
            document.getElementById('resultAmount').textContent = '0';
            document.getElementById('resultFormula').textContent = `0 ${this.fromCurrency} = 0 ${this.toCurrency}`;
            return;
        }
        
        // 获取汇率
        const fromRate = this.exchangeRates[this.fromCurrency];
        const toRate = this.exchangeRates[this.toCurrency];
        
        // 计算转换结果
        // 转换公式：目标金额 = 源金额 * (目标货币汇率 / 源货币汇率)
        const convertedAmount = this.amount * (toRate / fromRate);
        
        // 更新UI
        document.getElementById('resultSymbol').textContent = this.currencySymbols[this.toCurrency];
        document.getElementById('resultAmount').textContent = this.formatAmount(convertedAmount);
        document.getElementById('resultFormula').textContent = `${this.amount} ${this.fromCurrency} = ${this.formatAmount(convertedAmount)} ${this.toCurrency}`;
    },
    
    // 交换源货币和目标货币
    swapCurrencies: function() {
        const temp = this.fromCurrency;
        this.fromCurrency = this.toCurrency;
        this.toCurrency = temp;
        
        // 更新UI
        document.getElementById('fromCurrencySelect').value = this.fromCurrency;
        document.getElementById('toCurrencySelect').value = this.toCurrency;
        
        // 重新计算
        this.convertCurrency();
    },
    
    // 更新汇率表
    updateRatesTable: function() {
        const tableBody = document.getElementById('ratesTableBody');
        tableBody.innerHTML = '';
        
        // 创建表格行
        Object.keys(this.exchangeRates).forEach(currencyCode => {
            if (currencyCode !== 'CNY') {
                const row = document.createElement('div');
                row.className = 'table-row';
                
                const currencyCell = document.createElement('div');
                currencyCell.className = 'table-cell';
                
                const currencySymbol = document.createElement('span');
                currencySymbol.className = 'currency-symbol';
                currencySymbol.textContent = this.currencySymbols[currencyCode];
                
                const currencyCodeSpan = document.createElement('span');
                currencyCodeSpan.className = 'currency-code';
                currencyCodeSpan.textContent = currencyCode;
                
                currencyCell.appendChild(currencySymbol);
                currencyCell.appendChild(currencyCodeSpan);
                
                const rateCell = document.createElement('div');
                rateCell.className = 'table-cell';
                rateCell.textContent = this.exchangeRates[currencyCode];
                
                row.appendChild(currencyCell);
                row.appendChild(rateCell);
                
                tableBody.appendChild(row);
            }
        });
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
            this.lastUpdated = new Date().toISOString();
            
            // 更新UI
            document.getElementById('lastUpdatedText').textContent = `更新于: ${this.formatDateTime(new Date(this.lastUpdated))}`;
            this.updateRatesTable();
            this.convertCurrency();
            
            // 保存到本地存储
            localStorage.setItem('exchangeRates', JSON.stringify(rates));
            localStorage.setItem('ratesLastUpdated', this.lastUpdated);
            
            // 显示成功提示
            this.showToast('汇率已更新');
        }, 1500);
    },
    
    // 格式化金额
    formatAmount: function(amount) {
        // 从本地存储获取小数位数设置
        let displaySettings = localStorage.getItem('displaySettings');
        let decimalPlaces = 2;
        let useThousandSeparator = true;
        
        if (displaySettings) {
            displaySettings = JSON.parse(displaySettings);
            decimalPlaces = displaySettings.decimalPlaces !== undefined ? displaySettings.decimalPlaces : 2;
            useThousandSeparator = displaySettings.useThousandSeparator !== undefined ? displaySettings.useThousandSeparator : true;
        }
        
        // 处理日元特殊情况
        if (this.toCurrency === 'JPY') {
            amount = Math.round(amount);
            decimalPlaces = 0;
        }
        
        let formattedAmount = amount.toFixed(decimalPlaces);
        
        // 添加千位分隔符
        if (useThousandSeparator) {
            formattedAmount = this.addThousandSeparator(formattedAmount);
        }
        
        return formattedAmount;
    },
    
    // 添加千位分隔符
    addThousandSeparator: function(numStr) {
        const parts = numStr.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    },
    
    // 格式化日期时间
    formatDateTime: function(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
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
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    exchangeManager.init();
});