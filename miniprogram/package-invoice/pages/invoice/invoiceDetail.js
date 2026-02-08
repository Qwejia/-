// pages/invoice/invoiceDetail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    invoice: null,
    invoiceItems: [],
    action: '', // 'view' or 'edit'
    loading: false,
    
    // 发票类型映射
    invoiceTypeMap: {
      'special': '增值税专用发票',
      'ordinary': '增值税普通发票',
      'e_special': '电子增值税专用发票',
      'e_ordinary': '电子增值税普通发票',
      'motor_vehicle': '机动车销售统一发票',
      'second_hand_car': '二手车销售统一发票',
      'import_vat': '海关进口增值税专用缴款书',
      'receipt': '收据'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, action = 'view' } = options;
    this.setData({ action });
    this.loadInvoiceDetail(id);
  },

  /**
   * 加载发票详情
   * @param {string} invoiceId 发票ID
   */
  loadInvoiceDetail: function (invoiceId) {
    this.setData({ loading: true });

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
        invoiceItems,
        loading: false
      });
    } catch (error) {
      console.error('加载发票详情失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 编辑发票
   */
  onEdit: function () {
    wx.navigateTo({
      url: `/pages/invoice/invoiceCreate?id=${this.data.invoice._id}&action=edit`
    });
  },

  /**
   * 作废发票
   */
  onCancel: function () {
    wx.showModal({
      title: '确认作废',
      content: '确定要作废此发票吗？作废后将无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.cancelInvoice();
        }
      }
    });
  },

  /**
   * 执行作废操作
   */
  cancelInvoice: function () {
    try {
      const app = getApp();
      const allInvoices = app.getInvoicesFromLocal();
      const invoiceIndex = allInvoices.findIndex(item => item._id === this.data.invoice._id);

      if (invoiceIndex !== -1) {
        allInvoices[invoiceIndex].status = 'cancelled';
        allInvoices[invoiceIndex].cancelledDate = new Date().toISOString().split('T')[0];
        
        // 保存更新后的发票列表
        app.saveInvoicesToLocal(allInvoices);

        // 更新页面数据
        this.setData({
          'invoice.status': 'cancelled',
          'invoice.cancelledDate': allInvoices[invoiceIndex].cancelledDate
        });

        wx.showToast({
          title: '发票已作废',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('作废发票失败:', error);
      wx.showToast({
        title: '作废失败',
        icon: 'none'
      });
    }
  },

  /**
   * 删除发票
   */
  onDelete: function () {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此发票吗？删除后将无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.deleteInvoice();
        }
      }
    });
  },

  /**
   * 执行删除操作
   */
  deleteInvoice: function () {
    try {
      const app = getApp();
      const allInvoices = app.getInvoicesFromLocal();
      const allInvoiceItems = app.getInvoiceItemsFromLocal();

      // 删除发票
      const updatedInvoices = allInvoices.filter(item => item._id !== this.data.invoice._id);
      
      // 删除发票明细项
      const updatedInvoiceItems = allInvoiceItems.filter(item => item.invoiceId !== this.data.invoice._id);

      // 保存更新后的数据
      app.saveInvoicesToLocal(updatedInvoices);
      app.saveInvoiceItemsToLocal(updatedInvoiceItems);

      wx.showToast({
        title: '发票已删除',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('删除发票失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  /**
   * 返回上一页
   */
  onBack: function () {
    wx.navigateBack();
  }
});
