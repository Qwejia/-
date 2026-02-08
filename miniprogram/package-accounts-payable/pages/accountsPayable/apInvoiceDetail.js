Page({
  data: {
    apInvoice: {
      code: '',
      supplierId: '',
      invoiceDate: '',
      dueDate: '',
      amount: 0,
      balance: 0,
      paymentMethod: '',
      remark: '',
      status: 'unpaid'
    },
    suppliers: [],
    editing: false,
    supplierIndex: 0,
    selectedSupplierName: '请选择供应商',
    formattedPaidAmount: '0'
  },

  onLoad: function(options) {
    console.log('apInvoiceDetail onLoad', options);
    const { id, supplierId } = options || {};
    this.loadSuppliers();
    
    if (id) {
      // 编辑模式
      this.setData({ editing: true });
      this.loadApInvoice(id);
    } else {
      // 新增模式
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const apInvoice = {
        ...this.data.apInvoice,
        supplierId: supplierId || '',
        invoiceDate: today,
        dueDate: dueDate
      };
      this.setData({ apInvoice });
    }
  },

  loadSuppliers: function() {
    const suppliers = getApp().getSuppliersFromLocal();
    // 计算当前选择的供应商索引和名称
    const supplierIndex = this.data.apInvoice.supplierId 
      ? suppliers.findIndex(s => s._id === this.data.apInvoice.supplierId)
      : 0;
    const selectedSupplierName = supplierIndex >= 0 && supplierIndex < suppliers.length 
      ? suppliers[supplierIndex].name
      : '请选择供应商';
    this.setData({ suppliers, supplierIndex, selectedSupplierName });
  },

  loadApInvoice: function(id) {
    const invoice = getApp().getApInvoiceFromLocal(id);
    if (invoice) {
      // 计算已付金额并格式化
      const paidAmount = invoice.amount - invoice.balance;
      const formattedPaidAmount = paidAmount.toLocaleString();
      this.setData({ 
        apInvoice: invoice,
        formattedPaidAmount: formattedPaidAmount 
      });
      // 更新选择的供应商索引和名称
      const suppliers = this.data.suppliers;
      const supplierIndex = invoice.supplierId 
        ? suppliers.findIndex(s => s._id === invoice.supplierId)
        : 0;
      const selectedSupplierName = supplierIndex >= 0 && supplierIndex < suppliers.length 
        ? suppliers[supplierIndex].name
        : '请选择供应商';
      this.setData({ supplierIndex, selectedSupplierName });
    }
  },

  generateInvoiceCode: function() {
    const invoices = getApp().getApInvoicesFromLocal();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let maxSeq = 0;
    
    invoices.forEach(invoice => {
      if (invoice.code && invoice.code.startsWith('AP' + dateStr)) {
        const seq = parseInt(invoice.code.slice(10));
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    
    const newSeq = maxSeq + 1;
    const code = `AP${dateStr}${String(newSeq).padStart(4, '0')}`;
    return code;
  },

  inputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    let { value } = e.detail;
    
    // 处理数值字段
    if (field === 'amount' || field === 'balance') {
      value = parseFloat(value) || 0;
    }
    
    this.setData({
      [`apInvoice.${field}`]: value
    });
  },

  supplierChange: function(e) {
    const supplierIndex = e.detail.value;
    const supplier = this.data.suppliers[supplierIndex];
    this.setData({
      [`apInvoice.supplierId`]: supplier._id,
      selectedSupplierName: supplier.name
    });
  },

  saveApInvoice: function() {
    const { apInvoice, editing } = this.data;
    
    // 验证必填字段
    if (!apInvoice.supplierId) {
      wx.showToast({
        title: '请选择供应商',
        icon: 'none'
      });
      return;
    }
    
    if (!apInvoice.invoiceDate) {
      wx.showToast({
        title: '请选择开票日期',
        icon: 'none'
      });
      return;
    }
    
    if (!apInvoice.dueDate) {
      wx.showToast({
        title: '请选择到期日期',
        icon: 'none'
      });
      return;
    }
    
    if (apInvoice.amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }
    
    if (new Date(apInvoice.dueDate) < new Date(apInvoice.invoiceDate)) {
      wx.showToast({
        title: '到期日期不能早于开票日期',
        icon: 'none'
      });
      return;
    }
    
    // 更新余额
    apInvoice.balance = apInvoice.amount;
    
    if (editing) {
      // 更新现有应付单
      const existingInvoice = getApp().getApInvoiceFromLocal(apInvoice._id);
      // 如果金额变化，重新计算余额
      if (existingInvoice.amount !== apInvoice.amount) {
        const paidAmount = existingInvoice.amount - existingInvoice.balance;
        apInvoice.balance = apInvoice.amount - paidAmount;
        
        // 更新状态
        if (apInvoice.balance <= 0) {
          apInvoice.status = 'writtenoff';
          apInvoice.balance = 0;
        } else if (apInvoice.balance < apInvoice.amount) {
          apInvoice.status = 'partiallypaid';
        } else {
          apInvoice.status = 'unpaid';
        }
      }
      
      getApp().updateApInvoiceToLocal(apInvoice);
      wx.showToast({
        title: '应付单已更新',
        icon: 'success'
      });
    } else {
      // 生成单据编号
      apInvoice.code = this.generateInvoiceCode();
      
      // 新增应付单
      const newInvoice = {
        ...apInvoice,
        _id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      getApp().addApInvoiceToLocal(newInvoice);
      wx.showToast({
        title: '应付单已添加',
        icon: 'success'
      });
    }
    
    // 保存成功后返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  deleteApInvoice: function() {
    const { apInvoice } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除应付单 "${apInvoice.code}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          getApp().deleteApInvoiceFromLocal(apInvoice._id);
          wx.showToast({
            title: '应付单已删除',
            icon: 'success'
          });
          
          // 删除成功后返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  },

  goBack: function() {
    wx.navigateBack();
  }
});