// 生产制造首页逻辑
Page({
  data: {
    productionStats: {
      totalPlans: 50,
      pendingPlans: 10,
      completedPlans: 40,
      totalWorkshopOrders: 80
    },
    recentPlans: []
  },

  onLoad() {
    this.loadRecentPlans();
  },

  // 加载最近生产计划
  loadRecentPlans() {
    // 加载模拟数据
    const { productionPlansData } = require('../../data/productionData');
    const recentPlans = productionPlansData.slice(0, 5); // 取最近5个计划
    this.setData({ recentPlans });
  },

  // 跳转到生产计划列表
  goToProductionPlan() {
    wx.navigateTo({
      url: '/pages/production/productionPlan'
    });
  },

  // 跳转到车间管理
  goToWorkshop() {
    wx.navigateTo({
      url: '/pages/production/workshop'
    });
  },

  // 跳转到物料清单
  goToBom() {
    wx.navigateTo({
      url: '/pages/production/bom'
    });
  },

  // 跳转到生产分析
  goToProductionAnalysis() {
    wx.navigateTo({
      url: '/pages/production/analysis'
    });
  },

  // 跳转到计划详情
  goToPlanDetail(e) {
    const { planId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/production/planDetail?id=${planId}`
    });
  }
});