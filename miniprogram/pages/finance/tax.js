// pages/finance/tax.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taxStatus: {
      monthlyTax: '¥0.00',
      declaredTax: '¥0.00',
      pendingTax: '¥0.00'
    },
    reminders: [
      {
        date: '2024-01-15',
        content: '增值税月度申报',
        status: 'pending'
      },
      {
        date: '2024-01-20',
        content: '企业所得税季度申报',
        status: 'pending'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载税务数据
    this.loadTaxData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 重新加载数据
    this.loadTaxData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 加载税务数据
   */
  loadTaxData() {
    // 模拟加载税务数据
    // 实际项目中，这里应该调用API获取真实数据
    console.log('加载税务数据');
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 显示更多选项
   */
  showMoreOptions() {
    wx.showActionSheet({
      itemList: ['导出数据', '刷新数据', '帮助中心'],
      success: function(res) {
        console.log(res.tapIndex);
        // 根据用户选择执行相应操作
      },
      fail: function(res) {
        console.log(res.errMsg);
      }
    });
  },

  /**
   * 导航到设置页面
   */
  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },

  /**
   * 导航到税额计算页面
   */
  navigateToTaxCalculator() {
    wx.navigateTo({
      url: '/pages/ai-assistant/tax-planning'
    });
  },

  /**
   * 导航到税务筹划页面
   */
  navigateToTaxPlanning() {
    wx.navigateTo({
      url: '/pages/ai-assistant/tax-planning'
    });
  },

  /**
   * 导航到税务查询页面
   */
  navigateToTaxInquiry() {
    // 实际项目中，这里应该导航到税务查询页面
    wx.showToast({
      title: '税务查询功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到税务小贴士页面
   */
  navigateToTaxTips() {
    // 实际项目中，这里应该导航到税务小贴士页面
    wx.showToast({
      title: '税务小贴士功能开发中',
      icon: 'none'
    });
  }
})