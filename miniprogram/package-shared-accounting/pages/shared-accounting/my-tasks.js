// 我的任务页面逻辑
Page({
  data: {
    // 任务列表
    tasks: [],
    // 筛选后的任务列表
    filteredTasks: [],
    // 当前筛选条件
    activeFilter: 'all'
  },
  
  onLoad() {
    this.initializePage();
  },
  
  onShow() {
    this.loadTasks();
  },
  
  // 初始化页面
  initializePage() {
    this.loadTasks();
  },
  
  // 加载任务列表
  loadTasks() {
    try {
      // 从本地存储获取任务列表
      const tasks = wx.getStorageSync('accountingTasks') || [];
      
      // 添加一些模拟数据
      if (tasks.length === 0) {
        const mockTasks = [
          {
            id: '1',
            title: '月度税务申报',
            description: '2026年1月增值税、企业所得税申报',
            service: 'tax',
            budget: 'medium',
            deadline: '2026-02-15',
            contact: '13800138000',
            status: 'completed',
            statusColor: '#10b981',
            price: 200,
            createdAt: '2026-01-15T10:00:00.000Z',
            assignedAccountant: '张会计'
          },
          {
            id: '2',
            title: '年度财务审计',
            description: '2025年度财务报表审计',
            service: 'audit',
            budget: 'high',
            deadline: '2026-03-31',
            contact: '13900139000',
            status: 'processing',
            statusColor: '#3b82f6',
            price: 1500,
            createdAt: '2026-01-20T14:30:00.000Z',
            assignedAccountant: '李会计'
          },
          {
            id: '3',
            title: '财务咨询',
            description: '关于企业融资的财务问题咨询',
            service: 'consulting',
            budget: 'low',
            deadline: '2026-02-10',
            contact: '13700137000',
            status: 'pending',
            statusColor: '#1e3a8a',
            price: 300,
            createdAt: '2026-01-25T09:15:00.000Z',
            assignedAccountant: ''
          },
          {
            id: '4',
            title: '账务处理',
            description: '2026年1月的日常账务处理',
            service: 'accounting',
            budget: 'medium',
            deadline: '2026-02-05',
            contact: '13600136000',
            status: 'pending',
            statusColor: '#1e3a8a',
            price: 500,
            createdAt: '2026-01-28T11:00:00.000Z',
            assignedAccountant: ''
          }
        ];
        wx.setStorageSync('accountingTasks', mockTasks);
        this.setData({
          tasks: mockTasks,
          filteredTasks: mockTasks
        });
      } else {
        this.setData({
          tasks,
          filteredTasks: tasks
        });
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
      this.setData({ 
        tasks: [],
        filteredTasks: []
      });
    }
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  },
  
  // 切换筛选条件
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.filterTasks();
  },
  
  // 筛选任务
  filterTasks() {
    const { tasks, activeFilter } = this.data;
    let filteredTasks = tasks;
    
    if (activeFilter !== 'all') {
      filteredTasks = tasks.filter(task => task.status === activeFilter);
    }
    
    this.setData({ filteredTasks });
  },
  
  // 查看任务详情
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shared-accounting/task-detail?id=${taskId}`
    });
  },
  
  // 取消任务
  cancelTask(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消任务',
      content: '确定要取消这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          const tasks = [...this.data.tasks];
          const taskIndex = tasks.findIndex(t => t.id === taskId);
          
          if (taskIndex !== -1) {
            tasks[taskIndex].status = 'cancelled';
            tasks[taskIndex].statusColor = '#6b7280';
            wx.setStorageSync('accountingTasks', tasks);
            this.setData({ tasks });
            this.filterTasks();
            
            wx.showToast({
              title: '任务已取消',
              icon: 'success',
              duration: 1500
            });
          }
        }
      }
    });
  },
  
  // 完成任务
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '完成任务',
      content: '确定要标记这个任务为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          const tasks = [...this.data.tasks];
          const taskIndex = tasks.findIndex(t => t.id === taskId);
          
          if (taskIndex !== -1) {
            tasks[taskIndex].status = 'completed';
            tasks[taskIndex].statusColor = '#10b981';
            wx.setStorageSync('accountingTasks', tasks);
            this.setData({ tasks });
            this.filterTasks();
            
            wx.showToast({
              title: '任务已完成',
              icon: 'success',
              duration: 1500
            });
          }
        }
      }
    });
  },
  
  // 评价任务
  reviewTask(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shared-accounting/task-review?id=${taskId}`
    });
  },
  
  // 跳转到发布任务页面
  navigateToPostTask() {
    wx.navigateTo({
      url: '/pages/shared-accounting/post-task'
    });
  },
  
  // 获取状态颜色
  getStatusColor(status) {
    const colorMap = {
      pending: '#1e3a8a',
      processing: '#3b82f6',
      completed: '#10b981',
      cancelled: '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  },
  
  // 获取状态文本
  getStatusText(status) {
    const textMap = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return textMap[status] || '未知';
  },
  
  // 获取服务类型文本
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

  // 获取预算文本
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
  
  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});