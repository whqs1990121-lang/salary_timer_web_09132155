// 全局变量和设置
const app = {
    // 状态变量
    salaryType: 'year', // 'year' 或 'month'
    selectedCurrency: 'CNY',
    displayCurrency: 'CNY',
    
    // 货币符号映射
    currencySymbols: {
        CNY: '¥',
        USD: '$',
        GBP: '£',
        JPY: '¥',
        EUR: '€',
        HKD: 'HK$'
    },
    
    // 汇率数据（相对于CNY的汇率）
    exchangeRates: {
        CNY: 1,
        USD: 0.1394,
        GBP: 0.1079,
        JPY: 15.1823,
        EUR: 0.1281,
        HKD: 1.0853
    },
    
    // 工作设置
    workSettings: {
        daysPerWeek: 5,
        hoursPerDay: 8,
        vacationDays: 15
    },
    
    // 显示设置
    displaySettings: {
        theme: 'light', // 'light' 或 'dark'
        decimalPlaces: 2,
        useThousandSeparator: true
    },
    
    // 货币设置
    currencySettings: {
        defaultInputCurrency: 'CNY',
        defaultDisplayCurrency: 'CNY'
    },
    
    // 汇率设置
    exchangeRateSettings: {
        updateFrequency: 'daily', // 'daily', 'weekly', 'open'
        offlineMode: false
    },
    
    // 初始化函数
    init: function() {
        // 加载本地存储的设置
        this.loadSettings();
        
        // 初始化界面
        this.initUI();
        
        // 添加事件监听
        this.addEventListeners();
        
        // 初始化金币动画
        this.startCoinAnimation();
    },
    
    // 加载本地存储的设置
    loadSettings: function() {
        // 加载主题设置
        const theme = localStorage.getItem('theme');
        if (theme) {
            this.displaySettings.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
        }
        
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
            this.selectedCurrency = this.currencySettings.defaultInputCurrency;
            this.displayCurrency = this.currencySettings.defaultDisplayCurrency;
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
        
        // 加载最近记录
        const latestRecords = localStorage.getItem('latestRecords');
        if (latestRecords) {
            this.latestRecords = JSON.parse(latestRecords);
            this.updateRecordsList();
        }
    },
    
    // 初始化界面
    initUI: function() {
        // 设置货币选择器的当前值
        document.getElementById('currencySelect').value = this.selectedCurrency;
        
        // 设置货币符号
        document.getElementById('currencySymbol').textContent = this.currencySymbols[this.selectedCurrency];
        
// 设置主题图标
const themeIcon = document.getElementById('themeIcon');
themeIcon.src = this.displaySettings.theme === 'light' ? 'assets/icons/moon.png' : 'assets/icons/sun.png';

// 显示记录列表（如果有记录）
if (this.latestRecords && this.latestRecords.length > 0) {
    document.getElementById('recordsSection').classList.remove('section-hidden');
    document.getElementById('recordsSection').classList.add('section-visible');
}
},

// 添加事件监听
addEventListeners: function() {
// 年薪/月薪切换
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        const type = e.target.getAttribute('data-type');
        this.toggleSalaryType(type);
    });
});

// 货币选择
document.getElementById('currencySelect').addEventListener('change', (e) => {
    this.selectedCurrency = e.target.value;
    document.getElementById('currencySymbol').textContent = this.currencySymbols[this.selectedCurrency];
});

// 开始计算按钮
document.getElementById('startCalculation').addEventListener('click', () => {
    this.startCalculation();
});

// 主题切换
document.getElementById('themeToggle').addEventListener('click', () => {
    this.toggleTheme();
});
},

// 切换年薪/月薪
toggleSalaryType: function(type) {
if (type === this.salaryType) return;

this.salaryType = type;

// 更新UI
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    if (tab.getAttribute('data-type') === type) {
        tab.classList.add('active');
    } else {
        tab.classList.remove('active');
    }
});

// 移动指示器
const indicator = document.querySelector('.tab-indicator');
indicator.style.left = type === 'year' ? '0' : '50%';

// 更新标签文本
document.getElementById('salaryLabel').textContent = `输入您的${type === 'year' ? '年薪' : '月薪'}`;
},

// 开始计算
startCalculation: function() {
const salaryInput = document.getElementById('salaryInput');
const salary = parseFloat(salaryInput.value);

if (!salary || isNaN(salary)) {
    alert('请输入有效的薪资金额');
    return;
}

// 隐藏输入区域，显示计时器区域
document.getElementById('inputSection').classList.remove('section-visible');
document.getElementById('inputSection').classList.add('section-hidden');

document.getElementById('timerSection').classList.remove('section-hidden');
document.getElementById('timerSection').classList.add('section-visible');

// 计算每秒收入
let annualSalary = salary;
if (this.salaryType === 'month') {
    annualSalary *= 12;
}

// 工作日计算：每年工作日 = 365 - 104(周末) - 假期
const workingDays = 365 - (52 * (7 - this.workSettings.daysPerWeek)) - this.workSettings.vacationDays;

// 每秒收入 = 年薪 / 工作日 / 每天工作小时 / 3600
const perSecond = annualSalary / workingDays / this.workSettings.hoursPerDay / 3600;

// 初始化计时器并自动开始
timer.init(perSecond, this.selectedCurrency, this.currencySymbols[this.selectedCurrency], salary, this.salaryType, true);
},

// 切换主题
toggleTheme: function() {
const newTheme = this.displaySettings.theme === 'light' ? 'dark' : 'light';
this.displaySettings.theme = newTheme;

// 更新DOM
document.documentElement.setAttribute('data-theme', newTheme);

// 更新主题图标
const themeIcon = document.getElementById('themeIcon');
themeIcon.src = newTheme === 'light' ? 'assets/icons/moon.png' : 'assets/icons/sun.png';

// 保存设置
localStorage.setItem('displaySettings', JSON.stringify(this.displaySettings));
},

// 更新记录列表
updateRecordsList: function() {
if (!this.latestRecords || this.latestRecords.length === 0) return;

const recordsList = document.getElementById('recordsList');
recordsList.innerHTML = '';

// 只显示最近的3条记录
const records = this.latestRecords.slice(0, 3);

records.forEach(record => {
    const recordItem = document.createElement('div');
    recordItem.className = 'record-item';
    
    const recordInfo = document.createElement('div');
    recordInfo.className = 'record-info';
    
    const recordTime = document.createElement('span');
    recordTime.className = 'record-time';
    recordTime.textContent = record.timeString;
    
    const recordAmount = document.createElement('span');
    recordAmount.className = 'record-amount';
    recordAmount.textContent = `${record.currencySymbol} ${this.formatAmount(record.amount, record.currency)}`;
    
    recordInfo.appendChild(recordTime);
    recordInfo.appendChild(recordAmount);
    
    const recordDiff = document.createElement('div');
    recordDiff.className = `record-diff ${record.diff >= 0 ? 'positive' : 'negative'}`;
    recordDiff.textContent = `${record.diff >= 0 ? '+' : ''}${record.currencySymbol} ${this.formatAmount(record.diff, record.currency)}`;
    
    recordItem.appendChild(recordInfo);
    recordItem.appendChild(recordDiff);
    
    recordsList.appendChild(recordItem);
});

// 显示记录区域
document.getElementById('recordsSection').classList.remove('section-hidden');
document.getElementById('recordsSection').classList.add('section-visible');
},

// 格式化金额显示
formatAmount: function(amount, currency) {
if (currency === 'JPY') {
    return Math.round(amount);
}

const decimalPlaces = this.displaySettings.decimalPlaces;
let formattedAmount = amount.toFixed(decimalPlaces);

// 添加千位分隔符
if (this.displaySettings.useThousandSeparator) {
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

// 金币动画
startCoinAnimation: function() {
// 每隔一段时间创建一枚新金币
setInterval(() => {
    this.createCoin();
}, 800);

// 初始创建几枚金币
for (let i = 0; i < 5; i++) {
    setTimeout(() => {
        this.createCoin();
    }, Math.random() * 2000);
}
},

createCoin: function() {
const coinContainer = document.getElementById('coinContainer');
const coin = document.createElement('div');
coin.className = 'coin';

// 随机货币符号
const currencies = Object.keys(this.currencySymbols);
const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
const symbol = this.currencySymbols[randomCurrency];
coin.textContent = symbol;

// 随机位置和动画时间
const left = Math.random() * 100;
const size = Math.random() * 10 + 20;
const duration = Math.random() * 5 + 3;

coin.style.left = `${left}%`;
coin.style.width = `${size}px`;
coin.style.height = `${size}px`;
coin.style.fontSize = `${size * 0.6}px`;
coin.style.animationDuration = `${duration}s`;

coinContainer.appendChild(coin);

// 动画结束后移除
setTimeout(() => {
    if (coin.parentNode === coinContainer) {
        coinContainer.removeChild(coin);
    }
}, duration * 1000);
}
};

// 励志语录数组
const motivationQuotes = [
    "“🎉今天的摸鱼，是为了明天更好的工作”-鱼小子",
    "“🐟适度摸鱼，提高效率”-鱼小子",
    "“🐟摸鱼是一门艺术，需要智慧与勇气”-鱼小子",
    "“🐟偷得浮生半日闲，何不摸鱼度时光”-鱼小子",
    "“🎉劳逸结合，摸鱼有道”-鱼小子",
    "“🌳生活不止眼前的工作，还有诗和远方的摸鱼”-鱼小子",
    "“🎉摸鱼是为了更好地工作，工作是为了更好地摸鱼”-鱼小子",
    "“🐟站在风口浪尖，每一条鱼都能飞起来”-鱼小子",
    "“🎉不摸鱼的人生不是完整的人生”-鱼小子",
    "“😄摸鱼使我快乐，快乐使我高效”-鱼小子",
    "“♨️摸鱼不是目的，放松身心才是真谛”-鱼小子",
    "“🐟会摸鱼的人，才是真正懂得工作的人”-鱼小子",
    "“🎉高效工作，快乐摸鱼，人生平衡之道”-鱼小子",
    "“🐟摸鱼的艺术在于不被发现”-鱼小子",
    "“🎉珍惜当下的每一次摸鱼，它比加班更珍贵”-鱼小子"
];

// 获取随机语录
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
    return motivationQuotes[randomIndex];
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();

    // 初始化励志语录点击事件
    const motivationCard = document.getElementById('motivationCard');
    const motivationText = document.getElementById('motivationText');

    if (motivationCard && motivationText) {
        motivationCard.addEventListener('click', function() {
            motivationText.textContent = getRandomQuote();
            
            // 添加点击动画效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    }
});