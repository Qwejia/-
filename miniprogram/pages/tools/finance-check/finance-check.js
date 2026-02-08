Page({
  data: {
    revenue: '',
    profit: '',
    assets: '',
    liabilities: '',
    healthScore: 0,
    healthLevel: '',
    healthAnalysis: '',
    showResult: false,
    canCalculate: false
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '财务健康检查'
    });
  },

  onRevenueInput(e) {
    this.setData({ revenue: e.detail.value });
    this.checkCanCalculate();
  },

  onProfitInput(e) {
    this.setData({ profit: e.detail.value });
    this.checkCanCalculate();
  },

  onAssetsInput(e) {
    this.setData({ assets: e.detail.value });
    this.checkCanCalculate();
  },

  onLiabilitiesInput(e) {
    this.setData({ liabilities: e.detail.value });
    this.checkCanCalculate();
  },

  checkCanCalculate() {
    const { revenue, profit, assets, liabilities } = this.data;
    const canCalculate = revenue && profit && assets && liabilities;
    this.setData({ canCalculate });
  },

  calculate() {
    const revenue = parseFloat(this.data.revenue);
    const profit = parseFloat(this.data.profit);
    const assets = parseFloat(this.data.assets);
    const liabilities = parseFloat(this.data.liabilities);

    if (isNaN(revenue) || isNaN(profit) || isNaN(assets) || isNaN(liabilities)) {
      wx.showToast({
        title: '请输入有效的财务数据',
        icon: 'none'
      });
      return;
    }

    const healthScore = this.calculateHealthScore(revenue, profit, assets, liabilities);
    const healthLevel = this.getHealthLevel(healthScore);
    const healthAnalysis = this.getHealthAnalysis(revenue, profit, assets, liabilities);

    this.setData({
      healthScore,
      healthLevel,
      healthAnalysis,
      showResult: true
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

  copyResult() {
    const result = `财务健康评分：${this.data.healthScore}分\n健康等级：${this.data.healthLevel}`;
    
    wx.setClipboardData({
      data: result,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  }
});
