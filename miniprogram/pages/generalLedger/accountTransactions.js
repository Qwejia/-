// pages/generalLedger/accountTransactions.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    accountId: '',
    account: {},
    transactions: [],
    filteredTransactions: [],
    searchKeyword: '',
    dateRange: {
      start: '',
      end: ''
    },
    typeFilter: '',
    typeOptions: [
      { value: '', text: '全部类型' },
      { value: 'debit', text: '借方' },
      { value: 'credit', text: '贷方' }
    ]
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    if (id) {
      this.setData({ accountId: id });
      this.loadAccountInfo(id);
      this.loadTransactions(id);
    }
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.accountId) {
      this.loadTransactions(this.data.accountId);
    }
  },
  
  // 加载会计科目信息
  loadAccountInfo(id) {
    const app = getApp();
    const accounts = app.globalData.accounts || [];
    const account = accounts.find(acc => acc._id === id);
    
    if (account) {
      this.setData({ account: account });
    }
  },
  
  // 加载交易记录
  loadTransactions(id) {
    const app = getApp();
    const voucherEntries = app.getVoucherEntriesFromLocal() || [];
    const vouchers = app.getVouchersFromLocal() || [];
    
    // 过滤与当前科目相关的交易
    const relatedEntries = voucherEntries.filter(entry => entry.accountId === id);
    
    // 转换为交易记录格式
    const transactions = relatedEntries.map(entry => {
      // 获取凭证信息
      const voucher = vouchers.find(v => v._id === entry.voucherId);
      
      return {
        _id: entry._id,
        date: voucher ? voucher.date : '',
        description: entry.description,
        voucherNumber: voucher ? voucher.number : '',
        voucherId: voucher ? voucher._id : '',
        type: entry.debit > 0 ? 'debit' : 'credit',
        amount: Math.abs(entry.debit || entry.credit || 0)
      };
    });
    
    // 按日期降序排序
    const sortedTransactions = transactions.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    this.setData({
      transactions: sortedTransactions,
      filteredTransactions: sortedTransactions
    });
  },
  
  // 搜索交易记录
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterTransactions();
  },
  
  // 选择开始日期
  onStartDateChange(e) {
    const start = e.detail.value;
    this.setData({
      'dateRange.start': start
    });
    this.filterTransactions();
  },
  
  // 选择结束日期
  onEndDateChange(e) {
    const end = e.detail.value;
    this.setData({
      'dateRange.end': end
    });
    this.filterTransactions();
  },
  
  // 选择交易类型
  onTypeChange(e) {
    const typeIndex = e.detail.value;
    this.setData({
      typeFilter: typeIndex
    });
    this.filterTransactions();
  },
  
  // 筛选交易记录
  filterTransactions() {
    const { transactions, searchKeyword, dateRange, typeFilter, typeOptions } = this.data;
    
    let filtered = transactions;
    
    // 按关键词筛选（摘要或凭证号）
    if (searchKeyword) {
      filtered = filtered.filter(transaction => {
        return transaction.description.includes(searchKeyword) || 
               transaction.voucherNumber.includes(searchKeyword);
      });
    }
    
    // 按日期范围筛选
    if (dateRange.start) {
      filtered = filtered.filter(transaction => transaction.date >= dateRange.start);
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(transaction => transaction.date <= dateRange.end);
    }
    
    // 按交易类型筛选
    const selectedType = typeOptions[typeFilter].value;
    if (selectedType) {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }
    
    this.setData({
      filteredTransactions: filtered
    });
  },
  
  // 重置筛选条件
  resetFilters() {
    this.setData({
      searchKeyword: '',
      dateRange: {
        start: '',
        end: ''
      },
      typeFilter: ''
    });
    this.filterTransactions();
  },
  
  // 查看凭证详情
  viewVoucherDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/generalLedger/voucherDetail?id=${id}`
    });
  }
});