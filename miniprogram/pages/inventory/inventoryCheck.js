// 库存盘点页面逻辑
Page({
  data: {
    inventoryItems: [],
    loading: false,
    selectedDate: '2026-01-01'
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
        actualStock: item.stock, // 默认实际库存等于系统库存
        difference: 0
      }));
      
      this.setData({
        inventoryItems: inventoryItems,
        loading: false
      });
    }, 1000);
  },

  // 选择盘点日期
  bindDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
  },

  // 更新实际库存
  updateActualStock(e) {
    const { index } = e.currentTarget.dataset;
    const actualStock = parseInt(e.detail.value) || 0;
    const inventoryItems = [...this.data.inventoryItems];
    const item = inventoryItems[index];
    item.actualStock = actualStock;
    item.difference = actualStock - item.stock;
    this.setData({ inventoryItems });
  },

  // 提交盘点结果
  submitInventoryCheck() {
    wx.showLoading({ title: '提交盘点结果...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '盘点结果已提交', icon: 'success' });
    }, 1500);
  },

  // 导出盘点报告
  exportInventoryReport() {
    wx.showLoading({ title: '导出报告中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '报告已导出', icon: 'success' });
    }, 1500);
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadInventoryItems();
    wx.stopPullDownRefresh();
  }
});