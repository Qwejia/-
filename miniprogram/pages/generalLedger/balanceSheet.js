// pages/generalLedger/balanceSheet.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    balanceData: [],
    filteredBalanceData: [],
    searchKeyword: '',
    categoryFilter: '',
    levelFilter: '',
    period: 'current', // current:本期, prev:上期
    periodIndex: 0,
    periodText: '本期',
    periodOptions: [
      { value: 'current', text: '本期' },
      { value: 'prev', text: '上期' }
    ],
    categoryOptions: [
      { value: '', text: '全部类别' },
      { value: 'asset', text: '资产类' },
      { value: 'liability', text: '负债类' },
      { value: 'equity', text: '所有者权益类' },
      { value: 'income', text: '损益类' },
      { value: 'cost', text: '成本类' }
    ],
    levelOptions: [
      { value: '', text: '全部级次' },
      { value: '1', text: '一级' },
      { value: '2', text: '二级' },
      { value: '3', text: '三级' },
      { value: '4', text: '四级' }
    ]
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadBalanceSheet();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadBalanceSheet();
  },
  
  // 加载余额表数据
  loadBalanceSheet() {
    const app = getApp();
    const accounts = app.globalData.accounts || [];
    const vouchers = app.globalData.vouchers || [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 计算本期和上期的日期范围
    const currentStartDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const currentEndDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    const prevStartDate = currentMonth === 1 ? `${currentYear - 1}-12-01` : `${currentYear}-${(currentMonth - 1).toString().padStart(2, '0')}-01`;
    const prevEndDate = new Date(currentMonth === 1 ? currentYear - 1 : currentYear, currentMonth - 1, 0).toISOString().split('T')[0];
    
    // 过滤凭证
    const filterDate = this.data.period === 'current' ? currentEndDate : prevEndDate;
    
    // 构建余额表数据
    let balanceData = accounts.map(account => {
      // 计算期初余额和期末余额
      const openingBalance = account.balance || 0;
      let currentDebit = 0;
      let currentCredit = 0;
      
      // 计算本期发生额
      vouchers.forEach(voucher => {
        if (voucher.date <= filterDate) {
          voucher.items.forEach(item => {
            if (item.accountId === account._id) {
              if (item.debitAmount > 0) {
                currentDebit += item.debitAmount;
              }
              if (item.creditAmount > 0) {
                currentCredit += item.creditAmount;
              }
            }
          });
        }
      });
      
      // 计算期末余额
      let closingBalance = openingBalance;
      if (account.balanceDirection === 'debit') {
        closingBalance = openingBalance + currentDebit - currentCredit;
      } else {
        closingBalance = openingBalance + currentCredit - currentDebit;
      }
      
      return {
        account: account,
        categoryName: this.getCategoryName(account.category),
        openingBalance: openingBalance,
        currentDebit: currentDebit,
        currentCredit: currentCredit,
        closingBalance: closingBalance
      };
    });
    
    // 按科目代码排序
    balanceData = balanceData.sort((a, b) => a.account.code.localeCompare(b.account.code));
    
    this.setData({
      balanceData: balanceData,
      filteredBalanceData: balanceData
    });
  },
  
  // 获取科目类别名称
  getCategoryName(category) {
    const categoryMap = {
      'asset': '资产类',
      'liability': '负债类',
      'equity': '所有者权益类',
      'income': '损益类',
      'cost': '成本类'
    };
    return categoryMap[category] || category;
  },
  
  // 搜索科目
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.applyFilters();
  },
  
  // 选择科目类别
  onCategoryChange(e) {
    const categoryIndex = e.detail.value;
    this.setData({
      categoryFilter: categoryIndex
    });
    this.applyFilters();
  },
  
  // 选择科目级次
  onLevelChange(e) {
    const levelIndex = e.detail.value;
    this.setData({
      levelFilter: levelIndex
    });
    this.applyFilters();
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
    this.loadBalanceSheet();
  },
  
  // 查看科目明细账
  viewSubLedger(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/generalLedger/subLedger?id=${id}`
    });
  },
  
  // 应用过滤条件
  applyFilters() {
    const { balanceData, searchKeyword, categoryFilter, levelFilter } = this.data;
    let filteredData = [...balanceData];
    
    // 搜索过滤
    if (searchKeyword) {
      filteredData = filteredData.filter(item => 
        item.account.code.includes(searchKeyword) || 
        item.account.name.includes(searchKeyword)
      );
    }
    
    // 类别过滤
    if (categoryFilter) {
      const selectedCategory = this.data.categoryOptions[categoryFilter].value;
      if (selectedCategory) {
        filteredData = filteredData.filter(item => item.account.category === selectedCategory);
      }
    }
    
    // 级次过滤
    if (levelFilter) {
      const selectedLevel = this.data.levelOptions[levelFilter].value;
      if (selectedLevel) {
        filteredData = filteredData.filter(item => 
          item.account.code.length === parseInt(selectedLevel) * 2
        );
      }
    }
    
    this.setData({
      filteredBalanceData: filteredData
    });
  }
});
