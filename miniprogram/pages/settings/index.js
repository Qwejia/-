// pages/settings/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {
      avatar: '👤',
      name: '财务管理员',
      role: '系统管理员'
    },
    // 语言选项
    languageOptions: [
      { value: 'zh-CN', name: '简体中文' },
      { value: 'en-US', name: 'English' }
    ],
    // 应用设置
    appSettings: {
      notifications: true,
      darkMode: false,
      language: 'zh-CN',
      languageIndex: 0
    },
    // 安全设置
    securitySettings: {
      twoFactorAuth: false,
      loginVerification: true,
      sessionTimeout: '30分钟',
      sessionTimeoutIndex: 1
    },
    // 关于信息
    aboutInfo: {
      version: '1.0.0',
      buildNumber: '1001',
      copyright: '© 2026 财务会计系统'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载本地存储的设置
    this.loadSettings()
  },
  
  /**
   * 加载本地存储的设置
   */
  loadSettings() {
    // 加载应用设置
    const notifications = wx.getStorageSync('notifications')
    const darkMode = wx.getStorageSync('darkMode')
    const language = wx.getStorageSync('language')
    
    // 加载安全设置
    const twoFactorAuth = wx.getStorageSync('twoFactorAuth')
    const loginVerification = wx.getStorageSync('loginVerification')
    const sessionTimeout = wx.getStorageSync('sessionTimeout')
    
    // 更新数据
    const appSettings = {
      notifications: notifications !== undefined ? notifications : this.data.appSettings.notifications,
      darkMode: darkMode !== undefined ? darkMode : this.data.appSettings.darkMode,
      language: language || this.data.appSettings.language,
      languageIndex: language === 'en-US' ? 1 : 0
    }
    
    // 会话超时选项
    const sessionTimeoutOptions = ['15分钟', '30分钟', '1小时', '2小时', '永不超时']
    const sessionTimeoutText = sessionTimeout || this.data.securitySettings.sessionTimeout
    const sessionTimeoutIndex = sessionTimeoutOptions.indexOf(sessionTimeoutText)
    
    const securitySettings = {
      twoFactorAuth: twoFactorAuth !== undefined ? twoFactorAuth : this.data.securitySettings.twoFactorAuth,
      loginVerification: loginVerification !== undefined ? loginVerification : this.data.securitySettings.loginVerification,
      sessionTimeout: sessionTimeoutText,
      sessionTimeoutIndex: sessionTimeoutIndex !== -1 ? sessionTimeoutIndex : this.data.securitySettings.sessionTimeoutIndex
    }
    
    this.setData({
      appSettings,
      securitySettings
    })
    
    // 应用深色模式
    this.applyDarkMode(appSettings.darkMode)
  },

  /**
   * 切换通知设置
   */
  toggleNotifications(e) {
    const notifications = e.detail.value
    this.setData({
      'appSettings.notifications': notifications
    })
    
    // 保存到本地存储
    wx.setStorageSync('notifications', notifications)
    
    wx.showToast({
      title: notifications ? '已开启通知提醒' : '已关闭通知提醒',
      icon: 'success'
    })
  },

  /**
   * 切换深色模式
   */
  toggleDarkMode(e) {
    const darkMode = e.detail.value
    this.setData({
      'appSettings.darkMode': darkMode
    })
    
    // 应用深色模式
    this.applyDarkMode(darkMode)
    
    // 保存到本地存储
    wx.setStorageSync('darkMode', darkMode)
    
    wx.showToast({
      title: darkMode ? '已切换到深色模式' : '已切换到浅色模式',
      icon: 'success'
    })
  },
  
  /**
   * 应用深色模式
   */
  applyDarkMode(darkMode) {
    // 更新根元素的class
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const root = currentPage.selectComponent('#app-root')
    
    if (root) {
      if (darkMode) {
        root.setStyleClass('dark-mode')
      } else {
        root.removeStyleClass('dark-mode')
      }
    }
    
    // 更新导航栏颜色
    if (darkMode) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1f2937'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1677ff'
      })
    }
  },

  /**
   * 切换双重认证
   */
  toggleTwoFactorAuth(e) {
    const twoFactorAuth = e.detail.value
    this.setData({
      'securitySettings.twoFactorAuth': twoFactorAuth
    })
    
    // 保存到本地存储
    wx.setStorageSync('twoFactorAuth', twoFactorAuth)
    
    wx.showToast({
      title: twoFactorAuth ? '已开启双重认证' : '已关闭双重认证',
      icon: 'success'
    })
  },

  /**
   * 切换登录验证
   */
  toggleLoginVerification(e) {
    const loginVerification = e.detail.value
    this.setData({
      'securitySettings.loginVerification': loginVerification
    })
    
    // 保存到本地存储
    wx.setStorageSync('loginVerification', loginVerification)
    
    wx.showToast({
      title: loginVerification ? '已开启登录验证' : '已关闭登录验证',
      icon: 'success'
    })
  },

  /**
   * 选择语言
   */
  selectLanguage(e) {
    const index = e.detail.value
    const language = this.data.languageOptions[index].value
    this.setData({
      'appSettings.language': language,
      'appSettings.languageIndex': index
    })
    
    // 保存到本地存储
    wx.setStorageSync('language', language)
    
    wx.showToast({
      title: `已切换为${this.data.languageOptions[index].name}`,
      icon: 'success'
    })
  },

  /**
   * 选择会话超时时间
   */
  selectSessionTimeout(e) {
    const sessionTimeoutIndex = e.detail.value
    const sessionTimeoutText = ['15分钟', '30分钟', '1小时', '2小时', '永不超时'][sessionTimeoutIndex]
    
    this.setData({
      'securitySettings.sessionTimeout': sessionTimeoutText,
      'securitySettings.sessionTimeoutIndex': sessionTimeoutIndex
    })
    
    // 保存到本地存储
    wx.setStorageSync('sessionTimeout', sessionTimeoutText)
    
    wx.showToast({
      title: `会话超时已设置为${sessionTimeoutText}`,
      icon: 'success'
    })
  },

  /**
   * 修改密码
   */
  changePassword() {
    // 模拟密码修改流程
    wx.showModal({
      title: '修改密码',
      content: '确认要修改密码吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以添加实际的密码修改逻辑
          wx.showToast({
            title: '密码修改功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  /**
   * 清除缓存
   */
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 显示加载提示
          wx.showLoading({
            title: '正在清除缓存...',
            mask: true
          })
          
          // 模拟清除缓存的异步操作
          setTimeout(() => {
            // 实际项目中可以调用 wx.clearStorageSync() 或其他清除缓存的方法
            wx.clearStorageSync()
            
            // 隐藏加载提示
            wx.hideLoading()
            
            // 显示成功提示
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            })
          }, 1000)
        }
      }
    })
  },

  /**
   * 关于我们
   */
  aboutUs() {
    wx.showModal({
      title: '关于财务会计系统',
      content: `版本：${this.data.aboutInfo.version}\n构建：${this.data.aboutInfo.buildNumber}\n\n这是一个功能强大的财务会计系统，帮助您轻松管理财务数据。\n\n${this.data.aboutInfo.copyright}`,
      showCancel: false
    })
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 显示加载提示
          wx.showLoading({
            title: '正在退出登录...',
            mask: true
          })
          
          // 模拟退出登录的异步操作
          setTimeout(() => {
            // 实际项目中可以添加清除用户信息、token等逻辑
            wx.clearStorageSync()
            
            // 隐藏加载提示
            wx.hideLoading()
            
            // 显示成功提示
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            
            // 跳转到登录页面或首页
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/index/index'
              })
            }, 1000)
          }, 1500)
        }
      }
    })
  }
})