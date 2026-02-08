const aiService = require('../../utils/aiService');

Page({
  data: {
    chatHistory: [],
    userInput: '',
    loading: false,
    showWelcome: true,
    activeTab: 'chat',
    scrollTop: 0,
    showScrollToTop: false,
    quickQuestions: [
      '如何计算增值税？',
      '小微企业有哪些税收优惠？',
      '如何优化企业成本？',
      '如何提高企业利润率？',
      '个人所得税如何申报？'
    ],
    toolCategories: [
      {
        id: 'tax',
        name: '税务工具',
        icon: '📋',
        tools: [
          { name: '增值税计算器', desc: '快速计算增值税', action: 'openVATCalculator' },
          { name: '个税计算器', desc: '计算个人所得税', action: 'openPersonalTaxCalculator' },
          { name: '企业所得税计算器', desc: '计算企业所得税', action: 'openIncomeTaxCalculator' }
        ]
      },
      {
        id: 'finance',
        name: '财务分析',
        icon: '📊',
        tools: [
          { name: '财务健康检查', desc: '企业财务状况评估', action: 'openFinanceCheck' },
          { name: '成本分析', desc: '企业成本结构分析', action: 'openCostAnalysis' },
          { name: '现金流预测', desc: '未来现金流预测', action: 'openCashFlowForecast' }
        ]
      },
      {
        id: 'risk',
        name: '风险预警',
        icon: '⚠️',
        tools: [
          { name: '财务风险评估', desc: '识别潜在财务风险', action: 'openRiskAssessment' },
          { name: '税务风险检测', desc: '检测税务合规风险', action: 'openTaxRiskCheck' },
          { name: '经营风险分析', desc: '企业经营风险评估', action: 'openBusinessRiskAnalysis' }
        ]
      }
    ]
  },

  maxHistoryLength: 50,

  onLoad() {
    this.initPage();
  },

  onUnload() {
    this.saveChatHistory();
  },

  onShow() {
    this.loadChatHistory();
  },

  onHide() {
    this.saveChatHistory();
  },

  initPage() {
    this.loadChatHistory();
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  loadChatHistory() {
    try {
      const savedHistory = wx.getStorageSync('aiChatHistory') || [];
      const limitedHistory = savedHistory.slice(-this.maxHistoryLength);
      
      const historyWithTime = limitedHistory.map(msg => ({
        ...msg,
        formattedTime: this.formatTime(msg.timestamp || Date.now())
      }));
      
      this.setData({ 
        chatHistory: historyWithTime,
        showWelcome: historyWithTime.length === 0
      });
    } catch (error) {
      console.error('加载聊天历史失败:', error);
    }
  },

  saveChatHistory() {
    try {
      const limitedHistory = this.data.chatHistory.slice(-this.maxHistoryLength);
      wx.setStorageSync('aiChatHistory', limitedHistory);
    } catch (error) {
      console.error('保存聊天历史失败:', error);
    }
  },

  onInputChange(e) {
    this.setData({ userInput: e.detail.value });
  },

  sendMessage() {
    const userMessage = this.data.userInput.trim();
    if (!userMessage || this.data.loading) return;

    const timestamp = Date.now();
    const formattedTime = this.formatTime(timestamp);
    const userMsg = { 
      isAI: false, 
      userMessage, 
      timestamp,
      formattedTime
    };
    const aiMsg = { 
      isAI: true, 
      aiResponse: '', 
      timestamp,
      formattedTime
    };
    const chatHistory = [...this.data.chatHistory, userMsg, aiMsg];

    this.setData({
      chatHistory,
      userInput: '',
      loading: true,
      showWelcome: false
    });

    this.saveChatHistory();
    this.callAIAPI(userMessage, chatHistory);
  },

  async callAIAPI(userMessage, chatHistory) {
    try {
      const prompt = `你是一个专业的财务助手，请回答以下财务问题：${userMessage}\n\n请提供详细、准确的回答，包括相关的财务知识和建议。`;
      const response = await aiService.financialAssistant(prompt);
      
      let aiResponse = '';
      if (response && response.output && response.output[0] && response.output[0].content && response.output[0].content[0]) {
        aiResponse = response.output[0].content[0].text;
      } else {
        aiResponse = '抱歉，我暂时无法回答这个问题。请稍后再试或联系管理员。';
      }

      const lastIndex = chatHistory.length - 1;
      chatHistory[lastIndex].aiResponse = aiResponse;
      chatHistory[lastIndex].isTyping = true;
      chatHistory[lastIndex].displayResponse = '';
      
      this.setData({
        chatHistory,
        loading: false
      });
      
      this.typeWriterEffect(lastIndex, aiResponse, chatHistory);
    } catch (error) {
      console.error('AI API调用失败:', error);
      
      const fallbackResponse = '抱歉，网络连接出现问题，请检查网络设置后重试。';
      
      const lastIndex = chatHistory.length - 1;
      chatHistory[lastIndex].aiResponse = fallbackResponse;
      chatHistory[lastIndex].isTyping = true;
      chatHistory[lastIndex].displayResponse = '';
      
      this.setData({
        chatHistory,
        loading: false
      });
      
      this.typeWriterEffect(lastIndex, fallbackResponse, chatHistory);
    }
  },

  typeWriterEffect(index, fullText, chatHistory) {
    let currentIndex = 0;
    const speed = 30;
    
    const typeNext = () => {
      if (currentIndex < fullText.length) {
        chatHistory[index].displayResponse = fullText.substring(0, currentIndex + 1);
        this.setData({ chatHistory });
        currentIndex++;
        setTimeout(typeNext, speed);
      } else {
        chatHistory[index].isTyping = false;
        this.setData({ chatHistory });
        this.saveChatHistory();
      }
    };
    
    typeNext();
  },

  askQuickQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ userInput: question });
    this.sendMessage();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.setData({
      scrollTop,
      showScrollToTop: scrollTop > 300
    });
  },

  scrollToTop() {
    this.setData({ scrollTop: 0 });
  },

  copyMessage(e) {
    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  deleteMessage(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条消息吗？',
      success: (res) => {
        if (res.confirm) {
          const chatHistory = this.data.chatHistory.filter((_, i) => i !== index);
          this.setData({ chatHistory });
          this.saveChatHistory();
        }
      }
    });
  },

  clearChatHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ 
            chatHistory: [],
            showWelcome: true
          });
          wx.removeStorageSync('aiChatHistory');
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  executeTool(e) {
    const action = e.currentTarget.dataset.action;
    if (this[action]) {
      this[action]();
    }
  },

  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/ai-assistant/settings'
    });
  },

  openVATCalculator() {
    wx.showModal({
      title: '增值税计算器',
      content: '请输入不含税金额',
      editable: true,
      placeholderText: '请输入金额',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content);
          if (!isNaN(amount)) {
            const tax = amount * 0.13;
            const total = amount + tax;
            wx.showModal({
              title: '计算结果',
              content: `不含税金额：¥${amount.toFixed(2)}\n增值税：¥${tax.toFixed(2)}\n含税金额：¥${total.toFixed(2)}`,
              showCancel: false
            });
          }
        }
      }
    });
  },

  openIncomeTaxCalculator() {
    wx.showModal({
      title: '企业所得税计算器',
      content: '请输入应纳税所得额',
      editable: true,
      placeholderText: '请输入金额',
      success: (res) => {
        if (res.confirm && res.content) {
          const income = parseFloat(res.content);
          if (!isNaN(income)) {
            const tax = income * 0.25;
            wx.showModal({
              title: '计算结果',
              content: `应纳税所得额：¥${income.toFixed(2)}\n应纳税额：¥${tax.toFixed(2)}`,
              showCancel: false
            });
          }
        }
      }
    });
  },

  openPersonalTaxCalculator() {
    wx.showModal({
      title: '个人所得税计算器',
      content: '请输入税前月收入',
      editable: true,
      placeholderText: '请输入金额',
      success: (res) => {
        if (res.confirm && res.content) {
          const income = parseFloat(res.content);
          if (!isNaN(income)) {
            const annualIncome = income * 12;
            const deductions = 60000;
            const taxableIncome = Math.max(0, annualIncome - deductions);
            let tax = 0;
            
            if (taxableIncome <= 36000) {
              tax = taxableIncome * 0.03;
            } else if (taxableIncome <= 144000) {
              tax = 36000 * 0.03 + (taxableIncome - 36000) * 0.1;
            } else if (taxableIncome <= 300000) {
              tax = 36000 * 0.03 + 108000 * 0.1 + (taxableIncome - 144000) * 0.2;
            } else if (taxableIncome <= 420000) {
              tax = 36000 * 0.03 + 108000 * 0.1 + 156000 * 0.2 + (taxableIncome - 300000) * 0.25;
            } else if (taxableIncome <= 660000) {
              tax = 36000 * 0.03 + 108000 * 0.1 + 156000 * 0.2 + 120000 * 0.25 + (taxableIncome - 420000) * 0.3;
            } else if (taxableIncome <= 960000) {
              tax = 36000 * 0.03 + 108000 * 0.1 + 156000 * 0.2 + 120000 * 0.25 + 240000 * 0.3 + (taxableIncome - 660000) * 0.35;
            } else {
              tax = 36000 * 0.03 + 108000 * 0.1 + 156000 * 0.2 + 120000 * 0.25 + 240000 * 0.3 + 300000 * 0.35 + (taxableIncome - 960000) * 0.45;
            }
            
            wx.showModal({
              title: '计算结果',
              content: `年收入：¥${annualIncome.toFixed(2)}\n减除费用：¥60000\n应纳税所得额：¥${taxableIncome.toFixed(2)}\n年应纳税额：¥${tax.toFixed(2)}\n月均税额：¥${(tax / 12).toFixed(2)}`,
              showCancel: false
            });
          }
        }
      }
    });
  },

  openFinanceCheck() {
    wx.showToast({ title: '财务健康检查功能开发中', icon: 'none' });
  },

  openCostAnalysis() {
    wx.showToast({ title: '成本分析功能开发中', icon: 'none' });
  },

  openCashFlowForecast() {
    wx.showToast({ title: '现金流预测功能开发中', icon: 'none' });
  },

  openRiskAssessment() {
    wx.showToast({ title: '财务风险评估功能开发中', icon: 'none' });
  },

  openTaxRiskCheck() {
    wx.showToast({ title: '税务风险检测功能开发中', icon: 'none' });
  },

  openBusinessRiskAnalysis() {
    wx.showToast({ title: '经营风险分析功能开发中', icon: 'none' });
  }
});
