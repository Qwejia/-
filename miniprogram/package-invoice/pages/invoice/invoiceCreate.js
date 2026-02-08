// pages/invoice/invoiceCreate.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    action: 'add', // 'add' or 'edit'
    invoiceId: '',
    invoice: {
      type: '', // 用户自定义发票类型
      direction: 'sale', // 'sale' 销售发票, 'purchase' 采购发票
      invoiceNo: '',
      invoiceDate: '',
      status: 'draft',
      totalAmount: 0,
      totalTax: 0,
      remark: ''
    },
    
    // 发票明细项
    invoiceItems: [],
    
    // 表单状态
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, action = 'add' } = options;
    this.setData({
      action,
      invoiceId: id
    });

    // 如果是编辑模式，加载现有发票数据
    if (action === 'edit' && id) {
      this.loadExistingInvoice(id);
    } else {
      // 初始化新发票
      this.initializeNewInvoice();
    }
  },

  /**
   * 加载客户和供应商列表
   */
  loadParties: function () {
    const app = getApp();
    const customers = app.getDataFromLocal('customers');
    const suppliers = app.getDataFromLocal('suppliers');

    this.setData({
      customers,
      suppliers
    });
  },

  /**
   * 初始化新发票
   */
  initializeNewInvoice: function () {
    // 生成发票号码
    const today = new Date();
    const yearMonth = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const invoiceNo = `${yearMonth}${random}`;

    // 设置当前日期
    const invoiceDate = today.toISOString().split('T')[0];

    // 添加一个默认的明细项
    const defaultItem = {
      _id: `item_${Date.now()}`,
      name: '',
      spec: '',
      unit: '件',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxRate: 0.13,
      taxAmount: 0
    };

    this.setData({
      'invoice.invoiceNo': invoiceNo,
      'invoice.invoiceDate': invoiceDate,
      invoiceItems: [defaultItem]
    });
  },

  /**
   * 加载现有发票数据
   * @param {string} invoiceId 发票ID
   */
  loadExistingInvoice: function (invoiceId) {
    try {
      const app = getApp();
      const allInvoices = app.getInvoicesFromLocal();
      const allInvoiceItems = app.getInvoiceItemsFromLocal();

      // 查找发票
      const invoice = allInvoices.find(item => item._id === invoiceId);
      if (!invoice) {
        wx.showToast({
          title: '发票不存在',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }

      // 查找发票明细项
    const invoiceItems = allInvoiceItems.filter(item => item.invoiceId === invoiceId);

    this.setData({
      invoice,
      invoiceItems
    });
    } catch (error) {
      console.error('加载发票失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 发票类型变更
   */
  onTypeChange: function (e) {
    const type = e.detail.value;
    
    this.setData({
      'invoice.type': type
    });
  },

  /**
   * 发票方向变更
   */
  onDirectionChange: function (e) {
    const direction = e.detail.value;
    
    this.setData({
      'invoice.direction': direction
    });
  },

  /**
   * 发票号码变更
   */
  onInvoiceNoChange: function (e) {
    this.setData({
      'invoice.invoiceNo': e.detail.value
    });
  },

  /**
   * 发票日期变更
   */
  onDateChange: function (e) {
    const invoiceDate = e.detail.value;
    
    this.setData({
      'invoice.invoiceDate': invoiceDate
    });
  },

  /**
   * 客户名称变更
   */
  onCustomerChange: function (e) {
    const customerName = e.detail.value;
    
    this.setData({
      'invoice.customerName': customerName
    });
  },

  /**
   * 供应商名称变更
   */
  onSupplierChange: function (e) {
    const supplierName = e.detail.value;
    
    this.setData({
      'invoice.supplierName': supplierName
    });
  },

  /**
   * 备注变更
   */
  onRemarkChange: function (e) {
    this.setData({
      'invoice.remark': e.detail.value
    });
  },

  /**
   * 明细项名称变更
   */
  onItemNameChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const name = e.detail.value;
    
    const invoiceItems = [...this.data.invoiceItems];
    invoiceItems[index].name = name;
    
    this.setData({
      invoiceItems
    });
  },

  /**
   * 明细项规格变更
   */
  onItemSpecChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const spec = e.detail.value;
    
    const invoiceItems = [...this.data.invoiceItems];
    invoiceItems[index].spec = spec;
    
    this.setData({
      invoiceItems
    });
  },

  /**
   * 明细项单位变更
   */
  onItemUnitChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const unit = e.detail.value;
    
    const invoiceItems = [...this.data.invoiceItems];
    invoiceItems[index].unit = unit;
    
    this.setData({
      invoiceItems
    });
  },

  /**
   * 明细项数量变更
   */
  onItemQuantityChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const quantity = parseFloat(e.detail.value) || 0;
    
    const invoiceItems = [...this.data.invoiceItems];
    invoiceItems[index].quantity = quantity;
    // 重新计算金额和税额
    this.calculateItemAmount(index, invoiceItems);
    
    this.setData({
      invoiceItems
    });
    
    // 更新总金额和总税额
    this.updateTotalAmounts();
  },

  /**
   * 明细项单价变更
   */
  onItemUnitPriceChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const unitPrice = parseFloat(e.detail.value) || 0;
    
    const invoiceItems = [...this.data.invoiceItems];
    invoiceItems[index].unitPrice = unitPrice;
    // 重新计算金额和税额
    this.calculateItemAmount(index, invoiceItems);
    
    this.setData({
      invoiceItems
    });
    
    // 更新总金额和总税额
    this.updateTotalAmounts();
  },

  /**
   * 明细项税率变更
   */
  onItemTaxRateChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const taxRate = parseFloat(e.detail.value) || 0;
    
    const invoiceItems = [...this.data.invoiceItems];
    invoiceItems[index].taxRate = taxRate;
    // 重新计算金额和税额
    this.calculateItemAmount(index, invoiceItems);
    
    this.setData({
      invoiceItems
    });
    
    // 更新总金额和总税额
    this.updateTotalAmounts();
  },

  /**
   * 计算明细项金额和税额
   * @param {number} index 明细项索引
   * @param {Array} invoiceItems 明细项数组
   */
  calculateItemAmount: function (index, invoiceItems) {
    const item = invoiceItems[index];
    const amount = item.quantity * item.unitPrice;
    const taxAmount = amount * item.taxRate;
    
    invoiceItems[index].amount = amount;
    invoiceItems[index].taxAmount = taxAmount;
  },

  /**
   * 更新总金额和总税额
   */
  updateTotalAmounts: function () {
    const totalAmount = this.data.invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const totalTax = this.data.invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0);
    
    this.setData({
      'invoice.totalAmount': totalAmount,
      'invoice.totalTax': totalTax
    });
  },

  /**
   * 添加明细项
   */
  addItem: function () {
    const newItem = {
      _id: `item_${Date.now()}`,
      name: '',
      spec: '',
      unit: '件',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxRate: 0.13,
      taxAmount: 0
    };
    
    const invoiceItems = [...this.data.invoiceItems, newItem];
    this.setData({
      invoiceItems
    });
  },

  /**
   * 删除明细项
   */
  deleteItem: function (e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.invoiceItems.length <= 1) {
      wx.showToast({
        title: '至少保留一项明细',
        icon: 'none'
      });
      return;
    }
    
    const invoiceItems = this.data.invoiceItems.filter((item, i) => i !== index);
    this.setData({
      invoiceItems
    });
    
    // 更新总金额和总税额
    this.updateTotalAmounts();
  },

  /**
   * 保存发票
   */
  saveInvoice: function () {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }

    this.setData({
      isSubmitting: true
    });

    try {
      const app = getApp();
      let allInvoices = app.getInvoicesFromLocal();
      let allInvoiceItems = app.getInvoiceItemsFromLocal();
      
      const invoice = {
        ...this.data.invoice,
        _id: this.data.action === 'add' ? `invoice_${Date.now()}` : this.data.invoice._id,
        createdAt: this.data.action === 'add' ? new Date().toISOString().split('T')[0] : this.data.invoice.createdAt,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      // 处理客户/供应商信息
      if (invoice.direction === 'sale' || invoice.direction === '销售发票') {
        // 销售发票需要客户信息
        if (!invoice.customerName) {
          wx.showToast({
            title: '请输入客户名称',
            icon: 'none'
          });
          return;
        }
      } else {
        // 采购发票需要供应商信息
        if (!invoice.supplierName) {
          wx.showToast({
            title: '请输入供应商名称',
            icon: 'none'
          });
          return;
        }
      }

      if (this.data.action === 'add') {
        // 添加新发票
        allInvoices.push(invoice);
        
        // 保存明细项
        const invoiceId = invoice._id;
        const itemsToSave = this.data.invoiceItems.map(item => ({
          ...item,
          invoiceId
        }));
        allInvoiceItems = [...allInvoiceItems, ...itemsToSave];
      } else {
        // 更新现有发票
        const invoiceIndex = allInvoices.findIndex(item => item._id === invoice._id);
        if (invoiceIndex !== -1) {
          allInvoices[invoiceIndex] = invoice;
        }
        
        // 更新明细项（先删除旧的，再添加新的）
        allInvoiceItems = allInvoiceItems.filter(item => item.invoiceId !== invoice._id);
        const itemsToSave = this.data.invoiceItems.map(item => ({
          ...item,
          invoiceId: invoice._id
        }));
        allInvoiceItems = [...allInvoiceItems, ...itemsToSave];
      }

      // 保存到本地存储
      app.saveInvoicesToLocal(allInvoices);
      app.saveInvoiceItemsToLocal(allInvoiceItems);

      wx.showToast({
        title: this.data.action === 'add' ? '发票制作完成' : '发票更新完成',
        icon: 'success'
      });

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存发票失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        isSubmitting: false
      });
    }
  },

  /**
   * 表单验证
   */
  validateForm: function () {
    // 验证发票号码
    if (!this.data.invoice.invoiceNo) {
      wx.showToast({
        title: '请输入发票号码',
        icon: 'none'
      });
      return false;
    }

    // 验证发票日期
    if (!this.data.invoice.invoiceDate) {
      wx.showToast({
        title: '请输入发票日期',
        icon: 'none'
      });
      return false;
    }

    // 验证明细项
    for (let i = 0; i < this.data.invoiceItems.length; i++) {
      const item = this.data.invoiceItems[i];
      if (!item.name) {
        wx.showToast({
          title: `请输入第${i + 1}项的名称`,
          icon: 'none'
        });
        return false;
      }
      if (item.quantity <= 0) {
        wx.showToast({
          title: `请输入有效的数量`,
          icon: 'none'
        });
        return false;
      }
      if (item.unitPrice <= 0) {
        wx.showToast({
          title: `请输入有效的单价`,
          icon: 'none'
        });
        return false;
      }
    }

    return true;
  },

  /**
   * 返回上一页
   */
  onBack: function () {
    wx.navigateBack();
  }
});
