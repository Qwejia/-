// pages/finance/data-connection.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 连接状态
    isConnected: false,
    connectionDescription: '未连接用友U8系统，请先连接后进行数据同步操作',
    
    // 用友U8连接信息
    serverUrl: '',
    port: '',
    accountId: '',
    username: '',
    password: '',
    
    // 同步状态
    syncStatus: {
      basicData: '未同步',
      businessData: '未同步',
      financeData: '未同步',
      reportData: '未同步'
    },
    lastSyncTime: '',
    
    // 同步设置
    autoSync: false,
    syncFrequencyOptions: ['每天', '每周', '每月', '手动'],
    syncFrequencyIndex: 3,
    
    // 模态框状态
    showConnectModal: false,
    showSyncModal: false,
    
    // 同步进度
    syncTask: '',
    syncProgress: 0,
    syncMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查本地存储的连接信息
    this.checkSavedConnection();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 刷新连接状态
    if (this.data.isConnected) {
      this.checkConnectionStatus();
    }
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 显示帮助信息
   */
  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '用友U8数据对接工具可以帮助您实现与企业ERP系统的数据同步。\n\n1. 连接设置：输入用友U8服务器信息进行连接\n2. 基础数据同步：同步客户、供应商、存货等基础档案\n3. 业务数据同步：同步销售订单、采购订单、出入库单等\n4. 财务数据同步：同步凭证、发票、收付款单等\n5. 报表数据同步：同步资产负债表、利润表、现金流量表等',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 检查本地存储的连接信息
   */
  checkSavedConnection() {
    const savedConnection = wx.getStorageSync('u8Connection');
    if (savedConnection && savedConnection.isConnected) {
      this.setData({
        isConnected: true,
        connectionDescription: `已连接到 ${savedConnection.serverUrl} 的用友U8系统`,
        serverUrl: savedConnection.serverUrl,
        port: savedConnection.port,
        accountId: savedConnection.accountId,
        username: savedConnection.username,
        lastSyncTime: savedConnection.lastSyncTime || ''
      });
    }
  },

  /**
   * 显示连接用友U8模态框
   */
  showConnectModal() {
    this.setData({ showConnectModal: true });
  },

  /**
   * 关闭连接用友U8模态框
   */
  closeConnectModal() {
    this.setData({ showConnectModal: false });
  },

  /**
   * 绑定服务器地址输入
   */
  bindServerInput(e) {
    this.setData({ serverUrl: e.detail.value });
  },

  /**
   * 绑定端口号输入
   */
  bindPortInput(e) {
    this.setData({ port: e.detail.value });
  },

  /**
   * 绑定账套号输入
   */
  bindAccountInput(e) {
    this.setData({ accountId: e.detail.value });
  },

  /**
   * 绑定用户名输入
   */
  bindUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  /**
   * 绑定密码输入
   */
  bindPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  /**
   * 连接用友U8
   */
  connectU8() {
    const { serverUrl, port, accountId, username, password } = this.data;
    
    if (!serverUrl || !accountId || !username || !password) {
      wx.showToast({
        title: '请输入完整的连接信息',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '连接中...',
      mask: true
    });
    
    // 模拟连接用友U8
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '连接成功',
        icon: 'success'
      });
      
      // 保存连接信息
      const connectionInfo = {
        isConnected: true,
        serverUrl,
        port,
        accountId,
        username,
        lastSyncTime: ''
      };
      wx.setStorageSync('u8Connection', connectionInfo);
      
      // 更新连接状态
      this.setData({
        isConnected: true,
        connectionDescription: `已连接到 ${serverUrl} 的用友U8系统`,
        showConnectModal: false
      });
    }, 2000);
  },

  /**
   * 断开用友U8连接
   */
  disconnectU8() {
    wx.showModal({
      title: '断开连接',
      content: '确定要断开与用友U8的连接吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除连接信息
          wx.removeStorageSync('u8Connection');
          
          // 更新连接状态
          this.setData({
            isConnected: false,
            connectionDescription: '未连接用友U8系统，请先连接后进行数据同步操作',
            syncStatus: {
              basicData: '未同步',
              businessData: '未同步',
              financeData: '未同步',
              reportData: '未同步'
            },
            lastSyncTime: ''
          });
          
          wx.showToast({
            title: '已断开连接',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 检查连接状态
   */
  checkConnectionStatus() {
    wx.showLoading({
      title: '检查连接中...',
      mask: true
    });
    
    // 模拟检查连接状态
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '连接正常',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 显示同步模态框
   */
  showSyncModal(task) {
    this.setData({
      showSyncModal: true,
      syncTask: task,
      syncProgress: 0,
      syncMessage: '准备同步数据...'
    });
  },

  /**
   * 关闭同步模态框
   */
  closeSyncModal() {
    this.setData({ showSyncModal: false });
  },

  /**
   * 更新同步进度
   */
  updateSyncProgress(progress, message) {
    this.setData({
      syncProgress: progress,
      syncMessage: message
    });
  },

  /**
   * 同步基础数据
   */
  syncBasicData() {
    this.showSyncModal('同步基础数据');
    
    // 模拟同步过程
    let progress = 0;
    const syncSteps = [
      '开始同步客户档案',
      '同步供应商档案',
      '同步存货档案',
      '同步部门档案',
      '同步人员档案',
      '同步完成'
    ];
    
    const syncInterval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        this.updateSyncProgress(progress, syncSteps[Math.min(Math.floor(progress / 20), syncSteps.length - 1)]);
      } else {
        clearInterval(syncInterval);
        setTimeout(() => {
          this.closeSyncModal();
          wx.showToast({
            title: '基础数据同步成功',
            icon: 'success'
          });
          
          // 更新同步状态
          const now = new Date().toLocaleString();
          this.setData({
            syncStatus: {
              ...this.data.syncStatus,
              basicData: '已同步',
            },
            lastSyncTime: now
          });
          
          // 更新本地存储
          const savedConnection = wx.getStorageSync('u8Connection');
          if (savedConnection) {
            savedConnection.lastSyncTime = now;
            wx.setStorageSync('u8Connection', savedConnection);
          }
        }, 500);
      }
    }, 500);
  },

  /**
   * 同步业务数据
   */
  syncBusinessData() {
    this.showSyncModal('同步业务数据');
    
    // 模拟同步过程
    let progress = 0;
    const syncSteps = [
      '开始同步销售订单',
      '同步采购订单',
      '同步出入库单',
      '同步生产订单',
      '同步委外订单',
      '同步完成'
    ];
    
    const syncInterval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        this.updateSyncProgress(progress, syncSteps[Math.min(Math.floor(progress / 20), syncSteps.length - 1)]);
      } else {
        clearInterval(syncInterval);
        setTimeout(() => {
          this.closeSyncModal();
          wx.showToast({
            title: '业务数据同步成功',
            icon: 'success'
          });
          
          // 更新同步状态
          const now = new Date().toLocaleString();
          this.setData({
            syncStatus: {
              ...this.data.syncStatus,
              businessData: '已同步',
            },
            lastSyncTime: now
          });
          
          // 更新本地存储
          const savedConnection = wx.getStorageSync('u8Connection');
          if (savedConnection) {
            savedConnection.lastSyncTime = now;
            wx.setStorageSync('u8Connection', savedConnection);
          }
        }, 500);
      }
    }, 500);
  },

  /**
   * 同步财务数据
   */
  syncFinanceData() {
    this.showSyncModal('同步财务数据');
    
    // 模拟同步过程
    let progress = 0;
    const syncSteps = [
      '开始同步凭证',
      '同步发票',
      '同步收付款单',
      '同步银行对账',
      '同步费用报销',
      '同步完成'
    ];
    
    const syncInterval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        this.updateSyncProgress(progress, syncSteps[Math.min(Math.floor(progress / 20), syncSteps.length - 1)]);
      } else {
        clearInterval(syncInterval);
        setTimeout(() => {
          this.closeSyncModal();
          wx.showToast({
            title: '财务数据同步成功',
            icon: 'success'
          });
          
          // 更新同步状态
          const now = new Date().toLocaleString();
          this.setData({
            syncStatus: {
              ...this.data.syncStatus,
              financeData: '已同步',
            },
            lastSyncTime: now
          });
          
          // 更新本地存储
          const savedConnection = wx.getStorageSync('u8Connection');
          if (savedConnection) {
            savedConnection.lastSyncTime = now;
            wx.setStorageSync('u8Connection', savedConnection);
          }
        }, 500);
      }
    }, 500);
  },

  /**
   * 同步报表数据
   */
  syncReportData() {
    this.showSyncModal('同步报表数据');
    
    // 模拟同步过程
    let progress = 0;
    const syncSteps = [
      '开始同步资产负债表',
      '同步利润表',
      '同步现金流量表',
      '同步所有者权益变动表',
      '同步部门收支表',
      '同步完成'
    ];
    
    const syncInterval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        this.updateSyncProgress(progress, syncSteps[Math.min(Math.floor(progress / 20), syncSteps.length - 1)]);
      } else {
        clearInterval(syncInterval);
        setTimeout(() => {
          this.closeSyncModal();
          wx.showToast({
            title: '报表数据同步成功',
            icon: 'success'
          });
          
          // 更新同步状态
          const now = new Date().toLocaleString();
          this.setData({
            syncStatus: {
              ...this.data.syncStatus,
              reportData: '已同步',
            },
            lastSyncTime: now
          });
          
          // 更新本地存储
          const savedConnection = wx.getStorageSync('u8Connection');
          if (savedConnection) {
            savedConnection.lastSyncTime = now;
            wx.setStorageSync('u8Connection', savedConnection);
          }
        }, 500);
      }
    }, 500);
  },

  /**
   * 切换自动同步
   */
  toggleAutoSync(e) {
    this.setData({ autoSync: e.detail.value });
    wx.showToast({
      title: e.detail.value ? '已开启自动同步' : '已关闭自动同步',
      icon: 'success'
    });
  },

  /**
   * 改变同步频率
   */
  changeSyncFrequency(e) {
    this.setData({ syncFrequencyIndex: e.detail.value });
  },

  /**
   * 显示数据映射设置
   */
  showMappingSettings() {
    wx.showModal({
      title: '数据映射配置',
      content: '数据映射配置功能正在开发中，敬请期待！',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 阻止事件冒泡
   */
  catchTap(e) {
    // 阻止事件冒泡，避免点击模态框内容时关闭模态框
  }
})