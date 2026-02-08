// pages/invoice/index.js
const aiService = require('../../utils/aiService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    invoices: [],
    loading: false,
    hasMore: true,
    currentPage: 1,
    pageSize: 10,
    searchKeyword: '',
    showAIAssistant: false,
    showAIExtractModal: false,
    aiQuestion: '',
    aiChatMessages: [],
    isAILoading: false,
    imagePath: '',
    isRecognizing: false,
    recognitionResult: null,
    
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
    this.loadInvoices();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次显示页面时刷新数据
    this.setData({ currentPage: 1 });
    this.loadInvoices(true);
  },

  /**
   * 加载发票列表
   * @param {boolean} refresh 是否刷新
   */
  loadInvoices: function (refresh = false) {
    if (this.data.loading && !refresh) return;

    this.setData({
      loading: true
    });

    try {
      const app = getApp();
      let allInvoices = app.getInvoicesFromLocal() || [];

      // 搜索过滤
      if (this.data.searchKeyword) {
        const keyword = this.data.searchKeyword.toLowerCase();
        allInvoices = allInvoices.filter(invoice => 
          (invoice.invoiceNo && invoice.invoiceNo.toLowerCase().includes(keyword)) ||
          (invoice.customerName && invoice.customerName.toLowerCase().includes(keyword)) ||
          (invoice.supplierName && invoice.supplierName.toLowerCase().includes(keyword))
        );
      }

      // 按日期排序（最新在前）
      allInvoices.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));

      // 分页处理
      const start = refresh ? 0 : (this.data.currentPage - 1) * this.data.pageSize;
      const end = refresh ? this.data.pageSize : start + this.data.pageSize;
      const paginatedInvoices = allInvoices.slice(start, end);

      this.setData({
        invoices: refresh ? paginatedInvoices : [...this.data.invoices, ...paginatedInvoices],
        hasMore: end < allInvoices.length,
        currentPage: refresh ? 1 : this.data.currentPage + 1,
        loading: false
      });
    } catch (error) {
      console.error('加载发票列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 搜索发票
   */
  onSearch: function (e) {
    this.setData({
      searchKeyword: e.detail.value,
      currentPage: 1
    });
    this.loadInvoices(true);
  },

  /**
   * 点击发票项
   */
  onInvoiceItemClick: function (e) {
    const invoiceId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/invoice/invoiceDetail?id=${invoiceId}`
    });
  },

  /**
   * 创建新发票
   */
  createInvoice: function () {
    wx.navigateTo({
      url: '/pages/invoice/invoiceCreate'
    });
  },

  /**
   * 提取发票
   */
  extractInvoice: function () {
    wx.navigateTo({
      url: '/pages/invoice/invoiceExtract'
    });
  },

  /**
   * AI识别发票
   */
  aiExtractInvoice: function () {
    this.setData({
      showAIExtractModal: true,
      imagePath: '',
      recognitionResult: null,
      isRecognizing: false
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
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          imagePath: res.tempFilePaths[0]
        });
      },
      fail: function (error) {
        console.error('选择图片失败:', error);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 识别发票
   */
  async recognizeInvoice() {
    if (!this.data.imagePath) {
      wx.showToast({
        title: '请先上传发票照片',
        icon: 'none'
      });
      return;
    }

    this.setData({ isRecognizing: true });

    try {
      // 模拟AI发票识别
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟识别结果
      const result = {
        invoiceType: '增值税专用发票',
        invoiceNo: '1234567890',
        invoiceDate: new Date().toISOString().split('T')[0],
        amount: '¥1,234.56',
        supplier: '示例供应商有限公司',
        customer: '示例客户有限公司',
        taxAmount: '¥209.87',
        totalAmount: '¥1,444.43'
      };

      this.setData({ recognitionResult: result });
      wx.showToast({
        title: '识别成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('识别发票失败:', error);
      wx.showToast({
        title: '识别失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isRecognizing: false });
    }
  },

  /**
   * 保存识别的发票
   */
  saveRecognizedInvoice() {
    const result = this.data.recognitionResult;
    if (!result) return;

    // 跳转到发票创建页面，并传递识别结果
    wx.navigateTo({
      url: `/pages/invoice/invoiceCreate?invoiceType=${result.invoiceType}&invoiceNo=${result.invoiceNo}&invoiceDate=${result.invoiceDate}&amount=${result.totalAmount}&supplier=${result.supplier}&customer=${result.customer}`
    });

    this.closeAIExtractModal();
  },

  /**
   * 重置识别
   */
  resetRecognition() {
    this.setData({
      imagePath: '',
      recognitionResult: null
    });
  },

  /**
   * 关闭AI提取弹窗
   */
  closeAIExtractModal() {
    this.setData({
      showAIExtractModal: false,
      imagePath: '',
      recognitionResult: null,
      isRecognizing: false
    });
  },

  /**
   * 打开AI助手
   */
  openAIAssistant() {
    this.setData({
      showAIAssistant: true,
      aiChatMessages: [
        {
          role: 'assistant',
          content: '您好！我是您的AI发票助手，有什么可以帮助您的吗？例如：如何识别虚假发票？'
        }
      ],
      aiQuestion: ''
    });
  },

  /**
   * 关闭AI助手
   */
  closeAIAssistant() {
    this.setData({ showAIAssistant: false });
  },

  /**
   * 输入AI问题
   */
  onAIQuestionInput(e) {
    this.setData({ aiQuestion: e.detail.value });
  },

  /**
   * 发送AI问题
   */
  async sendAIQuestion() {
    const question = this.data.aiQuestion.trim();
    if (!question || this.data.isAILoading) return;

    this.setData({
      isAILoading: true,
      aiChatMessages: [...this.data.aiChatMessages, {
        role: 'user',
        content: question
      }]
    });

    try {
      const response = await aiService.financialAssistant(question);
      this.setData({
        aiChatMessages: [...this.data.aiChatMessages, {
          role: 'assistant',
          content: response
        }],
        aiQuestion: ''
      });
    } catch (error) {
      this.setData({
        aiChatMessages: [...this.data.aiChatMessages, {
          role: 'assistant',
          content: '抱歉，AI服务暂时不可用，请稍后再试。'
        }]
      });
    } finally {
      this.setData({ isAILoading: false });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.setData({ currentPage: 1 });
    this.loadInvoices(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadInvoices();
    }
  }
});
