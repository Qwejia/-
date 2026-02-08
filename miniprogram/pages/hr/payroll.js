// 薪资管理页面逻辑
Page({
  data: {
    payrolls: [],
    loading: false,
    selectedPeriod: '2026-01'
  },

  onLoad() {
    this.loadPayrollData();
  },

  // 加载薪资数据
  loadPayrollData() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { payrollData } = require('../../data/hrData');
      this.setData({
        payrolls: payrollData,
        loading: false
      });
    }, 1000);
  },

  // 选择薪资期间
  selectPeriod(e) {
    this.setData({ selectedPeriod: e.detail.value });
    this.loadPayrollData(); // 这里可以根据选择的期间筛选数据
  },

  // 查看薪资详情
  viewPayrollDetail(e) {
    const { payrollId } = e.currentTarget.dataset;
    wx.showModal({
      title: '薪资详情',
      content: `薪资单ID: ${payrollId}\n功能开发中`,
      showCancel: false
    });
  },

  // 导出薪资报表
  exportPayrollReport() {
    wx.showLoading({ title: '导出报表中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '报表已导出', icon: 'success' });
    }, 1500);
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadPayrollData();
    wx.stopPullDownRefresh();
  }
});