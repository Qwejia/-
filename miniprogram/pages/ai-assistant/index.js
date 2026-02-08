const aiService = require('../../utils/aiService');

Page({
  data: {
    chatHistory: [],
    userInput: '',
    loading: false,
    showWelcome: true,
    activeTab: 'chat',
    useRealAPI: true,
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

  knowledgeBase: null,
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
    this.initKnowledgeBase();
    this.loadChatHistory();
    this.initAIService();
  },

  initAIService() {
    try {
      const savedApiKey = wx.getStorageSync('aiApiKey') || '';
      if (savedApiKey && savedApiKey.trim() !== '') {
        aiService.setApiKey(savedApiKey);
        this.setData({ useRealAPI: true });
      } else {
        this.setData({ useRealAPI: false });
      }
    } catch (error) {
      this.setData({ useRealAPI: false });
    }
  },

  initKnowledgeBase() {
    this.knowledgeBase = {
      '增值税': {
        keywords: ['增值税', 'vat', '税额', '税率'],
        response: '增值税的计算公式为：**应纳税额 = 销项税额 - 进项税额**\n\n其中：\n- 销项税额 = 销售额 × 税率\n- 进项税额 = 购进货物或服务的金额 × 税率\n\n**税率说明：**\n- 销售货物或提供加工、修理修配劳务：13%\n- 销售交通运输、邮政、基础电信、建筑、不动产租赁服务：9%\n- 销售现代服务、生活服务、金融服务：6%\n- 出口货物：0%\n\n小规模纳税人采用简易计税方法：应纳税额 = 销售额 × 征收率（通常为3%）'
      },
      '企业所得税': {
        keywords: ['企业所得税', '企业税', '公司税'],
        response: '企业所得税的基本税率：25%\n\n**优惠政策：**\n1. 小型微利企业：实际税负2.5%-5%\n2. 高新技术企业：15%\n3. 技术先进型服务企业：15%\n\n**计算公式：**\n应纳税额 = 应纳税所得额 × 适用税率 - 减免税额\n\n应纳税所得额 = 收入总额 - 不征税收入 - 免税收入 - 各项扣除 - 以前年度亏损'
      },
      '个人所得税': {
        keywords: ['个人所得税', '个税', '工资税'],
        response: '个人所得税采用超额累进税率：\n\n**综合所得税率表：**\n- 不超过36000元：3%\n- 超过36000-144000元：10%\n- 超过144000-300000元：20%\n- 超过300000-420000元：25%\n- 超过420000-660000元：30%\n- 超过660000-960000元：35%\n- 超过960000元：45%\n\n**申报方式：**\n1. 下载个人所得税APP\n2. 注册登录并完善信息\n3. 填写收入和专项附加扣除\n4. 提交申报'
      },
      '成本优化': {
        keywords: ['成本', '优化', '降低成本'],
        response: '企业成本优化的核心策略：\n\n1. **供应链优化**\n   - 建立长期供应商关系\n   - 优化库存管理\n   - 集中采购降低成本\n\n2. **生产效率提升**\n   - 流程优化减少浪费\n   - 技术升级提高效率\n   - 员工培训提升技能\n\n3. **管理费用控制**\n   - 精简组织结构\n   - 数字化管理降低成本\n   - 优化办公资源配置\n\n4. **财务成本优化**\n   - 合理安排资金结构\n   - 利用税收优惠政策\n   - 加强应收账款管理'
      },
      '利润率': {
        keywords: ['利润率', '盈利', '提高利润'],
        response: '提高企业利润率的方法：\n\n1. **增加收入**\n   - 扩大市场份额\n   - 提高产品价格\n   - 开发新产品\n\n2. **降低成本**\n   - 优化成本结构\n   - 提高生产效率\n   - 减少管理费用\n\n3. **提高附加值**\n   - 加强产品研发\n   - 增加产品功能\n   - 建立品牌优势\n\n4. **资金管理**\n   - 优化资金结构\n   - 提高资金使用效率\n   - 加强应收账款管理\n\n5. **税务筹划**\n   - 充分利用税收优惠\n   - 合理安排企业架构'
      },
      '税务筹划': {
        keywords: ['税务筹划', '节税', '合理避税'],
        response: '税务筹划的基本原则：\n\n1. **合法性原则**\n   - 遵守税收法律法规\n   - 不进行任何违法操作\n\n2. **利用税收优惠**\n   - 了解国家和地方政策\n   - 选择适合的优惠政策\n   - 合理安排业务享受优惠\n\n3. **优化企业架构**\n   - 合理设置组织形式\n   - 利用区域税收优惠\n\n4. **合理安排业务**\n   - 优化合同条款\n   - 合理安排收入支出时间\n   - 选择适合的结算方式\n\n5. **风险控制**\n   - 建立税务管理制度\n   - 定期进行税务自查\n   - 及时了解政策变化'
      },
      '财务分析': {
        keywords: ['财务分析', '财务报表', '财务指标'],
        response: '财务分析的基本步骤：\n\n1. **收集数据**\n   - 资产负债表\n   - 利润表\n   - 现金流量表\n\n2. **计算指标**\n   - 盈利能力：毛利率、净利率、ROE\n   - 运营能力：存货周转率、应收账款周转率\n   - 偿债能力：资产负债率、流动比率\n   - 发展能力：收入增长率、利润增长率\n\n3. **分析比较**\n   - 与历史数据比较\n   - 与同行业比较\n   - 趋势分析\n\n4. **撰写报告**\n   - 总结财务状况\n   - 分析问题\n   - 提出建议'
      },
      '现金流': {
        keywords: ['现金流', '现金管理', '资金管理'],
        response: '企业现金流管理方法：\n\n1. **现金预算**\n   - 编制现金预算\n   - 定期更新调整\n   - 监控执行情况\n\n2. **应收账款管理**\n   - 建立信用评估体系\n   - 制定信用政策\n   - 加强催收\n\n3. **存货管理**\n   - 优化库存水平\n   - 建立管理制度\n   - ABC分类管理\n\n4. **应付账款管理**\n   - 建立良好合作关系\n   - 合理安排付款时间\n   - 利用商业信用\n\n5. **融资管理**\n   - 合理安排融资结构\n   - 选择适合的融资方式\n   - 控制融资成本'
      },
      '财务风险': {
        keywords: ['财务风险', '风险控制', '风险管理'],
        response: '企业财务风险类型及控制：\n\n1. **流动性风险**\n   - 保持合理的现金储备\n   - 优化应收账款管理\n   - 建立融资渠道\n\n2. **信用风险**\n   - 建立客户信用评估\n   - 制定信用政策\n   - 加强应收账款催收\n\n3. **市场风险**\n   - 多元化经营\n   - 套期保值\n   - 关注市场变化\n\n4. **操作风险**\n   - 完善内控制度\n   - 加强员工培训\n   - 建立应急预案'
      },
      '预算管理': {
        keywords: ['预算', '预算管理', '预算编制'],
        response: '企业预算管理流程：\n\n1. **预算编制**\n   - 确定预算目标\n   - 收集历史数据\n   - 编制各项预算\n   - 汇总平衡\n\n2. **预算执行**\n   - 分解预算指标\n   - 落实责任到人\n   - 监控执行进度\n\n3. **预算控制**\n   - 定期分析差异\n   - 采取措施调整\n   - 优化资源配置\n\n4. **预算考核**\n   - 评价执行效果\n   - 总结经验教训\n   - 改进下期预算'
      }
    };
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
      let aiResponse = '';

      if (this.data.useRealAPI) {
        const prompt = `你是一个专业的财务助手，请回答以下财务问题：${userMessage}\n\n请提供详细、准确的回答，包括相关的财务知识和建议。`;
        const response = await aiService.financialAssistant(prompt);
        
        if (response && response.output && response.output[0] && response.output[0].content && response.output[0].content[0]) {
          aiResponse = response.output[0].content[0].text;
        }
      }

      if (!aiResponse) {
        aiResponse = this.searchKnowledgeBase(userMessage) || '抱歉，我暂时无法回答这个问题。您可以尝试：\n\n1. 重新表述您的问题\n2. 使用下方的快速提问功能\n3. 查看工具页面中的专业功能\n\n我会持续学习，为您提供更好的服务！';
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
      
      const fallbackResponse = this.searchKnowledgeBase(userMessage) || '抱歉，我暂时无法回答这个问题。您可以尝试：\n\n1. 重新表述您的问题\n2. 使用下方的快速提问功能\n3. 查看工具页面中的专业功能\n\n我会持续学习，为您提供更好的服务！';
      
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

  searchKnowledgeBase(query) {
    if (!this.knowledgeBase) {
      this.initKnowledgeBase();
    }

    const queryLower = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const key in this.knowledgeBase) {
      const item = this.knowledgeBase[key];
      let score = 0;

      for (const keyword of item.keywords) {
        const keywordLower = keyword.toLowerCase();
        
        if (queryLower === keywordLower) {
          score = 100;
          break;
        } else if (queryLower.includes(keywordLower)) {
          const matchLength = keywordLower.length;
          const queryLength = queryLower.length;
          score = Math.max(score, (matchLength / queryLength) * 80);
        } else if (keywordLower.includes(queryLower)) {
          score = Math.max(score, 60);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item.response;
      }
    }

    return bestScore >= 30 ? bestMatch : null;
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

  toggleAPIMode() {
    const currentMode = this.data.useRealAPI;
    const newMode = !currentMode;
    
    this.setData({ useRealAPI: newMode });
    
    wx.showToast({
      title: newMode ? '已切换到在线AI模式' : '已切换到本地知识库模式',
      icon: 'none',
      duration: 2000
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
