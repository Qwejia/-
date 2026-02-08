// 销售订单详情页面逻辑
Page({
  data: {
    salesOrder: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    this.loadSalesOrderDetail(id);
  },

  // 加载销售订单详情
  loadSalesOrderDetail(orderId) {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { salesOrdersData } = require('../../data/supplyChainData');
      const salesOrder = salesOrdersData.find(item => item._id === orderId);
      
      this.setData({
        salesOrder: salesOrder,
        loading: false
      });
    }, 1000);
  },

  // 编辑销售订单
  editSalesOrder() {
    wx.showToast({ title: '编辑销售订单功能开发中', icon: 'none' });
  },

  // 查看客户信息
  viewCustomerInfo() {
    wx.showToast({ title: '查看客户信息功能开发中', icon: 'none' });
  },

  // 打印销售订单
  printSalesOrder() {
    wx.showToast({ title: '打印销售订单功能开发中', icon: 'none' });
  },

  // 分享销售订单
  shareSalesOrder() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  }
});