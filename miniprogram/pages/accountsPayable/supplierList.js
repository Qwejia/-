Page({
  data: {
    suppliers: [],
    filteredSuppliers: [],
    searchQuery: '',
    statusFilter: 'all',
    showAddDialog: false,
    supplier: {
      code: '',
      name: '',
      contact: '',
      phone: '',
      address: '',
      creditLimit: 0,
      status: 'active'
    },
    editingId: null
  },

  onLoad: function() {
    this.loadSuppliers();
  },

  onShow: function() {
    this.loadSuppliers();
  },

  loadSuppliers: function() {
    const suppliers = getApp().getSuppliersFromLocal();
    this.setData({
      suppliers: suppliers,
      filteredSuppliers: suppliers
    });
  },

  searchSupplier: function(e) {
    const searchQuery = e.detail.value.toLowerCase();
    this.setData({ searchQuery });
    this.filterSuppliers();
  },

  filterByStatus: function(e) {
    const statusFilter = e.currentTarget.dataset.status;
    this.setData({ statusFilter });
    this.filterSuppliers();
  },

  filterSuppliers: function() {
    const { suppliers, searchQuery, statusFilter } = this.data;
    let filtered = suppliers;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery) ||
        s.code.toLowerCase().includes(searchQuery) ||
        s.contact.toLowerCase().includes(searchQuery) ||
        s.phone.includes(searchQuery)
      );
    }

    this.setData({ filteredSuppliers: filtered });
  },

  showAddSupplier: function() {
    this.setData({
      showAddDialog: true,
      editingId: null,
      supplier: {
        code: '',
        name: '',
        contact: '',
        phone: '',
        address: '',
        creditLimit: 0,
        status: 'active'
      }
    });
  },

  showEditSupplier: function(e) {
    const supplierId = e.currentTarget.dataset.id;
    const supplier = this.data.suppliers.find(s => s._id === supplierId);
    this.setData({
      showAddDialog: true,
      editingId: supplierId,
      supplier: { ...supplier }
    });
  },

  closeAddDialog: function() {
    this.setData({ showAddDialog: false });
  },

  inputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`supplier.${field}`]: value
    });
  },

  saveSupplier: function() {
    const { supplier, editingId } = this.data;
    
    if (!supplier.code || !supplier.name || !supplier.contact || !supplier.phone) {
      wx.showToast({
        title: '请填写必填字段',
        icon: 'none'
      });
      return;
    }

    if (editingId) {
      // 更新现有供应商
      getApp().updateSupplierToLocal(supplier);
      wx.showToast({
        title: '供应商已更新',
        icon: 'success'
      });
    } else {
      // 检查供应商编码是否已存在
      const existingSuppliers = getApp().getSuppliersFromLocal();
      if (existingSuppliers.find(s => s.code === supplier.code)) {
        wx.showToast({
          title: '供应商编码已存在',
          icon: 'none'
        });
        return;
      }

      // 添加新供应商
      const newSupplier = {
        ...supplier,
        _id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      getApp().addSupplierToLocal(newSupplier);
      wx.showToast({
        title: '供应商已添加',
        icon: 'success'
      });
    }

    this.setData({ showAddDialog: false });
    this.loadSuppliers();
  },

  deleteSupplier: function(e) {
    const supplierId = e.currentTarget.dataset.id;
    const supplier = this.data.suppliers.find(s => s._id === supplierId);

    wx.showModal({
      title: '确认删除',
      content: `确定要删除供应商 "${supplier.name}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          getApp().deleteSupplierFromLocal(supplierId);
          wx.showToast({
            title: '供应商已删除',
            icon: 'success'
          });
          this.loadSuppliers();
        }
      }
    });
  },

  toggleSupplierStatus: function(e) {
    const supplierId = e.currentTarget.dataset.id;
    const supplier = this.data.suppliers.find(s => s._id === supplierId);
    const newStatus = supplier.status === 'active' ? 'inactive' : 'active';
    
    supplier.status = newStatus;
    supplier.updatedAt = new Date().toISOString();
    
    getApp().updateSupplierToLocal(supplier);
    wx.showToast({
      title: `供应商已${newStatus === 'active' ? '激活' : '停用'}`,
      icon: 'success'
    });
    this.loadSuppliers();
  },

  viewSupplierDetail: function(e) {
    const supplierId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/accountsPayable/supplierDetail?id=${supplierId}`
    });
  }
});