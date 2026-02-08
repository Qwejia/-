Page({
  data: {
    revenue: '',
    labor: '',
    material: '',
    manufacturing: '',
    sales: '',
    management: '',
    other: '',
    totalCost: '0.00',
    costRatio: '0.00',
    profit: '0.00',
    profitMargin: '0.00',
    costAnalysis: '',
    showResult: false,
    canCalculate: false
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '成本结构分析' });
  },

  onRevenueInput(e) { this.setData({ revenue: e.detail.value }); this.checkCanCalculate(); },
  onLaborInput(e) { this.setData({ labor: e.detail.value }); this.checkCanCalculate(); },
  onMaterialInput(e) { this.setData({ material: e.detail.value }); this.checkCanCalculate(); },
  onManufacturingInput(e) { this.setData({ manufacturing: e.detail.value }); this.checkCanCalculate(); },
  onSalesInput(e) { this.setData({ sales: e.detail.value }); this.checkCanCalculate(); },
  onManagementInput(e) { this.setData({ management: e.detail.value }); this.checkCanCalculate(); },
  onOtherInput(e) { this.setData({ other: e.detail.value }); this.checkCanCalculate(); },

  checkCanCalculate() {
    const { revenue, labor, material, manufacturing, sales, management, other } = this.data;
    const canCalculate = revenue && labor && material && manufacturing && sales && management && other;
    this.setData({ canCalculate });
  },

  calculate() {
    const revenue = parseFloat(this.data.revenue);
    const labor = parseFloat(this.data.labor);
    const material = parseFloat(this.data.material);
    const manufacturing = parseFloat(this.data.manufacturing);
    const sales = parseFloat(this.data.sales);
    const management = parseFloat(this.data.management);
    const other = parseFloat(this.data.other);

    if (isNaN(revenue) || isNaN(labor) || isNaN(material) || isNaN(manufacturing) || isNaN(sales) || isNaN(management) || isNaN(other)) {
      wx.showToast({ title: '请输入有效的成本数据', icon: 'none' });
      return;
    }

    const totalCost = labor + material + manufacturing + sales + management + other;
    const costRatio = ((totalCost / revenue) * 100).toFixed(2);
    const profit = revenue - totalCost;
    const profitMargin = ((profit / revenue) * 100).toFixed(2);
    const costAnalysis = this.getCostAnalysis(revenue, labor, material, manufacturing, sales, management, other, totalCost, costRatio, profit, profitMargin);

    this.setData({ totalCost, costRatio, profit, profitMargin, costAnalysis, showResult: true });
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
    costItems.forEach(item => analysis += `• ${item.name}：${item.value}万元（占比${item.ratio}%）\n`);
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
    if (maxCostItem.ratio > 40) analysis += `• 重点关注${maxCostItem.name}，占总成本${maxCostItem.ratio}%\n`;
    if (sales > material) analysis += `• 销售费用高于材料成本，建议优化销售策略\n`;
    if (management > (labor + material) * 0.3) analysis += `• 管理费用偏高，建议精简管理流程\n`;
    return analysis;
  },

  copyResult() {
    const result = `总成本：¥${this.data.totalCost}万元\n成本率：${this.data.costRatio}%\n利润：¥${this.data.profit}万元\n利润率：${this.data.profitMargin}%`;
    wx.setClipboardData({ data: result, success: () => wx.showToast({ title: '已复制', icon: 'success' }) });
  }
});
