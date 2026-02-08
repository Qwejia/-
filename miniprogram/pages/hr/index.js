// 人力资源首页逻辑
Page({
  data: {
    hrStats: {
      totalEmployees: 100,
      activeEmployees: 95,
      departments: 5,
      totalPayroll: 5000000
    },
    recentEmployees: []
  },

  onLoad() {
    this.loadRecentEmployees();
  },

  // 加载最近员工
  loadRecentEmployees() {
    // 加载模拟数据
    const { employeesData } = require('../../data/hrData');
    const recentEmployees = employeesData.slice(0, 5); // 取最近5个员工
    this.setData({ recentEmployees });
  },

  // 跳转到人员管理
  goToEmployeeManage() {
    wx.navigateTo({
      url: '/pages/hr/employeeList'
    });
  },

  // 跳转到薪资管理
  goToPayrollManage() {
    wx.navigateTo({
      url: '/pages/hr/payroll'
    });
  },

  // 跳转到考勤管理
  goToAttendanceManage() {
    wx.navigateTo({
      url: '/pages/hr/attendance'
    });
  },

  // 跳转到部门管理
  goToDepartmentManage() {
    wx.navigateTo({
      url: '/pages/hr/departmentList'
    });
  },

  // 跳转到员工详情
  goToEmployeeDetail(e) {
    const { employeeId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/hr/employeeDetail?id=${employeeId}`
    });
  }
});