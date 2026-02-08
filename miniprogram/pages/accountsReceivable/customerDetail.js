// pages/accountsReceivable/customerDetail.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    action: '', // 'add' or 'edit'
    customerId: '',
    customer: {
      code: '',
      name: '',
      contact: '',
      phone: '',
      address: '',
      creditLimit: 0,
      status: 'active'
    },
    isSubmitting: false,
    agingData: {
      '0-30天': 0,
      '31-60天': 0,
      '61-90天': 0,
      '91-180天': 0,
      '180天以上': 0,
      total: 0
    },
    customerInvoices: []
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { action, id } = options;
    this.setData({
      action: action
    });
    
    if (action === 'edit' && id) {
      this.loadCustomer(id);
    } else if (action === 'add') {
      this.generateCustomerCode();
    }
  },
  
  // 加载客户信息
  loadCustomer(customerId) {
    const app = getApp();
    const customers = app.getCustomersFromLocal();
    const customer = customers.find(c => c._id === customerId);
    
    if (customer) {
      this.setData({
        customerId: customerId,
        customer: customer
      });
      
      // 加载客户的应收账款账龄统计
      this.calculateCustomerAging();
    }
  },
  
  // 计算客户应收账款账龄
  calculateCustomerAging() {
    const app = getApp();
    const { customerId } = this.data;
    const invoices = app.getArInvoicesFromLocal();
    const receipts = app.getArReceiptsFromLocal();
    
    // 获取该客户的所有应收单
    const customerInvoices = invoices.filter(invoice => 
      invoice.customerId === customerId && 
      (invoice.status === 'approved' || invoice.status === 'partiallyWrittenOff')
    );
    
    // 计算账龄
    const agingData = {
      '0-30天': 0,
      '31-60天': 0,
      '61-90天': 0,
      '91-180天': 0,
      '180天以上': 0,
      total: 0
    };
    
    const asOfDate = new Date();
    
    customerInvoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.invoiceDate);
      const daysOutstanding = Math.ceil((asOfDate - invoiceDate) / (1000 * 60 * 60 * 24));
      
      let agingPeriod = '';
      if (daysOutstanding <= 30) agingPeriod = '0-30天';
      else if (daysOutstanding <= 60) agingPeriod = '31-60天';
      else if (daysOutstanding <= 90) agingPeriod = '61-90天';
      else if (daysOutstanding <= 180) agingPeriod = '91-180天';
      else agingPeriod = '180天以上';
      
      agingData[agingPeriod] += invoice.balance;
      agingData.total += invoice.balance;
    });
    
    this.setData({
      agingData: agingData,
      customerInvoices: customerInvoices
    });
  },
  
  // 刷新账龄数据
  refreshAgingData() {
    this.calculateCustomerAging();
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
    });
  },
  
  // 查看应收单详情
  viewInvoice(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/accountsReceivable/arInvoiceDetail?action=view&id=${id}`
    });
  },
  
  // 生成客户编号
  generateCustomerCode() {
    const app = getApp();
    const customers = app.getCustomersFromLocal();
    
    // 找到最大的客户编号
    let maxCode = 0;
    customers.forEach(customer => {
      if (customer.code.startsWith('C')) {
        const codeNum = parseInt(customer.code.substring(1));
        if (codeNum > maxCode) {
          maxCode = codeNum;
        }
      }
    });
    
    // 生成新的客户编号
    const newCode = `C${String(maxCode + 1).padStart(3, '0')}`;
    
    this.setData({
      'customer.code': newCode
    });
  },
  
  // 输入字段变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    // 处理数值类型的字段
    if (field === 'creditLimit') {
      const numValue = parseFloat(value) || 0;
      this.setData({
        [`customer.${field}`]: numValue
      });
    } else {
      this.setData({
        [`customer.${field}`]: value
      });
    }
  },
  
  // 状态变化
  onStatusChange(e) {
    const value = e.detail.value;
    this.setData({
      'customer.status': value
    });
  },
  
  // 表单验证
  validateForm() {
    const { customer } = this.data;
    
    if (!customer.code || customer.code.trim() === '') {
      wx.showToast({
        title: '请输入客户编号',
        icon: 'none'
      });
      return false;
    }
    
    if (!customer.name || customer.name.trim() === '') {
      wx.showToast({
        title: '请输入客户名称',
        icon: 'none'
      });
      return false;
    }
    
    if (!customer.contact || customer.contact.trim() === '') {
      wx.showToast({
        title: '请输入联系人',
        icon: 'none'
      });
      return false;
    }
    
    if (!customer.phone || customer.phone.trim() === '') {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return false;
    }
    
    // 验证电话号码格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(customer.phone)) {
      wx.showToast({
        title: '请输入正确的电话号码',
        icon: 'none'
      });
      return false;
    }
    
    if (customer.creditLimit < 0) {
      wx.showToast({
        title: '信用额度不能为负数',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },
  
  // 保存客户信息
  saveCustomer() {
    if (this.data.isSubmitting) return;
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({
      isSubmitting: true
    });
    
    const app = getApp();
    const { action, customerId, customer } = this.data;
    
    try {
      if (action === 'add') {
        // 添加新客户
        const newCustomer = {
          ...customer,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        app.addCustomerToLocal(newCustomer);
        
        wx.showToast({
          title: '客户添加成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else if (action === 'edit' && customerId) {
        // 更新客户信息
        const updatedCustomer = {
          ...customer,
          _id: customerId,
          updatedAt: new Date().toISOString()
        };
        
        app.updateCustomerToLocal(updatedCustomer);
        
        wx.showToast({
          title: '客户更新成功',
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
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
