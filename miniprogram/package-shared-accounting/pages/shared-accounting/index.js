// 共享会计页面逻辑
Page({
  data: {
    // 推荐会计
    recommendedAccountants: [],
    // 我的任务
    myTasks: []
  },
  
  onLoad() {
    this.initializePage();
  },
  
  onShow() {
    this.refreshData();
  },
  
  // 初始化页面
  initializePage() {
    this.loadRecommendedAccountants();
    this.loadMyTasks();
  },
  
  // 刷新数据
  refreshData() {
    this.loadRecommendedAccountants();
    this.loadMyTasks();
  },
  
  // 导航到发布任务页面
  navigateToPostTask() {
    wx.navigateTo({
      url: '/pages/shared-accounting/post-task'
    });
  },
  
  // 导航到任务列表页面
  navigateToTaskList(e) {
    const service = e.currentTarget.dataset.service;
    wx.navigateTo({
      url: `/pages/shared-accounting/task-list?service=${service}`
    });
  },
  
  // 导航到会计列表页面
  navigateToAccountantList() {
    wx.navigateTo({
      url: '/pages/shared-accounting/accountant-list'
    });
  },
  
  // 导航到我的任务页面
  navigateToMyTasks() {
    wx.navigateTo({
      url: '/pages/shared-accounting/my-tasks'
    });
  },
  
  // 雇佣会计
  hireAccountant(e) {
    const accountantId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '预约成功',
      icon: 'success'
    });
  },
  
  // 加载推荐会计
  loadRecommendedAccountants() {
    try {
      // 模拟数据
      const accountants = [
        {
          id: 1,
          name: '张会计',
          avatar: '张',
          rating: 4.9,
          specialty: '税务筹划、账务处理',
          experience: 8,
          completedTasks: 156,
          price: 200
        },
        {
          id: 2,
          name: '李会计',
          avatar: '李',
          rating: 4.8,
          specialty: '财务审计、税务申报',
          experience: 10,
          completedTasks: 218,
          price: 250
        },
        {
          id: 3,
          name: '王会计',
          avatar: '王',
          rating: 4.7,
          specialty: '小微企业财务咨询',
          experience: 6,
          completedTasks: 98,
          price: 180
        }
      ];
      this.setData({ recommendedAccountants: accountants });
    } catch (error) {
      console.error('加载推荐会计失败:', error);
      this.setData({ recommendedAccountants: [] });
    }
  },
  
  // 加载我的任务
  loadMyTasks() {
    try {
      // 模拟数据
      const tasks = [
        {
          id: 1,
          title: '月度税务申报',
          description: '2026年1月增值税、企业所得税申报',
          price: 200,
          status: '已完成',
          statusColor: '#00b578',
          createdDate: '2026-01-15'
        },
        {
          id: 2,
          title: '年度财务审计',
          description: '2025年度财务报表审计',
          price: 1500,
          status: '进行中',
          statusColor: '#1677ff',
          createdDate: '2026-01-20'
        }
      ];
      this.setData({ myTasks: tasks });
    } catch (error) {
      console.error('加载我的任务失败:', error);
      this.setData({ myTasks: [] });
    }
  }
});