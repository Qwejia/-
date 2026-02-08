// 采购管理首页逻辑
Page({
  data: {
    purchaseStats: {
      totalOrders: 100,
      pendingOrders: 20,
      completedOrders: 80,
      totalAmount: 5000000
    },
    recentOrders: []
  },

  onLoad() {
    this.loadRecentOrders();
  },

  // 加载最近采购订单
  loadRecentOrders() {
    // 加载模拟数据
    const { purchaseOrdersData } = require('../../data/supplyChainData');
    const recentOrders = purchaseOrdersData.slice(0, 5); // 取最近5个订单
    this.setData({ recentOrders });
  },

  // 跳转到采购订单列表
  goToOrderList() {
    wx.navigateTo({
      url: '/pages/purchase/orderList'
    });
  },

  // 跳转到采购订单新增
  goToOrderAdd() {
    wx.navigateTo({
      url: '/pages/purchase/orderAdd'
    });
  },

  // 跳转到供应商管理
  goToSupplierManage() {
    wx.navigateTo({
      url: '/pages/purchase/supplierList'
    });
  },

  // 跳转到采购分析
  goToPurchaseAnalysis() {
    wx.navigateTo({
      url: '/pages/purchase/analysis'
    });
  },

  // 跳转到订单详情
  goToOrderDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/purchase/orderDetail?id=${orderId}`
    });
  }
});