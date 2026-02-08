const { getChartManager } = require('../../utils/chartManager');

Page({
  data: {
    greeting: '',
    currentDate: '',
    accountingEntity: {},
    currentPeriod: '',
    currentPeriodIncome: '0.00',
    currentPeriodExpense: '0.00',
    currentPeriodProfit: '0.00',
    incomeChange: 0,
    expenseChange: 0,
    profitChange: 0,
    totalAssets: '0.00',
    totalLiabilities: '0.00',
    netAssets: '0.00',
    chartType: 'line',
    loading: false,
    loadingChart: false,
    loadingInsight: false,
    aiInsight: '',
    aiInsights: [],
    currentInsightIndex: 0,
    activities: [],
    activeTab: 'all',
    bookkeepingDeadline: '',
    reportGeneration: '',
    taxDeadline: '',
    dataCache: {
      overview: null,
      activities: null,
      chart: null,
      insight: null,
      lastUpdated: null
    },
    incomeChangeText: '↑',
    expenseChangeText: '↓',
    profitChangeText: '↑',
    incomeChangeClass: 'up',
    expenseChangeClass: 'up',
    profitChangeClass: 'up',
    incomeChangeAbs: 0,
    expenseChangeAbs: 0,
    profitChangeAbs: 0,
    chartTypeText: '柱状图',
    currentInsightText: '暂无洞察',
    entityName: '我的企业'
  },
  
  chartManager: null,
  insightTimer: null,
  
  onLoad() {
    this.initializePage();
  },
  
  onShow() {
    this.refreshData();
  },
  
  onUnload() {
    if (this.insightTimer) {
      clearInterval(this.insightTimer);
    }
  },
  
  initializePage() {
    this.setCurrentDate();
    this.setGreeting();
    this.loadAccountingEntity();
    this.setCalendarDates();
    this.initChart();
  },
  
  initChart() {
    if (this.chartManager) {
      this.chartManager.destroy();
    }
    this.chartManager = getChartManager('trendChart', {
      width: wx.getSystemInfoSync().windowWidth - 32,
      height: 300
    });
  },
  
  setCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const currentDate = `${year}年${month}月${day}日`;
    const currentPeriod = `${year}年${month}月`;
    this.setData({ currentDate, currentPeriod });
  },
  
  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 6) {
      greeting = '凌晨好';
    } else if (hour < 9) {
      greeting = '早上好';
    } else if (hour < 12) {
      greeting = '上午好';
    } else if (hour < 14) {
      greeting = '中午好';
    } else if (hour < 18) {
      greeting = '下午好';
    } else {
      greeting = '晚上好';
    }
    this.setData({ greeting });
  },
  
  setCalendarDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const bookkeepingDeadline = `${year}年${month}月${lastDayOfMonth}日`;
    const reportGeneration = `${year}年${month + 1}月5日`;
    const taxDeadline = `${year}年${month + 1}月15日`;
    
    this.setData({ bookkeepingDeadline, reportGeneration, taxDeadline });
  },
  
  loadAccountingEntity() {
    const accountingEntity = { name: '北京数智科技有限公司' };
    const entityName = accountingEntity.name || '我的企业';
    this.setData({ accountingEntity, entityName });
  },
  
  refreshData() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    Promise.all([
      this.loadOverviewData(),
      this.loadActivitiesData(),
      this.refreshAIInsight(),
      this.loadChartData()
    ]).then(() => {
      this.setData({ loading: false });
      wx.showToast({ title: '数据已刷新', icon: 'success' });
    }).catch(error => {
      console.error('刷新数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({ title: '刷新数据失败', icon: 'none' });
    });
  },
  
  loadChartData() {
    return new Promise((resolve, reject) => {
      try {
        this.setData({ loadingChart: true });
        
        const cache = this.data.dataCache;
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000;
        
        if (cache.chart && cache.lastUpdated && (now - cache.lastUpdated) < cacheExpiry) {
          setTimeout(() => {
            this.setData({ loadingChart: false });
            this.drawChart(cache.chart);
            resolve(cache.chart);
          }, 100);
          return;
        }
        
        const chartData = [
          { name: '7月', value: 85000 },
          { name: '8月', value: 92000 },
          { name: '9月', value: 105000 },
          { name: '10月', value: 98000 },
          { name: '11月', value: 115000 },
          { name: '12月', value: 128000 }
        ];
        
        setTimeout(() => {
          this.setData({
            loadingChart: false,
            dataCache: { ...cache, chart: chartData, lastUpdated: now }
          });
          this.drawChart(chartData);
          resolve(chartData);
        }, 500);
      } catch (error) {
        console.error('加载图表数据失败:', error);
        this.setData({ loadingChart: false });
        reject(error);
      }
    });
  },
  
  drawChart(data) {
    if (!this.chartManager) {
      this.initChart();
    }
    
    const chartType = this.data.chartType;
    const chartColor = '#45B7D1';
    
    if (chartType === 'line') {
      this.chartManager.drawLineChart(data, {
        title: '财务趋势',
        showArea: true,
        showValue: true,
        color: chartColor
      });
    } else {
      const coloredData = data.map(item => ({ ...item, color: chartColor }));
      this.chartManager.drawBarChart(coloredData, {
        title: '财务趋势',
        showValue: true
      });
    }
  },
  
  loadOverviewData() {
    return new Promise((resolve, reject) => {
      try {
        const cache = this.data.dataCache;
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000;
        
        if (cache.overview && cache.lastUpdated && (now - cache.lastUpdated) < cacheExpiry) {
          this.setData(cache.overview);
          resolve(cache.overview);
          return;
        }
        
        setTimeout(() => {
          const data = {
            currentPeriodIncome: '128000.00',
            currentPeriodExpense: '86000.00',
            currentPeriodProfit: '42000.00',
            incomeChange: 12.5,
            expenseChange: 8.3,
            profitChange: 18.7,
            totalAssets: '1200000.00',
            totalLiabilities: '450000.00',
            netAssets: '750000.00'
          };
          
          this.setData({
            ...data,
            dataCache: { ...cache, overview: data, lastUpdated: now },
            incomeChangeText: data.incomeChange >= 0 ? '↑' : '↓',
            expenseChangeText: data.expenseChange <= 0 ? '↓' : '↑',
            profitChangeText: data.profitChange >= 0 ? '↑' : '↓',
            incomeChangeClass: data.incomeChange >= 0 ? 'up' : 'down',
            expenseChangeClass: data.expenseChange <= 0 ? 'up' : 'down',
            profitChangeClass: data.profitChange >= 0 ? 'up' : 'down',
            incomeChangeAbs: Math.abs(data.incomeChange),
            expenseChangeAbs: Math.abs(data.expenseChange),
            profitChangeAbs: Math.abs(data.profitChange)
          });
          
          resolve(data);
        }, 300);
      } catch (error) {
        console.error('加载概览数据失败:', error);
        const defaultData = {
          currentPeriodIncome: '0.00',
          currentPeriodExpense: '0.00',
          currentPeriodProfit: '0.00',
          incomeChange: 0,
          expenseChange: 0,
          profitChange: 0,
          totalAssets: '0.00',
          totalLiabilities: '0.00',
          netAssets: '0.00'
        };
        this.setData(defaultData);
        reject(error);
      }
    });
  },
  
  loadActivitiesData() {
    return new Promise((resolve, reject) => {
      try {
        const cache = this.data.dataCache;
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000;
        
        if (cache.activities && cache.lastUpdated && (now - cache.lastUpdated) < cacheExpiry) {
          this.setData({ activities: cache.activities });
          resolve(cache.activities);
          return;
        }
        
        setTimeout(() => {
          const activities = [
            { id: 1, title: '收到客户货款', amount: '50000.00', date: '2026-01-25', type: 'income', icon: '💵' },
            { id: 2, title: '支付供应商款项', amount: '25000.00', date: '2026-01-24', type: 'expense', icon: '💸' },
            { id: 3, title: '支付员工工资', amount: '30000.00', date: '2026-01-20', type: 'expense', icon: '👥' }
          ];
          
          this.setData({
            activities,
            dataCache: { ...cache, activities, lastUpdated: now }
          });
          
          resolve(activities);
        }, 200);
      } catch (error) {
        console.error('加载活动数据失败:', error);
        this.setData({ activities: [] });
        reject(error);
      }
    });
  },
  
  refreshAIInsight() {
    return new Promise((resolve, reject) => {
      try {
        this.setData({ loadingInsight: true });
        
        if (this.insightTimer) {
          clearInterval(this.insightTimer);
        }
        
        setTimeout(() => {
          const insights = [
            '根据您的财务数据，本月收入环比增长12.5%，主要来自新客户订单。建议继续加大市场推广力度，扩大客户群体。',
            '您的成本费用率为67.2%，低于行业平均水平75%，成本控制良好。建议保持当前的成本管理策略。',
            '根据最新税收政策，您的企业符合小微企业税收优惠条件，可享受增值税减免和企业所得税优惠。建议及时办理相关备案手续。',
            '您的应收账款周转天数为45天，高于行业平均水平30天，建议加强应收账款管理，缩短回款周期。',
            '本月毛利率为33.6%，较上月提升2.1个百分点，主要得益于成本控制措施的有效实施。',
            '您的企业现金流状况良好，建议考虑适当增加研发投入，提升产品竞争力。',
            '根据季节性销售数据，预计下季度销售额将增长15-20%，建议提前做好库存和人员准备。',
            '您的固定成本占比为45%，在行业中处于合理水平，建议继续优化成本结构。',
            '本月新客户获取成本为8500元，低于上月的10200元，客户获取效率有所提升。',
            '您的企业资产负债率为37.5%，低于行业平均水平50%，财务风险较低，具有较强的抗风险能力。'
          ];
          
          const shuffledInsights = [...insights].sort(() => 0.5 - Math.random());
          const selectedInsights = shuffledInsights.slice(0, Math.floor(Math.random() * 3) + 8);
          
          this.setData({ 
            aiInsights: selectedInsights,
            currentInsightIndex: 0,
            loadingInsight: false,
            currentInsightText: selectedInsights[0] || '暂无洞察'
          });
          
          this.initInsightAutoScroll();
          
          resolve(selectedInsights);
        }, 1500);
      } catch (error) {
        console.error('刷新AI洞察失败:', error);
        this.setData({ 
          aiInsights: ['AI分析失败，请稍后重试'],
          currentInsightIndex: 0,
          loadingInsight: false,
          currentInsightText: 'AI分析失败，请稍后重试'
        });
        reject(error);
      }
    });
  },
  
  initInsightAutoScroll() {
    if (this.insightTimer) {
      clearInterval(this.insightTimer);
    }
    
    this.insightTimer = setInterval(() => {
      const { aiInsights, currentInsightIndex } = this.data;
      const nextIndex = (currentInsightIndex + 1) % aiInsights.length;
      const currentInsightText = aiInsights[nextIndex] || '暂无洞察';
      this.setData({ currentInsightIndex: nextIndex, currentInsightText });
    }, 5000);
  },
  
  refreshOverviewData() {
    this.loadOverviewData().then(() => {
      wx.showToast({ title: '数据已刷新', icon: 'success' });
    }).catch(() => {
      wx.showToast({ title: '刷新失败', icon: 'none' });
    });
  },
  
  toggleChartType() {
    const newChartType = this.data.chartType === 'line' ? 'bar' : 'line';
    const chartTypeText = newChartType === 'line' ? '柱状图' : '折线图';
    this.setData({ chartType: newChartType, chartTypeText });
    this.loadChartData();
  },
  
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    
    const cache = this.data.dataCache;
    const allActivities = cache.activities || this.data.activities;
    
    const filteredActivities = tab === 'all' ? allActivities : allActivities.filter(activity => activity.type === tab);
    this.setData({ activities: filteredActivities });
  },
  
  openPeriodSelector() {
    wx.showActionSheet({
      itemList: ['2026年1月', '2025年12月', '2025年11月'],
      success: (res) => {
        const periods = ['2026年1月', '2025年12月', '2025年11月'];
        const selectedPeriod = periods[res.tapIndex];
        this.setData({ 
          currentPeriod: selectedPeriod,
          dataCache: {
            overview: null,
            activities: null,
            chart: null,
            insight: null,
            lastUpdated: null
          }
        });
        this.refreshData();
      }
    });
  },
  
  navigateToAIAssistant() {
    wx.switchTab({
      url: '/pages/ai-assistant/index',
      success: () => console.log('导航成功'),
      fail: (err) => {
        console.error('导航失败:', err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  }
});
