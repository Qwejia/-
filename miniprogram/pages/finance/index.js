Page({
  data: {
    pendingInvoices: 0,
    pendingTaxes: 0,
    pendingDataSync: 0,
    tasks: [],
    invoiceCount: 0,
    taxCount: 0,
    syncCount: 0,
    invoiceChange: 0,
    taxChange: 0,
    syncChange: 0,
    currentStatsPeriod: '本月'
  },
  
  onLoad() {
    this.initializePage();
  },
  
  onShow() {
    this.refreshData();
  },
  
  initializePage() {
    this.loadOverviewData();
    this.loadTasks();
    this.loadStatsData();
  },
  
  refreshData() {
    this.loadOverviewData();
    this.loadTasks();
    this.loadStatsData();
  },
  
  loadOverviewData() {
    try {
      const data = {
        pendingInvoices: 5,
        pendingTaxes: 2,
        pendingDataSync: 3
      };
      this.setData(data);
    } catch (error) {
      console.error('加载概览数据失败:', error);
      this.setData({ pendingInvoices: 0, pendingTaxes: 0, pendingDataSync: 0 });
    }
  },
  
  loadTasks() {
    try {
      const tasks = [
        { id: 1, title: '增值税申报', deadline: '2026-02-15', status: 'urgent', statusText: '紧急', icon: '📋' },
        { id: 2, title: '企业所得税预缴', deadline: '2026-02-20', status: 'warning', statusText: '待处理', icon: '💰' },
        { id: 3, title: '银行流水同步', deadline: '2026-01-30', status: 'normal', statusText: '进行中', icon: '🔗' }
      ];
      this.setData({ tasks });
    } catch (error) {
      console.error('加载任务数据失败:', error);
      this.setData({ tasks: [] });
    }
  },
  
  loadStatsData() {
    try {
      const data = {
        invoiceCount: 120,
        taxCount: 8,
        syncCount: 50,
        invoiceChange: 15.2,
        taxChange: 0,
        syncChange: 25.8
      };
      this.setData(data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      this.setData({ invoiceCount: 0, taxCount: 0, syncCount: 0, invoiceChange: 0, taxChange: 0, syncChange: 0 });
    }
  },
  
  refreshOverview() {
    this.loadOverviewData();
    wx.showToast({ title: '数据已刷新', icon: 'success' });
  },
  
  openStatsFilter() {
    wx.showActionSheet({
      itemList: ['本月', '本季度', '本年'],
      success: (res) => {
        const periods = ['本月', '本季度', '本年'];
        this.setData({ currentStatsPeriod: periods[res.tapIndex] });
        this.loadStatsData();
      }
    });
  },
  
  viewAllTasks() {
    wx.showToast({ title: '查看全部任务', icon: 'none' });
  },
  
  navigateToInvoice() {
    wx.navigateTo({ url: '/pages/invoice/index' });
  },
  
  navigateToTax() {
    wx.navigateTo({ url: '/pages/finance/tax' });
  },
  
  navigateToDataConnection() {
    wx.navigateTo({ url: '/pages/finance/data-connection' });
  }
});