Page({
  data: { revenue: '', profit: '', assets: '', liabilities: '', receivables: '', inventory: '', riskScore: 0, riskLevel: '', riskAnalysis: '', showResult: false, canCalculate: false },
  onLoad() { wx.setNavigationBarTitle({ title: '财务风险评估' }); },
  onRevenueInput(e) { this.setData({ revenue: e.detail.value }); this.checkCanCalculate(); },
  onProfitInput(e) { this.setData({ profit: e.detail.value }); this.checkCanCalculate(); },
  onAssetsInput(e) { this.setData({ assets: e.detail.value }); this.checkCanCalculate(); },
  onLiabilitiesInput(e) { this.setData({ liabilities: e.detail.value }); this.checkCanCalculate(); },
  onReceivablesInput(e) { this.setData({ receivables: e.detail.value }); this.checkCanCalculate(); },
  onInventoryInput(e) { this.setData({ inventory: e.detail.value }); this.checkCanCalculate(); },
  checkCanCalculate() { const { revenue, profit, assets, liabilities, receivables, inventory } = this.data; this.setData({ canCalculate: revenue && profit && assets && liabilities && receivables && inventory }); },
  calculate() {
    const revenue = parseFloat(this.data.revenue);
    const profit = parseFloat(this.data.profit);
    const assets = parseFloat(this.data.assets);
    const liabilities = parseFloat(this.data.liabilities);
    const receivables = parseFloat(this.data.receivables);
    const inventory = parseFloat(this.data.inventory);
    if (isNaN(revenue) || isNaN(profit) || isNaN(assets) || isNaN(liabilities) || isNaN(receivables) || isNaN(inventory)) { wx.showToast({ title: '请输入有效的财务数据', icon: 'none' }); return; }
    const riskAssessment = this.calculateRiskAssessment(revenue, profit, assets, liabilities, receivables, inventory);
    this.setData({ riskScore: riskAssessment.score, riskLevel: riskAssessment.level, riskAnalysis: riskAssessment.analysis, showResult: true });
  },
  calculateRiskAssessment(revenue, profit, assets, liabilities, receivables, inventory) {
    let score = 100; let analysis = '';
    const debtRatio = assets > 0 ? (liabilities / assets) * 100 : 0;
    const receivablesRatio = revenue > 0 ? (receivables / revenue) * 100 : 0;
    const inventoryRatio = revenue > 0 ? (inventory / revenue) * 100 : 0;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    analysis += '风险指标分析：\n';
    analysis += `• 资产负债率：${debtRatio.toFixed(2)}%\n`;
    if (debtRatio > 70) { score -= 30; analysis += `✗ 负债率过高（>70%），存在严重财务风险\n`; }
    else if (debtRatio > 50) { score -= 15; analysis += `⚠ 负债率偏高（50%-70%），需要关注\n`; }
    else if (debtRatio > 30) { score -= 5; analysis += `✓ 负债率适中（30%-50%），财务结构合理\n`; }
    else { analysis += `✓ 负债率低（<30%），财务结构健康\n`; }
    analysis += `• 应收账款率：${receivablesRatio.toFixed(2)}%\n`;
    if (receivablesRatio > 20) { score -= 20; analysis += `✗ 应收账款率过高（>20%），回款风险大\n`; }
    else if (receivablesRatio > 15) { score -= 10; analysis += `⚠ 应收账款率偏高（15%-20%），建议加强催收\n`; }
    else if (receivablesRatio > 10) { score -= 5; analysis += `✓ 应收账款率适中（10%-15%），回款正常\n`; }
    else { analysis += `✓ 应收账款率低（<10%），回款良好\n`; }
    analysis += `• 存货率：${inventoryRatio.toFixed(2)}%\n`;
    if (inventoryRatio > 30) { score -= 20; analysis += `✗ 存货率过高（>30%），库存积压风险\n`; }
    else if (inventoryRatio > 20) { score -= 10; analysis += `⚠ 存货率偏高（20%-30%），建议优化库存\n`; }
    else if (inventoryRatio > 10) { score -= 5; analysis += `✓ 存货率适中（10%-20%），库存管理良好\n`; }
    else { analysis += `✓ 存货率低（<10%），库存周转快\n`; }
    analysis += `• 利润率：${profitMargin.toFixed(2)}%\n`;
    if (profitMargin < 0) { score -= 30; analysis += `✗ 企业亏损，经营风险极高\n`; }
    else if (profitMargin < 5) { score -= 15; analysis += `⚠ 利润率较低（<5%），盈利能力弱\n`; }
    else if (profitMargin < 10) { score -= 5; analysis += `✓ 利润率一般（5%-10%），盈利能力一般\n`; }
    else if (profitMargin < 15) { analysis += `✓ 利润率良好（10%-15%），盈利能力较强\n`; }
    else { analysis += `✓ 利润率优秀（>15%），盈利能力强\n`; }
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
