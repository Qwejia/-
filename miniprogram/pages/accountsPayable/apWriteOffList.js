Page({
  data: {
    writeOffs: [],
    filteredWriteOffs: [],
    searchQuery: '',
    suppliers: [],
    apInvoices: []
  },

  onLoad: function() {
    this.loadWriteOffs();
    this.loadSuppliers();
    this.loadApInvoices();
  },

  onShow: function() {
    this.loadWriteOffs();
  },

  loadSuppliers: function() {
    const suppliers = getApp().getSuppliersFromLocal();
    this.setData({ suppliers });
  },

  loadApInvoices: function() {
    const apInvoices = getApp().getApInvoicesFromLocal();
    this.setData({ apInvoices });
  },

  loadWriteOffs: function() {
    const writeOffs = getApp().getApWriteOffsFromLocal();
    
    // 添加供应商和应付单信息
    const suppliers = getApp().getSuppliersFromLocal();
    const apInvoices = getApp().getApInvoicesFromLocal();
    
    const writeOffsWithDetails = writeOffs.map(writeOff => {
      const invoice = apInvoices.find(i => i._id === writeOff.invoiceId);
      const supplier = invoice ? suppliers.find(s => s._id === invoice.supplierId) : null;
      
      return {
        ...writeOff,
        invoiceCode: invoice ? invoice.code : '未知应付单',
        supplierName: supplier ? supplier.name : '未知供应商',
        invoiceDate: invoice ? invoice.invoiceDate : '未知日期'
      };
    });
    
    // 按核销日期降序排序
    writeOffsWithDetails.sort((a, b) => new Date(b.writeOffDate) - new Date(a.writeOffDate));
    
    this.setData({ writeOffs: writeOffsWithDetails, filteredWriteOffs: writeOffsWithDetails });
  },

  searchWriteOff: function(e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterWriteOffs();
  },

  filterWriteOffs: function() {
    const { writeOffs, searchQuery } = this.data;
    let filtered = writeOffs;

    if (searchQuery) {
      filtered = filtered.filter(writeOff => 
        writeOff.invoiceCode.toLowerCase().includes(searchQuery) ||
        writeOff.supplierName.toLowerCase().includes(searchQuery) ||
        writeOff.remark?.toLowerCase().includes(searchQuery)
      );
    }

    this.setData({ filteredWriteOffs: filtered });
  }
});