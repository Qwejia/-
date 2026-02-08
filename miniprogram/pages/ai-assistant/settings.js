Page({
  data: {
    currentTheme: 'light',
    notificationEnabled: true,
    voiceNotificationEnabled: true
  },

  onLoad(options) {
    this.loadSettings();
  },

  onShow() {
    this.loadSettings();
  },

  loadSettings() {
    try {
      const currentTheme = wx.getStorageSync('aiAssistantTheme') || 'light';
      const notificationEnabled = wx.getStorageSync('notificationEnabled') !== false;
      const voiceNotificationEnabled = wx.getStorageSync('voiceNotificationEnabled') !== false;
      
      this.setData({
        currentTheme,
        notificationEnabled,
        voiceNotificationEnabled
      });
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  },

  saveSettings() {
    try {
      wx.setStorageSync('aiAssistantTheme', this.data.currentTheme);
      wx.setStorageSync('notificationEnabled', this.data.notificationEnabled);
      wx.setStorageSync('voiceNotificationEnabled', this.data.voiceNotificationEnabled);
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  },

  switchTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    this.setData({ currentTheme: theme });
    this.saveSettings();
    
    wx.showToast({
      title: `已切换到${this.getThemeName(theme)}`,
      icon: 'success'
    });
  },

  getThemeName(theme) {
    const themeNames = {
      light: '浅色主题',
      dark: '深色主题',
      system: '跟随系统主题'
    };
    return themeNames[theme] || '浅色主题';
  },

  toggleNotification(e) {
    const enabled = e.detail.value;
    this.setData({ notificationEnabled: enabled });
    this.saveSettings();
  },

  toggleVoiceNotification(e) {
    const enabled = e.detail.value;
    this.setData({ voiceNotificationEnabled: enabled });
    this.saveSettings();
  },

  clearChatHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有聊天历史吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('aiChatHistory');
            wx.showToast({
              title: '聊天历史已清空',
              icon: 'success'
            });
          } catch (error) {
            console.error('清空聊天历史失败:', error);
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  clearRecentSearches() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空最近搜索记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('aiRecentSearches');
            wx.showToast({
              title: '最近搜索已清空',
              icon: 'success'
            });
          } catch (error) {
            console.error('清空最近搜索失败:', error);
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  clearVoiceHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空语音输入历史吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('voiceInputHistory');
            wx.showToast({
              title: '语音历史已清空',
              icon: 'success'
            });
          } catch (error) {
            console.error('清空语音历史失败:', error);
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: 'AI财务助手尊重并保护用户隐私。我们不会收集、存储或共享您的个人信息。所有数据均存储在本地，仅用于提供更好的服务体验。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  showTermsOfService() {
    wx.showModal({
      title: '服务条款',
      content: '使用AI财务助手即表示您同意我们的服务条款。我们致力于提供准确、专业的财务服务，但不对任何使用结果负责。请谨慎使用本服务提供的建议。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});