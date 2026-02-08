// 库存列表页面逻辑
Page({
  data: {
    inventory: [],
    loading: false,
    searchKeyword: ''
  },

  onLoad() {
    this.loadInventoryList();
  },

  // 加载库存列表
  loadInventoryList() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { inventoryData } = require('../../data/supplyChainData');
      this.setData({
        inventory: inventoryData,
        loading: false
      });
    }, 1000);
  },

  // 搜索库存
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 跳转到库存详情
  goToInventoryDetail(e) {
    const { productId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/inventory/inventoryDetail?id=${productId}`
    });
  },

  // 添加库存
  addInventory() {
    wx.showToast({ title: '添加库存功能开发中', icon: 'none' });
  },

  // 刷新库存列表
  onPullDownRefresh() {
    this.loadInventoryList();
    wx.stopPullDownRefresh();
  }
});