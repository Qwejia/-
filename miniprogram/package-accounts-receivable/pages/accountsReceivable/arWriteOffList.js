// pages/accountsReceivable/arWriteOffList.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    writeOffs: [],
    filteredWriteOffs: [],
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
    this.loadWriteOffs();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadWriteOffs();
  },
  
  // 加载核销记录
  loadWriteOffs() {
    const app = getApp();
    const writeOffs = app.getArWriteOffsFromLocal();
    
    // 计算总金额
    const totalAmount = writeOffs.reduce((sum, writeOff) => sum + writeOff.amount, 0);
    
    this.setData({
      writeOffs: writeOffs,
      filteredWriteOffs: writeOffs,
      totalAmount: totalAmount
    });
    
    this.updateFilteredWriteOffs();
  },
  
  // 新增核销记录
  addWriteOff() {
    wx.navigateTo({
      url: '/pages/accountsReceivable/arWriteOffDetail?action=add'
    });
  },
  
  // 查看核销记录详情
  viewWriteOff(e) {
    const writeOffId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/accountsReceivable/arWriteOffDetail?action=view&id=${writeOffId}`
    });
  },
  
  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.updateFilteredWriteOffs();
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
    this.updateFilteredWriteOffs();
  },
  
  // 开始日期变化
  onStartDateChange(e) {
    this.setData({
      'dateRange.startDate': e.detail.value
    });
    this.updateFilteredWriteOffs();
  },
  
  // 结束日期变化
  onEndDateChange(e) {
    this.setData({
      'dateRange.endDate': e.detail.value
    });
    this.updateFilteredWriteOffs();
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
    this.updateFilteredWriteOffs();
  },
  
  // 更新筛选后的核销记录
  updateFilteredWriteOffs() {
    const { writeOffs, searchKeyword, selectedStatus, dateRange } = this.data;
    
    let filtered = writeOffs;
    
    // 搜索筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(writeOff => 
        writeOff.writeOffNo.toLowerCase().includes(keyword) ||
        writeOff.customerName.toLowerCase().includes(keyword) ||
        writeOff.invoiceNo.toLowerCase().includes(keyword) ||
        (writeOff.remark && writeOff.remark.toLowerCase().includes(keyword))
      );
    }
    
    // 日期范围筛选
    if (dateRange.startDate) {
      filtered = filtered.filter(writeOff => 
        writeOff.writeOffDate >= dateRange.startDate
      );
    }
    
    if (dateRange.endDate) {
      filtered = filtered.filter(writeOff => 
        writeOff.writeOffDate <= dateRange.endDate
      );
    }
    
    // 计算筛选后的总金额
    const totalAmount = filtered.reduce((sum, writeOff) => sum + writeOff.amount, 0);
    
    this.setData({
      filteredWriteOffs: filtered,
      totalAmount: totalAmount
    });
  },
  
  // 删除核销记录
  deleteWriteOff(e) {
    const writeOffId = e.currentTarget.dataset.id;
    const app = getApp();
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条核销记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            app.deleteArWriteOffFromLocal(writeOffId);
            this.loadWriteOffs();
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
