// 生产计划列表页面逻辑
Page({
  data: {
    productionPlans: [],
    loading: false,
    searchKeyword: ''
  },

  onLoad() {
    this.loadProductionPlans();
  },

  // 加载生产计划列表
  loadProductionPlans() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { productionPlansData } = require('../../data/productionData');
      this.setData({
        productionPlans: productionPlansData,
        loading: false
      });
    }, 1000);
  },

  // 搜索生产计划
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 跳转到计划详情
  goToPlanDetail(e) {
    const { planId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/production/planDetail?id=${planId}`
    });
  },

  // 添加生产计划
  addProductionPlan() {
    wx.showToast({ title: '添加生产计划功能开发中', icon: 'none' });
  },

  // 刷新生产计划列表
  onPullDownRefresh() {
    this.loadProductionPlans();
    wx.stopPullDownRefresh();
  }
});