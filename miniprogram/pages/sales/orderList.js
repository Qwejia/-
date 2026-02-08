// 销售订单列表页面逻辑
Page({
  data: {
    salesOrders: [],
    loading: false,
    searchKeyword: ''
  },

  onLoad() {
    this.loadSalesOrders();
  },

  // 加载销售订单列表
  loadSalesOrders() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { salesOrdersData } = require('../../data/supplyChainData');
      this.setData({
        salesOrders: salesOrdersData,
        loading: false
      });
    }, 1000);
  },

  // 搜索销售订单
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 跳转到订单详情
  goToOrderDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/sales/orderDetail?id=${orderId}`
    });
  },

  // 添加销售订单
  addSalesOrder() {
    wx.navigateTo({
      url: '/pages/sales/orderAdd'
    });
  },

  // 刷新销售订单列表
  onPullDownRefresh() {
    this.loadSalesOrders();
    wx.stopPullDownRefresh();
  }
});