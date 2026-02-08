// 库存调拨页面逻辑
Page({
  data: {
    inventoryItems: [],
    loading: false,
    transferData: {
      fromLocation: '仓库A',
      toLocation: '仓库B',
      transferDate: '2026-01-01',
      remark: ''
    }
  },

  onLoad() {
    this.loadInventoryItems();
  },

  // 加载库存项目
  loadInventoryItems() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { inventoryData } = require('../../data/supplyChainData');
      const inventoryItems = inventoryData.map(item => ({
        ...item,
        transferQuantity: 0
      }));
      
      this.setData({
        inventoryItems: inventoryItems,
        loading: false
      });
    }, 1000);
  },

  // 更新调拨数量
  updateTransferQuantity(e) {
    const { index } = e.currentTarget.dataset;
    const transferQuantity = parseInt(e.detail.value) || 0;
    const inventoryItems = [...this.data.inventoryItems];
    inventoryItems[index].transferQuantity = transferQuantity;
    this.setData({ inventoryItems });
  },

  // 更新调拨信息
  updateTransferInfo(e) {
    const { key } = e.currentTarget.dataset;
    const value = e.detail.value;
    const transferData = { ...this.data.transferData };
    transferData[key] = value;
    this.setData({ transferData });
  },

  // 提交调拨申请
  submitTransfer() {
    wx.showLoading({ title: '提交调拨申请...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '调拨申请已提交', icon: 'success' });
    }, 1500);
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadInventoryItems();
    wx.stopPullDownRefresh();
  }
});