// pages/generalLedger/accountDetail.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    account: {},
    categoryName: '',
    parentAccountName: '',
    auxAccountingText: '',
    recentTransactions: []
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.loadAccountDetail(id);
    this.loadRecentTransactions(id);
  },
  
  // 加载科目详情
  loadAccountDetail(accountId) {
    const app = getApp();
    const accounts = app.globalData.accounts || [];
    const account = accounts.find(acc => acc._id === accountId);
    
    if (account) {
      // 获取科目类别名称
      const categoryName = this.getCategoryName(account.type);
      
      // 获取上级科目名称
      let parentAccountName = '';
      if (account.parentId) {
        const parentAccount = accounts.find(acc => acc._id === account.parentId);
        if (parentAccount) {
          parentAccountName = `${parentAccount.code} ${parentAccount.name}`;
        }
      }
      
      // 获取辅助核算文本
      let auxAccountingText = '';
      if (account.auxAccounting && account.auxAccounting.length > 0) {
        auxAccountingText = account.auxAccounting.map(type => {
          return type === 'customer' ? '客户' : 
                 type === 'supplier' ? '供应商' : 
                 type === 'department' ? '部门' : 
                 type === 'project' ? '项目' : type;
        }).join(', ');
      }
      
      this.setData({
        account: account,
        categoryName: categoryName,
        parentAccountName: parentAccountName,
        auxAccountingText: auxAccountingText
      });
    }
  },
  
  // 加载近期交易
  loadRecentTransactions(accountId) {
    const app = getApp();
    const voucherEntries = app.getVoucherEntriesFromLocal() || [];
    const vouchers = app.getVouchersFromLocal() || [];
    
    // 过滤与当前科目相关的交易
    const relatedEntries = voucherEntries.filter(entry => entry.accountId === accountId);
    
    // 转换为交易记录格式
    const transactions = relatedEntries.map(entry => {
      // 获取凭证信息
      const voucher = vouchers.find(v => v._id === entry.voucherId);
      
      return {
        _id: entry._id,
        date: voucher ? voucher.date : '',
        description: entry.description,
        voucherNumber: voucher ? voucher.number : '',
        type: entry.debit > 0 ? 'debit' : 'credit',
        amount: Math.abs(entry.debit || entry.credit || 0)
      };
    });
    
    // 按日期降序排序，取最近10条
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    this.setData({
      recentTransactions: recentTransactions
    });
  },
  
  // 获取科目类别名称（使用常量缓存提高性能）
  getCategoryName(category) {
    // 使用静态映射表，避免每次调用都创建新对象
    const categoryMap = this.categoryMap || (this.categoryMap = {
      'asset': '资产类',
      'liability': '负债类',
      'equity': '所有者权益类',
      'income': '损益类',
      'cost': '成本类'
    });
    return categoryMap[category] || category;
  },
  
  // 编辑科目
  editAccount() {
    const { _id } = this.data.account;
    wx.navigateTo({
      url: `/pages/generalLedger/accountEntry?id=${_id}`
    });
  },
  
  // 查看所有交易
  viewAllTransactions() {
    const { _id } = this.data.account;
    wx.navigateTo({
      url: `/pages/generalLedger/accountTransactions?id=${_id}`
    });
  }
});