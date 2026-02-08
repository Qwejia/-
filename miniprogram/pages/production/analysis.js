// 生产分析页面逻辑
Page({
  data: {
    productionStats: {
      totalPlans: 0,
      completedPlans: 0,
      inProgressPlans: 0,
      pendingPlans: 0,
      totalProduction: 0
    },
    productionTrend: [],
    loading: false
  },

  onLoad() {
    this.loadProductionAnalysis();
  },

  // 加载生产分析数据
  loadProductionAnalysis() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { productionPlansData } = require('../../data/productionData');
      
      // 计算生产统计
      const totalPlans = productionPlansData.length;
      const completedPlans = productionPlansData.filter(item => item.status === 'completed').length;
      const inProgressPlans = productionPlansData.filter(item => item.status === 'inProgress').length;
      const pendingPlans = productionPlansData.filter(item => item.status === 'pending').length;
      const totalProduction = productionPlansData.reduce((sum, item) => sum + item.quantity, 0);
      
      // 生成生产趋势数据（模拟）
      const productionTrend = [
        { month: '2025-09', value: 1200 },
        { month: '2025-10', value: 1500 },
        { month: '2025-11', value: 1800 },
        { month: '2025-12', value: 2100 },
        { month: '2026-01', value: 2500 }
      ];
      
      this.setData({
        productionStats: {
          totalPlans,
          completedPlans,
          inProgressPlans,
          pendingPlans,
          totalProduction
        },
        productionTrend,
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
    this.loadProductionAnalysis();
    wx.stopPullDownRefresh();
  }
});