// 生产计划详情页面逻辑
Page({
  data: {
    productionPlan: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    this.loadProductionPlanDetail(id);
  },

  // 加载生产计划详情
  loadProductionPlanDetail(planId) {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { productionPlansData } = require('../../data/productionData');
      const productionPlan = productionPlansData.find(item => item._id === planId);
      
      this.setData({
        productionPlan: productionPlan,
        loading: false
      });
    }, 1000);
  },

  // 编辑生产计划
  editProductionPlan() {
    wx.showToast({ title: '编辑生产计划功能开发中', icon: 'none' });
  },

  // 查看物料需求
  viewMaterialRequirements() {
    wx.showToast({ title: '查看物料需求功能开发中', icon: 'none' });
  },

  // 查看生产进度
  viewProductionProgress() {
    wx.showToast({ title: '查看生产进度功能开发中', icon: 'none' });
  },

  // 分享生产计划
  shareProductionPlan() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  }
});