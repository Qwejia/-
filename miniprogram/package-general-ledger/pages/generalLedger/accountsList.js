// pages/generalLedger/accountsList.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    accounts: [],
    filteredAccounts: [],
    searchKeyword: '',
    categoryFilter: '',
    levelFilter: '',
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
    this.loadAccounts();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadAccounts();
  },
  
  // 加载会计科目数据
  loadAccounts() {
    const app = getApp();
    let accounts = app.globalData.accounts || [];
    
    // 处理科目类别名称和辅助核算文本
    accounts = accounts.map(account => {
      // 科目类别名称
      const categoryName = this.getCategoryName(account.category);
      
      // 辅助核算文本
      let auxAccountingText = '';
      if (account.auxAccounting && account.auxAccounting.length > 0) {
        auxAccountingText = account.auxAccounting.map(type => {
          return type === 'customer' ? '客户' : 
                 type === 'supplier' ? '供应商' : 
                 type === 'department' ? '部门' : 
                 type === 'project' ? '项目' : type;
        }).join(', ');
      }
      
      return {
        ...account,
        categoryName: categoryName,
        auxAccountingText: auxAccountingText
      };
    });
    
    // 按科目代码排序
    const sortedAccounts = accounts.sort((a, b) => {
      return a.code.localeCompare(b.code);
    });
    
    this.setData({
      accounts: sortedAccounts,
      filteredAccounts: sortedAccounts
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
  
  // 搜索会计科目
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterAccounts();
  },
  
  // 选择科目类别
  onCategoryChange(e) {
    const categoryIndex = e.detail.value;
    this.setData({
      categoryFilter: categoryIndex
    });
    this.filterAccounts();
  },
  
  // 选择科目级次
  onLevelChange(e) {
    const levelIndex = e.detail.value;
    this.setData({
      levelFilter: levelIndex
    });
    this.filterAccounts();
  },
  
  // 筛选会计科目
  filterAccounts() {
    const { accounts, searchKeyword, categoryFilter, levelFilter, categoryOptions, levelOptions } = this.data;
    
    let filtered = accounts;
    
    // 按关键词筛选
    if (searchKeyword) {
      filtered = filtered.filter(account => {
        return account.code.includes(searchKeyword) || account.name.includes(searchKeyword);
      });
    }
    
    // 按科目类别筛选
    const selectedCategory = categoryOptions[categoryFilter].value;
    if (selectedCategory) {
      filtered = filtered.filter(account => account.category === selectedCategory);
    }
    
    // 按科目级次筛选
    const selectedLevel = levelOptions[levelFilter].value;
    if (selectedLevel) {
      filtered = filtered.filter(account => account.level === selectedLevel);
    }
    
    this.setData({
      filteredAccounts: filtered
    });
  },
  
  // 重置筛选条件
  resetFilters() {
    this.setData({
      searchKeyword: '',
      categoryFilter: '',
      levelFilter: ''
    });
    this.filterAccounts();
  },
  
  // 查看科目详情
  viewAccountDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/generalLedger/accountDetail?id=${id}`
    });
  },
  
  // 新增科目
  addAccount() {
    wx.navigateTo({
      url: '/pages/generalLedger/accountEntry'
    });
  }
});