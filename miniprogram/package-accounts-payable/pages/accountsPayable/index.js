// pages/accountsPayable/index.js
const aiService = require('../../utils/aiService');

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    menuItems: [
      {
        id: 'supplier',
        name: '供应商管理',
        icon: '🏪',
        path: '/pages/accountsPayable/supplierList'
      },
      {
        id: 'apInvoice',
        name: '应付单',
        icon: '📄',
        path: '/pages/accountsPayable/apInvoiceList'
      },
      {
        id: 'apPayment',
        name: '付款单',
        icon: '💳',
        path: '/pages/accountsPayable/apPaymentList'
      },
      {
        id: 'writeOff',
        name: '核销管理',
        icon: '✓',
        path: '/pages/accountsPayable/apWriteOffList'
      }
    ],
    suppliers: [],
    apInvoices: [],
    apPayments: [],
    aiReminders: [],
    showAIAssistant: false,
    aiQuestion: '',
    aiChatMessages: [],
    isAILoading: false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData();
    this.refreshAIReminders();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadData();
    this.refreshAIReminders();
  },
  
  // 加载数据
  loadData() {
    const app = getApp();
    const suppliers = app.getSuppliersFromLocal() || [];
    const apInvoices = app.getApInvoicesFromLocal() || [];
    const apPayments = app.getApPaymentsFromLocal() || [];
    
    this.setData({
      suppliers: suppliers,
      apInvoices: apInvoices,
      apPayments: apPayments
    });
  },
  
  // 导航到对应功能页面
  navigateToPage(e) {
    const { path } = e.currentTarget.dataset;
    wx.navigateTo({
      url: path
    });
  },
  
  // 打开AI助手
  openAIAssistant() {
    this.setData({
      showAIAssistant: true,
      aiChatMessages: [
        {
          role: 'assistant',
          content: '您好！我是您的AI应付助手，有什么可以帮助您的吗？例如：如何优化应付账款管理？'
        }
      ],
      aiQuestion: ''
    });
  },
  
  // 关闭AI助手
  closeAIAssistant() {
    this.setData({
      showAIAssistant: false
    });
  },
  
  // 输入AI问题
  onAIQuestionInput(e) {
    this.setData({
      aiQuestion: e.detail.value
    });
  },
  
  // 发送AI问题
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
      this.setData({
        isAILoading: false
      });
    }
  },
  
  // 刷新AI提醒
  refreshAIReminders() {
    const app = getApp();
    const apInvoices = app.getApInvoicesFromLocal() || [];
    const reminders = [];
    
    // 模拟AI提醒数据
    apInvoices.forEach(invoice => {
      if (invoice.status === 'pending' && new Date(invoice.dueDate) < new Date()) {
        reminders.push({
          id: invoice.id,
          type: 'overdue',
          icon: '⚠️',
          title: '逾期应付账款',
          description: `供应商: ${invoice.supplierName}`,
          amount: `金额: ¥${invoice.amount.toFixed(2)}`,
          dueDate: invoice.dueDate
        });
      }
    });
    
    // 添加一些智能提醒
    if (reminders.length > 0) {
      reminders.push({
        id: 'summary',
        type: 'summary',
        icon: '📊',
        title: '应付账款概览',
        description: `当前有 ${reminders.length} 笔逾期款项`,
        amount: `总逾期金额: ¥${reminders.reduce((sum, r) => sum + parseFloat(r.amount.replace(/[^\d.]/g, '')), 0).toFixed(2)}`
      });
    }
    
    this.setData({
      aiReminders: reminders
    });
  },
  
  // 处理提醒操作
  handleReminderAction(e) {
    const { type, id } = e.currentTarget.dataset;
    
    if (type === 'overdue') {
      wx.navigateTo({
        url: `/pages/accountsPayable/apInvoiceDetail?id=${id}`
      });
    }
  }
});