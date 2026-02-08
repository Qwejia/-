Page({
  data: { revenue: '', cost: '', receivables: '', payables: '', netCashFlow: '0.00', cashFlowTrend: '', forecastAnalysis: '', showResult: false, canCalculate: false },
  onLoad() { wx.setNavigationBarTitle({ title: '现金流预测' }); },
  onRevenueInput(e) { this.setData({ revenue: e.detail.value }); this.checkCanCalculate(); },
  onCostInput(e) { this.setData({ cost: e.detail.value }); this.checkCanCalculate(); },
  onReceivablesInput(e) { this.setData({ receivables: e.detail.value }); this.checkCanCalculate(); },
  onPayablesInput(e) { this.setData({ payables: e.detail.value }); this.checkCanCalculate(); },
  checkCanCalculate() { const { revenue, cost, receivables, payables } = this.data; this.setData({ canCalculate: revenue && cost && receivables && payables }); },
  calculate() {
    const revenue = parseFloat(this.data.revenue);
    const cost = parseFloat(this.data.cost);
    const receivables = parseFloat(this.data.receivables);
    const payables = parseFloat(this.data.payables);
    if (isNaN(revenue) || isNaN(cost) || isNaN(receivables) || isNaN(payables)) {
      wx.showToast({ title: '请输入有效的现金流数据', icon: 'none' });
      return;
    }
    const monthlyCashFlow = revenue - cost;
    const netCashFlow = monthlyCashFlow + receivables - payables;
    const cashFlowTrend = netCashFlow >= 0 ? '正向' : '负向';
    let forecastAnalysis = '基础数据：\n';
    forecastAnalysis += `• 月营收：¥${revenue.toFixed(2)}万元\n`;
    forecastAnalysis += `• 月成本：¥${cost.toFixed(2)}万元\n`;
    forecastAnalysis += `• 月应收账款：¥${receivables.toFixed(2)}万元\n`;
    forecastAnalysis += `• 月应付账款：¥${payables.toFixed(2)}万元\n`;
    forecastAnalysis += `• 月净现金流：¥${monthlyCashFlow.toFixed(2)}万元\n`;
    forecastAnalysis += `• 月实际现金流：¥${netCashFlow.toFixed(2)}万元\n\n`;
    forecastAnalysis += '现金流趋势预测：\n';
    forecastAnalysis += `• 现金流趋势：${cashFlowTrend}\n\n`;
    forecastAnalysis += '未来6个月预测：\n';
    for (let i = 1; i <= 6; i++) {
      const monthCashFlow = netCashFlow * (1 + (i * 0.05));
      const cumulativeCash = monthCashFlow * i;
      forecastAnalysis += `\n第${i}个月：\n`;
      forecastAnalysis += `  预计现金流：¥${monthCashFlow.toFixed(2)}万元\n`;
      forecastAnalysis += `  累计现金流：¥${cumulativeCash.toFixed(2)}万元\n`;
    }
    forecastAnalysis += '\n风险提示：\n';
    if (netCashFlow < 0) {
      forecastAnalysis += `✗ 当前现金流为负，存在资金压力\n`;
      forecastAnalysis += `• 建议加强应收账款管理\n`;
      forecastAnalysis += `• 建议优化成本结构\n`;
    } else if (netCashFlow < revenue * 0.1) {
      forecastAnalysis += `✓ 现金流较低，建议关注\n`;
      forecastAnalysis += `• 保持合理的现金储备\n`;
      forecastAnalysis += `• 优化应收应付账款周期\n`;
    } else {
      forecastAnalysis += `✓ 现金流健康\n`;
      forecastAnalysis += `• 建议合理规划资金使用\n`;
      forecastAnalysis += `• 可考虑投资理财\n`;
    }
    this.setData({ netCashFlow: netCashFlow.toFixed(2), cashFlowTrend, forecastAnalysis, showResult: true });
  },
  copyResult() {
    wx.setClipboardData({ data: this.data.forecastAnalysis, success: () => wx.showToast({ title: '已复制', icon: 'success' }) });
  }
});
