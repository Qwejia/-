// pages/accountsReceivable/arReceiptList.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    receipts: [],
    filteredReceipts: [],
    searchKeyword: '',
    showFilter: false,
    selectedStatus: 'all',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    totalAmount: 0
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadReceipts();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadReceipts();
  },
  
  // 加载收款记录
  loadReceipts() {
    const app = getApp();
    const receipts = app.getArReceiptsFromLocal();
    
    // 计算总金额
    const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    
    this.setData({
      receipts: receipts,
      filteredReceipts: receipts,
      totalAmount: totalAmount
    });
    
    this.updateFilteredReceipts();
  },
  
  // 新增收款记录
  addReceipt() {
    wx.navigateTo({
      url: '/pages/accountsReceivable/arReceiptDetail?action=add'
    });
  },
  
  // 查看收款记录详情
  viewReceipt(e) {
    const receiptId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/accountsReceivable/arReceiptDetail?action=view&id=${receiptId}`
    });
  },
  
  // 编辑收款记录
  editReceipt(e) {
    const receiptId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/accountsReceivable/arReceiptDetail?action=edit&id=${receiptId}`
    });
  },
  
  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.updateFilteredReceipts();
  },
  
  // 切换筛选面板
  toggleFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },
  
  // 状态筛选变化
  onStatusChange(e) {
    this.setData({
      selectedStatus: e.detail.value
    });
    this.updateFilteredReceipts();
  },
  
  // 开始日期变化
  onStartDateChange(e) {
    this.setData({
      'dateRange.startDate': e.detail.value
    });
    this.updateFilteredReceipts();
  },
  
  // 结束日期变化
  onEndDateChange(e) {
    this.setData({
      'dateRange.endDate': e.detail.value
    });
    this.updateFilteredReceipts();
  },
  
  // 重置筛选
  resetFilter() {
    this.setData({
      searchKeyword: '',
      selectedStatus: 'all',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
    this.updateFilteredReceipts();
  },
  
  // 更新筛选后的收款记录
  updateFilteredReceipts() {
    const { receipts, searchKeyword, selectedStatus, dateRange } = this.data;
    
    let filtered = receipts;
    
    // 搜索筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.receiptNo.toLowerCase().includes(keyword) ||
        receipt.customerName.toLowerCase().includes(keyword) ||
        receipt.invoiceNo.toLowerCase().includes(keyword) ||
        (receipt.remark && receipt.remark.toLowerCase().includes(keyword))
      );
    }
    
    // 日期范围筛选
    if (dateRange.startDate) {
      filtered = filtered.filter(receipt => 
        receipt.receiptDate >= dateRange.startDate
      );
    }
    
    if (dateRange.endDate) {
      filtered = filtered.filter(receipt => 
        receipt.receiptDate <= dateRange.endDate
      );
    }
    
    // 计算筛选后的总金额
    const totalAmount = filtered.reduce((sum, receipt) => sum + receipt.amount, 0);
    
    this.setData({
      filteredReceipts: filtered,
      totalAmount: totalAmount
    });
  },
  
  // 删除收款记录
  deleteReceipt(e) {
    const receiptId = e.currentTarget.dataset.id;
    const app = getApp();
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条收款记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            app.deleteArReceiptFromLocal(receiptId);
            this.loadReceipts();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});
