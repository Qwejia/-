// pages/generalLedger/index.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    voucherTypes: [
      { id: '1', name: '记账凭证', icon: '📝' },
      { id: '2', name: '收款凭证', icon: '💵' },
      { id: '3', name: '付款凭证', icon: '💰' },
      { id: '4', name: '转账凭证', icon: '🔄' }
    ],
    menuItems: [
      { id: '1', name: '凭证录入', icon: '✏️', url: '/pages/generalLedger/voucherEntry' },
      { id: '2', name: '凭证列表', icon: '📋', url: '/pages/generalLedger/voucherList' },
      { id: '3', name: '会计科目', icon: '📊', url: '/pages/generalLedger/accountsList' },
      { id: '4', name: '总账查询', icon: '📈', url: '/pages/generalLedger/ledger' },
      { id: '5', name: '明细账查询', icon: '📉', url: '/pages/generalLedger/subLedger' },
      { id: '6', name: '余额表', icon: '⚖️', url: '/pages/generalLedger/balanceSheet' },
      { id: '7', name: '期末结账', icon: '🔒', url: '/pages/generalLedger/checkout' }
    ]
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const app = getApp();
    this.setData({
      accounts: app.globalData.accounts || []
    });
  },

  onShow: function () {
    const app = getApp();
    const currentAccounts = this.data.accounts || [];
    const globalAccounts = app.globalData.accounts || [];
    
    if (currentAccounts.length !== globalAccounts.length) {
      this.setData({
        accounts: globalAccounts
      });
    }
  },
  
  // 跳转到功能页面
  navigateToPage(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({
        url: url
      });
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },
  
  // 跳转到凭证录入页面
  goToVoucherEntry(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/generalLedger/voucherEntry?type=${type}`
    });
  }
});
