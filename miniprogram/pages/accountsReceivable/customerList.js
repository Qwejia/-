// pages/accountsReceivable/customerList.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    customers: [],
    filteredCustomers: [],
    searchKeyword: '',
    selectedStatus: 'all',
    showFilter: false,
    customerId: ''
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadCustomers();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadCustomers();
  },
  
  // 加载客户列表
  loadCustomers() {
    const app = getApp();
    const customers = app.getCustomersFromLocal();
    
    // 按客户编号排序
    const sortedCustomers = customers.sort((a, b) => {
      if (a.code < b.code) return -1;
      if (a.code > b.code) return 1;
      return 0;
    });
    
    this.setData({
      customers: sortedCustomers,
      filteredCustomers: sortedCustomers
    });
  },
  
  // 搜索客户
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterCustomers();
  },
  
  // 选择状态筛选
  onStatusChange(e) {
    const status = e.detail.value;
    this.setData({
      selectedStatus: status
    });
    this.filterCustomers();
  },
  
  // 筛选客户
  filterCustomers() {
    const { customers, searchKeyword, selectedStatus } = this.data;
    
    let filtered = customers;
    
    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === selectedStatus);
    }
    
    // 按关键词筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(keyword) || 
        customer.code.toLowerCase().includes(keyword) ||
        customer.contact.toLowerCase().includes(keyword) ||
        customer.phone.includes(keyword)
      );
    }
    
    this.setData({
      filteredCustomers: filtered
    });
  },
  
  // 添加客户
  addCustomer() {
    wx.navigateTo({
      url: '/pages/accountsReceivable/customerDetail?action=add'
    });
  },
  
  // 编辑客户
  editCustomer(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/accountsReceivable/customerDetail?action=edit&id=${id}`
    });
  },
  
  // 删除客户
  deleteCustomer(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();
    
    wx.showModal({
      title: '删除客户',
      content: '确定要删除该客户吗？',
      success: (res) => {
        if (res.confirm) {
          app.deleteCustomerFromLocal(id);
          this.loadCustomers();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 切换筛选面板
  toggleFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },
  
  // 重置筛选
  resetFilter() {
    this.setData({
      searchKeyword: '',
      selectedStatus: 'all',
      showFilter: false
    });
    this.filterCustomers();
  }
});
