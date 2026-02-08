// 部门管理页面逻辑
Page({
  data: {
    departments: [],
    loading: false
  },

  onLoad() {
    this.loadDepartments();
  },

  // 加载部门列表
  loadDepartments() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { departmentsData } = require('../../data/hrData');
      this.setData({
        departments: departmentsData,
        loading: false
      });
    }, 1000);
  },

  // 查看部门详情
  viewDepartmentDetail(e) {
    const { departmentId } = e.currentTarget.dataset;
    const data = this.data.departments.find(item => item.code === departmentId);
    
    wx.showModal({
      title: '部门详情',
      content: `部门名称: ${data.name}\n部门编码: ${data.code}\n部门经理: ${data.managerName}\n部门描述: ${data.description}`,
      showCancel: false
    });
  },

  // 添加部门
  addDepartment() {
    wx.showToast({ title: '添加部门功能开发中', icon: 'none' });
  },

  // 刷新部门列表
  onPullDownRefresh() {
    this.loadDepartments();
    wx.stopPullDownRefresh();
  }
});