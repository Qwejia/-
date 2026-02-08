// pages/accountsReceivable/arInvoiceDetail.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    action: '', // 'add', 'edit', or 'view'
    arInvoice: {
      invoiceNo: '',
      customerId: '',
      customerName: '',
      invoiceDate: '',
      dueDate: '',
      amount: 0,
      type: 'sale',
      status: 'draft',
      remark: ''
    },
    customers: [],
    invoiceId: '',
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
      this.loadInvoice(id);
    } else if (action === 'edit' && id) {
      this.loadInvoice(id);
    } else if (action === 'add') {
      this.initializeNewInvoice();
    }
  },
  
  // 初始化新应收单
  initializeNewInvoice() {
    // 生成当前日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // 生成应收单编号
    this.generateInvoiceNo();
    
    this.setData({
      'arInvoice.invoiceDate': currentDate,
      'arInvoice.dueDate': currentDate
    });
  },
  
  // 生成应收单编号
  generateInvoiceNo() {
    const app = getApp();
    const arInvoices = app.getArInvoicesFromLocal();
    
    // 获取当前年月
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // 查找当前年月的最大编号
    let maxSeq = 0;
    arInvoices.forEach(invoice => {
      if (invoice.invoiceNo.startsWith(`AR${yearMonth}`)) {
        const seq = parseInt(invoice.invoiceNo.substring(8));
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
    
    // 生成新编号
    const newSeq = String(maxSeq + 1).padStart(4, '0');
    const newInvoiceNo = `AR${yearMonth}${newSeq}`;
    
    this.setData({
      'arInvoice.invoiceNo': newInvoiceNo
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
  
  // 加载应收单信息
  loadInvoice(invoiceId) {
    const app = getApp();
    const arInvoices = app.getArInvoicesFromLocal();
    const invoice = arInvoices.find(inv => inv._id === invoiceId);
    
    if (invoice) {
      this.setData({
        invoiceId: invoiceId,
        arInvoice: invoice
      });
    }
  },
  
  // 客户选择变化
  onCustomerChange(e) {
    const customerId = e.detail.value;
    const customer = this.data.customers.find(c => c._id === customerId);
    
    if (customer) {
      this.setData({
        'arInvoice.customerId': customerId,
        'arInvoice.customerName': customer.name
      });
    }
  },
  
  // 发票日期变化
  onInvoiceDateChange(e) {
    this.setData({
      'arInvoice.invoiceDate': e.detail.value
    });
  },
  
  // 到期日期变化
  onDueDateChange(e) {
    this.setData({
      'arInvoice.dueDate': e.detail.value
    });
  },
  
  // 金额变化
  onAmountChange(e) {
    const amount = parseFloat(e.detail.value) || 0;
    this.setData({
      'arInvoice.amount': amount
    });
  },
  
  // 发票类型变化
  onTypeChange(e) {
    this.setData({
      'arInvoice.type': e.detail.value
    });
  },
  
  // 备注变化
  onRemarkChange(e) {
    this.setData({
      'arInvoice.remark': e.detail.value
    });
  },
  
  // 表单验证
  validateForm() {
    const { arInvoice } = this.data;
    
    if (!arInvoice.customerId) {
      wx.showToast({
        title: '请选择客户',
        icon: 'none'
      });
      return false;
    }
    
    if (!arInvoice.invoiceDate) {
      wx.showToast({
        title: '请选择发票日期',
        icon: 'none'
      });
      return false;
    }
    
    if (!arInvoice.dueDate) {
      wx.showToast({
        title: '请选择到期日期',
        icon: 'none'
      });
      return false;
    }
    
    if (arInvoice.amount <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      });
      return false;
    }
    
    if (new Date(arInvoice.dueDate) < new Date(arInvoice.invoiceDate)) {
      wx.showToast({
        title: '到期日期不能早于发票日期',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },
  
  // 保存应收单
  saveInvoice() {
    if (this.data.isSubmitting) return;
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({
      isSubmitting: true
    });
    
    const app = getApp();
    const { action, invoiceId, arInvoice } = this.data;
    
    try {
      if (action === 'add') {
        // 添加新应收单
        const newInvoice = {
          ...arInvoice,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          balance: arInvoice.amount // 初始余额等于金额
        };
        
        app.addArInvoiceToLocal(newInvoice);
        
        wx.showToast({
          title: '应收单添加成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else if (action === 'edit' && invoiceId) {
        // 更新应收单
        const updatedInvoice = {
          ...arInvoice,
          _id: invoiceId,
          updatedAt: new Date().toISOString()
        };
        
        app.updateArInvoiceToLocal(updatedInvoice);
        
        wx.showToast({
          title: '应收单更新成功',
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
  
  // 审核应收单
  approveInvoice() {
    const app = getApp();
    const { invoiceId, arInvoice } = this.data;
    
    wx.showModal({
      title: '审核确认',
      content: '确定要审核该应收单吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedInvoice = {
            ...arInvoice,
            _id: invoiceId,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          app.updateArInvoiceToLocal(updatedInvoice);
          
          wx.showToast({
            title: '审核成功',
            icon: 'success'
          });
          
          this.setData({
            'arInvoice.status': 'approved'
          });
        }
      }
    });
  },
  
  // 关闭应收单
  closeInvoice() {
    const app = getApp();
    const { invoiceId, arInvoice } = this.data;
    
    wx.showModal({
      title: '关闭确认',
      content: '确定要关闭该应收单吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedInvoice = {
            ...arInvoice,
            _id: invoiceId,
            status: 'closed',
            closedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          app.updateArInvoiceToLocal(updatedInvoice);
          
          wx.showToast({
            title: '关闭成功',
            icon: 'success'
          });
          
          this.setData({
            'arInvoice.status': 'closed'
          });
        }
      }
    });
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
