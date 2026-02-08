Page({
  data: {
    apInvoices: [],
    filteredInvoices: [],
    searchQuery: '',
    statusFilter: 'all',
    supplierId: '',
    suppliers: []
  },

  onLoad: function(options) {
    const { supplierId } = options;
    this.setData({ supplierId });
    this.loadApInvoices();
    this.loadSuppliers();
  },

  onShow: function() {
    this.loadApInvoices();
  },

  loadSuppliers: function() {
    const suppliers = getApp().getSuppliersFromLocal();
    this.setData({ suppliers });
  },

  loadApInvoices: function() {
    const allInvoices = getApp().getApInvoicesFromLocal();
    const { supplierId } = this.data;
    
    let apInvoices = allInvoices;
    if (supplierId) {
      apInvoices = apInvoices.filter(invoice => invoice.supplierId === supplierId);
    }
    
    // 添加供应商名称和格式化金额
    const suppliers = getApp().getSuppliersFromLocal();
    apInvoices = apInvoices.map(invoice => {
      const supplier = suppliers.find(s => s._id === invoice.supplierId);
      const paid = invoice.amount - invoice.balance;
      return {
        ...invoice,
        supplierName: supplier ? supplier.name : '未知供应商',
        formattedAmount: invoice.amount.toLocaleString(),
        formattedPaid: paid.toLocaleString(),
        formattedBalance: invoice.balance.toLocaleString()
      };
    });
    
    this.setData({ apInvoices, filteredInvoices: apInvoices });
    this.filterInvoices();
  },

  searchInvoice: function(e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterInvoices();
  },

  filterByStatus: function(e) {
    const statusFilter = e.currentTarget.dataset.status;
    this.setData({ statusFilter });
    this.filterInvoices();
  },

  filterInvoices: function() {
    const { apInvoices, searchQuery, statusFilter } = this.data;
    let filtered = apInvoices;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(invoice => 
        invoice.code.toLowerCase().includes(searchQuery) ||
        invoice.supplierName.toLowerCase().includes(searchQuery) ||
        invoice.remark?.toLowerCase().includes(searchQuery)
      );
    }

    this.setData({ filteredInvoices: filtered });
  },

  addApInvoice: function() {
    const { supplierId } = this.data;
    const url = supplierId ? `/pages/accountsPayable/apInvoiceDetail?supplierId=${supplierId}` : '/pages/accountsPayable/apInvoiceDetail';
    wx.navigateTo({ url });
  },

  viewApInvoice: function(e) {
    const invoiceId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/accountsPayable/apInvoiceDetail?id=${invoiceId}`
    });
  },

  deleteApInvoice: function(e) {
    const invoiceId = e.currentTarget.dataset.id;
    const invoice = this.data.apInvoices.find(i => i._id === invoiceId);

    wx.showModal({
      title: '确认删除',
      content: `确定要删除应付单 "${invoice.code}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          getApp().deleteApInvoiceFromLocal(invoiceId);
          wx.showToast({
            title: '应付单已删除',
            icon: 'success'
          });
          this.loadApInvoices();
        }
      }
    });
  }
});