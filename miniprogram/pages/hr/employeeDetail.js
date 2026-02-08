// 员工详情页面逻辑
Page({
  data: {
    employee: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    this.loadEmployeeDetail(id);
  },

  // 加载员工详情
  loadEmployeeDetail(employeeId) {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { employeesData } = require('../../data/hrData');
      const employee = employeesData.find(item => item.employeeId === employeeId);
      
      this.setData({
        employee: employee,
        loading: false
      });
    }, 1000);
  },

  // 编辑员工信息
  editEmployee() {
    wx.showToast({ title: '编辑员工功能开发中', icon: 'none' });
  },

  // 查看考勤记录
  viewAttendanceRecord() {
    wx.showToast({ title: '查看考勤记录功能开发中', icon: 'none' });
  },

  // 查看薪资记录
  viewPayrollRecord() {
    wx.showToast({ title: '查看薪资记录功能开发中', icon: 'none' });
  },

  // 分享员工信息
  shareEmployee() {
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  }
});