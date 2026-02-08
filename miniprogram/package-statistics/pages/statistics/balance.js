// pages/statistics/balance.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 报表日期
    reportDate: '',
    // 模拟的资产负债表数据
    balanceSheet: {
      assets: {
        currentAssets: [
          { name: '货币资金', amount: 150000 },
          { name: '应收账款', amount: 85000 },
          { name: '存货', amount: 220000 },
          { name: '其他流动资产', amount: 35000 }
        ],
        nonCurrentAssets: [
          { name: '固定资产', amount: 650000 },
          { name: '无形资产', amount: 120000 },
          { name: '长期股权投资', amount: 250000 },
          { name: '其他非流动资产', amount: 80000 }
        ]
      },
      liabilities: {
        currentLiabilities: [
          { name: '短期借款', amount: 120000 },
          { name: '应付账款', amount: 75000 },
          { name: '应付职工薪酬', amount: 45000 },
          { name: '其他流动负债', amount: 20000 }
        ],
        nonCurrentLiabilities: [
          { name: '长期借款', amount: 350000 },
          { name: '应付债券', amount: 180000 },
          { name: '其他非流动负债', amount: 50000 }
        ]
      },
      equity: [
        { name: '实收资本', amount: 500000 },
        { name: '资本公积', amount: 120000 },
        { name: '盈余公积', amount: 85000 },
        { name: '未分配利润', amount: 210000 }
      ]
    },
    // 计算的总计
    totals: {
      currentAssets: 0,
      nonCurrentAssets: 0,
      totalAssets: 0,
      currentLiabilities: 0,
      nonCurrentLiabilities: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalLiabilitiesAndEquity: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initReportDate()
    this.calculateTotals()
  },

  /**
   * 初始化报表日期
   */
  initReportDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    this.setData({
      reportDate: `${year}-${month}-${day}`
    })
  },

  /**
   * 计算资产负债表总计
   */
  calculateTotals() {
    const { balanceSheet } = this.data
    const totals = {
      currentAssets: 0,
      nonCurrentAssets: 0,
      totalAssets: 0,
      currentLiabilities: 0,
      nonCurrentLiabilities: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalLiabilitiesAndEquity: 0
    }

    // 计算流动资产总计
    balanceSheet.assets.currentAssets.forEach(item => {
      totals.currentAssets += item.amount
    })

    // 计算非流动资产总计
    balanceSheet.assets.nonCurrentAssets.forEach(item => {
      totals.nonCurrentAssets += item.amount
    })

    // 计算资产总计
    totals.totalAssets = totals.currentAssets + totals.nonCurrentAssets

    // 计算流动负债总计
    balanceSheet.liabilities.currentLiabilities.forEach(item => {
      totals.currentLiabilities += item.amount
    })

    // 计算非流动负债总计
    balanceSheet.liabilities.nonCurrentLiabilities.forEach(item => {
      totals.nonCurrentLiabilities += item.amount
    })

    // 计算负债总计
    totals.totalLiabilities = totals.currentLiabilities + totals.nonCurrentLiabilities

    // 计算所有者权益总计
    balanceSheet.equity.forEach(item => {
      totals.totalEquity += item.amount
    })

    // 计算负债和所有者权益总计
    totals.totalLiabilitiesAndEquity = totals.totalLiabilities + totals.totalEquity

    this.setData({ totals })
  },

  /**
   * 日期选择器变化
   */
  onDateChange(e) {
    this.setData({
      reportDate: e.detail.value
    })
    // 这里可以根据选择的日期加载对应的报表数据
  },

  /**
   * 导出报表
   */
  exportReport() {
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    })
  }
})