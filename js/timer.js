// 计时器对象
const timer = {
    // 状态变量
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    timerInterval: null,
    perSecond: 0,
    currency: 'CNY',
    currencySymbol: '¥',
    
    // 初始化计时器
    init: function(perSecond, currency, currencySymbol, salary, salaryType, autoStart = false) {
        this.perSecond = perSecond;
        this.currency = currency;
        this.currencySymbol = currencySymbol;
        this.salary = salary;
        this.salaryType = salaryType;
        
        // 重置计时器状态
        this.isRunning = false;
        this.startTime = null;
        this.elapsedTime = 0;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // 更新显示
        this.updateDisplay();
        
        // 添加事件监听
        this.addEventListeners();

        // 如果需要自动开始
        if (autoStart) {
            this.start();
        }
    },
    
    // 添加事件监听
    addEventListeners: function() {
        // 播放/暂停按钮
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        });
        
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // 记录按钮
        document.getElementById('recordBtn').addEventListener('click', () => {
            this.recordCurrentTime();
        });
    },
    
    // 开始计时
    start: function() {
        if (this.isRunning) return;
        
        // 更新UI
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn.classList.remove('play-btn');
        playPauseBtn.classList.add('pause-btn');
        playPauseBtn.querySelector('img').src = 'assets/icons/pause.png';
        
        this.isRunning = true;
        
        // 如果是第一次启动或重置后启动
        if (this.startTime === null) {
            this.startTime = Date.now() - this.elapsedTime;
        } else {
            // 如果是暂停后继续
            this.startTime = Date.now() - this.elapsedTime;
        }
        
        // 启动定时器
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateDisplay();
        }, 100); // 每100毫秒更新一次
    },
    
    // 暂停计时
    pause: function() {
        if (!this.isRunning) return;
        
        // 更新UI
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn.classList.remove('pause-btn');
        playPauseBtn.classList.add('play-btn');
        playPauseBtn.querySelector('img').src = 'assets/icons/play.png';
        
        this.isRunning = false;
        
        // 清除定时器
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    },
    
    // 重置计时器
    reset: function() {
        // 暂停计时器
        this.pause();
        
        // 重置状态
        this.startTime = null;
        this.elapsedTime = 0;
        
        // 更新显示
        this.updateDisplay();
    },
    
    // 更新显示
    updateDisplay: function() {
        const seconds = this.elapsedTime / 1000;
        const amount = this.perSecond * seconds;
        
        // 更新金额显示
        document.getElementById('timerAmount').textContent = `${this.currencySymbol} ${this.formatAmount(amount)}`;
        
        // 更新货币显示
        document.getElementById('timerCurrency').textContent = this.currency;
        
        // 更新每秒/每分钟/每小时收入
        document.getElementById('timerRate').textContent = `${this.currencySymbol} ${this.formatAmount(this.perSecond)} / 秒`;
        document.getElementById('perMinute').textContent = `${this.currencySymbol} ${this.formatAmount(this.perSecond * 60)}`;
        document.getElementById('perHour').textContent = `${this.currencySymbol} ${this.formatAmount(this.perSecond * 3600)}`;
        
        // 更新计时显示
        document.getElementById('timerTime').textContent = this.formatTime(seconds);
    },
    
    // 格式化金额
    formatAmount: function(amount) {
        if (this.currency === 'JPY') {
            return Math.round(amount);
        }
        
        const decimalPlaces = app.displaySettings.decimalPlaces || 2;
        let formattedAmount = amount.toFixed(decimalPlaces);
        
        // 添加千位分隔符
        if (app.displaySettings.useThousandSeparator) {
            formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        return formattedAmount;
    },
    
    // 格式化时间
    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 记录当前时间点
    recordCurrentTime: function() {
        const timestamp = new Date();
        const seconds = this.elapsedTime / 1000;
        const amount = this.perSecond * seconds;
        
        // 创建记录对象
        const record = {
            id: `record-${Date.now()}`,
            timestamp: timestamp,
            timeString: this.formatDateTime(timestamp),
            amount: amount,
            seconds: seconds,
            currency: this.currency,
            currencySymbol: this.currencySymbol
        };
        
        // 获取当前记录列表
        let records = localStorage.getItem('allRecords');
        records = records ? JSON.parse(records) : [];
        
        // 获取最近记录
        let latestRecords = localStorage.getItem('latestRecords');
        latestRecords = latestRecords ? JSON.parse(latestRecords) : [];
        
        // 计算与上一条记录的差额
        if (latestRecords.length > 0) {
            const lastRecord = latestRecords[0];
            record.diff = record.amount - lastRecord.amount;
        } else {
            record.diff = record.amount;
        }
        
        // 更新记录列表
        records = [record, ...records];
        localStorage.setItem('allRecords', JSON.stringify(records));
        
        // 更新最近记录
        latestRecords = [record, ...latestRecords];
        if (latestRecords.length > 3) {
            latestRecords = latestRecords.slice(0, 3);
        }
        localStorage.setItem('latestRecords', JSON.stringify(latestRecords));
        
        // 更新全局变量
        app.latestRecords = latestRecords;
        
        // 更新UI
        app.updateRecordsList();
        
        // 显示提示
        this.showToast('记录成功');
    },
    
    // 格式化日期时间
    formatDateTime: function(date) {
        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        if (isToday) {
            return `今天 ${hours}:${minutes}:${seconds}`;
        } else {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
    },
    
    // 显示提示
    showToast: function(message) {
        // 创建提示元素
        const toast = document.createElement('div');
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
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }
};