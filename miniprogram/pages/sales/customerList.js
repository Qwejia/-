// 客户管理页面逻辑
Page({
  data: {
    customers: [],
    loading: false,
    searchKeyword: ''
  },

  onLoad() {
    this.loadCustomers();
  },

  // 加载客户列表
  loadCustomers() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { customersData } = require('../../data/supplyChainData');
      this.setData({
        customers: customersData,
        loading: false
      });
    }, 1000);
  },

  // 搜索客户
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 查看客户详情
  viewCustomerDetail(e) {
    const { customerId } = e.currentTarget.dataset;
    const customer = this.data.customers.find(item => item.code === customerId);
    
    wx.showModal({
      title: '客户详情',
      content: `客户名称: ${customer.name}\n客户编码: ${customer.code}\n联系人: ${customer.contact}\n电话: ${customer.phone}\n地址: ${customer.address}`,
      showCancel: false
    });
  },

  // 添加客户
  addCustomer() {
    wx.showToast({ title: '添加客户功能开发中', icon: 'none' });
  },

  // 刷新客户列表
  onPullDownRefresh() {
    this.loadCustomers();
    wx.stopPullDownRefresh();
  }
});