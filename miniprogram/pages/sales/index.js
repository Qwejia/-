// 销售管理首页逻辑
Page({
  data: {
    salesStats: {
      totalOrders: 120,
      pendingOrders: 15,
      completedOrders: 105,
      totalAmount: 6000000
    },
    recentOrders: []
  },

  onLoad() {
    this.loadRecentOrders();
  },

  // 加载最近销售订单
  loadRecentOrders() {
    // 加载模拟数据
    const { salesOrdersData } = require('../../data/supplyChainData');
    const recentOrders = salesOrdersData.slice(0, 5); // 取最近5个订单
    this.setData({ recentOrders });
  },

  // 跳转到销售订单列表
  goToOrderList() {
    wx.navigateTo({
      url: '/pages/sales/orderList'
    });
  },

  // 跳转到销售订单新增
  goToOrderAdd() {
    wx.navigateTo({
      url: '/pages/sales/orderAdd'
    });
  },

  // 跳转到客户管理
  goToCustomerManage() {
    wx.navigateTo({
      url: '/pages/sales/customerList'
    });
  },

  // 跳转到销售分析
  goToSalesAnalysis() {
    wx.navigateTo({
      url: '/pages/sales/analysis'
    });
  },

  // 跳转到订单详情
  goToOrderDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/sales/orderDetail?id=${orderId}`
    });
  }
});