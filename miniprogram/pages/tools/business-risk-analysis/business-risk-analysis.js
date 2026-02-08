Page({
  data: { revenue: '', profit: '', growthRate: '', marketShare: '', employeeCount: '', riskScore: 0, riskLevel: '', riskAnalysis: '', showResult: false, canCalculate: false },
  onLoad() { wx.setNavigationBarTitle({ title: '经营风险分析' }); },
  onRevenueInput(e) { this.setData({ revenue: e.detail.value }); this.checkCanCalculate(); },
  onProfitInput(e) { this.setData({ profit: e.detail.value }); this.checkCanCalculate(); },
  onGrowthRateInput(e) { this.setData({ growthRate: e.detail.value }); this.checkCanCalculate(); },
  onMarketShareInput(e) { this.setData({ marketShare: e.detail.value }); this.checkCanCalculate(); },
  onEmployeeCountInput(e) { this.setData({ employeeCount: e.detail.value }); this.checkCanCalculate(); },
  checkCanCalculate() { const { revenue, profit, growthRate, marketShare, employeeCount } = this.data; this.setData({ canCalculate: revenue && profit && growthRate && marketShare && employeeCount }); },
  calculate() {
    const revenue = parseFloat(this.data.revenue);
    const profit = parseFloat(this.data.profit);
    const growthRate = parseFloat(this.data.growthRate);
    const marketShare = parseFloat(this.data.marketShare);
    const employeeCount = parseFloat(this.data.employeeCount);
    if (isNaN(revenue) || isNaN(profit) || isNaN(growthRate) || isNaN(marketShare) || isNaN(employeeCount)) { wx.showToast({ title: '请输入有效的经营数据', icon: 'none' }); return; }
    const riskAssessment = this.calculateBusinessRiskAssessment(revenue, profit, growthRate, marketShare, employeeCount);
    this.setData({ riskScore: riskAssessment.score, riskLevel: riskAssessment.level, riskAnalysis: riskAssessment.analysis, showResult: true });
  },
  calculateBusinessRiskAssessment(revenue, profit, growthRate, marketShare, employeeCount) {
    let score = 100; let analysis = '';
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    analysis += '经营风险指标分析：\n';
    analysis += `• 利润率：${profitMargin.toFixed(2)}%\n`;
    if (profitMargin < 0) { score -= 30; analysis += `✗ 企业亏损，经营风险极高\n`; }
    else if (profitMargin < 5) { score -= 15; analysis += `⚠ 利润率较低（<5%），盈利能力弱\n`; }
    else if (profitMargin < 10) { score -= 5; analysis += `✓ 利润率一般（5%-10%），盈利能力一般\n`; }
    else if (profitMargin < 15) { analysis += `✓ 利润率良好（10%-15%），盈利能力较强\n`; }
    else { analysis += `✓ 利润率优秀（>15%），盈利能力强\n`; }
    if (!isNaN(growthRate)) {
      analysis += `• 营收增长率：${growthRate.toFixed(2)}%\n`;
      if (growthRate < 0) { score -= 20; analysis += `✗ 营收负增长，业务萎缩\n`; }
      else if (growthRate < 5) { score -= 10; analysis += `⚠ 增长率较低（<5%），增长乏力\n`; }
      else if (growthRate < 15) { analysis += `✓ 增长率适中（5%-15%），增长稳定\n`; }
      else { analysis += `✓ 增长率良好（>15%），增长强劲\n`; }
    }
    if (!isNaN(marketShare)) {
      analysis += `• 市场占有率：${marketShare.toFixed(2)}%\n`;
      if (marketShare < 5) { score -= 15; analysis += `✗ 市场占有率低（<5%），竞争力弱\n`; }
      else if (marketShare < 10) { score -= 5; analysis += `✓ 市场占有率一般（5%-10%），竞争力一般\n`; }
      else { analysis += `✓ 市场占有率良好（>10%），竞争力强\n`; }
    }
    if (!isNaN(employeeCount) && employeeCount > 0) {
      const revenuePerEmployee = revenue / employeeCount;
      analysis += `• 人均营收：¥${revenuePerEmployee.toFixed(2)}万元\n`;
      if (revenuePerEmployee < 50) { score -= 15; analysis += `✗ 人均营收低（<50万），效率偏低\n`; }
      else if (revenuePerEmployee < 100) { score -= 5; analysis += `✓ 人均营收一般（50-100万），效率一般\n`; }
      else { analysis += `✓ 人均营收良好（>100万），效率较高\n`; }
    }
    analysis += '\n经营风险建议：\n';
    if (score >= 70) { analysis += `✓ 经营状况良好，建议保持\n• 继续提升核心竞争力\n• 优化运营效率\n`; }
    else if (score >= 50) { analysis += `✓ 经营状况一般，需要关注\n• 加强成本控制\n• 提升产品竞争力\n• 优化人员配置\n`; }
    else { analysis += `✗ 经营状况较差，风险较高\n• 建议制定转型计划\n• 优化业务结构\n• 加强风险管理\n`; }
    const finalScore = Math.max(0, Math.min(100, score));
    let level = '';
    if (finalScore >= 80) level = '低风险';
    else if (finalScore >= 60) level = '中低风险';
    else if (finalScore >= 40) level = '中等风险';
    else if (finalScore >= 20) level = '中高风险';
    else level = '高风险';
    return { score: finalScore, level, analysis };
  },
  copyResult() {
    const result = `风险等级：${this.data.riskLevel}\n风险评分：${this.data.riskScore}分`;
    wx.setClipboardData({ data: result, success: () => wx.showToast({ title: '已复制', icon: 'success' }) });
  }
});
