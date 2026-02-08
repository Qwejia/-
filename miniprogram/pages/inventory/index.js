// 库存管理首页逻辑
Page({
  data: {
    inventoryStats: {
      totalProducts: 50,
      lowStockProducts: 5,
      totalValue: 2000000,
      inStockProducts: 45
    },
    recentInventory: []
  },

  onLoad() {
    this.loadRecentInventory();
  },

  // 加载最近库存变动
  loadRecentInventory() {
    // 加载模拟数据
    const { inventoryData } = require('../../data/supplyChainData');
    const recentInventory = inventoryData.slice(0, 5); // 取最近5个库存记录
    this.setData({ recentInventory });
  },

  // 跳转到库存列表
  goToInventoryList() {
    wx.navigateTo({
      url: '/pages/inventory/inventoryList'
    });
  },

  // 跳转到库存盘点
  goToInventoryCheck() {
    wx.navigateTo({
      url: '/pages/inventory/inventoryCheck'
    });
  },

  // 跳转到库存调拨
  goToInventoryTransfer() {
    wx.navigateTo({
      url: '/pages/inventory/inventoryTransfer'
    });
  },

  // 跳转到库存分析
  goToInventoryAnalysis() {
    wx.navigateTo({
      url: '/pages/inventory/inventoryAnalysis'
    });
  },

  // 跳转到库存详情
  goToInventoryDetail(e) {
    const { productId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/inventory/inventoryDetail?id=${productId}`
    });
  }
});