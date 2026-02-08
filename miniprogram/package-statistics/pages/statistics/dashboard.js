// 经营仪表盘页面逻辑
const { getChartManager } = require('../../utils/chartManager');

Page({
  data: {
    // 时间范围选择
    selectedRange: 'month',
    // 核心指标
    revenue: '0.00',
    cost: '0.00',
    profit: '0.00',
    taxRate: '0.00',
    // 变化率
    revenueChange: 0,
    costChange: 0,
    profitChange: 0,
    taxRateChange: 0,
    // 行业选择
    selectedIndustry: '科技行业',
    // 行业对比数据
    companyProfitMargin: 0,
    industryProfitMargin: 0,
    companyCostRate: 0,
    industryCostRate: 0,
    companyTaxRate: 0,
    industryTaxRate: 0,
    // 经营建议
    suggestions: []
  },
  
  // 图表管理器实例
  revenueChartManager: null,
  costChartManager: null,
  
  onLoad() {
    this.initializePage();
  },
  
  onShow() {
    this.refreshData();
  },
  
  // 初始化页面
  initializePage() {
    this.loadKeyMetrics();
    this.loadIndustryComparison();
    this.loadBusinessSuggestions();
    this.initializeCharts();
  },
  
  // 刷新数据
  refreshData() {
    this.loadKeyMetrics();
    this.loadIndustryComparison();
    this.loadBusinessSuggestions();
    this.refreshCharts();
  },
  
  // 选择时间范围
  selectTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({ selectedRange: range });
    // 这里可以根据选择的时间范围重新加载数据
    this.loadKeyMetrics();
    this.refreshCharts();
  },
  
  // 加载核心指标
  loadKeyMetrics() {
    try {
      const { selectedRange } = this.data;
      let data;
      
      // 根据时间范围返回不同的数据
      switch (selectedRange) {
        case 'day':
          data = {
            revenue: '4266.67',
            cost: '2866.67',
            profit: '1400.00',
            taxRate: '3.5',
            revenueChange: 2.5,
            costChange: 1.8,
            profitChange: 3.2,
            taxRateChange: 0
          };
          break;
        case 'week':
          data = {
            revenue: '30000.00',
            cost: '20000.00',
            profit: '10000.00',
            taxRate: '3.5',
            revenueChange: 6.8,
            costChange: 4.5,
            profitChange: 9.2,
            taxRateChange: -0.2
          };
          break;
        case 'month':
          data = {
            revenue: '128000.00',
            cost: '86000.00',
            profit: '42000.00',
            taxRate: '3.5',
            revenueChange: 12.5,
            costChange: 8.3,
            profitChange: 18.7,
            taxRateChange: -0.5
          };
          break;
        case 'quarter':
          data = {
            revenue: '385000.00',
            cost: '260000.00',
            profit: '125000.00',
            taxRate: '3.4',
            revenueChange: 35.2,
            costChange: 28.6,
            profitChange: 45.8,
            taxRateChange: -0.8
          };
          break;
        case 'year':
          data = {
            revenue: '1550000.00',
            cost: '1050000.00',
            profit: '500000.00',
            taxRate: '3.2',
            revenueChange: 45.8,
            costChange: 38.2,
            profitChange: 58.6,
            taxRateChange: -1.2
          };
          break;
        default:
          data = {
            revenue: '128000.00',
            cost: '86000.00',
            profit: '42000.00',
            taxRate: '3.5',
            revenueChange: 12.5,
            costChange: 8.3,
            profitChange: 18.7,
            taxRateChange: -0.5
          };
      }
      
      this.setData(data);
    } catch (error) {
      console.error('加载核心指标失败:', error);
      // 设置默认数据
      const defaultData = {
        revenue: '0.00',
        cost: '0.00',
        profit: '0.00',
        taxRate: '0.00',
        revenueChange: 0,
        costChange: 0,
        profitChange: 0,
        taxRateChange: 0
      };
      this.setData(defaultData);
    }
  },
  
  // 加载行业对比数据
  loadIndustryComparison() {
    try {
      const { selectedRange } = this.data;
      let data;
      
      // 根据时间范围返回不同的行业对比数据
      switch (selectedRange) {
        case 'day':
          data = {
            companyProfitMargin: 33.0,
            industryProfitMargin: 25.0,
            companyCostRate: 67.0,
            industryCostRate: 75.0,
            companyTaxRate: 3.5,
            industryTaxRate: 4.2
          };
          break;
        case 'week':
          data = {
            companyProfitMargin: 33.3,
            industryProfitMargin: 25.0,
            companyCostRate: 66.7,
            industryCostRate: 75.0,
            companyTaxRate: 3.5,
            industryTaxRate: 4.2
          };
          break;
        case 'month':
          data = {
            companyProfitMargin: 32.8,
            industryProfitMargin: 25.0,
            companyCostRate: 67.2,
            industryCostRate: 75.0,
            companyTaxRate: 3.5,
            industryTaxRate: 4.2
          };
          break;
        case 'quarter':
          data = {
            companyProfitMargin: 32.5,
            industryProfitMargin: 25.0,
            companyCostRate: 67.5,
            industryCostRate: 75.0,
            companyTaxRate: 3.4,
            industryTaxRate: 4.2
          };
          break;
        case 'year':
          data = {
            companyProfitMargin: 32.3,
            industryProfitMargin: 25.0,
            companyCostRate: 67.7,
            industryCostRate: 75.0,
            companyTaxRate: 3.2,
            industryTaxRate: 4.2
          };
          break;
        default:
          data = {
            companyProfitMargin: 32.8,
            industryProfitMargin: 25.0,
            companyCostRate: 67.2,
            industryCostRate: 75.0,
            companyTaxRate: 3.5,
            industryTaxRate: 4.2
          };
      }
      
      this.setData(data);
    } catch (error) {
      console.error('加载行业对比数据失败:', error);
      // 设置默认数据
      const defaultData = {
        companyProfitMargin: 0,
        industryProfitMargin: 0,
        companyCostRate: 0,
        industryCostRate: 0,
        companyTaxRate: 0,
        industryTaxRate: 0
      };
      this.setData(defaultData);
    }
  },
  
  // 加载经营建议
  loadBusinessSuggestions() {
    try {
      const { selectedRange } = this.data;
      let suggestions;
      
      // 根据时间范围返回不同的经营建议
      switch (selectedRange) {
        case 'day':
          suggestions = [
            {
              id: 1,
              title: '日销售额分析',
              description: '今日销售额为¥4,266.67，较昨日增长2.5%。建议关注每日销售高峰时段，优化人员安排。',
              icon: '📊'
            },
            {
              id: 2,
              title: '成本控制',
              description: '今日成本率为67.2%，与行业平均水平相比有优势。建议保持当前的成本控制策略。',
              icon: '💰'
            }
          ];
          break;
        case 'week':
          suggestions = [
            {
              id: 1,
              title: '周销售趋势',
              description: '本周销售额为¥30,000.00，较上周增长6.8%。建议分析周内销售波动，优化促销策略。',
              icon: '📈'
            },
            {
              id: 2,
              title: '周末销售策略',
              description: '周末销售额相对较低，建议针对周末制定专门的促销活动，提升周末销售表现。',
              icon: '🎯'
            }
          ];
          break;
        case 'month':
          suggestions = [
            {
              id: 1,
              title: '优化成本结构',
              description: '您的成本率为67.2%，高于行业平均水平。建议重点关注采购成本和运营费用，寻找优化空间。',
              icon: '💰'
            },
            {
              id: 2,
              title: '扩大市场份额',
              description: '您的利润率高于行业平均水平，说明产品具有竞争力。建议加大市场推广力度，扩大市场份额。',
              icon: '📈'
            },
            {
              id: 3,
              title: '税务筹划',
              description: '您的税负率略低于行业平均水平，但仍有优化空间。建议利用小微企业税收优惠政策，进一步降低税务成本。',
              icon: '📋'
            }
          ];
          break;
        case 'quarter':
          suggestions = [
            {
              id: 1,
              title: '季度业绩分析',
              description: '本季度销售额为¥385,000.00，较上季度增长35.2%。建议分析季度增长驱动因素，持续优化业务策略。',
              icon: '📊'
            },
            {
              id: 2,
              title: '成本结构优化',
              description: '本季度成本率为67.5%，建议重点关注采购成本，通过批量采购或寻找更优供应商降低成本。',
              icon: '💰'
            },
            {
              id: 3,
              title: '现金流管理',
              description: '季度利润增长45.8%，建议加强现金流管理，确保资金充足以支持业务扩张。',
              icon: '💸'
            }
          ];
          break;
        case 'year':
          suggestions = [
            {
              id: 1,
              title: '年度业绩总结',
              description: '本年度销售额为¥1,550,000.00，较去年增长45.8%。建议总结年度成功经验，制定下一年度增长目标。',
              icon: '📋'
            },
            {
              id: 2,
              title: '成本结构长期优化',
              description: '年度成本率为67.7%，建议制定长期成本优化计划，特别是在采购和运营费用方面。',
              icon: '💰'
            },
            {
              id: 3,
              title: '市场扩张策略',
              description: '年度利润率高于行业平均水平，建议考虑市场扩张，开拓新的销售渠道或地域市场。',
              icon: '🌍'
            },
            {
              id: 4,
              title: '税务筹划方案',
              description: '年度税负率为3.2%，建议制定更全面的税务筹划方案，充分利用各项税收优惠政策。',
              icon: '📊'
            }
          ];
          break;
        default:
          suggestions = [
            {
              id: 1,
              title: '优化成本结构',
              description: '您的成本率为67.2%，高于行业平均水平。建议重点关注采购成本和运营费用，寻找优化空间。',
              icon: '💰'
            },
            {
              id: 2,
              title: '扩大市场份额',
              description: '您的利润率高于行业平均水平，说明产品具有竞争力。建议加大市场推广力度，扩大市场份额。',
              icon: '📈'
            },
            {
              id: 3,
              title: '税务筹划',
              description: '您的税负率略低于行业平均水平，但仍有优化空间。建议利用小微企业税收优惠政策，进一步降低税务成本。',
              icon: '📋'
            }
          ];
      }
      
      this.setData({ suggestions });
    } catch (error) {
      console.error('加载经营建议失败:', error);
      this.setData({ suggestions: [] });
    }
  },
  
  // 初始化图表
  initializeCharts() {
    // 初始化营收趋势图表
    this.revenueChartManager = getChartManager('revenueChart', {
      width: wx.getSystemInfoSync().windowWidth - 32,
      height: 300
    });
    
    // 初始化成本结构图表
    this.costChartManager = getChartManager('costChart', {
      width: wx.getSystemInfoSync().windowWidth - 32,
      height: 400
    });
    
    // 绘制图表
    this.drawRevenueChart();
    this.drawCostChart();
  },
  
  // 刷新图表
  refreshCharts() {
    // 重新绘制图表
    this.drawRevenueChart();
    this.drawCostChart();
  },
  
  // 绘制营收趋势图表
  drawRevenueChart() {
    if (!this.revenueChartManager) return;
    
    const { selectedRange } = this.data;
    let revenueData;
    
    // 根据时间范围返回不同的图表数据
    switch (selectedRange) {
      case 'day':
        // 日数据：24小时
        revenueData = [
          { name: '0时', value: 100 },
          { name: '4时', value: 50 },
          { name: '8时', value: 300 },
          { name: '12时', value: 500 },
          { name: '16时', value: 450 },
          { name: '20时', value: 350 },
          { name: '23时', value: 200 }
        ];
        break;
      case 'week':
        // 周数据：7天
        revenueData = [
          { name: '周一', value: 4200 },
          { name: '周二', value: 4500 },
          { name: '周三', value: 4800 },
          { name: '周四', value: 4300 },
          { name: '周五', value: 5200 },
          { name: '周六', value: 3500 },
          { name: '周日', value: 3500 }
        ];
        break;
      case 'month':
        // 月数据：30天（简化为6个点）
        revenueData = [
          { name: '1-5日', value: 21000 },
          { name: '6-10日', value: 22000 },
          { name: '11-15日', value: 23000 },
          { name: '16-20日', value: 21000 },
          { name: '21-25日', value: 24000 },
          { name: '26-30日', value: 17000 }
        ];
        break;
      case 'quarter':
        // 季数据：3个月
        revenueData = [
          { name: '1月', value: 120000 },
          { name: '2月', value: 130000 },
          { name: '3月', value: 135000 }
        ];
        break;
      case 'year':
        // 年数据：12个月
        revenueData = [
          { name: '1月', value: 85000 },
          { name: '2月', value: 92000 },
          { name: '3月', value: 88000 },
          { name: '4月', value: 95000 },
          { name: '5月', value: 105000 },
          { name: '6月', value: 110000 },
          { name: '7月', value: 115000 },
          { name: '8月', value: 120000 },
          { name: '9月', value: 125000 },
          { name: '10月', value: 122000 },
          { name: '11月', value: 128000 },
          { name: '12月', value: 135000 }
        ];
        break;
      default:
        // 默认月数据
        revenueData = [
          { name: '1-5日', value: 21000 },
          { name: '6-10日', value: 22000 },
          { name: '11-15日', value: 23000 },
          { name: '16-20日', value: 21000 },
          { name: '21-25日', value: 24000 },
          { name: '26-30日', value: 17000 }
        ];
    }
    
    // 绘制折线图
    this.revenueChartManager.drawLineChart(revenueData, {
      title: '营收趋势',
      showArea: true,
      showValue: true
    });
  },
  
  // 绘制成本结构图表
  drawCostChart() {
    if (!this.costChartManager) return;
    
    const { selectedRange } = this.data;
    let costData;
    
    // 根据时间范围返回不同的成本结构数据
    switch (selectedRange) {
      case 'day':
        costData = [
          { name: '采购成本', value: 1200 },
          { name: '运营费用', value: 900 },
          { name: '人力成本', value: 600 },
          { name: '其他费用', value: 166.67 }
        ];
        break;
      case 'week':
        costData = [
          { name: '采购成本', value: 8500 },
          { name: '运营费用', value: 6000 },
          { name: '人力成本', value: 4500 },
          { name: '其他费用', value: 1000 }
        ];
        break;
      case 'month':
        costData = [
          { name: '采购成本', value: 45000 },
          { name: '运营费用', value: 20000 },
          { name: '人力成本', value: 15000 },
          { name: '其他费用', value: 6000 }
        ];
        break;
      case 'quarter':
        costData = [
          { name: '采购成本', value: 135000 },
          { name: '运营费用', value: 60000 },
          { name: '人力成本', value: 45000 },
          { name: '其他费用', value: 20000 }
        ];
        break;
      case 'year':
        costData = [
          { name: '采购成本', value: 550000 },
          { name: '运营费用', value: 250000 },
          { name: '人力成本', value: 200000 },
          { name: '其他费用', value: 50000 }
        ];
        break;
      default:
        costData = [
          { name: '采购成本', value: 45000 },
          { name: '运营费用', value: 20000 },
          { name: '人力成本', value: 15000 },
          { name: '其他费用', value: 6000 }
        ];
    }
    
    // 绘制饼图
    this.costChartManager.drawPieChart(costData, {
      title: '成本结构'
    });
  },
  
  // 刷新图表数据
  refreshChart() {
    this.refreshCharts();
    wx.showToast({
      title: '图表已刷新',
      icon: 'success'
    });
  },
  
  // 打开行业选择器
  openIndustrySelector() {
    wx.showActionSheet({
      itemList: ['科技行业', '零售行业', '餐饮行业', '制造业', '服务业'],
      success: (res) => {
        const industries = ['科技行业', '零售行业', '餐饮行业', '制造业', '服务业'];
        const selectedIndustry = industries[res.tapIndex];
        this.setData({ selectedIndustry });
        // 这里可以根据选择的行业重新加载对比数据
        this.loadIndustryComparison();
      }
    });
  }
});