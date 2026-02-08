Page({
  data: {
    currentDate: '',
    riskLevel: 'medium',
    warnings: [],
    showDetailModal: false,
    selectedWarning: {},
    riskStats: {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 0
    }
  },

  onLoad(options) {
    this.initData();
  },

  onReady() {},

  onShow() {},

  onHide() {},

  onUnload() {},

  onPullDownRefresh() {
    this.initData();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {},

  onShareAppMessage() {},

  initData() {
    this.setData({ currentDate: this.getFormattedDate() });
    this.loadRiskData();
  },

  loadRiskData() {
    const mockWarnings = [
      {
        id: 1,
        title: '增值税申报逾期',
        description: '本月增值税申报截止日期为15日，尚未完成申报',
        date: '2026-01-25',
        level: 'high',
        levelText: '高风险',
        status: 'pending',
        statusText: '待处理',
        icon: '⚠️',
        impact: '可能面临罚款和滞纳金',
        suggestion: '立即完成增值税申报，避免产生罚款',
        priority: 1
      },
      {
        id: 2,
        title: '企业所得税预缴异常',
        description: '本季度企业所得税预缴金额与实际利润不匹配',
        date: '2026-01-24',
        level: 'medium',
        levelText: '中风险',
        status: 'processing',
        statusText: '处理中',
        icon: '⚠️',
        impact: '可能引起税务机关关注',
        suggestion: '核对企业所得税预缴数据，确保准确无误',
        priority: 2
      },
      {
        id: 3,
        title: '发票开具不规范',
        description: '部分发票开具内容与实际业务不符',
        date: '2026-01-23',
        level: 'medium',
        levelText: '中风险',
        status: 'pending',
        statusText: '待处理',
        icon: '⚠️',
        impact: '可能影响发票抵扣和税务检查',
        suggestion: '规范发票开具流程，确保发票内容与实际业务一致',
        priority: 3
      },
      {
        id: 4,
        title: '财务报表数据异常',
        description: '资产负债表和利润表数据存在逻辑矛盾',
        date: '2026-01-22',
        level: 'low',
        levelText: '低风险',
        status: 'resolved',
        statusText: '已解决',
        icon: '✅',
        impact: '可能影响财务分析和决策',
        suggestion: '核对财务报表数据，确保逻辑一致',
        priority: 4
      }
    ];

    this.setData({ warnings: mockWarnings });
    this.calculateRiskStats();
    this.calculateRiskLevel();
  },

  calculateRiskStats() {
    const warnings = this.data.warnings;
    const stats = {
      total: warnings.length,
      high: warnings.filter(w => w.level === 'high').length,
      medium: warnings.filter(w => w.level === 'medium').length,
      low: warnings.filter(w => w.level === 'low').length,
      resolved: warnings.filter(w => w.status === 'resolved').length
    };
    this.setData({ riskStats: stats });
  },

  calculateRiskLevel() {
    const warnings = this.data.warnings;
    const activeWarnings = warnings.filter(w => w.status !== 'resolved');
    const highRiskCount = activeWarnings.filter(w => w.level === 'high').length;
    const mediumRiskCount = activeWarnings.filter(w => w.level === 'medium').length;
    
    let riskLevel = 'low';
    if (highRiskCount > 0) {
      riskLevel = 'high';
    } else if (mediumRiskCount > 0) {
      riskLevel = 'medium';
    }
    
    this.setData({ riskLevel });
  },

  getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  navigateBack() {
    wx.navigateBack({ delta: 1 });
  },

  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '风险预警功能可以帮助您及时发现和处理企业的税务和财务风险。\n\n功能说明：\n1. 风险状态概览：显示企业当前的整体风险等级\n2. 风险预警列表：列出具体的风险预警信息\n3. 风险评估工具：提供税务、财务和合规性评估\n\n点击风险预警项可以查看详细信息并进行处理。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  showWarningDetail(e) {
    const warningId = e.currentTarget.dataset.id;
    const selectedWarning = this.data.warnings.find(warning => warning.id === warningId);
    
    if (selectedWarning) {
      this.setData({ selectedWarning, showDetailModal: true });
    }
  },

  closeDetailModal() {
    this.setData({ showDetailModal: false, selectedWarning: {} });
  },

  handleWarning() {
    const selectedWarning = this.data.selectedWarning;
    
    wx.showLoading({ title: '处理中...', mask: true });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '处理成功', icon: 'success' });
      
      const updatedWarnings = this.data.warnings.map(warning => {
        if (warning.id === selectedWarning.id) {
          return { ...warning, status: 'resolved', statusText: '已解决' };
        }
        return warning;
      });
      
      this.setData({ 
        warnings: updatedWarnings,
        showDetailModal: false 
      });
      
      this.calculateRiskStats();
      this.calculateRiskLevel();
    }, 2000);
  },

  startTaxAssessment() {
    wx.showToast({ title: '税务风险评估功能开发中', icon: 'none' });
  },

  startFinancialAssessment() {
    wx.showToast({ title: '财务风险评估功能开发中', icon: 'none' });
  },

  startComplianceAssessment() {
    wx.showToast({ title: '合规性评估功能开发中', icon: 'none' });
  },

  generateReport() {
    wx.showLoading({ title: '生成报告中...', mask: true });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '报告生成成功', icon: 'success' });
      
      setTimeout(() => {
        wx.showModal({
          title: '报告生成完成',
          content: '风险报告已生成，是否查看报告？',
          confirmText: '查看',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.showToast({ title: '报告查看功能开发中', icon: 'none' });
            }
          }
        });
      }, 1000);
    }, 3000);
  },

  filterWarnings(level) {
    if (level === 'all') {
      return this.data.warnings;
    }
    return this.data.warnings.filter(w => w.level === level);
  },

  catchTap(e) {}
});