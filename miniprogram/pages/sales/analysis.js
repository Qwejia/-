// 销售分析页面逻辑
Page({
  data: {
    salesStats: {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalAmount: 0
    },
    salesTrend: [],
    customerStats: [],
    loading: false
  },

  onLoad() {
    this.loadSalesAnalysis();
  },

  // 加载销售分析数据
  loadSalesAnalysis() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { salesOrdersData, customersData } = require('../../data/supplyChainData');
      
      // 计算销售统计
      const totalOrders = salesOrdersData.length;
      const completedOrders = salesOrdersData.filter(item => item.status === 'completed').length;
      const pendingOrders = salesOrdersData.filter(item => item.status === 'pending').length;
      const totalAmount = salesOrdersData.reduce((sum, item) => sum + item.totalAmount, 0);
      
      // 生成销售趋势数据（模拟）
      const salesTrend = [
        { month: '2025-09', value: 120000 },
        { month: '2025-10', value: 150000 },
        { month: '2025-11', value: 180000 },
        { month: '2025-12', value: 210000 },
        { month: '2026-01', value: 250000 }
      ];
      
      // 生成客户统计数据（模拟）
      const customerStats = customersData.map(customer => ({
        customerName: customer.name,
        orderCount: Math.floor(Math.random() * 10) + 1,
        totalAmount: Math.floor(Math.random() * 100000) + 50000
      }));
      
      this.setData({
        salesStats: {
          totalOrders,
          completedOrders,
          pendingOrders,
          totalAmount
        },
        salesTrend,
        customerStats,
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
    this.loadSalesAnalysis();
    wx.stopPullDownRefresh();
  }
});