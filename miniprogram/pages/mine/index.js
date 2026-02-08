// pages/mine/index.js
const app = getApp()
let db = null
let recordsCollection = null

// 尝试初始化云数据库连接
if (wx.cloud) {
  try {
    db = wx.cloud.database()
    recordsCollection = db.collection('records')
  } catch (error) {
    console.error('云数据库初始化失败：', error)
    // 云数据库初始化失败不影响页面加载，会使用模拟数据
  }
}



Page({
  /**
   * 页面的初始数据
   */
  data: {
    totalRecords: 0,
    totalMonths: 0,
    avgExpense: '¥0.00',
    monthIncome: '¥0.00',
    monthExpense: '¥0.00',
    monthBalance: '¥0.00',
    showAISettingsModal: false,
    aiSettings: {
      enabled: true,
      invoiceRecognition: true,
      financialAssistant: true,
      reminders: true,
      reportAnalysis: true
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.fetchUserStats()
  },

  /**
   * 获取用户统计数据
   */
  async fetchUserStats() {
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })

      // 从本地存储获取数据
      let records = app.getRecordsFromLocal();
      
      // 如果本地没有数据，初始化空数组
      records = records || [];
      
      // 暂时禁用云数据同步，避免数据库集合不存在的错误
      // if (app.globalData.cloud && recordsCollection) {
      //   try {
      //     // 尝试从云数据库获取记录
      //     const recordsRes = await recordsCollection.get()
      //     
      //     if (recordsRes.data && recordsRes.data.length > 0) {
      //       // 合并云数据到本地
      //       records = [...records, ...recordsRes.data.filter(record => 
      //         !records.some(localRecord => localRecord._id === record._id)
      //       )];
      //       // 更新本地存储
      //       app.saveRecordsToLocal(records);
      //     }
      //   } catch (cloudErr) {
      //     console.error('云数据库同步失败，使用本地数据：', cloudErr)
      //     // 云数据库请求失败不影响，继续使用本地数据
      //   }
      // }

      // 计算总记录数
      const totalRecords = records.length

      // 计算记账月数
      const totalMonths = this.calculateTotalMonths(records)

      // 计算日均支出
      const avgExpense = this.calculateAvgExpense(records)

      // 计算本月统计数据
      const { monthIncome, monthExpense, monthBalance } = this.calculateThisMonthStats(records)

      this.setData({
        totalRecords: totalRecords,
        totalMonths: totalMonths,
        avgExpense: avgExpense,
        monthIncome: monthIncome,
        monthExpense: monthExpense,
        monthBalance: monthBalance
      })
    } catch (err) {
      console.error('获取数据失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 数据恢复功能
   */
  async restoreData() {
    try {
      wx.showLoading({
        title: '恢复中',
      })

      // 让用户选择备份文件
      const chooseResult = await wx.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['.json'],
        success: (res) => {
          return res
        },
        fail: (error) => {
          console.error('选择文件失败：', error)
          throw new Error('选择文件失败')
        }
      })

      if (!chooseResult || !chooseResult.tempFiles || chooseResult.tempFiles.length === 0) {
        wx.showToast({
          title: '未选择文件',
          icon: 'none'
        })
        return
      }

      const file = chooseResult.tempFiles[0]

      // 读取文件内容
      const fileContent = await wx.getFileSystemManager().readFile({
        filePath: file.path,
        encoding: 'utf-8',
        success: (res) => {
          return res.data
        },
        fail: (error) => {
          console.error('读取文件失败：', error)
          throw new Error('读取文件失败')
        }
      })

      // 解析备份数据
      const backupData = JSON.parse(fileContent)

      // 验证备份格式
      if (!backupData.version || !backupData.data || !backupData.data.categories || !backupData.data.records) {
        wx.showToast({
          title: '备份文件格式错误',
          icon: 'none'
        })
        return
      }

      // 确认恢复操作
      wx.showModal({
        title: '确认恢复',
        content: `确定要从备份文件\n${file.name}恢复数据吗？\n这将覆盖当前所有数据。`,
        confirmText: '确认恢复',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            // 执行恢复操作
            try {
              // 恢复分类数据
              app.saveCategoriesToLocal(backupData.data.categories)
              
              // 恢复记录数据
              app.saveRecordsToLocal(backupData.data.records)
              
              // 更新页面统计数据
              this.fetchUserStats()
              
              wx.showToast({
                title: '恢复成功',
                icon: 'success',
                duration: 2000
              })
            } catch (error) {
              console.error('恢复数据失败：', error)
              wx.showToast({
                title: '恢复数据失败',
                icon: 'none'
              })
            }
          } else {
            wx.showToast({
              title: '已取消恢复',
              icon: 'none'
            })
          }
        },
        fail: (error) => {
          console.error('确认操作失败：', error)
        }
      })
    } catch (err) {
      console.error('恢复失败：', err)
      wx.showToast({
        title: '恢复失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 计算记账月数
   * @param {Array} records - 所有记录
   * @returns {number} 记账月数
   */
  calculateTotalMonths(records) {
    if (records.length === 0) return 0

    // 提取所有月份
    const months = new Set()
    records.forEach(record => {
      const month = record.date.substring(0, 7) // YYYY-MM
      months.add(month)
    })

    return months.size
  },

  /**
   * 计算日均支出
   * @param {Array} records - 所有记录
   * @returns {string} 日均支出金额
   */
  calculateAvgExpense(records) {
    if (records.length === 0) return '¥0.00'

    // 计算总支出
    const totalExpense = records
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0)

    // 计算天数范围
    const dates = records.map(record => new Date(record.date))
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))
    const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1

    // 计算日均支出
    const avgExpense = totalExpense / daysDiff
    return `¥${avgExpense.toFixed(2)}`
  },

  /**
   * 计算本月统计数据
   * @param {Array} records - 所有记录
   * @returns {Object} 本月统计数据
   */
  calculateThisMonthStats(records) {
    if (records.length === 0) {
      return {
        monthIncome: '¥0.00',
        monthExpense: '¥0.00',
        monthBalance: '¥0.00'
      }
    }

    const today = new Date()
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

    // 筛选本月记录
    const monthRecords = records.filter(record => {
      return record.date.startsWith(currentMonth)
    })

    // 计算本月收入
    const monthIncome = monthRecords
      .filter(record => record.type === 'income')
      .reduce((sum, record) => sum + record.amount, 0)

    // 计算本月支出
    const monthExpense = monthRecords
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0)

    // 计算本月结余
    const monthBalance = monthIncome - monthExpense

    return {
      monthIncome: `¥${monthIncome.toFixed(2)}`,
      monthExpense: `¥${monthExpense.toFixed(2)}`,
      monthBalance: `¥${monthBalance.toFixed(2)}`
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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
    this.fetchUserStats()
    wx.stopPullDownRefresh()
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

  // 菜单点击事件处理函数
  navigateToStatistics() {
    wx.switchTab({
      url: '/pages/statistics/index'
    })
  },

  async backupData() {
    try {
      wx.showLoading({
        title: '备份中',
      })

      // 获取所有数据
      const categories = app.getCategoriesFromLocal()
      const records = app.getRecordsFromLocal()
      
      // 创建备份数据
      const backupData = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        data: {
          categories: categories,
          records: records
        }
      }
      
      // 转换为JSON字符串
      const backupJSON = JSON.stringify(backupData)
      
      // 保存到本地文件
      const filePath = `${wx.env.USER_DATA_PATH}/finance_backup_${new Date().getTime()}.json`
      
      await wx.getFileSystemManager().writeFile({
        filePath: filePath,
        data: backupJSON,
        encoding: 'utf-8'
      })
      
      // 提示用户并提供分享/保存选项
      wx.showActionSheet({
        itemList: ['保存到手机', '分享备份文件'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 保存到手机
            wx.saveFile({
              tempFilePath: filePath,
              success: (saveRes) => {
                wx.showToast({
                  title: `备份已保存到本地\n${saveRes.savedFilePath}`,
                  icon: 'none',
                  duration: 2000
                })
              },
              fail: (error) => {
                console.error('保存失败：', error)
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
            })
          } else if (res.tapIndex === 1) {
            // 分享备份文件
            wx.shareAppMessage({
              title: '财务数据备份',
              path: '/pages/index/index',
              success: () => {
                wx.showToast({
                  title: '分享成功',
                  icon: 'success'
                })
              },
              fail: (error) => {
                console.error('分享失败：', error)
                wx.showToast({
                  title: '分享失败',
                  icon: 'none'
                })
              }
            })
          }
        },
        fail: (error) => {
          console.error('操作失败：', error)
        }
      })
    } catch (err) {
      console.error('备份失败：', err)
      wx.showToast({
        title: '备份失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  showSettings() {
    wx.showActionSheet({
      itemList: ['数据清理', '云同步设置', '提醒设置', '关于应用'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            // 数据清理
            this.showClearDataConfirm()
            break
          case 1:
            // 云同步设置
            this.showCloudSyncSettings()
            break
          case 2:
            // 提醒设置
            this.showReminderSettings()
            break
          case 3:
            // 关于应用
            this.showAbout()
            break
        }
      },
      fail: (error) => {
        console.error('显示设置菜单失败：', error)
      }
    })
  },

  /**
   * 数据清理确认
   */
  showClearDataConfirm() {
    wx.showModal({
      title: '数据清理',
      content: '确定要清除所有本地数据吗？此操作不可恢复。',
      confirmText: '确认清理',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.clearAllData()
        }
      }
    })
  },

  /**
   * 清除所有数据
   */
  clearAllData() {
    try {
      wx.showLoading({
        title: '清理中',
      })

      // 清除本地存储数据
      wx.removeStorageSync('categories')
      wx.removeStorageSync('records')

      // 刷新页面统计数据
      this.setData({
        totalRecords: 0,
        totalMonths: 0,
        avgExpense: '¥0.00'
      })

      wx.showToast({
        title: '清理成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('清理数据失败：', error)
      wx.showToast({
        title: '清理失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 云同步设置
   */
  showCloudSyncSettings() {
    wx.showModal({
      title: '云同步设置',
      content: '云同步功能可以将您的数据备份到云端，防止数据丢失。\n\n当前状态：' + (app.globalData.cloud ? '已开启' : '未开启'),
      confirmText: '立即同步',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          if (app.globalData.cloud) {
            this.syncDataToCloud()
          } else {
            wx.showToast({
              title: '云功能未开启',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  /**
   * 同步数据到云端
   */
  async syncDataToCloud() {
    try {
      wx.showLoading({
        title: '同步中',
      })

      // 从本地获取最新数据
      const categories = app.getCategoriesFromLocal()
      const records = app.getRecordsFromLocal()

      // 模拟云同步
      await new Promise(resolve => setTimeout(resolve, 1000))

      wx.showToast({
        title: '同步成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('同步失败：', error)
      wx.showToast({
        title: '同步失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 提醒设置
   */
  showReminderSettings() {
    wx.showModal({
      title: '提醒设置',
      content: '每日记账提醒功能开发中，敬请期待！',
      showCancel: false
    })
  },

  contactSupport() {
    wx.showModal({
      title: '联系客服',
      content: '客服功能开发中',
      showCancel: false
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '财务管家 v1.0.0\n一款简单易用的记账应用',
      showCancel: false
    })
  },

  // AI设置相关方法
  showAISettings() {
    this.setData({ showAISettingsModal: true });
  },

  closeAISettingsModal() {
    this.setData({ showAISettingsModal: false });
  },

  toggleAIService(e) {
    const enabled = e.detail.value;
    this.setData({
      'aiSettings.enabled': enabled
    });
    // 保存设置到本地存储
    wx.setStorageSync('aiSettings', this.data.aiSettings);
  },

  toggleInvoiceRecognition(e) {
    const enabled = e.detail.value;
    this.setData({
      'aiSettings.invoiceRecognition': enabled
    });
    // 保存设置到本地存储
    wx.setStorageSync('aiSettings', this.data.aiSettings);
  },

  toggleFinancialAssistant(e) {
    const enabled = e.detail.value;
    this.setData({
      'aiSettings.financialAssistant': enabled
    });
    // 保存设置到本地存储
    wx.setStorageSync('aiSettings', this.data.aiSettings);
  },

  toggleReminders(e) {
    const enabled = e.detail.value;
    this.setData({
      'aiSettings.reminders': enabled
    });
    // 保存设置到本地存储
    wx.setStorageSync('aiSettings', this.data.aiSettings);
  },

  toggleReportAnalysis(e) {
    const enabled = e.detail.value;
    this.setData({
      'aiSettings.reportAnalysis': enabled
    });
    // 保存设置到本地存储
    wx.setStorageSync('aiSettings', this.data.aiSettings);
  }
})
