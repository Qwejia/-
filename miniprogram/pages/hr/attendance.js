// 考勤管理页面逻辑
Page({
  data: {
    attendanceData: [],
    loading: false,
    selectedDate: '2026-01-01'
  },

  onLoad() {
    this.loadAttendanceData();
  },

  // 加载考勤数据
  loadAttendanceData() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { attendanceData } = require('../../data/hrData');
      this.setData({
        attendanceData: attendanceData,
        loading: false
      });
    }, 1000);
  },

  // 选择日期
  bindDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
    this.loadAttendanceData(); // 这里可以根据选择的日期筛选数据
  },

  // 查看考勤详情
  viewAttendanceDetail(e) {
    const { employeeId } = e.currentTarget.dataset;
    const data = this.data.attendanceData.find(item => item.employeeId === employeeId);
    
    wx.showModal({
      title: '考勤详情',
      content: `员工: ${data.employeeName}\n部门: ${data.departmentName}\n日期: ${data.date}\n上班: ${data.checkInTime}\n下班: ${data.checkOutTime}\n状态: ${data.status}`,
      showCancel: false
    });
  },

  // 导出考勤报表
  exportAttendanceReport() {
    wx.showLoading({ title: '导出报表中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '报表已导出', icon: 'success' });
    }, 1500);
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadAttendanceData();
    wx.stopPullDownRefresh();
  }
});