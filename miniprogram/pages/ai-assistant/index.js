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
  maxRetries: 3,
  retryDelay: 1000,

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

    wx.vibrateShort({
      type: 'light'
    });

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
    let retryCount = 0;
    
    const attemptCall = async () => {
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
        console.error('AI API调用失败:', error, '重试次数:', retryCount);
        
        if (retryCount < this.data.maxRetries) {
          retryCount++;
          setTimeout(() => {
            attemptCall();
          }, this.data.retryDelay * retryCount);
        } else {
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
      }
    };
    
    attemptCall();
  },

  typeWriterEffect(index, fullText, chatHistory) {
    let currentIndex = 0;
    const baseSpeed = 30;
    const dynamicSpeed = Math.max(15, Math.min(baseSpeed, Math.floor(1000 / fullText.length)));
    
    const typeNext = () => {
      if (currentIndex < fullText.length) {
        chatHistory[index].displayResponse = fullText.substring(0, currentIndex + 1);
        this.setData({ chatHistory });
        currentIndex++;
        setTimeout(typeNext, dynamicSpeed);
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
      editable: true,
      placeholderText: '请输入不含税金额',
      content: '请输入不含税金额（元）',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content);
          if (!isNaN(amount) && amount >= 0) {
            const tax = amount * 0.13;
            const total = amount + tax;
            wx.showModal({
              title: '计算结果',
              content: `不含税金额：¥${amount.toFixed(2)}\n增值税（13%）：¥${tax.toFixed(2)}\n含税金额：¥${total.toFixed(2)}`,
              showCancel: false,
              confirmText: '复制结果',
              success: (copyRes) => {
                if (copyRes.confirm) {
                  wx.setClipboardData({
                    data: `不含税金额：¥${amount.toFixed(2)}\n增值税（13%）：¥${tax.toFixed(2)}\n含税金额：¥${total.toFixed(2)}`,
                    success: () => {
                      wx.showToast({ title: '已复制', icon: 'success' });
                    }
                  });
                }
              }
            });
          } else {
            wx.showToast({ title: '请输入有效的金额', icon: 'none' });
          }
        }
      }
    });
  },

  openIncomeTaxCalculator() {
    wx.showModal({
      title: '企业所得税计算器',
      editable: true,
      placeholderText: '请输入应纳税所得额',
      content: '请输入年应纳税所得额（元）',
      success: (res) => {
        if (res.confirm && res.content) {
          const income = parseFloat(res.content);
          if (!isNaN(income) && income >= 0) {
            const tax = this.calculateCorporateTax(income);
            const afterTax = income - tax;
            const taxRate = income > 0 ? ((tax / income) * 100).toFixed(2) : '0.00';
            wx.showModal({
              title: '计算结果',
              content: `应纳税所得额：¥${income.toFixed(2)}\n企业所得税：¥${tax.toFixed(2)}\n税后利润：¥${afterTax.toFixed(2)}\n\n税率说明：\n- 标准税率：25%\n- 小型微利企业：实际税负2.5%-5%\n- 高新技术企业：15%\n- 技术先进型服务企业：15%\n\n实际税率：${taxRate}%`,
              showCancel: false,
              confirmText: '复制结果',
              success: (copyRes) => {
                if (copyRes.confirm) {
                  wx.setClipboardData({
                    data: `应纳税所得额：¥${income.toFixed(2)}\n企业所得税：¥${tax.toFixed(2)}\n税后利润：¥${afterTax.toFixed(2)}`,
                    success: () => {
                      wx.showToast({ title: '已复制', icon: 'success' });
                    }
                  });
                }
              }
            });
          } else {
            wx.showToast({ title: '请输入有效的金额', icon: 'none' });
          }
        }
      }
    });
  },

  calculateCorporateTax(income) {
    const standardRate = 0.25;
    let tax = income * standardRate;
    
    if (income <= 300000) {
      tax = income * 0.05;
    } else if (income <= 1000000) {
      tax = income * 0.10;
    }
    
    return tax;
  },

  openPersonalTaxCalculator() {
    wx.showModal({
      title: '个税计算器',
      editable: true,
      placeholderText: '请输入税前工资',
      content: '请输入税前月工资（元）',
      success: (res) => {
        if (res.confirm && res.content) {
          const salary = parseFloat(res.content);
          if (!isNaN(salary) && salary >= 0) {
            const tax = this.calculatePersonalTax(salary);
            const afterTax = salary - tax;
            wx.showModal({
              title: '计算结果',
              content: `税前工资：¥${salary.toFixed(2)}\n个人所得税：¥${tax.toFixed(2)}\n税后工资：¥${afterTax.toFixed(2)}\n\n税率说明：\n- 不超过36000元：3%\n- 超过36000-144000元：10%\n- 超过144000-300000元：20%\n- 超过300000-420000元：25%\n- 超过420000-660000元：30%\n- 超过660000-960000元：35%\n- 超过960000元：45%`,
              showCancel: false,
              confirmText: '复制结果',
              success: (copyRes) => {
                if (copyRes.confirm) {
                  wx.setClipboardData({
                    data: `税前工资：¥${salary.toFixed(2)}\n个人所得税：¥${tax.toFixed(2)}\n税后工资：¥${afterTax.toFixed(2)}`,
                    success: () => {
                      wx.showToast({ title: '已复制', icon: 'success' });
                    }
                  });
                }
              }
            });
          } else {
            wx.showToast({ title: '请输入有效的金额', icon: 'none' });
          }
        }
      }
    });
  },

  calculatePersonalTax(salary) {
    const threshold = 5000;
    const taxableIncome = Math.max(0, salary - threshold);
    
    if (taxableIncome <= 0) {
      return 0;
    }
    
    const brackets = [
      { limit: 36000, rate: 0.03, deduction: 0 },
      { limit: 144000, rate: 0.1, deduction: 2520 },
      { limit: 300000, rate: 0.2, deduction: 16920 },
      { limit: 420000, rate: 0.25, deduction: 31920 },
      { limit: 660000, rate: 0.3, deduction: 52920 },
      { limit: 960000, rate: 0.35, deduction: 85920 },
      { limit: Infinity, rate: 0.45, deduction: 181920 }
    ];
    
    for (const bracket of brackets) {
      if (taxableIncome <= bracket.limit) {
        return taxableIncome * bracket.rate - bracket.deduction;
      }
    }
    
    return taxableIncome * 0.45 - 181920;
  },

  openFinanceCheck() {
    wx.showModal({
      title: '财务健康检查',
      editable: true,
      placeholderText: '请输入年营收',
      content: '请输入以下财务数据（单位：万元）\n\n1. 年营收：\n2. 年利润：\n3. 总资产：\n4. 总负债：',
      success: (res) => {
        if (res.confirm && res.content) {
          const inputs = res.content.split('\n').map(s => parseFloat(s.trim()));
          const [revenue, profit, assets, liabilities] = inputs;
          
          if (inputs.some(isNaN)) {
            wx.showToast({ title: '请输入有效的财务数据', icon: 'none' });
            return;
          }
          
          const healthScore = this.calculateHealthScore(revenue, profit, assets, liabilities);
          const healthLevel = this.getHealthLevel(healthScore);
          
          wx.showModal({
            title: '财务健康检查结果',
            content: `财务健康评分：${healthScore}分\n健康等级：${healthLevel}\n\n详细分析：\n\n${this.getHealthAnalysis(revenue, profit, assets, liabilities)}`,
            showCancel: false,
            confirmText: '复制结果',
            success: (copyRes) => {
              if (copyRes.confirm) {
                wx.setClipboardData({
                  data: `财务健康评分：${healthScore}分\n健康等级：${healthLevel}`,
                  success: () => {
                    wx.showToast({ title: '已复制', icon: 'success' });
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  calculateHealthScore(revenue, profit, assets, liabilities) {
    let score = 0;
    
    if (revenue > 0) {
      const profitMargin = (profit / revenue) * 100;
      if (profitMargin >= 15) score += 25;
      else if (profitMargin >= 10) score += 20;
      else if (profitMargin >= 5) score += 15;
      else if (profitMargin >= 0) score += 10;
    }
    
    if (assets > 0 && liabilities > 0) {
      const debtRatio = (liabilities / assets) * 100;
      if (debtRatio <= 30) score += 25;
      else if (debtRatio <= 50) score += 20;
      else if (debtRatio <= 70) score += 10;
      else score += 5;
    }
    
    if (profit > 0) score += 25;
    else if (profit >= 0) score += 15;
    else score += 5;
    
    return Math.min(100, Math.max(0, score));
  },

  getHealthLevel(score) {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    if (score >= 20) return '较差';
    return '危险';
  },

  getHealthAnalysis(revenue, profit, assets, liabilities) {
    let analysis = '';
    
    if (revenue > 0) {
      const profitMargin = ((profit / revenue) * 100).toFixed(2);
      analysis += `✓ 利润率：${profitMargin}%\n`;
      if (profitMargin >= 15) analysis += `  利润率优秀，盈利能力强\n`;
      else if (profitMargin >= 10) analysis += `  利润率良好\n`;
      else if (profitMargin >= 5) analysis += `  利润率一般，建议优化成本\n`;
      else analysis += `  利润率较低，需要关注\n`;
    }
    
    if (assets > 0 && liabilities > 0) {
      const debtRatio = ((liabilities / assets) * 100).toFixed(2);
      analysis += `✓ 资产负债率：${debtRatio}%\n`;
      if (debtRatio <= 30) analysis += `  负债率低，财务结构健康\n`;
      else if (debtRatio <= 50) analysis += `  负债率适中\n`;
      else if (debtRatio <= 70) analysis += `  负债率偏高，建议控制债务\n`;
      else analysis += `  负债率过高，存在财务风险\n`;
    }
    
    if (profit > 0) analysis += `✓ 盈利企业，经营状况良好\n`;
    else if (profit >= 0) analysis += `✓ 盈亏平衡\n`;
    else analysis += `✗ 亏损企业，需要改善经营\n`;
    
    return analysis;
  },

  openCostAnalysis() {
    wx.showModal({
      title: '成本结构分析',
      editable: true,
      placeholderText: '请输入年营收',
      content: '请输入以下成本数据（单位：万元）\n\n1. 年营收：\n2. 人工成本：\n3. 材料成本：\n4. 制造费用：\n5. 销售费用：\n6. 管理费用：\n7. 其他费用：',
      success: (res) => {
        if (res.confirm && res.content) {
          const inputs = res.content.split('\n').map(s => parseFloat(s.trim()));
          const [revenue, labor, material, manufacturing, sales, management, other] = inputs;
          
          if (inputs.some(isNaN)) {
            wx.showToast({ title: '请输入有效的成本数据', icon: 'none' });
            return;
          }
          
          const totalCost = labor + material + manufacturing + sales + management + other;
          const costRatio = ((totalCost / revenue) * 100).toFixed(2);
          const profit = revenue - totalCost;
          const profitMargin = ((profit / revenue) * 100).toFixed(2);
          
          const analysis = this.getCostAnalysis(revenue, labor, material, manufacturing, sales, management, other, totalCost, costRatio, profit, profitMargin);
          
          wx.showModal({
            title: '成本分析结果',
            content: `总成本：¥${totalCost.toFixed(2)}万元\n成本率：${costRatio}%\n利润：¥${profit.toFixed(2)}万元\n利润率：${profitMargin}%\n\n详细分析：\n\n${analysis}`,
            showCancel: false,
            confirmText: '复制结果',
            success: (copyRes) => {
              if (copyRes.confirm) {
                wx.setClipboardData({
                  data: `总成本：¥${totalCost.toFixed(2)}万元\n成本率：${costRatio}%\n利润：¥${profit.toFixed(2)}万元\n利润率：${profitMargin}%`,
                  success: () => {
                    wx.showToast({ title: '已复制', icon: 'success' });
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  getCostAnalysis(revenue, labor, material, manufacturing, sales, management, other, totalCost, costRatio, profit, profitMargin) {
    let analysis = '';
    
    const costItems = [
      { name: '人工成本', value: labor, ratio: ((labor / totalCost) * 100).toFixed(2) },
      { name: '材料成本', value: material, ratio: ((material / totalCost) * 100).toFixed(2) },
      { name: '制造费用', value: manufacturing, ratio: ((manufacturing / totalCost) * 100).toFixed(2) },
      { name: '销售费用', value: sales, ratio: ((sales / totalCost) * 100).toFixed(2) },
      { name: '管理费用', value: management, ratio: ((management / totalCost) * 100).toFixed(2) },
      { name: '其他费用', value: other, ratio: ((other / totalCost) * 100).toFixed(2) }
    ];
    
    costItems.sort((a, b) => b.value - a.value);
    
    analysis += '成本构成分析：\n';
    costItems.forEach(item => {
      analysis += `• ${item.name}：${item.value}万元（占比${item.ratio}%）\n`;
    });
    
    const maxCostItem = costItems[0];
    analysis += `\n最大成本项：${maxCostItem.name}，占比${maxCostItem.ratio}%\n`;
    
    analysis += `\n成本率分析：\n`;
    if (costRatio <= 60) analysis += `✓ 成本率${costRatio}%，成本控制良好\n`;
    else if (costRatio <= 75) analysis += `✓ 成本率${costRatio}%，成本控制一般\n`;
    else analysis += `✗ 成本率${costRatio}%，成本偏高，建议优化\n`;
    
    analysis += `\n利润率分析：\n`;
    if (profitMargin >= 20) analysis += `✓ 利润率${profitMargin}%，盈利能力强\n`;
    else if (profitMargin >= 10) analysis += `✓ 利润率${profitMargin}%，盈利能力良好\n`;
    else if (profitMargin >= 5) analysis += `✓ 利润率${profitMargin}%，盈利能力一般\n`;
    else analysis += `✗ 利润率${profitMargin}%，盈利能力较弱\n`;
    
    analysis += `\n优化建议：\n`;
    if (maxCostItem.ratio > 40) {
      analysis += `• 重点关注${maxCostItem.name}，占总成本${maxCostItem.ratio}%\n`;
    }
    if (sales > material) {
      analysis += `• 销售费用高于材料成本，建议优化销售策略\n`;
    }
    if (management > (labor + material) * 0.3) {
      analysis += `• 管理费用偏高，建议精简管理流程\n`;
    }
    
    return analysis;
  },

  openCashFlowForecast() {
    wx.showModal({
      title: '现金流预测',
      editable: true,
      placeholderText: '请输入月营收',
      content: '请输入以下现金流数据（单位：万元）\n\n1. 月营收：\n2. 月成本：\n3. 月应收账款：\n4. 月应付账款：\n5. 预测月数：',
      success: (res) => {
        if (res.confirm && res.content) {
          const inputs = res.content.split('\n').map(s => parseFloat(s.trim()));
          const [revenue, cost, receivables, payables, months] = inputs;
          
          if (inputs.some(isNaN)) {
            wx.showToast({ title: '请输入有效的现金流数据', icon: 'none' });
            return;
          }
          
          const forecast = this.calculateCashFlowForecast(revenue, cost, receivables, payables, months);
          
          wx.showModal({
            title: '现金流预测结果',
            content: `预测期：${months}个月\n\n${forecast}`,
            showCancel: false,
            confirmText: '复制结果',
            success: (copyRes) => {
              if (copyRes.confirm) {
                wx.setClipboardData({
                  data: forecast,
                  success: () => {
                    wx.showToast({ title: '已复制', icon: 'success' });
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  calculateCashFlowForecast(revenue, cost, receivables, payables, months) {
    let forecast = '';
    const monthlyCashFlow = revenue - cost;
    const netCashFlow = monthlyCashFlow + receivables - payables;
    
    forecast += '基础数据：\n';
    forecast += `• 月营收：¥${revenue.toFixed(2)}万元\n`;
    forecast += `• 月成本：¥${cost.toFixed(2)}万元\n`;
    forecast += `• 月应收账款：¥${receivables.toFixed(2)}万元\n`;
    forecast += `• 月应付账款：¥${payables.toFixed(2)}万元\n`;
    forecast += `• 月净现金流：¥${monthlyCashFlow.toFixed(2)}万元\n`;
    forecast += `• 月实际现金流：¥${netCashFlow.toFixed(2)}万元\n\n`;
    
    forecast += '现金流趋势预测：\n';
    const trend = netCashFlow >= 0 ? '正向' : '负向';
    forecast += `• 现金流趋势：${trend}\n`;
    
    forecast += '未来6个月预测：\n';
    for (let i = 1; i <= 6; i++) {
      const monthCashFlow = netCashFlow * (1 + (i * 0.05));
      const cumulativeCash = monthCashFlow * i;
      forecast += `\n第${i}个月：\n`;
      forecast += `  预计现金流：¥${monthCashFlow.toFixed(2)}万元\n`;
      forecast += `  累计现金流：¥${cumulativeCash.toFixed(2)}万元\n`;
    }
    
    forecast += '\n风险提示：\n';
    if (netCashFlow < 0) {
      forecast += `✗ 当前现金流为负，存在资金压力\n`;
      forecast += `• 建议加强应收账款管理\n`;
      forecast += `• 建议优化成本结构\n`;
    } else if (netCashFlow < revenue * 0.1) {
      forecast += `✓ 现金流较低，建议关注\n`;
      forecast += `• 保持合理的现金储备\n`;
      forecast += `• 优化应收应付账款周期\n`;
    } else {
      forecast += `✓ 现金流健康\n`;
      forecast += `• 建议合理规划资金使用\n`;
      forecast += `• 可考虑投资理财\n`;
    }
    
    return forecast;
  },

  openRiskAssessment() {
    wx.showModal({
      title: '财务风险评估',
      editable: true,
      placeholderText: '请输入年营收',
      content: '请输入以下财务数据（单位：万元）\n\n1. 年营收：\n2. 年利润：\n3. 总资产：\n4. 总负债：\n5. 应收账款：\n6. 存货价值：',
      success: (res) => {
        if (res.confirm && res.content) {
          const inputs = res.content.split('\n').map(s => parseFloat(s.trim()));
          const [revenue, profit, assets, liabilities, receivables, inventory] = inputs;
          
          if (inputs.some(isNaN)) {
            wx.showToast({ title: '请输入有效的财务数据', icon: 'none' });
            return;
          }
          
          const riskAssessment = this.calculateRiskAssessment(revenue, profit, assets, liabilities, receivables, inventory);
          
          wx.showModal({
            title: '风险评估结果',
            content: `风险等级：${riskAssessment.level}\n风险评分：${riskAssessment.score}分\n\n详细分析：\n\n${riskAssessment.analysis}`,
            showCancel: false,
            confirmText: '复制结果',
            success: (copyRes) => {
              if (copyRes.confirm) {
                wx.setClipboardData({
                  data: `风险等级：${riskAssessment.level}\n风险评分：${riskAssessment.score}分`,
                  success: () => {
                    wx.showToast({ title: '已复制', icon: 'success' });
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  calculateRiskAssessment(revenue, profit, assets, liabilities, receivables, inventory) {
    let score = 100;
    let analysis = '';
    
    const debtRatio = assets > 0 ? (liabilities / assets) * 100 : 0;
    const receivablesRatio = revenue > 0 ? (receivables / revenue) * 100 : 0;
    const inventoryRatio = revenue > 0 ? (inventory / revenue) * 100 : 0;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    analysis += '风险指标分析：\n';
    analysis += `• 资产负债率：${debtRatio.toFixed(2)}%\n`;
    if (debtRatio > 70) {
      score -= 30;
      analysis += `✗ 负债率过高（>70%），存在严重财务风险\n`;
    } else if (debtRatio > 50) {
      score -= 15;
      analysis += `⚠ 负债率偏高（50%-70%），需要关注\n`;
    } else if (debtRatio > 30) {
      score -= 5;
      analysis += `✓ 负债率适中（30%-50%），财务结构合理\n`;
    } else {
      analysis += `✓ 负债率低（<30%），财务结构健康\n`;
    }
    
    analysis += `• 应收账款率：${receivablesRatio.toFixed(2)}%\n`;
    if (receivablesRatio > 20) {
      score -= 20;
      analysis += `✗ 应收账款率过高（>20%），回款风险大\n`;
    } else if (receivablesRatio > 15) {
      score -= 10;
      analysis += `⚠ 应收账款率偏高（15%-20%），建议加强催收\n`;
    } else if (receivablesRatio > 10) {
      score -= 5;
      analysis += `✓ 应收账款率适中（10%-15%），回款正常\n`;
    } else {
      analysis += `✓ 应收账款率低（<10%），回款良好\n`;
    }
    
    analysis += `• 存货率：${inventoryRatio.toFixed(2)}%\n`;
    if (inventoryRatio > 30) {
      score -= 20;
      analysis += `✗ 存货率过高（>30%），库存积压风险\n`;
    } else if (inventoryRatio > 20) {
      score -= 10;
      analysis += `⚠ 存货率偏高（20%-30%），建议优化库存\n`;
    } else if (inventoryRatio > 10) {
      score -= 5;
      analysis += `✓ 存货率适中（10%-20%），库存管理良好\n`;
    } else {
      analysis += `✓ 存货率低（<10%），库存周转快\n`;
    }
    
    analysis += `• 利润率：${profitMargin.toFixed(2)}%\n`;
    if (profitMargin < 0) {
      score -= 30;
      analysis += `✗ 企业亏损，经营风险极高\n`;
    } else if (profitMargin < 5) {
      score -= 15;
      analysis += `⚠ 利润率较低（<5%），盈利能力弱\n`;
    } else if (profitMargin < 10) {
      score -= 5;
      analysis += `✓ 利润率一般（5%-10%），盈利能力一般\n`;
    } else if (profitMargin < 15) {
      analysis += `✓ 利润率良好（10%-15%），盈利能力较强\n`;
    } else {
      analysis += `✓ 利润率优秀（>15%），盈利能力强\n`;
    }
    
    const finalScore = Math.max(0, Math.min(100, score));
    let level = '';
    if (finalScore >= 80) level = '低风险';
    else if (finalScore >= 60) level = '中低风险';
    else if (finalScore >= 40) level = '中等风险';
    else if (finalScore >= 20) level = '中高风险';
    else level = '高风险';
    
    return {
      score: finalScore,
      level,
      analysis
    };
  },

  openTaxRiskCheck() {
    wx.showModal({
      title: '税务风险检测',
      editable: true,
      placeholderText: '请输入年营收',
      content: '请输入以下税务数据（单位：万元）\n\n1. 年营收：\n2. 年纳税额：\n3. 应收账款：\n4. 存货价值：',
      success: (res) => {
        if (res.confirm && res.content) {
          const inputs = res.content.split('\n').map(s => parseFloat(s.trim()));
          const [revenue, taxPaid, receivables, inventory] = inputs;
          
          if (inputs.some(isNaN)) {
            wx.showToast({ title: '请输入有效的税务数据', icon: 'none' });
            return;
          }
          
          const riskAssessment = this.calculateTaxRiskAssessment(revenue, taxPaid, receivables, inventory);
          
          wx.showModal({
            title: '税务风险检测结果',
            content: `风险等级：${riskAssessment.level}\n风险评分：${riskAssessment.score}分\n\n详细分析：\n\n${riskAssessment.analysis}`,
            showCancel: false,
            confirmText: '复制结果',
            success: (copyRes) => {
              if (copyRes.confirm) {
                wx.setClipboardData({
                  data: `风险等级：${riskAssessment.level}\n风险评分：${riskAssessment.score}分`,
                  success: () => {
                    wx.showToast({ title: '已复制', icon: 'success' });
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  calculateTaxRiskAssessment(revenue, taxPaid, receivables, inventory) {
    let score = 100;
    let analysis = '';
    
    const taxRatio = revenue > 0 ? (taxPaid / revenue) * 100 : 0;
    const receivablesRatio = revenue > 0 ? (receivables / revenue) * 100 : 0;
    const inventoryRatio = revenue > 0 ? (inventory / revenue) * 100 : 0;
    
    analysis += '税务风险指标分析：\n';
    analysis += `• 税负率：${taxRatio.toFixed(2)}%\n`;
    if (taxRatio > 25) {
      score -= 30;
      analysis += `✗ 税负率过高（>25%），税务负担重\n`;
    } else if (taxRatio > 20) {
      score -= 15;
      analysis += `⚠ 税负率偏高（20%-25%），建议税务筹划\n`;
    } else if (taxRatio > 15) {
      score -= 5;
      analysis += `✓ 税负率适中（15%-20%），税务结构合理\n`;
    } else {
      analysis += `✓ 税负率低（<15%），税务负担轻\n`;
    }
    
    analysis += `• 应收账款率：${receivablesRatio.toFixed(2)}%\n`;
    if (receivablesRatio > 30) {
      score -= 20;
      analysis += `✗ 应收账款率过高（>30%），回款风险大\n`;
    } else if (receivablesRatio > 20) {
      score -= 10;
      analysis += `⚠ 应收账款率偏高（20%-30%），建议加强催收\n`;
    } else if (receivablesRatio > 10) {
      score -= 5;
      analysis += `✓ 应收账款率适中（10%-20%），回款正常\n`;
    } else {
      analysis += `✓ 应收账款率低（<10%），回款良好\n`;
    }
    
    analysis += `• 存货率：${inventoryRatio.toFixed(2)}%\n`;
    if (inventoryRatio > 40) {
      score -= 20;
      analysis += `✗ 存货率过高（>40%），库存积压风险\n`;
    } else if (inventoryRatio > 30) {
      score -= 10;
      analysis += `⚠ 存货率偏高（30%-40%），建议优化库存\n`;
    } else if (inventoryRatio > 20) {
      score -= 5;
      analysis += `✓ 存货率适中（20%-30%），库存管理良好\n`;
    } else {
      analysis += `✓ 存货率低（<20%），库存周转快\n`;
    }
    
    analysis += `\n税务合规建议：\n`;
    if (score >= 70) {
      analysis += `✓ 税务状况良好，建议保持\n`;
    } else if (score >= 50) {
      analysis += `✓ 税务状况一般，建议优化\n`;
      analysis += `• 合理利用税收优惠政策\n`;
      analysis += `• 优化业务结构降低税负\n`;
    } else {
      analysis += `✗ 税务状况较差，需要关注\n`;
      analysis += `• 建议咨询专业税务顾问\n`;
      analysis += `• 加强税务合规管理\n`;
    }
    
    const finalScore = Math.max(0, Math.min(100, score));
    let level = '';
    if (finalScore >= 80) level = '低风险';
    else if (finalScore >= 60) level = '中低风险';
    else if (finalScore >= 40) level = '中等风险';
    else if (finalScore >= 20) level = '中高风险';
    else level = '高风险';
    
    return {
      score: finalScore,
      level,
      analysis
    };
  },

  openBusinessRiskAnalysis() {
    wx.showModal({
      title: '经营风险分析',
      editable: true,
      placeholderText: '请输入年营收',
      content: '请输入以下经营数据（单位：万元）\n\n1. 年营收：\n2. 年利润：\n3. 营收增长率：\n4. 市场占有率：\n5. 员工人数：',
      success: (res) => {
        if (res.confirm && res.content) {
          const inputs = res.content.split('\n').map(s => parseFloat(s.trim()));
          const [revenue, profit, growthRate, marketShare, employeeCount] = inputs;
          
          if (inputs.some(isNaN)) {
            wx.showToast({ title: '请输入有效的经营数据', icon: 'none' });
            return;
          }
          
          const riskAssessment = this.calculateBusinessRiskAssessment(revenue, profit, growthRate, marketShare, employeeCount);
          
          wx.showModal({
            title: '经营风险分析结果',
            content: `风险等级：${riskAssessment.level}\n风险评分：${riskAssessment.score}分\n\n详细分析：\n\n${riskAssessment.analysis}`,
            showCancel: false,
            confirmText: '复制结果',
            success: (copyRes) => {
              if (copyRes.confirm) {
                wx.setClipboardData({
                  data: `风险等级：${riskAssessment.level}\n风险评分：${riskAssessment.score}分`,
                  success: () => {
                    wx.showToast({ title: '已复制', icon: 'success' });
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  calculateBusinessRiskAssessment(revenue, profit, growthRate, marketShare, employeeCount) {
    let score = 100;
    let analysis = '';
    
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    analysis += '经营风险指标分析：\n';
    analysis += `• 利润率：${profitMargin.toFixed(2)}%\n`;
    if (profitMargin < 0) {
      score -= 30;
      analysis += `✗ 企业亏损，经营风险极高\n`;
    } else if (profitMargin < 5) {
      score -= 15;
      analysis += `⚠ 利润率较低（<5%），盈利能力弱\n`;
    } else if (profitMargin < 10) {
      score -= 5;
      analysis += `✓ 利润率一般（5%-10%），盈利能力一般\n`;
    } else if (profitMargin < 15) {
      analysis += `✓ 利润率良好（10%-15%），盈利能力较强\n`;
    } else {
      analysis += `✓ 利润率优秀（>15%），盈利能力强\n`;
    }
    
    if (growthRate !== undefined && !isNaN(growthRate)) {
      analysis += `• 营收增长率：${growthRate.toFixed(2)}%\n`;
      if (growthRate < 0) {
        score -= 20;
        analysis += `✗ 营收负增长，业务萎缩\n`;
      } else if (growthRate < 5) {
        score -= 10;
        analysis += `⚠ 增长率较低（<5%），增长乏力\n`;
      } else if (growthRate < 15) {
        analysis += `✓ 增长率适中（5%-15%），增长稳定\n`;
      } else {
        analysis += `✓ 增长率良好（>15%），增长强劲\n`;
      }
    }
    
    if (marketShare !== undefined && !isNaN(marketShare)) {
      analysis += `• 市场占有率：${marketShare.toFixed(2)}%\n`;
      if (marketShare < 5) {
        score -= 15;
        analysis += `✗ 市场占有率低（<5%），竞争力弱\n`;
      } else if (marketShare < 10) {
        score -= 5;
        analysis += `✓ 市场占有率一般（5%-10%），竞争力一般\n`;
      } else {
        analysis += `✓ 市场占有率良好（>10%），竞争力强\n`;
      }
    }
    
    if (employeeCount !== undefined && !isNaN(employeeCount)) {
      const revenuePerEmployee = revenue > 0 && employeeCount > 0 ? (revenue / employeeCount) : 0;
      analysis += `• 人均营收：¥${revenuePerEmployee.toFixed(2)}万元\n`;
      if (revenuePerEmployee < 50) {
        score -= 15;
        analysis += `✗ 人均营收低（<50万），效率偏低\n`;
      } else if (revenuePerEmployee < 100) {
        score -= 5;
        analysis += `✓ 人均营收一般（50-100万），效率一般\n`;
      } else {
        analysis += `✓ 人均营收良好（>100万），效率较高\n`;
      }
    }
    
    analysis += `\n经营风险建议：\n`;
    if (score >= 70) {
      analysis += `✓ 经营状况良好，建议保持\n`;
      analysis += `• 继续提升核心竞争力\n`;
      analysis += `• 优化运营效率\n`;
    } else if (score >= 50) {
      analysis += `✓ 经营状况一般，需要关注\n`;
      analysis += `• 加强成本控制\n`;
      analysis += `• 提升产品竞争力\n`;
      analysis += `• 优化人员配置\n`;
    } else {
      analysis += `✗ 经营状况较差，风险较高\n`;
      analysis += `• 建议制定转型计划\n`;
      analysis += `• 优化业务结构\n`;
      analysis += `• 加强风险管理\n`;
    }
    
    const finalScore = Math.max(0, Math.min(100, score));
    let level = '';
    if (finalScore >= 80) level = '低风险';
    else if (finalScore >= 60) level = '中低风险';
    else if (finalScore >= 40) level = '中等风险';
    else if (finalScore >= 20) level = '中高风险';
    else level = '高风险';
    
    return {
      score: finalScore,
      level,
      analysis
    };
  }
});
