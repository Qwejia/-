Page({
  data: {
    apPayment: {
      code: '',
      supplierId: '',
      paymentDate: '',
      amount: 0,
      paymentMethod: '',
      payer: '',
      createdBy: '',
      remark: '',
      status: 'pending',
      invoiceIds: []
    },
    suppliers: [],
    apInvoices: [],
    selectedInvoices: [],
    editing: false,
    supplierIndex: 0,
    selectedSupplierName: '请选择供应商',
    totalSelectedBalance: 0,
    formattedTotalSelectedBalance: '0'
  },

  onLoad: function(options) {
    const { id, supplierId } = options;
    this.loadSuppliers();
    this.loadApInvoices();
    
    if (id) {
      // 编辑模式
      this.setData({ editing: true });
      this.loadApPayment(id);
    } else {
      // 新增模式
      const today = new Date().toISOString().split('T')[0];
      const apPayment = {
        ...this.data.apPayment,
        supplierId: supplierId || '',
        paymentDate: today,
        createdBy: '当前用户' // 实际应用中应从登录信息获取
      };
      this.setData({ apPayment });
    }
  },

  loadSuppliers: function() {
    const suppliers = getApp().getSuppliersFromLocal();
    // 计算当前选择的供应商索引和名称
    const supplierIndex = this.data.apPayment.supplierId 
      ? suppliers.findIndex(s => s._id === this.data.apPayment.supplierId)
      : 0;
    const selectedSupplierName = supplierIndex >= 0 && supplierIndex < suppliers.length 
      ? suppliers[supplierIndex].name
      : '请选择供应商';
    this.setData({ suppliers, supplierIndex, selectedSupplierName });
  },

  loadApInvoices: function() {
    const apInvoices = getApp().getApInvoicesFromLocal();
    // 只显示未全额支付的应付单
    const unpaidInvoices = apInvoices.filter(invoice => invoice.balance > 0);
    
    // 添加供应商名称和格式化金额
    const suppliers = getApp().getSuppliersFromLocal();
    const invoicesWithSupplier = unpaidInvoices.map(invoice => {
      const supplier = suppliers.find(s => s._id === invoice.supplierId);
      const isSelected = false; // 初始状态为未选中
      return {
        ...invoice,
        supplierName: supplier ? supplier.name : '未知供应商',
        formattedAmount: invoice.amount.toLocaleString(),
        formattedBalance: invoice.balance.toLocaleString(),
        selected: isSelected
      };
    });
    
    this.setData({ apInvoices: invoicesWithSupplier });
  },

  loadApPayment: function(id) {
    const payment = getApp().getApPaymentFromLocal(id);
    if (payment) {
      this.setData({ apPayment: payment });
      // 更新选择的供应商索引和名称
      const suppliers = this.data.suppliers;
      const supplierIndex = payment.supplierId 
        ? suppliers.findIndex(s => s._id === payment.supplierId)
        : 0;
      const selectedSupplierName = supplierIndex >= 0 && supplierIndex < suppliers.length 
        ? suppliers[supplierIndex].name
        : '请选择供应商';
      this.setData({ supplierIndex, selectedSupplierName });
      this.loadSelectedInvoices(payment.invoiceIds);
    }
  },

  loadSelectedInvoices: function(invoiceIds) {
    const allInvoices = getApp().getApInvoicesFromLocal();
    const selectedInvoices = allInvoices.filter(invoice => invoiceIds.includes(invoice._id));
    
    // 添加供应商名称和格式化金额
    const suppliers = getApp().getSuppliersFromLocal();
    const invoicesWithSupplier = selectedInvoices.map(invoice => {
      const supplier = suppliers.find(s => s._id === invoice.supplierId);
      return {
        ...invoice,
        supplierName: supplier ? supplier.name : '未知供应商',
        formattedAmount: invoice.amount.toLocaleString(),
        formattedBalance: invoice.balance.toLocaleString()
      };
    });
    
    this.setData({ selectedInvoices: invoicesWithSupplier });
  },

  generatePaymentCode: function() {
    const payments = getApp().getApPaymentsFromLocal();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let maxSeq = 0;
    
    payments.forEach(payment => {
      if (payment.code && payment.code.startsWith('APP' + dateStr)) {
        const seq = parseInt(payment.code.slice(11));
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    
    const newSeq = maxSeq + 1;
    const code = `APP${dateStr}${String(newSeq).padStart(4, '0')}`;
    return code;
  },

  inputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    let { value } = e.detail;
    
    // 处理数值字段
    if (field === 'amount') {
      value = parseFloat(value) || 0;
    }
    
    this.setData({
      [`apPayment.${field}`]: value
    });
  },

  supplierChange: function(e) {
    const supplierIndex = e.detail.value;
    const supplier = this.data.suppliers[supplierIndex];
    this.setData({
      [`apPayment.supplierId`]: supplier._id,
      supplierIndex: supplierIndex,
      selectedSupplierName: supplier.name,
      selectedInvoices: []
    });
    // 当选择供应商后，过滤该供应商的应付单
    this.filterInvoicesBySupplier(supplier._id);
  },

  filterInvoicesBySupplier: function(supplierId) {
    const allInvoices = getApp().getApInvoicesFromLocal();
    // 只显示未全额支付的应付单
    const filteredInvoices = allInvoices.filter(invoice => 
      invoice.balance > 0 && invoice.supplierId === supplierId
    );
    
    // 添加供应商名称和格式化金额
    const suppliers = getApp().getSuppliersFromLocal();
    const invoicesWithSupplier = filteredInvoices.map(invoice => {
      const supplier = suppliers.find(s => s._id === invoice.supplierId);
      const isSelected = false; // 初始状态为未选中
      return {
        ...invoice,
        supplierName: supplier ? supplier.name : '未知供应商',
        formattedAmount: invoice.amount.toLocaleString(),
        formattedBalance: invoice.balance.toLocaleString(),
        selected: isSelected
      };
    });
    
    this.setData({ apInvoices: invoicesWithSupplier });
  },

  selectInvoice: function(e) {
    const invoiceId = e.currentTarget.dataset.id;
    const { selectedInvoices, apInvoices } = this.data;
    
    const invoice = apInvoices.find(i => i._id === invoiceId);
    if (!invoice) return;
    
    // 检查是否已选择
    const isSelected = selectedInvoices.some(i => i._id === invoiceId);
    let updatedSelectedInvoices;
    
    if (isSelected) {
      // 取消选择
      updatedSelectedInvoices = selectedInvoices.filter(i => i._id !== invoiceId);
    } else {
      // 添加选择
      updatedSelectedInvoices = [...selectedInvoices, invoice];
    }
    
    // 更新apInvoices数组中发票项的selected属性
    const updatedApInvoices = apInvoices.map(item => {
      return {
        ...item,
        selected: updatedSelectedInvoices.some(selected => selected._id === item._id)
      };
    });
    
    // 计算总余额并格式化
    const totalSelectedBalance = updatedSelectedInvoices.reduce((total, invoice) => total + invoice.balance, 0);
    const formattedTotalSelectedBalance = totalSelectedBalance.toLocaleString();
    this.setData({ 
      apInvoices: updatedApInvoices,
      selectedInvoices: updatedSelectedInvoices,
      totalSelectedBalance: totalSelectedBalance,
      formattedTotalSelectedBalance: formattedTotalSelectedBalance
    });
  },

  calculateTotalSelected: function() {
    const { selectedInvoices } = this.data;
    return selectedInvoices.reduce((total, invoice) => total + invoice.balance, 0);
  },

  saveApPayment: function() {
    const { apPayment, selectedInvoices, editing } = this.data;
    
    // 验证必填字段
    if (!apPayment.supplierId) {
      wx.showToast({
        title: '请选择供应商',
        icon: 'none'
      });
      return;
    }
    
    if (!apPayment.paymentDate) {
      wx.showToast({
        title: '请选择付款日期',
        icon: 'none'
      });
      return;
    }
    
    if (apPayment.amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return;
    }
    
    if (selectedInvoices.length === 0) {
      wx.showToast({
        title: '请选择要核销的应付单',
        icon: 'none'
      });
      return;
    }
    
    const totalSelected = this.calculateTotalSelected();
    if (apPayment.amount > totalSelected) {
      wx.showToast({
        title: '付款金额不能大于选中应付单的总余额',
        icon: 'none'
      });
      return;
    }
    
    // 生成单据编号
    if (!editing) {
      apPayment.code = this.generatePaymentCode();
    }
    
    // 更新发票ID列表
    apPayment.invoiceIds = selectedInvoices.map(invoice => invoice._id);
    
    if (editing) {
      // 更新现有付款单
      getApp().updateApPaymentToLocal(apPayment);
      wx.showToast({
        title: '付款单已更新',
        icon: 'success'
      });
    } else {
      // 新增付款单
      const newPayment = {
        ...apPayment,
        _id: new Date().getTime().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      getApp().addApPaymentToLocal(newPayment);
      
      // 核销应付单
      this.writeOffInvoices(selectedInvoices, newPayment.amount);
      
      wx.showToast({
        title: '付款单已添加并核销',
        icon: 'success'
      });
    }
    
    // 保存成功后返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  writeOffInvoices: function(invoices, paymentAmount) {
    let remainingAmount = paymentAmount;
    
    // 按到期日期排序，优先核销到期日早的
    const sortedInvoices = [...invoices].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    sortedInvoices.forEach(invoice => {
      if (remainingAmount <= 0) return;
      
      const writeOffAmount = Math.min(remainingAmount, invoice.balance);
      remainingAmount -= writeOffAmount;
      
      // 更新应付单余额
      invoice.balance -= writeOffAmount;
      
      // 更新应付单状态
      if (invoice.balance <= 0) {
        invoice.status = 'writtenoff';
        invoice.balance = 0;
      } else if (invoice.balance < invoice.amount) {
        invoice.status = 'partiallypaid';
      } else {
        invoice.status = 'unpaid';
      }
      
      // 保存更新后的应付单
      getApp().updateApInvoiceToLocal(invoice);
      
      // 创建核销记录
      this.createWriteOffRecord(invoice._id, writeOffAmount);
    });
  },

  createWriteOffRecord: function(invoiceId, amount) {
    const writeOff = {
      _id: new Date().getTime().toString(),
      invoiceId: invoiceId,
      amount: amount,
      writeOffDate: new Date().toISOString().split('T')[0],
      type: 'ap',
      remark: '付款核销'
    };
    
    getApp().addApWriteOffToLocal(writeOff);
  },

  deleteApPayment: function() {
    const { apPayment } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除付款单 "${apPayment.code}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          getApp().deleteApPaymentFromLocal(apPayment._id);
          wx.showToast({
            title: '付款单已删除',
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