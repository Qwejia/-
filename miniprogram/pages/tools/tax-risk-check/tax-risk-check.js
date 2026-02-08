Page({
  data: { revenue: '', taxPaid: '', receivables: '', inventory: '', riskScore: 0, riskLevel: '', riskAnalysis: '', showResult: false, canCalculate: false },
  onLoad() { wx.setNavigationBarTitle({ title: '税务风险检测' }); },
  onRevenueInput(e) { this.setData({ revenue: e.detail.value }); this.checkCanCalculate(); },
  onTaxPaidInput(e) { this.setData({ taxPaid: e.detail.value }); this.checkCanCalculate(); },
  onReceivablesInput(e) { this.setData({ receivables: e.detail.value }); this.checkCanCalculate(); },
  onInventoryInput(e) { this.setData({ inventory: e.detail.value }); this.checkCanCalculate(); },
  checkCanCalculate() { const { revenue, taxPaid, receivables, inventory } = this.data; this.setData({ canCalculate: revenue && taxPaid && receivables && inventory }); },
  calculate() {
    const revenue = parseFloat(this.data.revenue);
    const taxPaid = parseFloat(this.data.taxPaid);
    const receivables = parseFloat(this.data.receivables);
    const inventory = parseFloat(this.data.inventory);
    if (isNaN(revenue) || isNaN(taxPaid) || isNaN(receivables) || isNaN(inventory)) { wx.showToast({ title: '请输入有效的税务数据', icon: 'none' }); return; }
    const riskAssessment = this.calculateTaxRiskAssessment(revenue, taxPaid, receivables, inventory);
    this.setData({ riskScore: riskAssessment.score, riskLevel: riskAssessment.level, riskAnalysis: riskAssessment.analysis, showResult: true });
  },
  calculateTaxRiskAssessment(revenue, taxPaid, receivables, inventory) {
    let score = 100; let analysis = '';
    const taxRatio = revenue > 0 ? (taxPaid / revenue) * 100 : 0;
    const receivablesRatio = revenue > 0 ? (receivables / revenue) * 100 : 0;
    const inventoryRatio = revenue > 0 ? (inventory / revenue) * 100 : 0;
    analysis += '税务风险指标分析：\n';
    analysis += `• 税负率：${taxRatio.toFixed(2)}%\n`;
    if (taxRatio > 25) { score -= 30; analysis += `✗ 税负率过高（>25%），税务负担重\n`; }
    else if (taxRatio > 20) { score -= 15; analysis += `⚠ 税负率偏高（20%-25%），建议税务筹划\n`; }
    else if (taxRatio > 15) { score -= 5; analysis += `✓ 税负率适中（15%-20%），税务结构合理\n`; }
    else { analysis += `✓ 税负率低（<15%），税务负担轻\n`; }
    analysis += `• 应收账款率：${receivablesRatio.toFixed(2)}%\n`;
    if (receivablesRatio > 30) { score -= 20; analysis += `✗ 应收账款率过高（>30%），回款风险大\n`; }
    else if (receivablesRatio > 20) { score -= 10; analysis += `⚠ 应收账款率偏高（20%-30%），建议加强催收\n`; }
    else if (receivablesRatio > 10) { score -= 5; analysis += `✓ 应收账款率适中（10%-20%），回款正常\n`; }
    else { analysis += `✓ 应收账款率低（<10%），回款良好\n`; }
    analysis += `• 存货率：${inventoryRatio.toFixed(2)}%\n`;
    if (inventoryRatio > 40) { score -= 20; analysis += `✗ 存货率过高（>40%），库存积压风险\n`; }
    else if (inventoryRatio > 30) { score -= 10; analysis += `⚠ 存货率偏高（30%-40%），建议优化库存\n`; }
    else if (inventoryRatio > 20) { score -= 5; analysis += `✓ 存货率适中（20%-30%），库存管理良好\n`; }
    else { analysis += `✓ 存货率低（<20%），库存周转快\n`; }
    analysis += '\n税务合规建议：\n';
    if (score >= 70) { analysis += `✓ 税务状况良好，建议保持\n`; }
    else if (score >= 50) { analysis += `✓ 税务状况一般，建议优化\n• 合理利用税收优惠政策\n• 优化业务结构降低税负\n`; }
    else { analysis += `✗ 税务状况较差，需要关注\n• 建议咨询专业税务顾问\n• 加强税务合规管理\n`; }
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
