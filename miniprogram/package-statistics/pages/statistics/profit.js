// pages/statistics/profit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 报表期间
    reportPeriod: '',
    reportType: 'month', // month or year
    // 模拟的利润表数据
    profitStatement: {
      revenue: 1500000,
      costOfGoodsSold: 850000,
      taxesAndSurcharges: 45000,
      sellingExpenses: 120000,
      managementExpenses: 95000,
      researchAndDevelopmentExpenses: 35000,
      financialExpenses: 25000,
      assetImpairmentLoss: 10000,
      otherIncome: 8000,
      investmentIncome: 32000,
      operatingProfit: 0,
      nonOperatingIncome: 15000,
      nonOperatingExpenses: 9000,
      totalProfit: 0,
      incomeTaxExpense: 65000,
      netProfit: 0
    },
    // 利润表项目列表（用于显示）
    profitItems: [
      {
        category: '营业收入',
        items: [
          { name: '营业收入', amount: 1500000, type: 'income' }
        ],
        total: 1500000,
        totalType: 'income'
      },
      {
        category: '营业成本',
        items: [
          { name: '营业成本', amount: 850000, type: 'expense' },
          { name: '税金及附加', amount: 45000, type: 'expense' },
          { name: '销售费用', amount: 120000, type: 'expense' },
          { name: '管理费用', amount: 95000, type: 'expense' },
          { name: '研发费用', amount: 35000, type: 'expense' },
          { name: '财务费用', amount: 25000, type: 'expense' },
          { name: '资产减值损失', amount: 10000, type: 'expense' }
        ],
        total: 1180000,
        totalType: 'expense'
      },
      {
        category: '其他收益',
        items: [
          { name: '其他收益', amount: 8000, type: 'income' },
          { name: '投资收益', amount: 32000, type: 'income' }
        ],
        total: 40000,
        totalType: 'income'
      },
      {
        category: '营业利润',
        items: [],
        total: 360000,
        totalType: 'profit'
      },
      {
        category: '营业外收支',
        items: [
          { name: '营业外收入', amount: 15000, type: 'income' },
          { name: '营业外支出', amount: 9000, type: 'expense' }
        ],
        total: 6000,
        totalType: 'income'
      },
      {
        category: '利润总额',
        items: [],
        total: 366000,
        totalType: 'profit'
      },
      {
        category: '所得税',
        items: [
          { name: '所得税费用', amount: 65000, type: 'expense' }
        ],
        total: 65000,
        totalType: 'expense'
      },
      {
        category: '净利润',
        items: [],
        total: 301000,
        totalType: 'netprofit'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initReportPeriod()
  },

  /**
   * 初始化报表期间
   */
  initReportPeriod() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    this.setData({
      reportPeriod: `${year}-${month}`
    })
  },

  /**
   * 切换报表类型（月度/年度）
   */
  switchReportType(e) {
    const reportType = e.currentTarget.dataset.type
    this.setData({
      reportType
    })
    // 这里可以根据报表类型加载不同的数据
  },

  /**
   * 期间选择器变化
   */
  onPeriodChange(e) {
    this.setData({
      reportPeriod: e.detail.value
    })
    // 这里可以根据选择的期间加载对应的报表数据
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