// pages/generalLedger/subLedger.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    accountId: '',
    account: null,
    transactions: [],
    searchKeyword: '',
    period: 'current', // current:本期, prev:上期, all:全部
    periodIndex: 0,
    periodText: '本期',
    periodOptions: [
      { value: 'current', text: '本期' },
      { value: 'prev', text: '上期' },
      { value: 'all', text: '全部' }
    ],
    runningBalance: 0,
    accounts: [],
    accountOptions: [],
    accountIndex: 0,
    accountText: ''
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const app = getApp();
    const accounts = app.globalData.accounts || [];
    
    // 构建科目选项列表
    const accountOptions = accounts.map(acc => ({
      value: acc._id,
      text: `${acc.code} ${acc.name}`
    }));
    
    let accountId = '';
    let accountIndex = 0;
    let accountText = '';
    
    if (options.id) {
      accountId = options.id;
      accountIndex = accountOptions.findIndex(item => item.value === accountId);
      accountText = accountOptions[accountIndex] ? accountOptions[accountIndex].text : '';
    } else {
      // 如果没有传入科目ID，默认选择第一个科目
      if (accounts.length > 0) {
        accountId = accounts[0]._id;
        accountIndex = 0;
        accountText = accountOptions[0] ? accountOptions[0].text : '';
      }
    }
    
    this.setData({
      accounts: accounts,
      accountOptions: accountOptions,
      accountId: accountId,
      accountIndex: accountIndex,
      accountText: accountText
    });
    
    if (accountId) {
      this.loadAccountDetail();
      this.loadTransactions();
    }
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.accountId) {
      this.loadAccountDetail();
      this.loadTransactions();
    }
  },
  
  // 加载科目详情
  loadAccountDetail() {
    const app = getApp();
    const accounts = app.globalData.accounts || [];
    const account = accounts.find(acc => acc._id === this.data.accountId);
    
    if (account) {
      this.setData({
        account: account,
        runningBalance: account.balance || 0
      });
      wx.setNavigationBarTitle({
        title: `${account.code} ${account.name} - 明细账`
      });
    }
  },
  
  /**
   * 计算日期范围（与总账页面保持一致的缓存机制）
   */
  calculateDateRanges() {
    // 缓存计算结果，避免重复计算
    if (this.dateRanges && this.dateRanges.lastCalculatedDate === new Date().toDateString()) {
      return this.dateRanges;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 计算本期的日期范围（当月1日到当月最后一天）
    const currentStartDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const currentEndDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    
    // 计算上期的日期范围（上月1日到上月最后一天）
    const prevStartDate = currentMonth === 1 ? `${currentYear - 1}-12-01` : `${currentYear}-${(currentMonth - 1).toString().padStart(2, '0')}-01`;
    const prevEndDate = new Date(currentMonth === 1 ? currentYear - 1 : currentYear, currentMonth - 1, 0).toISOString().split('T')[0];
    
    // 缓存结果并记录计算日期
    this.dateRanges = {
      currentStartDate,
      currentEndDate,
      prevStartDate,
      prevEndDate,
      lastCalculatedDate: new Date().toDateString()
    };
    
    return this.dateRanges;
  },

  // 加载交易记录
  loadTransactions() {
    const app = getApp();
    const vouchers = app.globalData.vouchers || [];
    
    // 获取缓存的日期范围
    const { currentStartDate, currentEndDate, prevStartDate, prevEndDate } = this.calculateDateRanges();
    
    // 过滤凭证
    let filteredVouchers = vouchers;
    if (this.data.period === 'current') {
      filteredVouchers = vouchers.filter(v => v.date >= currentStartDate && v.date <= currentEndDate);
    } else if (this.data.period === 'prev') {
      filteredVouchers = vouchers.filter(v => v.date >= prevStartDate && v.date <= prevEndDate);
    }
    
    // 提取与当前科目相关的交易记录
    let transactions = [];
    filteredVouchers.forEach(voucher => {
      voucher.items.forEach(item => {
        if (item.accountId === this.data.accountId) {
          transactions.push({
            voucher: voucher,
            transaction: item
          });
        }
      });
    });
    
    // 按日期排序
    transactions = transactions.sort((a, b) => {
      if (a.voucher.date !== b.voucher.date) {
        return a.voucher.date.localeCompare(b.voucher.date);
      }
      return a.voucher.number.localeCompare(b.voucher.number);
    });
    
    // 计算运行余额
    let runningBalance = this.data.account ? this.data.account.balance : 0;
    const transactionsWithBalance = transactions.map(tran => {
      // 注意：这里假设余额是基于交易顺序计算的，实际可能需要从期初余额开始重新计算
      if (tran.transaction.debitAmount > 0) {
        runningBalance -= tran.transaction.debitAmount;
      }
      if (tran.transaction.creditAmount > 0) {
        runningBalance += tran.transaction.creditAmount;
      }
      
      return {
        ...tran,
        runningBalance: runningBalance
      };
    });
    
    // 反转顺序，最新的在前面
    transactionsWithBalance.reverse();
    
    this.setData({
      transactions: transactionsWithBalance
    });
  },
  
  // 搜索凭证
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
  },
  
  // 选择期间
  onPeriodChange(e) {
    const periodIndex = e.detail.value;
    const selectedPeriod = this.data.periodOptions[periodIndex];
    this.setData({
      periodIndex: periodIndex,
      period: selectedPeriod.value,
      periodText: selectedPeriod.text
    });
    this.loadTransactions();
  },
  
  // 选择科目
  onAccountChange(e) {
    const accountIndex = e.detail.value;
    const selectedAccount = this.data.accountOptions[accountIndex];
    this.setData({
      accountIndex: accountIndex,
      accountId: selectedAccount.value,
      accountText: selectedAccount.text
    });
    this.loadAccountDetail();
    this.loadTransactions();
  },
  
  // 查看凭证详情
  viewVoucherDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/generalLedger/voucherDetail?id=${id}`
    });
  }
});
