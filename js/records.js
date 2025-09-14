// 记录管理对象
const recordsManager = {
    // 状态变量
    records: [],
    sortOrder: 'desc', // 'desc': 最新在前, 'asc': 最早在前
    
    // 货币符号映射
    currencySymbols: {
        CNY: '¥',
        USD: '$',
        GBP: '£',
        JPY: '¥',
        EUR: '€',
        HKD: 'HK$'
    },
    
    // 初始化
    init: function() {
        // 加载记录
        this.loadRecords();
        
        // 添加事件监听
        this.addEventListeners();
        
        // 加载主题
        this.loadTheme();
    },
    
    // 加载记录
    loadRecords: function() {
        // 从本地存储中获取记录
        const allRecords = localStorage.getItem('allRecords');
        this.records = allRecords ? JSON.parse(allRecords) : [];
        
        // 根据排序顺序排序
        this.sortRecords();
        
        // 更新UI
        this.updateUI();
    },
    
    // 添加事件监听
    addEventListeners: function() {
        // 排序切换
        document.getElementById('sortToggle').addEventListener('click', () => {
            this.toggleSortOrder();
        });
        
        // 导出按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportRecords();
        });
        
        // 清空所有记录按钮
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.confirmClearAll();
        });
    },
    
    // 加载主题
    loadTheme: function() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    },
    
    // 更新UI
    updateUI: function() {
        const recordsList = document.getElementById('recordsList');
        const emptyState = document.getElementById('emptyState');
        const recordsListContainer = document.getElementById('recordsListContainer');
        
        // 清空记录列表
        recordsList.innerHTML = '';
        
        // 检查是否有记录
        if (this.records.length === 0) {
            // 显示空状态
            emptyState.classList.remove('section-hidden');
            emptyState.classList.add('section-visible');
            recordsListContainer.classList.remove('section-visible');
            recordsListContainer.classList.add('section-hidden');
            return;
        }
        
        // 隐藏空状态，显示记录列表
        emptyState.classList.remove('section-visible');
        emptyState.classList.add('section-hidden');
        recordsListContainer.classList.remove('section-hidden');
        recordsListContainer.classList.add('section-visible');
        
        // 创建记录项
        this.records.forEach(record => {
            const recordItem = this.createRecordItem(record);
            recordsList.appendChild(recordItem);
        });
    },
    
    // 创建记录项
    createRecordItem: function(record) {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        recordItem.setAttribute('data-id', record.id);
        
        // 记录头部
        const recordHeader = document.createElement('div');
        recordHeader.className = 'record-header';
        
        const recordTime = document.createElement('div');
        recordTime.className = 'record-time';
        recordTime.textContent = record.timeString || this.formatDateTime(new Date(record.timestamp));
        
        const recordActions = document.createElement('div');
        recordActions.className = 'record-actions';
        
        const deleteAction = document.createElement('div');
        deleteAction.className = 'action-icon delete';
        deleteAction.innerHTML = `<img src="../assets/icons/delete.png" alt="删除">`;
        deleteAction.addEventListener('click', () => {
            this.confirmDeleteRecord(record.id);
        });
        
        recordActions.appendChild(deleteAction);
        recordHeader.appendChild(recordTime);
        recordHeader.appendChild(recordActions);
        
        // 记录详情
        const recordDetails = document.createElement('div');
        recordDetails.className = 'record-details';
        
        const recordAmount = document.createElement('div');
        recordAmount.className = 'record-amount';
        recordAmount.textContent = `${record.currencySymbol} ${this.formatAmount(record.amount, record.currency)}`;
        
        const recordStats = document.createElement('div');
        recordStats.className = 'record-stats';
        
        // 持续时间
        const durationStat = document.createElement('div');
        durationStat.className = 'stat-item';
        
        const durationLabel = document.createElement('span');
        durationLabel.className = 'stat-label';
        durationLabel.textContent = '持续时间';
        
        const durationValue = document.createElement('span');
        durationValue.className = 'stat-value';
        durationValue.textContent = this.formatTime(record.seconds);
        
        durationStat.appendChild(durationLabel);
        durationStat.appendChild(durationValue);
        
        // 收益增量
        const diffStat = document.createElement('div');
        diffStat.className = 'stat-item';
        
        const diffLabel = document.createElement('span');
        diffLabel.className = 'stat-label';
        diffLabel.textContent = '收益增量';
        
        const diffValue = document.createElement('span');
        diffValue.className = `stat-value ${record.diff >= 0 ? 'positive' : 'negative'}`;
        diffValue.textContent = `${record.diff >= 0 ? '+' : ''}${record.currencySymbol} ${this.formatAmount(record.diff, record.currency)}`;
        
        diffStat.appendChild(diffLabel);
        diffStat.appendChild(diffValue);
        
        recordStats.appendChild(durationStat);
        if (record.diff !== undefined) {
            recordStats.appendChild(diffStat);
        }
        
        recordDetails.appendChild(recordAmount);
        recordDetails.appendChild(recordStats);
        
        recordItem.appendChild(recordHeader);
        recordItem.appendChild(recordDetails);
        
        return recordItem;
    },
    
    // 切换排序顺序
    toggleSortOrder: function() {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        
        // 更新排序图标
        const sortIcon = document.getElementById('sortIcon');
        sortIcon.src = `../assets/icons/sort_${this.sortOrder}.png`;
        
        // 重新排序并更新UI
        this.sortRecords();
        this.updateUI();
    },
    
    // 排序记录
    sortRecords: function() {
        this.records.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            
            return this.sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        });
    },
    
    // 确认删除记录
    confirmDeleteRecord: function(recordId) {
        this.showDialog(
            '确认删除',
            '确定要删除这条记录吗？',
            () => {
                this.deleteRecord(recordId);
            }
        );
    },
    
    // 删除记录
    deleteRecord: function(recordId) {
        // 从记录列表中删除
        this.records = this.records.filter(record => record.id !== recordId);
        
        // 更新本地存储
        localStorage.setItem('allRecords', JSON.stringify(this.records));
        
        // 更新最近记录
        const latestRecords = this.records.slice(0, 3);
        localStorage.setItem('latestRecords', JSON.stringify(latestRecords));
        
        // 更新UI
        this.updateUI();
        
        // 显示提示
        this.showToast('删除成功');
    },
    
    // 确认清空所有记录
    confirmClearAll: function() {
        this.showDialog(
            '确认清空',
            '确定要清空所有记录吗？此操作不可恢复！',
            () => {
                this.clearAllRecords();
            }
        );
    },
    
    // 清空所有记录
    clearAllRecords: function() {
        // 清空记录
        this.records = [];
        
        // 更新本地存储
        localStorage.setItem('allRecords', JSON.stringify(this.records));
        localStorage.setItem('latestRecords', JSON.stringify([]));
        
        // 更新UI
        this.updateUI();
        
        // 显示提示
        this.showToast('已清空所有记录');
    },
    
    // 导出记录
    exportRecords: function() {
        if (this.records.length === 0) {
            this.showToast('没有记录可导出');
            return;
        }
        
        // 创建CSV内容
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // 添加表头
        csvContent += '时间,金额,货币,持续时间(秒),收益增量\n';
        
        // 添加记录
        this.records.forEach(record => {
            const row = [
                record.timeString || this.formatDateTime(new Date(record.timestamp)),
                record.amount,
                record.currency,
                record.seconds,
                record.diff || 0
            ].join(',');
            csvContent += row + '\n';
        });
        
        // 创建下载链接
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `薪资流记录_${this.formatDateForFilename(new Date())}.csv`);
        document.body.appendChild(link);
        
        // 触发下载
        link.click();
        
        // 移除链接
        document.body.removeChild(link);
        
        // 显示提示
        this.showToast('导出成功');
    },
    
    // 显示对话框
    showDialog: function(title, content, confirmCallback) {
        // 创建对话框
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog';
        
        const dialogHeader = document.createElement('div');
        dialogHeader.className = 'dialog-header';
        
        const dialogTitle = document.createElement('div');
        dialogTitle.className = 'dialog-title';
        dialogTitle.textContent = title;
        
        const dialogContent = document.createElement('div');
        dialogContent.className = 'dialog-content';
        dialogContent.textContent = content;
        
        const dialogActions = document.createElement('div');
        dialogActions.className = 'dialog-actions';
        
        const cancelBtn = document.createElement('div');
        cancelBtn.className = 'dialog-btn cancel';
        cancelBtn.textContent = '取消';
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialogOverlay);
        });
        
        const confirmBtn = document.createElement('div');
        confirmBtn.className = 'dialog-btn confirm';
        confirmBtn.textContent = '确定';
        confirmBtn.addEventListener('click', () => {
            confirmCallback();
            document.body.removeChild(dialogOverlay);
        });
        
        dialogHeader.appendChild(dialogTitle);
        dialogActions.appendChild(cancelBtn);
        dialogActions.appendChild(confirmBtn);
        
        dialog.appendChild(dialogHeader);
        dialog.appendChild(dialogContent);
        dialog.appendChild(dialogActions);
        
        dialogOverlay.appendChild(dialog);
        
        document.body.appendChild(dialogOverlay);
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
    },
    
    // 格式化金额
    formatAmount: function(amount, currency) {
        if (currency === 'JPY') {
            return Math.round(amount);
        }
        
        // 从本地存储获取小数位数设置
        let displaySettings = localStorage.getItem('displaySettings');
        let decimalPlaces = 2;
        let useThousandSeparator = true;
        
        if (displaySettings) {
            displaySettings = JSON.parse(displaySettings);
            decimalPlaces = displaySettings.decimalPlaces !== undefined ? displaySettings.decimalPlaces : 2;
            useThousandSeparator = displaySettings.useThousandSeparator !== undefined ? displaySettings.useThousandSeparator : true;
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
    
    // 格式化时间
    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    
    // 格式化日期用于文件名
    formatDateForFilename: function(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${year}${month}${day}_${hours}${minutes}`;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    recordsManager.init();
});