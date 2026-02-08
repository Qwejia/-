// pages/shared-accounting/post-task.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedService: '',
    taskTitle: '',
    taskDescription: '',
    selectedBudget: '',
    deadlineDate: '',
    minDate: '',
    contactPhone: '',
    attachedFiles: [],
    canSubmit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 设置默认日期
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;
    
    // 设置最小日期为今天
    this.setData({
      deadlineDate: defaultDate,
      minDate: defaultDate
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 选择服务类型
   */
  selectService(e) {
    const service = e.currentTarget.dataset.service;
    this.setData({
      selectedService: service
    });
    this.checkSubmitStatus();
  },

  /**
   * 输入任务标题
   */
  onTitleInput(e) {
    this.setData({
      taskTitle: e.detail.value
    });
    this.checkSubmitStatus();
  },

  /**
   * 输入任务描述
   */
  onDescriptionInput(e) {
    this.setData({
      taskDescription: e.detail.value
    });
    this.checkSubmitStatus();
  },

  /**
   * 选择预算范围
   */
  selectBudget(e) {
    const budget = e.currentTarget.dataset.budget;
    this.setData({
      selectedBudget: budget
    });
    this.checkSubmitStatus();
  },

  /**
   * 选择截止日期
   */
  onDeadlineChange(e) {
    this.setData({
      deadlineDate: e.detail.value
    });
    this.checkSubmitStatus();
  },

  /**
   * 输入联系电话
   */
  onPhoneInput(e) {
    this.setData({
      contactPhone: e.detail.value
    });
    this.checkSubmitStatus();
  },

  /**
   * 选择文件
   */
  chooseFile() {
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        const tempFilePaths = res.tempFiles;
        const files = tempFilePaths.map(file => ({
          name: file.name,
          size: this.formatFileSize(file.size),
          path: file.path
        }));
        
        this.setData({
          attachedFiles: [...this.data.attachedFiles, ...files]
        });
      }
    });
  },

  /**
   * 删除文件
   */
  removeFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = [...this.data.attachedFiles];
    files.splice(index, 1);
    this.setData({
      attachedFiles: files
    });
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 检查是否可以提交
   */
  checkSubmitStatus() {
    const { selectedService, taskTitle, taskDescription, selectedBudget, deadlineDate, contactPhone } = this.data;
    const canSubmit = selectedService && taskTitle && taskDescription && selectedBudget && deadlineDate && contactPhone;
    this.setData({
      canSubmit
    });
  },

  /**
   * 提交任务
   */
  submitTask() {
    if (!this.data.canSubmit) return;
    
    // 模拟提交任务
    wx.showLoading({
      title: '发布中...',
      mask: true
    });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 保存任务到本地存储
      const task = {
        id: Date.now().toString(),
        service: this.data.selectedService,
        title: this.data.taskTitle,
        description: this.data.taskDescription,
        budget: this.data.selectedBudget,
        deadline: this.data.deadlineDate,
        contact: this.data.contactPhone,
        files: this.data.attachedFiles,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // 获取现有任务列表
      const existingTasks = wx.getStorageSync('accountingTasks') || [];
      existingTasks.push(task);
      wx.setStorageSync('accountingTasks', existingTasks);
      
      wx.showToast({
        title: '任务发布成功',
        icon: 'success',
        duration: 2000
      });
      
      // 跳转到任务列表页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/shared-accounting/task-list'
        });
      }, 1500);
    }, 1500);
  }
});