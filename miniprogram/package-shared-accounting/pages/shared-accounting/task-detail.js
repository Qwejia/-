// pages/shared-accounting/task-detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    task: {
      id: '',
      title: '',
      description: '',
      service: '',
      budget: '',
      deadline: '',
      contact: '',
      status: '',
      createdAt: '',
      files: [],
      progress: [],
      reviewed: false
    },
    showProgressModal: false,
    progressTitle: '',
    progressContent: '',
    selectedRating: 0,
    reviewContent: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const taskId = options.id;
    this.loadTaskData(taskId);
  },

  /**
   * 加载任务数据
   */
  loadTaskData(taskId) {
    // 从本地存储获取任务列表
    const tasks = wx.getStorageSync('accountingTasks') || [];
    let task = tasks.find(t => t.id === taskId);

    // 如果没有找到任务，使用模拟数据
    if (!task) {
      task = {
        id: '1',
        title: '月度税务申报',
        description: '需要完成1月份的增值税和企业所得税申报，包括数据整理、报表填写和网上申报。',
        service: 'tax',
        budget: 'medium',
        deadline: '2026-02-15',
        contact: '13800138000',
        status: 'pending',
        createdAt: new Date().toISOString(),
        files: [
          {
            name: '2025年12月财务报表.xlsx',
            size: '2.5 MB',
            path: ''
          },
          {
            name: '增值税申报表模板.pdf',
            size: '1.2 MB',
            path: ''
          }
        ],
        progress: [
          {
            title: '开始处理',
            content: '已接收任务，正在准备申报资料。',
            date: '2026-02-01'
          }
        ]
      };
    }

    this.setData({
      task
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
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
   * 获取状态描述
   */
  getStatusDescription(status) {
    const descMap = {
      pending: '任务已发布，等待会计接单',
      processing: '会计正在处理任务',
      completed: '任务已成功完成',
      cancelled: '任务已取消'
    };
    return descMap[status] || '';
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
  },

  /**
   * 取消任务
   */
  cancelTask() {
    wx.showModal({
      title: '取消任务',
      content: '确定要取消这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          const tasks = wx.getStorageSync('accountingTasks') || [];
          const updatedTasks = tasks.map(task => {
            if (task.id === this.data.task.id) {
              return { ...task, status: 'cancelled' };
            }
            return task;
          });
          wx.setStorageSync('accountingTasks', updatedTasks);
          this.setData({
            task: { ...this.data.task, status: 'cancelled' }
          });
          wx.showToast({
            title: '任务已取消',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 完成任务
   */
  completeTask() {
    wx.showModal({
      title: '确认完成',
      content: '确定任务已完成吗？',
      success: (res) => {
        if (res.confirm) {
          const tasks = wx.getStorageSync('accountingTasks') || [];
          const updatedTasks = tasks.map(task => {
            if (task.id === this.data.task.id) {
              return { ...task, status: 'completed' };
            }
            return task;
          });
          wx.setStorageSync('accountingTasks', updatedTasks);
          this.setData({
            task: { ...this.data.task, status: 'completed' }
          });
          wx.showToast({
            title: '任务已完成',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 添加进展
   */
  addProgress() {
    this.setData({
      showProgressModal: true,
      progressTitle: '',
      progressContent: ''
    });
  },

  /**
   * 关闭添加进展模态框
   */
  closeProgressModal() {
    this.setData({
      showProgressModal: false
    });
  },

  /**
   * 输入进展标题
   */
  onProgressTitleInput(e) {
    this.setData({
      progressTitle: e.detail.value
    });
  },

  /**
   * 输入进展内容
   */
  onProgressContentInput(e) {
    this.setData({
      progressContent: e.detail.value
    });
  },

  /**
   * 提交进展
   */
  submitProgress() {
    if (!this.data.progressTitle || !this.data.progressContent) {
      wx.showToast({
        title: '请填写进展标题和内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const newProgress = {
      title: this.data.progressTitle,
      content: this.data.progressContent,
      date: new Date().toISOString().split('T')[0]
    };

    const tasks = wx.getStorageSync('accountingTasks') || [];
    const updatedTasks = tasks.map(task => {
      if (task.id === this.data.task.id) {
        const progress = task.progress || [];
        return { ...task, progress: [...progress, newProgress], status: 'processing' };
      }
      return task;
    });

    wx.setStorageSync('accountingTasks', updatedTasks);
    
    const task = this.data.task;
    const progress = task.progress || [];
    this.setData({
      task: { ...task, progress: [...progress, newProgress], status: 'processing' },
      showProgressModal: false
    });

    wx.showToast({
      title: '进展已添加',
      icon: 'success',
      duration: 2000
    });
  },

  /**
   * 选择评分
   */
  selectRating(e) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    this.setData({
      selectedRating: rating
    });
  },

  /**
   * 输入评价内容
   */
  onReviewContentInput(e) {
    this.setData({
      reviewContent: e.detail.value
    });
  },

  /**
   * 提交评价
   */
  submitReview() {
    if (!this.data.selectedRating || !this.data.reviewContent) {
      wx.showToast({
        title: '请填写评分和评价内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const newReview = {
      rating: this.data.selectedRating,
      content: this.data.reviewContent,
      date: new Date().toISOString().split('T')[0]
    };

    const tasks = wx.getStorageSync('accountingTasks') || [];
    const updatedTasks = tasks.map(task => {
      if (task.id === this.data.task.id) {
        return { ...task, review: newReview, reviewed: true };
      }
      return task;
    });

    wx.setStorageSync('accountingTasks', updatedTasks);
    
    this.setData({
      task: { ...this.data.task, review: newReview, reviewed: true }
    });

    wx.showToast({
      title: '评价已提交',
      icon: 'success',
      duration: 2000
    });
  }
});