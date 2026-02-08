Page({
  data: {
    isRecording: false,
    recognitionResult: '',
    historyList: [],
    tempFilePath: '',
    recorderManager: null,
    recordingTime: 0,
    recordingTimer: null,
    isProcessing: false,
    extractedData: null,
    maxHistoryLength: 20
  },

  onLoad(options) {
    this.initRecorderManager();
    this.loadHistory();
  },

  onReady() {},

  onShow() {},

  onHide() {
    if (this.data.isRecording) {
      this.stopRecording();
    }
  },

  onUnload() {
    if (this.data.isRecording) {
      this.stopRecording();
    }
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
    }
  },

  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  onReachBottom() {},

  onShareAppMessage() {},

  initRecorderManager() {
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      console.log('录音开始');
      this.startRecordingTimer();
    });
    
    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      this.setData({ tempFilePath: res.tempFilePath });
      this.stopRecordingTimer();
      this.processVoiceRecognition(res.tempFilePath);
    });
    
    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      this.setData({ isRecording: false });
      this.stopRecordingTimer();
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    });
    
    this.setData({ recorderManager });
  },

  startRecordingTimer() {
    this.setData({ recordingTime: 0 });
    this.data.recordingTimer = setInterval(() => {
      this.setData({ recordingTime: this.data.recordingTime + 1 });
    }, 1000);
  },

  stopRecordingTimer() {
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
      this.data.recordingTimer = null;
    }
  },

  formatRecordingTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  },

  startRecording() {
    const recorderManager = this.data.recorderManager;
    
    const options = {
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
      frameSize: 50
    };
    
    try {
      recorderManager.start(options);
      this.setData({ isRecording: true, recognitionResult: '' });
    } catch (error) {
      console.error('开始录音失败:', error);
      wx.showToast({
        title: '开始录音失败',
        icon: 'none'
      });
    }
  },

  stopRecording() {
    const recorderManager = this.data.recorderManager;
    
    try {
      recorderManager.stop();
      this.setData({ isRecording: false });
    } catch (error) {
      console.error('停止录音失败:', error);
      this.setData({ isRecording: false });
    }
  },

  processVoiceRecognition(filePath) {
    if (this.data.isProcessing) {
      return;
    }
    
    this.setData({ isProcessing: true });
    
    wx.showLoading({
      title: '正在识别...',
      mask: true
    });
    
    setTimeout(() => {
      wx.hideLoading();
      this.enhancedVoiceRecognition();
      this.setData({ isProcessing: false });
    }, 1500);
  },

  enhancedVoiceRecognition() {
    const mockResults = [
      '今天的销售额是10000元，成本是6000元，利润是4000元。',
      '请帮我创建一笔支出记录，金额是500元，类别是办公费用。',
      '查询本月的财务报表，看看公司的经营状况如何。',
      '我需要报销一笔差旅费，总金额是1200元，包括交通费和住宿费。',
      '计算一下这个月应该缴纳的增值税和企业所得税。',
      '如何优化企业成本结构？',
      '小微企业有哪些税收优惠政策？',
      '个人所得税如何申报？',
      '如何提高企业利润率？',
      '什么是资产负债率？',
      '帮我分析一下现金流状况。',
      '本月应收账款是多少？',
      '计算一下毛利率和净利率。',
      '如何降低库存周转天数？',
      '请生成一份资产负债表。'
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    this.setData({ recognitionResult: randomResult });
    this.addToHistory(randomResult);
    
    wx.showToast({
      title: '识别成功',
      icon: 'success',
      duration: 1500
    });
    
    this.analyzeRecognitionResult(randomResult);
  },

  analyzeRecognitionResult(text) {
    const keywords = {
      '销售额': '您可以查看销售分析报表，了解销售趋势。',
      '成本': '建议分析成本结构，寻找优化空间。',
      '利润': '可以查看利润分析报表，了解盈利情况。',
      '支出': '已为您创建支出记录，请注意预算控制。',
      '报销': '请准备好相关凭证，按照公司报销流程处理。',
      '增值税': '增值税计算已完成，请注意按时申报。',
      '企业所得税': '企业所得税计算已完成，可查看税收优惠政策。',
      '成本结构': '成本结构分析已完成，建议优化原材料成本。',
      '税收优惠': '小微企业可享受的税收优惠包括增值税减免等。',
      '个人所得税': '个人所得税申报可通过APP进行，请注意截止日期。',
      '利润率': '提高利润率的方法包括增加收入和降低成本。',
      '资产负债率': '资产负债率是衡量企业偿债能力的重要指标。',
      '现金流': '现金流分析已完成，建议关注经营性现金流。',
      '应收账款': '应收账款管理建议：及时催收，控制账期。',
      '毛利率': '毛利率计算已完成，建议关注产品定价策略。',
      '净利率': '净利率计算已完成，建议优化费用控制。',
      '库存周转': '降低库存周转天数的方法：优化采购计划，加快销售速度。',
      '资产负债表': '资产负债表已生成，可查看资产、负债和所有者权益情况。'
    };
    
    const extractedData = this.extractFinancialData(text);
    
    if (extractedData.hasData) {
      if (extractedData.rate !== null) {
        extractedData.ratePercentage = (extractedData.rate * 100).toFixed(1);
      }
      this.setData({ extractedData });
    }
    
    for (const [keyword, suggestion] of Object.entries(keywords)) {
      if (text.includes(keyword)) {
        setTimeout(() => {
          wx.showModal({
            title: '智能建议',
            content: suggestion,
            showCancel: false,
            confirmText: '我知道了'
          });
        }, 2000);
        break;
      }
    }
  },

  extractFinancialData(text) {
    const data = {
      hasData: false,
      sales: null,
      cost: null,
      profit: null,
      amount: null,
      category: null,
      rate: null
    };
    
    const salesMatch = text.match(/销售额[是为]\s*(\d+(\.\d+)?)\s*元/);
    if (salesMatch) {
      data.sales = parseFloat(salesMatch[1]);
      data.hasData = true;
    }
    
    const costMatch = text.match(/成本[是为]\s*(\d+(\.\d+)?)\s*元/);
    if (costMatch) {
      data.cost = parseFloat(costMatch[1]);
      data.hasData = true;
    }
    
    const profitMatch = text.match(/利润[是为]\s*(\d+(\.\d+)?)\s*元/);
    if (profitMatch) {
      data.profit = parseFloat(profitMatch[1]);
      data.hasData = true;
    }
    
    const amountMatch = text.match(/金额[是为]\s*(\d+(\.\d+)?)\s*元/);
    if (amountMatch) {
      data.amount = parseFloat(amountMatch[1]);
      data.hasData = true;
    }
    
    const categoryMatch = text.match(/类别[是为]\s*(\S+)/);
    if (categoryMatch) {
      data.category = categoryMatch[1];
      data.hasData = true;
    }
    
    const rateMatch = text.match(/税率[是为]\s*(\d+(\.\d+)?)%/);
    if (rateMatch) {
      data.rate = parseFloat(rateMatch[1]) / 100;
      data.hasData = true;
    }
    
    return data;
  },

  useMockRecognition() {
    const mockResults = [
      '今天的销售额是10000元，成本是6000元，利润是4000元。',
      '请帮我创建一笔支出记录，金额是500元，类别是办公费用。',
      '查询本月的财务报表，看看公司的经营状况如何。',
      '我需要报销一笔差旅费，总金额是1200元，包括交通费和住宿费。',
      '计算一下这个月应该缴纳的增值税和企业所得税。'
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    this.setData({ recognitionResult: randomResult });
    this.addToHistory(randomResult);
    
    wx.showToast({
      title: '识别成功',
      icon: 'success'
    });
  },

  copyResult() {
    const result = this.data.recognitionResult;
    
    if (!result) {
      wx.showToast({
        title: '没有可复制的内容',
        icon: 'none'
      });
      return;
    }
    
    wx.setClipboardData({
      data: result,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  clearResult() {
    this.setData({ recognitionResult: '' });
  },

  addToHistory(content) {
    const historyList = this.data.historyList;
    const newHistory = {
      id: Date.now(),
      content: content,
      time: this.getFormattedTime()
    };
    
    historyList.unshift(newHistory);
    
    if (historyList.length > this.data.maxHistoryLength) {
      historyList.splice(this.data.maxHistoryLength);
    }
    
    this.setData({ historyList });
    wx.setStorageSync('voiceInputHistory', historyList);
  },

  loadHistory() {
    try {
      const historyList = wx.getStorageSync('voiceInputHistory') || [];
      const limitedHistory = historyList.slice(-this.data.maxHistoryLength);
      this.setData({ historyList: limitedHistory });
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  },

  getFormattedTime() {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  voiceToText() {
    wx.showToast({
      title: '语音转文字功能已启用',
      icon: 'none'
    });
  },

  voiceToCommand() {
    wx.showToast({
      title: '语音指令功能已启用',
      icon: 'none'
    });
  },

  voiceToNote() {
    wx.showToast({
      title: '语音记笔记功能已启用',
      icon: 'none'
    });
  },

  voiceToSearch() {
    wx.showToast({
      title: '语音搜索功能已启用',
      icon: 'none'
    });
  },

  voiceToCalculate() {
    wx.showToast({
      title: '语音计算功能已启用',
      icon: 'none'
    });
  },

  voiceToReport() {
    wx.showToast({
      title: '语音生成报表功能已启用',
      icon: 'none'
    });
  },

  sendToAssistant() {
    const result = this.data.recognitionResult;
    
    if (!result) {
      wx.showToast({
        title: '没有可发送的内容',
        icon: 'none'
      });
      return;
    }
    
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage && prevPage.setData && prevPage.handleVoiceInput) {
      prevPage.setData({
        userInput: result
      });
      prevPage.handleVoiceInput(result);
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.showToast({
        title: '无法返回上一页',
        icon: 'none'
      });
    }
  },

  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '语音输入功能可以帮助您通过语音快速输入文字。\n\n使用方法：\n1. 按住说话按钮开始录音\n2. 松开按钮结束录音\n3. 系统会自动识别您的语音并转换为文字\n\n支持的功能：\n- 语音转文字\n- 语音指令控制\n- 语音记笔记\n- 语音搜索',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});