// pages/accountsReceivable/arReceiptDetail.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    action: '', // 'add', 'edit', or 'view'
    receipt: {
      receiptNo: '',
      customerId: '',
      customerName: '',
      invoiceId: '',
      invoiceNo: '',
      receiptDate: '',
      amount: 0,
      method: 'cash',
      remark: ''
    },
    customers: [],
    invoices: [],
    filteredInvoices: [],
    receiptId: '',
    isSubmitting: false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { action, id } = options;
    this.setData({
      action: action
    });
    
    this.loadCustomers();
    
    if (action === 'view' && id) {
      this.loadReceipt(id);
    } else if (action === 'edit' && id) {
      this.loadReceipt(id);
    } else if (action === 'add') {
      this.initializeNewReceipt();
    }
  },
  
  // 初始化新收款记录
  initializeNewReceipt() {
    // 生成当前日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // 生成收款记录编号
    this.generateReceiptNo();
    
    this.setData({
      'receipt.receiptDate': currentDate
    });
  },
  
  // 生成收款记录编号
  generateReceiptNo() {
    const app = getApp();
    const receipts = app.getArReceiptsFromLocal();
    
    // 获取当前年月
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // 查找当前年月的最大编号
    let maxSeq = 0;
    receipts.forEach(receipt => {
      if (receipt.receiptNo.startsWith(`RC${yearMonth}`)) {
        const seq = parseInt(receipt.receiptNo.substring(8));
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    
    // 生成新编号
    const newSeq = String(maxSeq + 1).padStart(4, '0');
    const newReceiptNo = `RC${yearMonth}${newSeq}`;
    
    this.setData({
      'receipt.receiptNo': newReceiptNo
    });
  },
  
  // 加载客户列表
  loadCustomers() {
    const app = getApp();
    const customers = app.getCustomersFromLocal();
    this.setData({
      customers: customers
    });
  },
  
  // 加载应收单列表
  loadInvoices() {
    const app = getApp();
    const invoices = app.getArInvoicesFromLocal();
    this.setData({
      invoices: invoices,
      filteredInvoices: invoices
    });
  },
  
  // 加载收款记录信息
  loadReceipt(receiptId) {
    const app = getApp();
    const receipts = app.getArReceiptsFromLocal();
    const receipt = receipts.find(rcpt => rcpt._id === receiptId);
    
    if (receipt) {
      this.setData({
        receiptId: receiptId,
        receipt: receipt
      });
      
      // 如果是编辑模式，加载应收单列表
      if (this.data.action === 'edit') {
        this.loadInvoices();
      }
    }
  },
  
  // 客户选择变化
  onCustomerChange(e) {
    const customerId = e.detail.value;
    const customer = this.data.customers.find(c => c._id === customerId);
    
    if (customer) {
      this.setData({
        'receipt.customerId': customerId,
        'receipt.customerName': customer.name
      });
      
      // 筛选该客户的应收单
      this.filterInvoicesByCustomer(customerId);
    }
  },
  
  // 根据客户筛选应收单
  filterInvoicesByCustomer(customerId) {
    const { invoices } = this.data;
    const filtered = invoices.filter(invoice => 
      invoice.customerId === customerId && invoice.status === 'approved' && invoice.balance > 0
    );
    
    this.setData({
      filteredInvoices: filtered
    });
  },
  
  // 应收单选择变化
  onInvoiceChange(e) {
    const invoiceId = e.detail.value;
    const invoice = this.data.invoices.find(inv => inv._id === invoiceId);
    
    if (invoice) {
      this.setData({
        'receipt.invoiceId': invoiceId,
        'receipt.invoiceNo': invoice.invoiceNo
      });
    }
  },
  
  // 收款日期变化
  onReceiptDateChange(e) {
    this.setData({
      'receipt.receiptDate': e.detail.value
    });
  },
  
  // 金额变化
  onAmountChange(e) {
    const amount = parseFloat(e.detail.value) || 0;
    this.setData({
      'receipt.amount': amount
    });
  },
  
  // 收款方式变化
  onMethodChange(e) {
    this.setData({
      'receipt.method': e.detail.value
    });
  },
  
  // 备注变化
  onRemarkChange(e) {
    this.setData({
      'receipt.remark': e.detail.value
    });
  },
  
  // 表单验证
  validateForm() {
    const { receipt } = this.data;
    
    if (!receipt.customerId) {
      wx.showToast({
        title: '请选择客户',
        icon: 'none'
      });
      return false;
    }
    
    if (!receipt.invoiceId) {
      wx.showToast({
        title: '请选择应收单',
        icon: 'none'
      });
      return false;
    }
    
    if (!receipt.receiptDate) {
      wx.showToast({
        title: '请选择收款日期',
        icon: 'none'
      });
      return false;
    }
    
    if (receipt.amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return false;
    }
    
    // 检查收款金额是否超过应收单余额
    const invoice = this.data.invoices.find(inv => inv._id === receipt.invoiceId);
    if (invoice && receipt.amount > invoice.balance) {
      wx.showToast({
        title: `收款金额不能超过应收余额¥${invoice.balance.toFixed(2)}`,
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },
  
  // 保存收款记录
  saveReceipt() {
    if (this.data.isSubmitting) return;
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({
      isSubmitting: true
    });
    
    const app = getApp();
    const { action, receiptId, receipt } = this.data;
    
    try {
      if (action === 'add') {
        // 添加新收款记录
        const newReceipt = {
          ...receipt,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 更新应收单余额
        this.updateInvoiceBalance(receipt.invoiceId, receipt.amount);
        
        app.addArReceiptToLocal(newReceipt);
        
        wx.showToast({
          title: '收款记录添加成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else if (action === 'edit' && receiptId) {
        // 更新收款记录
        const oldReceipt = app.getArReceiptsFromLocal().find(rcpt => rcpt._id === receiptId);
        
        if (oldReceipt) {
          // 计算金额变化
          const amountDiff = receipt.amount - oldReceipt.amount;
          
          // 更新应收单余额
          this.updateInvoiceBalance(receipt.invoiceId, amountDiff);
        }
        
        const updatedReceipt = {
          ...receipt,
          _id: receiptId,
          updatedAt: new Date().toISOString()
        };
        
        app.updateArReceiptToLocal(updatedReceipt);
        
        wx.showToast({
          title: '收款记录更新成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({
        isSubmitting: false
      });
    }
  },
  
  // 更新应收单余额
  updateInvoiceBalance(invoiceId, amount) {
    const app = getApp();
    const invoices = app.getArInvoicesFromLocal();
    const invoiceIndex = invoices.findIndex(inv => inv._id === invoiceId);
    
    if (invoiceIndex !== -1) {
      invoices[invoiceIndex].balance -= amount;
      invoices[invoiceIndex].updatedAt = new Date().toISOString();
      
      // 如果余额为0，更新状态为已核销
      if (invoices[invoiceIndex].balance <= 0) {
        invoices[invoiceIndex].status = 'writtenoff';
      } else if (invoices[invoiceIndex].balance > 0) {
        invoices[invoiceIndex].status = 'approved';
      }
      
      app.updateArInvoicesLocal(invoices);
    }
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 编辑收款记录
  editReceipt() {
    const { receiptId } = this.data;
    wx.redirectTo({
      url: `/pages/accountsReceivable/arReceiptDetail?action=edit&id=${receiptId}`
    });
  },
  
  // 删除收款记录
  deleteReceipt() {
    const { receiptId, receipt } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条收款记录吗？删除后将恢复应收单余额。',
      confirmText: '删除',
      confirmColor: '#f44336',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          
          try {
            // 恢复应收单余额
            this.updateInvoiceBalance(receipt.invoiceId, -receipt.amount);
            
            // 删除收款记录
            app.deleteArReceiptFromLocal(receiptId);
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});
