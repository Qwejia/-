// pages/accountsReceivable/arWriteOffDetail.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    action: 'add', // add, edit, view
    writeOff: {
      _id: '',
      writeOffNo: '',
      invoiceId: '',
      invoiceNo: '',
      customerId: '',
      customerName: '',
      amount: 0,
      writeOffDate: new Date().toISOString().split('T')[0],
      remark: '',
      createdAt: '',
      updatedAt: ''
    },
    invoices: [],
    filteredInvoices: [],
    customers: [],
    isSubmitting: false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { action, id } = options;
    this.setData({ action });
    
    this.loadCustomers();
    this.loadInvoices();
    
    if (action === 'view' || action === 'edit') {
      this.loadWriteOffDetail(id);
    } else if (action === 'add') {
      this.generateWriteOffNo();
    }
  },
  
  // 加载客户列表
  loadCustomers() {
    const app = getApp();
    const customers = app.getCustomersFromLocal();
    this.setData({ customers });
  },
  
  // 加载发票列表
  loadInvoices() {
    const app = getApp();
    const invoices = app.getArInvoicesFromLocal();
    this.setData({ invoices });
  },
  
  // 生成核销编号
  generateWriteOffNo() {
    const app = getApp();
    const writeOffs = app.getArWriteOffsFromLocal();
    
    // 生成新的核销编号（WO+年份+月份+流水号）
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const serialNumber = (writeOffs.length + 1).toString().padStart(4, '0');
    const writeOffNo = `WO${year}${month}${serialNumber}`;
    
    this.setData({
      'writeOff.writeOffNo': writeOffNo
    });
  },
  
  // 加载核销记录详情
  loadWriteOffDetail(writeOffId) {
    const app = getApp();
    const writeOff = app.getArWriteOffFromLocal(writeOffId);
    
    if (writeOff) {
      this.setData({ writeOff });
    } else {
      wx.showToast({
        title: '核销记录不存在',
        icon: 'none'
      });
      this.goBack();
    }
  },
  
  // 发票选择变化
  onInvoiceChange(e) {
    const index = e.detail.value;
    const invoice = this.data.invoices[index];
    
    this.setData({
      'writeOff.invoiceId': index,
      'writeOff.invoiceNo': invoice.invoiceNo,
      'writeOff.customerName': invoice.customerName,
      'writeOff.customerId': invoice.customerId
    });
  },
  
  // 核销日期变化
  onWriteOffDateChange(e) {
    this.setData({
      'writeOff.writeOffDate': e.detail.value
    });
  },
  
  // 金额输入
  onAmountInput(e) {
    this.setData({
      'writeOff.amount': parseFloat(e.detail.value) || 0
    });
  },
  
  // 备注输入
  onRemarkInput(e) {
    this.setData({
      'writeOff.remark': e.detail.value
    });
  },
  
  // 表单验证
  validateForm() {
    const { writeOff } = this.data;
    
    if (!writeOff.invoiceId) {
      wx.showToast({
        title: '请选择关联发票',
        icon: 'none'
      });
      return false;
    }
    
    if (!writeOff.writeOffDate) {
      wx.showToast({
        title: '请选择核销日期',
        icon: 'none'
      });
      return false;
    }
    
    if (writeOff.amount <= 0) {
      wx.showToast({
        title: '核销金额必须大于0',
        icon: 'none'
      });
      return false;
    }
    
    // 检查发票是否存在未核销余额
    const invoice = this.data.invoices[writeOff.invoiceId];
    if (!invoice) {
      wx.showToast({
        title: '选择的发票不存在',
        icon: 'none'
      });
      return false;
    }
    
    if (invoice.balance <= 0) {
      wx.showToast({
        title: '该发票已无未核销余额',
        icon: 'none'
      });
      return false;
    }
    
    if (writeOff.amount > invoice.balance) {
      wx.showToast({
        title: '核销金额不能超过未核销余额',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },
  
  // 保存核销记录
  saveWriteOff() {
    if (this.data.isSubmitting) return;
    
    if (!this.validateForm()) return;
    
    const app = getApp();
    const { action, writeOff } = this.data;
    
    this.setData({ isSubmitting: true });
    
    try {
      const writeOffData = { ...writeOff };
      
      if (action === 'add') {
        // 添加新核销记录
        writeOffData._id = Date.now().toString();
        writeOffData.createdAt = new Date().toISOString();
        writeOffData.updatedAt = new Date().toISOString();
        
        app.addArWriteOffToLocal(writeOffData);
        
        // 更新发票的核销状态和余额
        const invoice = this.data.invoices[writeOffData.invoiceId];
        app.updateArInvoiceBalance(invoice._id, writeOffData.amount);
        
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
      } else if (action === 'edit') {
        // 更新现有核销记录
        writeOffData.updatedAt = new Date().toISOString();
        
        // 获取原核销记录
        const originalWriteOff = app.getArWriteOffFromLocal(writeOffData._id);
        
        // 更新发票余额（先恢复原金额，再减去新金额）
        const invoice = this.data.invoices[writeOffData.invoiceId];
        app.updateArInvoiceBalance(invoice._id, -originalWriteOff.amount);
        app.updateArInvoiceBalance(invoice._id, writeOffData.amount);
        
        app.updateArWriteOffInLocal(writeOffData);
        
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
      }
      
      // 延迟返回列表页
      setTimeout(() => {
        this.goBack();
      }, 1500);
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
      console.error('Save write off error:', error);
    } finally {
      this.setData({ isSubmitting: false });
    }
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 编辑核销记录
  editWriteOff() {
    const { writeOff } = this.data;
    wx.redirectTo({
      url: `/pages/accountsReceivable/arWriteOffDetail?action=edit&id=${writeOff._id}`
    });
  },
  
  // 删除核销记录
  deleteWriteOff() {
    const { writeOff } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条核销记录吗？删除后将恢复发票的核销状态。',
      confirmText: '删除',
      confirmColor: '#f44336',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          
          try {
            // 恢复发票余额
            const invoice = this.data.invoices[writeOff.invoiceId];
            app.updateArInvoiceBalance(invoice._id, -writeOff.amount);
            
            // 删除核销记录
            app.deleteArWriteOffFromLocal(writeOff._id);
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            setTimeout(() => {
              this.goBack();
            }, 1500);
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
            console.error('Delete write off error:', error);
          }
        }
      }
    });
  }
});
