// 员工列表页面逻辑
Page({
  data: {
    employees: [],
    loading: false,
    searchKeyword: ''
  },

  onLoad() {
    this.loadEmployees();
  },

  // 加载员工列表
  loadEmployees() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { employeesData } = require('../../data/hrData');
      this.setData({
        employees: employeesData,
        loading: false
      });
    }, 1000);
  },

  // 搜索员工
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 跳转到员工详情
  goToEmployeeDetail(e) {
    const { employeeId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/hr/employeeDetail?id=${employeeId}`
    });
  },

  // 添加员工
  addEmployee() {
    wx.showToast({ title: '添加员工功能开发中', icon: 'none' });
  },

  // 刷新员工列表
  onPullDownRefresh() {
    this.loadEmployees();
    wx.stopPullDownRefresh();
  }
});