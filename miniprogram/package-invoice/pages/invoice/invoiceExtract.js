// pages/invoice/invoiceExtract.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 提取方式
    extractMethod: 'camera', // 'camera' or 'album'
    
    // 图片路径
    imagePath: '',
    
    // 提取结果
    extractedInvoice: null,
    extractedItems: [],
    
    // 处理状态
    isProcessing: false,
    isExtracting: false,
    progress: 0,
    
    // 提取步骤
    currentStep: 0,
    steps: [
      { id: 0, name: '选择图片', status: 'active' },
      { id: 1, name: '提取信息', status: 'pending' },
      { id: 2, name: '确认信息', status: 'pending' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化
  },

  /**
   * 选择提取方式
   */
  onMethodChange: function (e) {
    const method = e.detail.value;
    this.setData({
      extractMethod: method
    });
  },

  /**
   * 选择图片
   */
  chooseImage: function () {
    const that = this;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [this.data.extractMethod],
      success: function (res) {
        const tempFilePath = res.tempFilePaths[0];
        that.setData({
          imagePath: tempFilePath,
          currentStep: 1,
          'steps[0].status': 'completed',
          'steps[1].status': 'active'
        });
        
        // 开始提取发票信息
        that.extractInvoiceInfo(tempFilePath);
      },
      fail: function (err) {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 预览图片
   */
  previewImage: function () {
    if (!this.data.imagePath) {
      return;
    }
    
    wx.previewImage({
      current: this.data.imagePath,
      urls: [this.data.imagePath]
    });
  },

  /**
   * 提取发票信息
   * @param {string} imagePath 图片路径
   */
  extractInvoiceInfo: function (imagePath) {
    this.setData({
      isExtracting: true,
      progress: 0
    });

    // 模拟OCR提取过程（实际项目中应接入OCR服务）
    setTimeout(() => {
      this.setData({
        progress: 20
      });

      // 模拟提取发票头部信息
      setTimeout(() => {
        this.setData({
          progress: 50
        });

        // 模拟提取发票明细信息
        setTimeout(() => {
          this.setData({
            progress: 80
          });

          // 模拟提取完成
          setTimeout(() => {
            this.setData({
              progress: 100
            });

            // 模拟提取结果
            const extractedData = this.mockExtractResult();
            
            this.setData({
              extractedInvoice: extractedData.invoice,
              extractedItems: extractedData.items,
              isExtracting: false,
              currentStep: 2,
              'steps[1].status': 'completed',
              'steps[2].status': 'active'
            });
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  },

  /**
   * 模拟提取结果
   */
  mockExtractResult: function () {
    return {
      invoice: {
        type: 'sale',
        invoiceNo: '202401190001',
        invoiceDate: new Date().toISOString().split('T')[0],
        sellerName: '北京星辰科技有限公司',
        sellerTaxNo: '911100000000000000',
        sellerAddress: '北京市朝阳区科技园区',
        sellerPhone: '010-12345678',
        sellerBank: '中国工商银行北京市分行',
        sellerAccount: '6222020200000000000',
        customerName: '上海创新有限公司',
        customerTaxNo: '913100000000000000',
        customerAddress: '上海市浦东新区金融中心',
        customerPhone: '021-87654321',
        customerBank: '中国银行上海市分行',
        customerAccount: '6013820000000000000',
        totalAmount: 11300.00,
        totalTax: 1300.00
      },
      items: [
        {
          _id: `item_${Date.now()}_1`,
          name: '软件开发服务',
          spec: '',
          unit: '项',
          quantity: 1,
          unitPrice: 10000.00,
          amount: 10000.00,
          taxRate: 0.13,
          taxAmount: 1300.00
        }
      ]
    };
  },

  /**
   * 重置提取
   */
  resetExtract: function () {
    this.setData({
      imagePath: '',
      extractedInvoice: null,
      extractedItems: [],
      currentStep: 0,
      steps: [
        { id: 0, name: '选择图片', status: 'active' },
        { id: 1, name: '提取信息', status: 'pending' },
        { id: 2, name: '确认信息', status: 'pending' }
      ]
    });
  },

  /**
   * 重新选择图片
   */
  rechooseImage: function () {
    this.resetExtract();
  },

  /**
   * 编辑发票信息
   */
  editInvoiceInfo: function () {
    // 可以跳转到发票制作页面并传入提取的数据
    wx.navigateTo({
      url: `/pages/invoice/invoiceCreate?action=edit&extractedData=${JSON.stringify({
        invoice: this.data.extractedInvoice,
        items: this.data.extractedItems
      })}`
    });
  },

  /**
   * 保存提取的发票
   */
  saveExtractedInvoice: function () {
    if (!this.data.extractedInvoice) {
      return;
    }

    this.setData({
      isProcessing: true
    });

    try {
      const app = getApp();
      let allInvoices = app.getInvoicesFromLocal();
      let allInvoiceItems = app.getInvoiceItemsFromLocal();
      
      // 创建新发票
      const invoice = {
        ...this.data.extractedInvoice,
        _id: `invoice_${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      // 保存发票
      allInvoices.push(invoice);
      
      // 保存明细项
      const invoiceId = invoice._id;
      const itemsToSave = this.data.extractedItems.map(item => ({
        ...item,
        invoiceId
      }));
      allInvoiceItems = [...allInvoiceItems, ...itemsToSave];

      // 保存到本地存储
      app.saveInvoicesToLocal(allInvoices);
      app.saveInvoiceItemsToLocal(allInvoiceItems);

      wx.showToast({
        title: '发票提取成功',
        icon: 'success'
      });

      // 返回发票列表页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存提取发票失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        isProcessing: false
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
