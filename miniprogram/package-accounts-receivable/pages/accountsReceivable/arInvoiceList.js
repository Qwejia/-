// pages/accountsReceivable/arInvoiceList.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    arInvoices: [],
    filteredInvoices: [],
    customers: [],
    searchKeyword: '',
    selectedStatus: 'all',
    showFilter: false,
    dateRange: {
      startDate: '',
      endDate: ''
    },
    totalAmount: 0
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadInvoices();
    this.loadCustomers();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadInvoices();
    this.loadCustomers();
  },
  
  // 加载应收单列表
  loadInvoices() {
    const app = getApp();
    const arInvoices = app.getArInvoicesFromLocal();
    
    // 按单据日期降序排序
    const sortedInvoices = arInvoices.sort((a, b) => {
      return new Date(b.invoiceDate) - new Date(a.invoiceDate);
    });
    
    this.setData({
      arInvoices: sortedInvoices,
      filteredInvoices: sortedInvoices
    });
    
    this.calculateTotal();
  },
  
  // 加载客户列表
  loadCustomers() {
    const app = getApp();
    const customers = app.getCustomersFromLocal();
    this.setData({
      customers: customers
    });
  },
  
  // 计算总金额
  calculateTotal() {
    const { filteredInvoices } = this.data;
    const totalAmount = filteredInvoices.reduce((sum, invoice) => {
      return sum + invoice.amount;
    }, 0);
    
    this.setData({
      totalAmount: totalAmount
    });
  },
  
  // 搜索应收单
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterInvoices();
  },
  
  // 选择状态筛选
  onStatusChange(e) {
    const status = e.detail.value;
    this.setData({
      selectedStatus: status
    });
    this.filterInvoices();
  },
  
  // 选择日期范围
  onDateRangeChange(e) {
    const { startDate, endDate } = e.detail;
    this.setData({
      'dateRange.startDate': startDate,
      'dateRange.endDate': endDate
    });
    this.filterInvoices();
  },
  
  // 筛选应收单
  filterInvoices() {
    const { arInvoices, searchKeyword, selectedStatus, dateRange, customers } = this.data;
    
    let filtered = arInvoices;
    
    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus);
    }
    
    // 按日期范围筛选
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= start && invoiceDate <= end;
      });
    }
    
    // 按关键词筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(invoice => {
        // 根据客户名称、单据编号、备注搜索
        const customer = customers.find(c => c._id === invoice.customerId);
        const customerName = customer ? customer.name.toLowerCase() : '';
        
        return invoice.invoiceNo.toLowerCase().includes(keyword) ||
               customerName.includes(keyword) ||
               (invoice.remark && invoice.remark.toLowerCase().includes(keyword));
      });
    }
    
    this.setData({
      filteredInvoices: filtered
    });
    
    this.calculateTotal();
  },
  
  // 添加应收单
  addInvoice() {
    wx.navigateTo({
      url: '/pages/accountsReceivable/arInvoiceDetail?action=add'
    });
  },
  
  // 查看应收单详情
  viewInvoice(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/accountsReceivable/arInvoiceDetail?action=view&id=${id}`
    });
  },
  
  // 编辑应收单
  editInvoice(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/accountsReceivable/arInvoiceDetail?action=edit&id=${id}`
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
      showFilter: false,
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
    this.filterInvoices();
  },
  
  // 选择开始日期
  onStartDateChange(e) {
    this.setData({
      'dateRange.startDate': e.detail.value
    });
  },
  
  // 选择结束日期
  onEndDateChange(e) {
    this.setData({
      'dateRange.endDate': e.detail.value
    });
    this.filterInvoices();
  }
});
