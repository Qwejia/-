// pages/generalLedger/ledger.js
const app = getApp();
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    ledgerData: [],
    searchKeyword: '',
    categoryFilter: '',
    period: 'current', // current:本期, prev:上期, all:全部
    periodIndex: 0,
    periodText: '本期',
    periodOptions: [
      { value: 'current', text: '本期' },
      { value: 'prev', text: '上期' },
      { value: 'all', text: '全部' }
    ],
    categoryOptions: [
      { value: '', text: '全部类别' },
      { value: 'asset', text: '资产类' },
      { value: 'liability', text: '负债类' },
      { value: 'equity', text: '所有者权益类' },
      { value: 'income', text: '损益类' },
      { value: 'cost', text: '成本类' }
    ],
    loading: false, // 加载状态
    error: '', // 错误信息
    totalDebit: 0, // 借贷方总金额
    totalCredit: 0,
    // 分页加载相关
    initialPageSize: 10, // 初始每页显示数量
    pageSize: 10, // 当前每页显示数量
    currentPage: 1, // 当前页码
    hasMoreData: true, // 是否有更多数据
    loadingMore: false, // 加载更多的状态
    preloadTriggered: false, // 是否已触发预加载
    preloadThreshold: 200, // 预加载触发阈值（距离底部像素）
    // 缓存相关
    ledgerCache: {}, // 总账数据缓存
    lastDataUpdateTime: 0, // 上次数据更新时间
    // 加载进度
    loadingProgress: 0, // 加载进度百分比
    showProgress: false, // 是否显示进度指示器
    // 错误重试相关
    retryCount: 0, // 当前重试次数
    maxRetries: 3, // 最大重试次数
    // 快捷操作按钮
    quickActions: [
      { id: 'addVoucher', name: '新增凭证', icon: '📝', action: 'addVoucher' },
      { id: 'exportData', name: '导出数据', icon: '📊', action: 'exportData' },
      { id: 'printLedger', name: '打印总账', icon: '🖨️', action: 'printLedger' },
      { id: 'refreshData', name: '刷新数据', icon: '🔄', action: 'refreshData' },
      { id: 'settings', name: '设置', icon: '⚙️', action: 'openSettings' },
      { id: 'help', name: '帮助', icon: '❓', action: 'openHelp' }
    ],
    showMoreActions: false, // 是否显示更多操作按钮
    visibleActions: [], // 当前可见的操作按钮
    maxVisibleActions: 4 // 默认显示的最大按钮数量
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化UI管理器
    this.uiManager = require('../../utils/uiManager').getUIManager(this);
    
    // 初始化可见的操作按钮
    this.initializeVisibleActions();
    
    this.loadLedgerData();
  },
  
  /**
   * 初始化可见的操作按钮
   */
  initializeVisibleActions: function() {
    const { quickActions, maxVisibleActions } = this.data;
    const visibleActions = quickActions.slice(0, maxVisibleActions);
    this.setData({
      visibleActions: visibleActions
    });
  },
  
  /**
   * 切换显示更多操作按钮
   */
  toggleMoreActions: function() {
    const { showMoreActions, quickActions, maxVisibleActions } = this.data;
    const newVisibleActions = showMoreActions 
      ? quickActions.slice(0, maxVisibleActions) 
      : quickActions;
    
    this.setData({
      showMoreActions: !showMoreActions,
      visibleActions: newVisibleActions
    });
  },
  
  /**
   * 处理快捷操作按钮点击
   */
  handleQuickAction: function(e) {
    const { action } = e.currentTarget.dataset;
    
    switch(action) {
      case 'addVoucher':
        this.addVoucher();
        break;
      case 'exportData':
        this.exportData();
        break;
      case 'printLedger':
        this.printLedger();
        break;
      case 'refreshData':
        this.refreshData();
        break;
      case 'openSettings':
        this.openSettings();
        break;
      case 'openHelp':
        this.openHelp();
        break;
      default:
        console.log('未知操作:', action);
    }
  },
  
  // 快捷操作实现
  addVoucher: function() {
    wx.navigateTo({
      url: '/pages/generalLedger/voucherEntry'
    });
  },
  
  exportData: function() {
    // 导出数据逻辑
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    });
  },
  
  printLedger: function() {
    // 打印逻辑
    wx.showToast({
      title: '打印功能开发中',
      icon: 'none'
    });
  },
  
  refreshData: function() {
    this.loadLedgerData();
  },
  
  openSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },
  
  openHelp: function() {
    wx.showToast({
      title: '帮助功能开发中',
      icon: 'none'
    });
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 避免与onLoad重复加载，仅当数据为空或需要刷新时加载
    if (!this.data.ledgerData || this.data.ledgerData.length === 0) {
      this.loadLedgerData();
    }
    
    // 延迟执行预加载，避免影响初始页面加载性能
    setTimeout(() => {
      this.preloadData();
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 清理防抖定时器，避免内存泄漏
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
    // 清理任何可能存在的进度定时器
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    // 清理UI管理器资源
    if (this.uiManager) {
      this.uiManager.destroy();
    }
  },
  
  /**
   * 计算日期范围
   * @returns {Object} 包含本期和上期日期范围的对象
   */
  calculateDateRanges() {
    // 缓存计算结果，避免重复计算
    if (this.dateRanges && this.dateRanges.lastCalculatedDate === new Date().toDateString()) {
      return this.dateRanges;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 计算本期的日期范围（当月1日到当月最后一天）
    const currentStartDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const currentEndDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    
    // 计算上期的日期范围（上月1日到上月最后一天）
    const prevStartDate = currentMonth === 1 ? `${currentYear - 1}-12-01` : `${currentYear}-${(currentMonth - 1).toString().padStart(2, '0')}-01`;
    const prevEndDate = new Date(currentMonth === 1 ? currentYear - 1 : currentYear, currentMonth - 1, 0).toISOString().split('T')[0];
    
    // 缓存结果并记录计算日期
    this.dateRanges = {
      currentStartDate,
      currentEndDate,
      prevStartDate,
      prevEndDate,
      lastCalculatedDate: new Date().toDateString()
    };
    
    return this.dateRanges;
  },

  // 生成缓存键
  generateCacheKey() {
    const { searchKeyword, categoryFilter, period } = this.data;
    return `${searchKeyword}_${categoryFilter}_${period}`;
  },

  // 加载总账数据（重构版）
  loadLedgerData(loadMore = false) {
    // 使用UI管理器统一处理异步操作
    this.uiManager.handleAsync(async () => {
      // 生成缓存键
      const cacheKey = this.generateCacheKey();
      const cacheData = this.data.ledgerCache[cacheKey];
      const dataUpdateTime = app.globalData.dataUpdateTime || 0;
      
      // 初始化真实加载进度（仅在没有缓存且非加载更多时）
      const totalSteps = 5; // 总处理步骤数
      const updateProgress = (step) => {
        if (!loadMore) {
          const newProgress = Math.min(90, Math.floor((step / totalSteps) * 90));
          this.uiManager.showProgress(newProgress, `正在加载数据(${step}/${totalSteps})...`);
        }
      };

      // 检查缓存是否存在且有效
      if (cacheData && cacheData.updateTime >= dataUpdateTime && !loadMore) {
        console.log('使用缓存数据');
        this.setData({
          ledgerData: cacheData.ledgerData.slice(0, this.data.pageSize),
          totalDebit: cacheData.totalDebit,
          totalCredit: cacheData.totalCredit,
          currentPage: 1,
          hasMoreData: cacheData.ledgerData.length > this.data.pageSize
        });
        return;
      }
      
      // 获取数据
      const accounts = app.globalData.accounts || [];
      const vouchers = app.globalData.vouchers || [];
      
      // 检查数据是否可用
      if (accounts.length === 0) {
        throw new Error('没有找到科目数据');
      }
      updateProgress(1); // 数据获取完成
      
      // 使用新的辅助方法处理数据
      const filteredVouchers = this.filterVouchersByPeriod(vouchers);
      updateProgress(2); // 凭证过滤完成
      
      const ledgerMap = this.initializeLedgerData(accounts);
      updateProgress(3); // 总账初始化完成
      
      const updatedLedgerMap = this.calculateLedgerAmounts(ledgerMap, filteredVouchers);
      updateProgress(4); // 金额计算完成
      
      let ledgerData = Object.values(updatedLedgerMap);
      ledgerData = this.filterAndSortLedgerData(ledgerData);
      updateProgress(5); // 数据排序完成
      
      const { totalDebit, totalCredit } = this.calculateTotalAmounts(ledgerData);
      const { paginatedData, hasMoreData, adjustedPageSize } = this.handlePagination(ledgerData, loadMore);

      // 缓存完整数据（仅在非加载更多时）
      if (!loadMore) {
        const cacheData = {
          ledgerData: ledgerData,
          totalDebit: totalDebit,
          totalCredit: totalCredit,
          updateTime: Date.now()
        };
        
        // 更新缓存
        this.data.ledgerCache[cacheKey] = cacheData;

        // 更新全局数据更新时间
        app.globalData.dataUpdateTime = Date.now();
      }
      
      // 加载完成，更新进度到100%
      this.uiManager.showProgress(100, '加载完成');
      
      // 延迟隐藏进度条
      setTimeout(() => {
        this.uiManager.hideProgress();
      }, 300);
      
      // 准备更新数据
      const updateData = {
        ledgerData: loadMore ? [...this.data.ledgerData, ...paginatedData] : paginatedData,
        totalDebit: totalDebit,
        totalCredit: totalCredit,
        currentPage: loadMore ? this.data.currentPage + 1 : 1,
        hasMoreData: hasMoreData
      };
      
      // 只在pageSize变化时更新
      if (adjustedPageSize !== this.data.pageSize) {
        updateData.pageSize = adjustedPageSize;
      }
      
      // 只在非加载更多时更新缓存（减少setData调用）
      if (!loadMore) {
        updateData.ledgerCache = this.data.ledgerCache;
      }
      
      // 批量更新UI
      this.setData(updateData);
    }, {
      loadingType: loadMore ? 'LOAD_MORE' : 'DEFAULT',
      loadingTitle: loadMore ? '加载更多数据...' : '加载总账数据中...',
      errorType: 'NETWORK',
      successMessage: ''
    });
  },
  
  // 获取科目类别名称（使用常量缓存提高性能）
  getCategoryName(category) {
    // 使用静态映射表，避免每次调用都创建新对象
    const categoryMap = this.categoryMap || (this.categoryMap = {
      'asset': '资产类',
      'liability': '负债类',
      'equity': '所有者权益类',
      'income': '损益类',
      'cost': '成本类'
    });
    return categoryMap[category] || category;
  },

  // 过滤凭证（按期间）
  filterVouchersByPeriod(vouchers) {
    const { currentStartDate, currentEndDate, prevStartDate, prevEndDate } = this.calculateDateRanges();
    
    if (this.data.period === 'current') {
      return vouchers.filter(v => v.date >= currentStartDate && v.date <= currentEndDate);
    } else if (this.data.period === 'prev') {
      return vouchers.filter(v => v.date >= prevStartDate && v.date <= prevEndDate);
    }
    return vouchers; // 全部
  },

  // 初始化总账数据
  initializeLedgerData(accounts) {
    const categoryFilterIndex = parseInt(this.data.categoryFilter) || 0;
    const selectedCategory = this.data.categoryOptions[categoryFilterIndex]?.value;
    
    const ledgerMap = {};
    accounts.forEach(account => {
      // 应用类别筛选
      if (selectedCategory && account.type !== selectedCategory) {
        return;
      }
      
      ledgerMap[account._id] = {
        account: account,
        categoryName: this.getCategoryName(account.type),
        debitAmount: 0,
        creditAmount: 0,
        balance: account.balance || 0
      };
    });
    
    return ledgerMap;
  },

  // 计算借贷方发生额
  calculateLedgerAmounts(ledgerMap, filteredVouchers) {
    filteredVouchers.forEach(voucher => {
      voucher.items.forEach(item => {
        if (ledgerMap[item.accountId]) {
          if (item.debitAmount > 0) {
            ledgerMap[item.accountId].debitAmount += item.debitAmount;
          }
          if (item.creditAmount > 0) {
            ledgerMap[item.accountId].creditAmount += item.creditAmount;
          }
        }
      });
    });
    return ledgerMap;
  },

  // 筛选和排序总账数据
  filterAndSortLedgerData(ledgerData) {
    // 应用搜索关键词筛选
    const keyword = this.data.searchKeyword.toLowerCase();
    if (keyword) {
      ledgerData = ledgerData.filter(item => 
        item.account.code.toLowerCase().includes(keyword) || 
        item.account.name.toLowerCase().includes(keyword)
      );
    }
    
    // 排序
    return ledgerData.sort((a, b) => a.account.code.localeCompare(b.account.code));
  },

  // 计算总金额
  calculateTotalAmounts(ledgerData) {
    const totalDebit = ledgerData.reduce((sum, item) => sum + item.debitAmount, 0);
    const totalCredit = ledgerData.reduce((sum, item) => sum + item.creditAmount, 0);
    return { totalDebit, totalCredit };
  },

  // 处理分页
  handlePagination(ledgerData, loadMore) {
    let { pageSize, currentPage } = this.data;
    
    // 根据数据量动态调整pageSize（数据量越大，每页加载越多）
    const totalItems = ledgerData.length;
    let adjustedPageSize = pageSize;
    
    if (totalItems > 100) {
      adjustedPageSize = 20;
    } else if (totalItems > 50) {
      adjustedPageSize = 15;
    }
    
    // 如果是首次加载，使用初始pageSize
    if (!loadMore) {
      adjustedPageSize = this.data.initialPageSize;
    }
    
    const startIndex = loadMore ? (currentPage - 1) * pageSize : 0;
    const endIndex = startIndex + adjustedPageSize;
    const paginatedData = ledgerData.slice(startIndex, endIndex);
    const hasMoreData = endIndex < ledgerData.length;
    
    return { paginatedData, hasMoreData, adjustedPageSize };
  },
  
  // 加载更多总账数据
  loadMoreLedger() {
    if (this.data.hasMoreData && !this.data.loadingMore) {
      this.loadLedgerData(true);
    }
  },
  
  // 滚动事件处理 - 实现预加载
  onScroll(e) {
    if (!this.data.hasMoreData || this.data.loadingMore || this.data.preloadTriggered) {
      return;
    }
    
    const { scrollHeight, scrollTop, clientHeight } = e.detail;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    
    // 当距离底部小于预加载阈值时触发预加载
    if (distanceToBottom < this.data.preloadThreshold) {
      this.setData({ preloadTriggered: true });
      // 预加载下一页数据
      this.loadLedgerData(true);
    }
  },
  
  // 搜索科目 - 添加防抖处理
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    
    // 清除之前的防抖定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    // 设置新的防抖定时器，500ms后执行搜索
    this.searchTimer = setTimeout(() => {
      // 搜索时重置分页
      this.setData({
        currentPage: 1,
        hasMoreData: true,
        ledgerData: []
      });
      this.loadLedgerData();
    }, 500);
  },

  // 重置搜索
  resetSearch() {
    this.setData({
      searchKeyword: '',
      currentPage: 1,
      hasMoreData: true,
      ledgerData: []
    });
    this.loadLedgerData();
  },

  // 数据预加载功能
  preloadData() {
    console.log('开始预加载数据...');
    
    // 预加载常用的筛选组合
    const preloadCombinations = [
      { period: 'current', categoryFilter: '0', searchKeyword: '' }, // 当前期间+全部类别
      { period: 'prev', categoryFilter: '0', searchKeyword: '' },    // 上一期间+全部类别
      { period: 'all', categoryFilter: '1', searchKeyword: '' },     // 全部期间+资产类
      { period: 'all', categoryFilter: '2', searchKeyword: '' }      // 全部期间+负债类
    ];
    
    // 获取当前筛选条件，避免重复预加载
    const currentFilters = {
      period: this.data.period,
      categoryFilter: this.data.categoryFilter,
      searchKeyword: this.data.searchKeyword
    };
    
    // 遍历预加载组合
    preloadCombinations.forEach((filters, index) => {
      // 检查是否与当前筛选条件相同，相同则跳过
      const isCurrentFilter = 
        filters.period === currentFilters.period &&
        filters.categoryFilter === currentFilters.categoryFilter &&
        filters.searchKeyword === currentFilters.searchKeyword;
      
      if (isCurrentFilter) {
        return;
      }
      
      // 延迟执行预加载，避免同时请求过多
      setTimeout(() => {
        this.preloadCombination(filters);
      }, index * 500);
    });
  },

  // 预加载单个筛选组合
  preloadCombination(filters) {
    try {
      const app = getApp();
      const accounts = app.globalData.accounts || [];
      const vouchers = app.globalData.vouchers || [];
      
      if (accounts.length === 0) {
        return;
      }
      
      // 暂时保存当前筛选条件
      const originalFilters = {
        period: this.data.period,
        categoryFilter: this.data.categoryFilter,
        searchKeyword: this.data.searchKeyword
      };
      
      // 应用预加载的筛选条件
      this.setData({
        period: filters.period,
        categoryFilter: filters.categoryFilter,
        searchKeyword: filters.searchKeyword
      });
      
      // 生成缓存键
      const cacheKey = this.generateCacheKey();
      
      // 如果缓存已存在，跳过预加载
      if (this.data.ledgerCache[cacheKey]) {
        // 恢复原始筛选条件
        this.setData(originalFilters);
        return;
      }
      
      // 使用辅助方法处理数据
      const filteredVouchers = this.filterVouchersByPeriod(vouchers);
      const ledgerMap = this.initializeLedgerData(accounts);
      const updatedLedgerMap = this.calculateLedgerAmounts(ledgerMap, filteredVouchers);
      let ledgerData = Object.values(updatedLedgerMap);
      ledgerData = this.filterAndSortLedgerData(ledgerData);
      const { totalDebit, totalCredit } = this.calculateTotalAmounts(ledgerData);
      
      // 缓存预加载的数据
      const cacheData = {
        ledgerData: ledgerData,
        totalDebit: totalDebit,
        totalCredit: totalCredit,
        updateTime: Date.now()
      };
      
      // 更新缓存
      this.data.ledgerCache[cacheKey] = cacheData;
      
      // 恢复原始筛选条件
      this.setData(originalFilters);
      
      console.log(`预加载完成: ${filters.period}, ${filters.categoryFilter}, ${filters.searchKeyword}`);
    } catch (err) {
      console.error('预加载数据失败:', err);
      // 确保恢复原始筛选条件
      this.setData(originalFilters || {});
    }
  },
  
  // 选择科目类别
  onCategoryChange(e) {
    const categoryIndex = e.detail.value;
    this.setData({
      categoryFilter: categoryIndex,
      currentPage: 1,
      hasMoreData: true,
      ledgerData: []
    });
    this.loadLedgerData();
  },
  
  // 选择期间
  onPeriodChange(e) {
    const periodIndex = e.detail.value;
    const selectedPeriod = this.data.periodOptions[periodIndex];
    this.setData({
      periodIndex: periodIndex,
      period: selectedPeriod.value,
      periodText: selectedPeriod.text,
      currentPage: 1,
      hasMoreData: true,
      ledgerData: []
    });
    this.loadLedgerData();
  },
  
  // 查看科目明细账
  viewSubLedger(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/generalLedger/subLedger?id=${id}`
    });
  }
});
