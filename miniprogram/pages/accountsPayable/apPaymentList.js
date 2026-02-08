Page({
  data: {
    apPayments: [],
    filteredPayments: [],
    searchQuery: '',
    statusFilter: 'all',
    supplierId: '',
    suppliers: []
  },

  onLoad: function(options) {
    const { supplierId } = options;
    this.setData({ supplierId });
    this.loadApPayments();
    this.loadSuppliers();
  },

  onShow: function() {
    this.loadApPayments();
  },

  loadSuppliers: function() {
    const suppliers = getApp().getSuppliersFromLocal();
    this.setData({ suppliers });
  },

  loadApPayments: function() {
    const allPayments = getApp().getApPaymentsFromLocal();
    const { supplierId } = this.data;
    
    let apPayments = allPayments;
    if (supplierId) {
      apPayments = apPayments.filter(payment => payment.supplierId === supplierId);
    }
    
    // 添加供应商名称
    const suppliers = getApp().getSuppliersFromLocal();
    apPayments = apPayments.map(payment => {
      const supplier = suppliers.find(s => s._id === payment.supplierId);
      return {
        ...payment,
        supplierName: supplier ? supplier.name : '未知供应商'
      };
    });
    
    this.setData({ apPayments, filteredPayments: apPayments });
    this.filterPayments();
  },

  searchPayment: function(e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterPayments();
  },

  filterByStatus: function(e) {
    const statusFilter = e.currentTarget.dataset.status;
    this.setData({ statusFilter });
    this.filterPayments();
  },

  filterPayments: function() {
    const { apPayments, searchQuery, statusFilter } = this.data;
    let filtered = apPayments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(payment => 
        payment.code.toLowerCase().includes(searchQuery) ||
        payment.supplierName.toLowerCase().includes(searchQuery) ||
        payment.remark?.toLowerCase().includes(searchQuery)
      );
    }

    this.setData({ filteredPayments: filtered });
  },

  addApPayment: function() {
    const { supplierId } = this.data;
    const url = supplierId ? `/pages/accountsPayable/apPaymentDetail?supplierId=${supplierId}` : '/pages/accountsPayable/apPaymentDetail';
    wx.navigateTo({ url });
  },

  viewApPayment: function(e) {
    const paymentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/accountsPayable/apPaymentDetail?id=${paymentId}`
    });
  },

  deleteApPayment: function(e) {
    const paymentId = e.currentTarget.dataset.id;
    const payment = this.data.apPayments.find(p => p._id === paymentId);

    wx.showModal({
      title: '确认删除',
      content: `确定要删除付款单 "${payment.code}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          getApp().deleteApPaymentFromLocal(paymentId);
          wx.showToast({
            title: '付款单已删除',
            icon: 'success'
          });
          this.loadApPayments();
        }
      }
    });
  }
});