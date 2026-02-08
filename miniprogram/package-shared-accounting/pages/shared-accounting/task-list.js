// pages/shared-accounting/task-list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tasks: [],
    filteredTasks: [],
    activeFilter: 'all',
    searchKeyword: '',
    activeSort: 'createdAt'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadTasks();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadTasks();
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 加载任务列表
   */
  loadTasks() {
    // 从本地存储获取任务列表
    const tasks = wx.getStorageSync('accountingTasks') || [];
    
    // 添加一些模拟数据
    if (tasks.length === 0) {
      const mockTasks = [
        {
          id: '1',
          title: '月度税务申报',
          description: '需要完成1月份的增值税和企业所得税申报',
          service: 'tax',
          budget: 'medium',
          deadline: '2026-02-15',
          contact: '13800138000',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: '年度账务处理',
          description: '需要处理2025年度的账务，包括凭证录入和报表生成',
          service: 'accounting',
          budget: 'high',
          deadline: '2026-03-31',
          contact: '13900139000',
          status: 'processing',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          title: '财务咨询',
          description: '需要咨询关于企业融资的财务问题',
          service: 'consulting',
          budget: 'low',
          deadline: '2026-02-10',
          contact: '13700137000',
          status: 'completed',
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          title: '税务筹划',
          description: '需要为企业制定合理的税务筹划方案',
          service: 'taxPlanning',
          budget: 'high',
          deadline: '2026-02-20',
          contact: '13600136000',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          title: '财务分析',
          description: '需要对2025年度的财务数据进行分析，生成分析报告',
          service: 'financialAnalysis',
          budget: 'mediumHigh',
          deadline: '2026-03-15',
          contact: '13500135000',
          status: 'processing',
          createdAt: new Date().toISOString()
        }
      ];
      wx.setStorageSync('accountingTasks', mockTasks);
      this.setData({
        tasks: mockTasks
      });
    } else {
      this.setData({
        tasks
      });
    }
    this.filterAndSortTasks();
  },

  /**
   * 切换筛选条件
   */
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      activeFilter: filter
    });
    this.filterAndSortTasks();
  },

  /**
   * 筛选和排序任务
   */
  filterAndSortTasks() {
    const { tasks, activeFilter, searchKeyword, activeSort } = this.data;
    let filteredTasks = tasks;
    
    // 根据状态筛选
    if (activeFilter !== 'all') {
      filteredTasks = tasks.filter(task => task.status === activeFilter);
    }
    
    // 根据搜索关键词筛选
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(keyword) || 
        task.description.toLowerCase().includes(keyword)
      );
    }
    
    // 根据排序选项排序
    filteredTasks = this.sortTasks(filteredTasks, activeSort);
    
    this.setData({
      filteredTasks
    });
  },

  /**
   * 排序任务
   */
  sortTasks(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt); // 倒序，最新的在前
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline); // 正序，截止日期早的在前
        case 'budget':
          // 预算排序，根据预算类型的优先级
          const budgetOrder = {
            veryLow: 0,
            low: 1,
            mediumLow: 2,
            medium: 3,
            mediumHigh: 4,
            high: 5,
            veryHigh: 6
          };
          return budgetOrder[a.budget] - budgetOrder[b.budget];
        default:
          return 0;
      }
    });
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    const searchKeyword = e.detail.value;
    this.setData({
      searchKeyword
    });
    this.filterAndSortTasks();
  },

  /**
   * 清除搜索
   */
  clearSearch() {
    this.setData({
      searchKeyword: ''
    });
    this.filterAndSortTasks();
  },

  /**
   * 切换排序选项
   */
  switchSort(e) {
    const activeSort = e.currentTarget.dataset.sort;
    this.setData({
      activeSort
    });
    this.filterAndSortTasks();
  },

  /**
   * 取消任务
   */
  cancelTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const tasks = [...this.data.tasks];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].status = 'cancelled';
      wx.setStorageSync('accountingTasks', tasks);
      this.setData({
        tasks
      });
      this.filterAndSortTasks();
      
      wx.showToast({
        title: '任务已取消',
        icon: 'success',
        duration: 1500
      });
    }
  },

  /**
   * 完成任务
   */
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const tasks = [...this.data.tasks];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].status = 'completed';
      wx.setStorageSync('accountingTasks', tasks);
      this.setData({
        tasks
      });
      this.filterAndSortTasks();
      
      wx.showToast({
        title: '任务已完成',
        icon: 'success',
        duration: 1500
      });
    }
  },

  /**
   * 查看任务详情
   */
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/shared-accounting/task-detail?id=' + taskId
    });
  },



  /**
   * 跳转到发布任务页面
   */
  navigateToPostTask() {
    wx.navigateTo({
      url: '/pages/shared-accounting/post-task'
    });
  },

  /**
   * 获取状态颜色
   */
  getStatusColor(status) {
    const colorMap = {
      pending: '#1e3a8a',
      processing: '#3b82f6',
      completed: '#10b981',
      cancelled: '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const textMap = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return textMap[status] || '未知';
  },

  /**
   * 获取服务类型文本
   */
  getServiceText(service) {
    const textMap = {
      tax: '税务申报',
      accounting: '账务处理',
      audit: '财务审计',
      consulting: '财务咨询',
      taxPlanning: '税务筹划',
      financialAnalysis: '财务分析',
      costAccounting: '成本核算',
      fundManagement: '资金管理',
      financialTraining: '财务培训'
    };
    return textMap[service] || '其他服务';
  },

  /**
   * 获取预算文本
   */
  getBudgetText(budget) {
    const textMap = {
      veryLow: '¥100以下',
      low: '¥100-300',
      mediumLow: '¥300-500',
      medium: '¥500-800',
      mediumHigh: '¥800-1000',
      high: '¥1000-2000',
      veryHigh: '¥2000+'
    };
    return textMap[budget] || '未设置';
  },

  /**
   * 格式化时间
   */
  formatTime(timeStr) {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
});