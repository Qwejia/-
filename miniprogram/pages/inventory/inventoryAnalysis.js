// 库存分析页面逻辑
Page({
  data: {
    inventoryStats: {
      totalProducts: 0,
      lowStockProducts: 0,
      totalValue: 0,
      inStockProducts: 0
    },
    categoryStats: [],
    loading: false
  },

  onLoad() {
    this.loadInventoryAnalysis();
  },

  // 加载库存分析数据
  loadInventoryAnalysis() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { inventoryData } = require('../../data/supplyChainData');
      
      // 计算库存统计
      const totalProducts = inventoryData.length;
      const lowStockProducts = inventoryData.filter(item => item.stock < item.minStock).length;
      const inStockProducts = inventoryData.filter(item => item.stock > 0).length;
      const totalValue = inventoryData.reduce((sum, item) => sum + (item.stock * item.price), 0);
      
      // 计算分类统计
      const categoryMap = {};
      inventoryData.forEach(item => {
        if (!categoryMap[item.category]) {
          categoryMap[item.category] = {
            category: item.category,
            count: 0,
            stock: 0,
            value: 0
          };
        }
        categoryMap[item.category].count++;
        categoryMap[item.category].stock += item.stock;
        categoryMap[item.category].value += item.stock * item.price;
      });
      
      const categoryStats = Object.values(categoryMap);
      
      this.setData({
        inventoryStats: {
          totalProducts,
          lowStockProducts,
          totalValue,
          inStockProducts
        },
        categoryStats,
        loading: false
      });
    }, 1000);
  },

  // 导出分析报告
  exportAnalysisReport() {
    wx.showLoading({ title: '导出报告中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '报告已导出', icon: 'success' });
    }, 1500);
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadInventoryAnalysis();
    wx.stopPullDownRefresh();
  }
});