// pages/statistics/cashflow.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 报表期间
    reportPeriod: '',
    reportType: 'month', // month or year
    // 模拟的现金流量表数据
    cashflowStatement: {
      // 经营活动产生的现金流量
      operatingActivities: {
        inflows: [
          { name: '销售商品、提供劳务收到的现金', amount: 1450000 },
          { name: '收到的税费返还', amount: 25000 },
          { name: '收到其他与经营活动有关的现金', amount: 35000 }
        ],
        outflows: [
          { name: '购买商品、接受劳务支付的现金', amount: 780000 },
          { name: '支付给职工以及为职工支付的现金', amount: 195000 },
          { name: '支付的各项税费', amount: 115000 },
          { name: '支付其他与经营活动有关的现金', amount: 85000 }
        ],
        netCashFlow: 0
      },
      
      // 投资活动产生的现金流量
      investingActivities: {
        inflows: [
          { name: '收回投资收到的现金', amount: 120000 },
          { name: '取得投资收益收到的现金', amount: 28000 },
          { name: '处置固定资产、无形资产和其他长期资产收回的现金净额', amount: 45000 }
        ],
        outflows: [
          { name: '购建固定资产、无形资产和其他长期资产支付的现金', amount: 320000 },
          { name: '投资支付的现金', amount: 85000 }
        ],
        netCashFlow: 0
      },
      
      // 筹资活动产生的现金流量
      financingActivities: {
        inflows: [
          { name: '吸收投资收到的现金', amount: 500000 },
          { name: '取得借款收到的现金', amount: 200000 }
        ],
        outflows: [
          { name: '偿还债务支付的现金', amount: 180000 },
          { name: '分配股利、利润或偿付利息支付的现金', amount: 35000 }
        ],
        netCashFlow: 0
      },
      
      // 汇率变动对现金及现金等价物的影响
      effectOfExchangeRateChanges: 12000,
      
      // 现金及现金等价物净增加额
      netIncreaseInCashAndCashEquivalents: 0,
      
      // 期初现金及现金等价物余额
      beginningCashAndCashEquivalents: 350000,
      
      // 期末现金及现金等价物余额
      endingCashAndCashEquivalents: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initReportPeriod()
    this.calculateCashFlows()
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
   * 计算现金流量
   */
  calculateCashFlows() {
    const { cashflowStatement } = this.data
    
    // 计算经营活动现金流量净额
    let operatingInflows = 0
    cashflowStatement.operatingActivities.inflows.forEach(item => {
      operatingInflows += item.amount
    })
    
    let operatingOutflows = 0
    cashflowStatement.operatingActivities.outflows.forEach(item => {
      operatingOutflows += item.amount
    })
    
    cashflowStatement.operatingActivities.netCashFlow = operatingInflows - operatingOutflows
    
    // 计算投资活动现金流量净额
    let investingInflows = 0
    cashflowStatement.investingActivities.inflows.forEach(item => {
      investingInflows += item.amount
    })
    
    let investingOutflows = 0
    cashflowStatement.investingActivities.outflows.forEach(item => {
      investingOutflows += item.amount
    })
    
    cashflowStatement.investingActivities.netCashFlow = investingInflows - investingOutflows
    
    // 计算筹资活动现金流量净额
    let financingInflows = 0
    cashflowStatement.financingActivities.inflows.forEach(item => {
      financingInflows += item.amount
    })
    
    let financingOutflows = 0
    cashflowStatement.financingActivities.outflows.forEach(item => {
      financingOutflows += item.amount
    })
    
    cashflowStatement.financingActivities.netCashFlow = financingInflows - financingOutflows
    
    // 计算现金及现金等价物净增加额
    cashflowStatement.netIncreaseInCashAndCashEquivalents = 
      cashflowStatement.operatingActivities.netCashFlow + 
      cashflowStatement.investingActivities.netCashFlow + 
      cashflowStatement.financingActivities.netCashFlow + 
      cashflowStatement.effectOfExchangeRateChanges
    
    // 计算期末现金及现金等价物余额
    cashflowStatement.endingCashAndCashEquivalents = 
      cashflowStatement.beginningCashAndCashEquivalents + 
      cashflowStatement.netIncreaseInCashAndCashEquivalents
    
    this.setData({
      cashflowStatement
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