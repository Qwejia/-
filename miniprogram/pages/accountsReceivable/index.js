// pages/accountsReceivable/index.js
const aiService = require('../../utils/aiService');

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    menuItems: [
      {
        id: 'customer',
        name: '客户管理',
        icon: '👥',
        path: '/pages/accountsReceivable/customerList'
      },
      {
        id: 'arInvoice',
        name: '应收单',
        icon: '📄',
        path: '/pages/accountsReceivable/arInvoiceList'
      },
      {
        id: 'arReceipt',
        name: '收款单',
        icon: '💰',
        path: '/pages/accountsReceivable/arReceiptList'
      },
      {
        id: 'writeOff',
        name: '核销管理',
        icon: '✓',
        path: '/pages/accountsReceivable/arWriteOffList'
      },
    ],
    customers: [],
    arInvoices: [],
    arReceipts: [],
    aiReminders: [],
    showAIAssistant: false,
    aiQuestion: '',
    aiChatMessages: [],
    isAILoading: false,
    summaryReport: {
      totalAmount: 0,
      writtenOffAmount: 0,
      outstandingAmount: 0,
      writeOffRate: 0,
      agingDistribution: [],
      overdueCount: 0,
      overdueAmount: 0,
      maxOverdueDays: 0
    }
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
    const customers = app.getCustomersFromLocal() || [];
    const arInvoices = app.getArInvoicesFromLocal() || [];
    const arReceipts = app.getArReceiptsFromLocal() || [];
    
    this.setData({
      customers: customers,
      arInvoices: arInvoices,
      arReceipts: arReceipts
    });
    
    this.calculateSummaryReport();
  },
  
  // 计算汇总报表
  calculateSummaryReport() {
    const { arInvoices } = this.data;
    const today = new Date();
    
    let totalAmount = 0;
    let writtenOffAmount = 0;
    let outstandingAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let maxOverdueDays = 0;
    
    const agingDistribution = [
      { name: '0-30天', amount: 0, percentage: 0, color: '#2196f3' },
      { name: '31-60天', amount: 0, percentage: 0, color: '#4caf50' },
      { name: '61-90天', amount: 0, percentage: 0, color: '#ff9800' },
      { name: '91-180天', amount: 0, percentage: 0, color: '#f44336' },
      { name: '180天以上', amount: 0, percentage: 0, color: '#9c27b0' }
    ];
    
    arInvoices.forEach(invoice => {
      totalAmount += invoice.amount;
      
      if (invoice.status === 'writtenoff' || invoice.status === 'closed') {
        writtenOffAmount += invoice.amount;
      } else {
        outstandingAmount += invoice.balance;
        
        // 计算账龄
        const invoiceDate = new Date(invoice.invoiceDate);
        const daysOutstanding = Math.ceil((today - invoiceDate) / (1000 * 60 * 60 * 24));
        
        let agingIndex = 0;
        if (daysOutstanding <= 30) agingIndex = 0;
        else if (daysOutstanding <= 60) agingIndex = 1;
        else if (daysOutstanding <= 90) agingIndex = 2;
        else if (daysOutstanding <= 180) agingIndex = 3;
        else agingIndex = 4;
        
        agingDistribution[agingIndex].amount += invoice.balance;
        
        // 检查逾期
        if (invoice.dueDate && new Date(invoice.dueDate) < today) {
          overdueCount++;
          overdueAmount += invoice.balance;
          
          const overdueDays = Math.ceil((today - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
          if (overdueDays > maxOverdueDays) {
            maxOverdueDays = overdueDays;
          }
        }
      }
    });
    
    // 计算百分比
    const totalOutstanding = agingDistribution.reduce((sum, item) => sum + item.amount, 0);
    agingDistribution.forEach(item => {
      item.percentage = totalOutstanding > 0 ? (item.amount / totalOutstanding) * 100 : 0;
    });
    
    const writeOffRate = totalAmount > 0 ? (writtenOffAmount / totalAmount) * 100 : 0;
    
    this.setData({
      summaryReport: {
        totalAmount,
        writtenOffAmount,
        outstandingAmount,
        writeOffRate,
        agingDistribution,
        overdueCount,
        overdueAmount,
        maxOverdueDays
      }
    });
  },
  
  // 刷新汇总报表
  refreshSummaryReport() {
    this.calculateSummaryReport();
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
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
          content: '您好！我是您的AI应收助手，有什么可以帮助您的吗？例如：如何处理逾期应收账款？'
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
    const arInvoices = app.getArInvoicesFromLocal() || [];
    const reminders = [];
    
    // 模拟AI提醒数据
    arInvoices.forEach(invoice => {
      if (invoice.status === 'pending' && new Date(invoice.dueDate) < new Date()) {
        reminders.push({
          id: invoice.id,
          type: 'overdue',
          icon: '⚠️',
          title: '逾期应收账款',
          description: `客户: ${invoice.customerName}`,
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
        title: '应收账款概览',
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
        url: `/pages/accountsReceivable/arInvoiceDetail?id=${id}`
      });
    }
  }
});
