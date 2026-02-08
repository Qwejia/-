// pages/generalLedger/voucherList.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    vouchers: [],
    filteredVouchers: [],
    searchKeyword: '',
    statusFilter: '',
    dateRange: {
      start: '',
      end: ''
    },
    statusOptions: [
      { value: '', text: '全部状态' },
      { value: 'draft', text: '草稿' },
      { value: 'submitted', text: '已提交' },
      { value: 'approved', text: '已审核' },
      { value: 'posted', text: '已记账' }
    ]
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadVouchers();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadVouchers();
  },
  
  // 加载凭证数据
  loadVouchers() {
    const app = getApp();
    const vouchers = app.getVouchersFromLocal();
    
    // 按日期降序排序
    const sortedVouchers = vouchers.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    this.setData({
      vouchers: sortedVouchers,
      filteredVouchers: sortedVouchers
    });
  },
  
  // 搜索凭证
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterVouchers();
  },
  
  // 选择状态筛选
  onStatusChange(e) {
    const status = e.detail.value;
    this.setData({
      statusFilter: status
    });
    this.filterVouchers();
  },
  
  // 选择开始日期
  onStartDateChange(e) {
    const start = e.detail.value;
    this.setData({
      'dateRange.start': start
    });
    this.filterVouchers();
  },
  
  // 选择结束日期
  onEndDateChange(e) {
    const end = e.detail.value;
    this.setData({
      'dateRange.end': end
    });
    this.filterVouchers();
  },
  
  // 筛选凭证
  filterVouchers() {
    const { vouchers, searchKeyword, statusFilter, dateRange } = this.data;
    
    let filtered = vouchers;
    
    // 按关键词筛选
    if (searchKeyword) {
      filtered = filtered.filter(voucher => {
        return voucher.number.includes(searchKeyword);
      });
    }
    
    // 按状态筛选
    if (statusFilter) {
      filtered = filtered.filter(voucher => voucher.status === statusFilter);
    }
    
    // 按日期范围筛选
    if (dateRange.start) {
      filtered = filtered.filter(voucher => voucher.date >= dateRange.start);
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(voucher => voucher.date <= dateRange.end);
    }
    
    this.setData({
      filteredVouchers: filtered
    });
  },
  
  // 重置筛选条件
  resetFilters() {
    this.setData({
      searchKeyword: '',
      statusFilter: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
    this.filterVouchers();
  },
  
  // 查看凭证详情
  viewVoucherDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/generalLedger/voucherDetail?id=${id}`
    });
  },
  
  // 新增凭证
  addVoucher() {
    wx.navigateTo({
      url: '/pages/generalLedger/voucherEntry'
    });
  },
  
  // 审核凭证
  approveVoucher(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();
    const vouchers = app.getVouchersFromLocal();
    const updatedVouchers = vouchers.map(voucher => {
      if (voucher._id === id) {
        return { ...voucher, status: 'approved', approvedAt: new Date().toISOString() };
      }
      return voucher;
    });
    
    app.saveVouchersToLocal(updatedVouchers);
    this.loadVouchers();
    
    wx.showToast({
      title: '凭证已审核',
      icon: 'success'
    });
  },
  
  // 记账凭证
  postVoucher(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();
    const vouchers = app.getVouchersFromLocal();
    const updatedVouchers = vouchers.map(voucher => {
      if (voucher._id === id) {
        return { ...voucher, status: 'posted', postedAt: new Date().toISOString() };
      }
      return voucher;
    });
    
    app.saveVouchersToLocal(updatedVouchers);
    this.loadVouchers();
    
    wx.showToast({
      title: '凭证已记账',
      icon: 'success'
    });
  }
});
