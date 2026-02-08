Page({
  data: {
    supplier: null,
    apInvoices: [],
    apPayments: [],
    totalAmount: 0,
    totalPaid: 0,
    totalBalance: 0
  },

  onLoad: function(options) {
    const { id } = options;
    this.loadSupplierDetail(id);
    this.loadRelatedTransactions(id);
  },

  loadSupplierDetail: function(supplierId) {
    const suppliers = getApp().getSuppliersFromLocal();
    const supplier = suppliers.find(s => s._id === supplierId);
    this.setData({ supplier });
  },

  loadRelatedTransactions: function(supplierId) {
    // 加载应付单
    const allApInvoices = getApp().getApInvoicesFromLocal();
    const apInvoices = allApInvoices.filter(i => i.supplierId === supplierId);
    
    // 加载付款单
    const allApPayments = getApp().getApPaymentsFromLocal();
    const apPayments = allApPayments.filter(p => p.supplierId === supplierId);
    
    // 计算统计信息
    const totalAmount = apInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalPaid = apPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalBalance = totalAmount - totalPaid;
    
    this.setData({
      apInvoices,
      apPayments,
      totalAmount,
      totalPaid,
      totalBalance
    });
  },

  goToEdit: function() {
    wx.navigateTo({
      url: `/pages/accountsPayable/supplierList?id=${this.data.supplier._id}`
    });
  },

  goToApInvoiceList: function() {
    wx.navigateTo({
      url: `/pages/accountsPayable/apInvoiceList?supplierId=${this.data.supplier._id}`
    });
  },

  goToApPaymentList: function() {
    wx.navigateTo({
      url: `/pages/accountsPayable/apPaymentList?supplierId=${this.data.supplier._id}`
    });
  },

  addApInvoice: function() {
    wx.navigateTo({
      url: `/pages/accountsPayable/apInvoiceDetail?supplierId=${this.data.supplier._id}`
    });
  },

  addApPayment: function() {
    wx.navigateTo({
      url: `/pages/accountsPayable/apPaymentDetail?supplierId=${this.data.supplier._id}`
    });
  },

  viewApInvoice: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/accountsPayable/apInvoiceDetail?id=${id}`
    });
  },

  viewApPayment: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/accountsPayable/apPaymentDetail?id=${id}`
    });
  },

  onShareAppMessage: function() {
    return {
      title: `供应商详情 - ${this.data.supplier.name}`,
      path: `/pages/accountsPayable/supplierDetail?id=${this.data.supplier._id}`
    };
  }
});