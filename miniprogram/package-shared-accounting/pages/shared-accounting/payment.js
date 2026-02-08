// pages/shared-accounting/payment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    task: {
      title: '',
      service: '',
      accountantName: '',
      amount: ''
    },
    paymentMethods: [
      {
        id: 'wechat',
        name: '微信支付',
        icon: '💚'
      },
      {
        id: 'alipay',
        name: '支付宝',
        icon: '💙'
      },
      {
        id: 'card',
        name: '银行卡',
        icon: '💳'
      }
    ],
    selectedMethod: 'wechat'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadTaskData();
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 加载任务数据
   */
  loadTaskData() {
    // 模拟任务数据
    const task = {
      title: '月度税务申报',
      service: 'tax',
      accountantName: '张会计',
      amount: '¥300.00'
    };

    this.setData({
      task
    });
  },

  /**
   * 获取服务类型文本
   */
  getServiceText(service) {
    const textMap = {
      tax: '税务申报',
      accounting: '账务处理',
      audit: '财务审计',
      consulting: '财务咨询',
      taxPlanning: '税务筹划',
      financialAnalysis: '财务分析',
      costAccounting: '成本核算',
      fundManagement: '资金管理',
      financialTraining: '财务培训'
    };
    return textMap[service] || '其他服务';
  },

  /**
   * 选择支付方式
   */
  selectPaymentMethod(e) {
    const methodId = e.currentTarget.dataset.id;
    this.setData({
      selectedMethod: methodId
    });
  },

  /**
   * 确认支付
   */
  confirmPayment() {
    // 显示支付中提示
    wx.showLoading({
      title: '支付中...',
      mask: true
    });

    // 模拟支付过程
    setTimeout(() => {
      wx.hideLoading();

      // 显示支付成功提示
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      });

      // 跳转到任务详情页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/shared-accounting/task-detail?id=1'
        });
      }, 1500);
    }, 2000);
  }
});