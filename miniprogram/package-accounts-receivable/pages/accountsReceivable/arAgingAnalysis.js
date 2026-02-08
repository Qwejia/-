// pages/accountsReceivable/arAgingAnalysis.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    agingData: [],
    customers: [],
    selectedCustomer: 0,
    selectedCustomerName: '全部客户',
    agingPeriods: [
      { name: '0-30天', min: 0, max: 30 },
      { name: '31-60天', min: 31, max: 60 },
      { name: '61-90天', min: 61, max: 90 },
      { name: '91-180天', min: 91, max: 180 },
      { name: '180天以上', min: 181, max: Infinity }
    ],
    asOfDate: new Date().toISOString().split('T')[0],
    totalAging: {
      '0-30天': 0,
      '31-60天': 0,
      '61-90天': 0,
      '91-180天': 0,
      '180天以上': 0,
      total: 0
    },
    chartTypes: ['柱状图', '饼图'],
    chartTypeIndex: 0,
    loading: false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadCustomers();
    this.calculateAging();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.calculateAging();
  },
  
  // 加载客户列表
  loadCustomers() {
    const app = getApp();
    const customers = app.getDataFromLocal('customers');
    // 添加"全部客户"选项
    const customerOptions = [{ _id: 'all', name: '全部客户' }, ...customers];
    this.setData({ 
      customers: customerOptions,
      selectedCustomer: 0 // 使用索引而不是字符串
    });
  },
  
  // 计算账龄
  calculateAging() {
    this.setData({ loading: true });
    
    try {
      const app = getApp();
      const invoices = app.getDataFromLocal('arInvoices') || [];
      const asOfDate = this.data.asOfDate;
      const selectedCustomerIndex = this.data.selectedCustomer;
      const selectedCustomerOption = this.data.customers[selectedCustomerIndex];
      const selectedCustomerId = selectedCustomerOption ? selectedCustomerOption._id : 'all';
      
      // 只计算未核销或部分核销的发票
      const outstandingInvoices = invoices.filter(invoice => 
        invoice.status === 'approved' || invoice.status === 'partiallyWrittenOff'
      );
      
      // 按客户过滤
      const filteredInvoices = selectedCustomerId === 'all' 
        ? outstandingInvoices 
        : outstandingInvoices.filter(invoice => invoice.customerId === selectedCustomerId);
      
      // 按客户分组
      const customerGroups = this.groupInvoicesByCustomer(filteredInvoices);
      
      // 计算每个客户的账龄
      const agingData = [];
      const totalAging = {
        '0-30天': 0,
        '31-60天': 0,
        '61-90天': 0,
        '91-180天': 0,
        '180天以上': 0,
        total: 0
      };
      
      for (const customerId in customerGroups) {
        const customerInvoices = customerGroups[customerId];
        const customer = this.data.customers.find(c => c._id === customerId) || 
          { name: '未知客户' };
        
        const customerAging = this.calculateCustomerAging(customerInvoices, asOfDate);
        agingData.push({
          customerId,
          customerName: customer.name,
          ...customerAging
        });
        
        // 累加总账龄
        this.updateTotalAging(totalAging, customerAging);
      }
      
      this.setData({
        agingData,
        totalAging,
        loading: false
      });
    } catch (error) {
      console.error('计算账龄失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '计算账龄失败',
        icon: 'none'
      });
    }
  },
  
  // 按客户分组发票
  groupInvoicesByCustomer(invoices) {
    return invoices.reduce((groups, invoice) => {
      if (!groups[invoice.customerId]) {
        groups[invoice.customerId] = [];
      }
      groups[invoice.customerId].push(invoice);
      return groups;
    }, {});
  },
  
  // 计算单个客户的账龄
  calculateCustomerAging(invoices, asOfDate) {
    const aging = {
      '0-30天': 0,
      '31-60天': 0,
      '61-90天': 0,
      '91-180天': 0,
      '180天以上': 0,
      total: 0
    };
    
    const asOfDateTime = new Date(asOfDate).getTime();
    
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.invoiceDate).getTime();
      const daysOutstanding = Math.ceil((asOfDateTime - invoiceDate) / (1000 * 60 * 60 * 24));
      
      let agingPeriod = '';
      if (daysOutstanding <= 30) agingPeriod = '0-30天';
      else if (daysOutstanding <= 60) agingPeriod = '31-60天';
      else if (daysOutstanding <= 90) agingPeriod = '61-90天';
      else if (daysOutstanding <= 180) agingPeriod = '91-180天';
      else agingPeriod = '180天以上';
      
      aging[agingPeriod] += invoice.balance;
      aging.total += invoice.balance;
    });
    
    return aging;
  },
  
  // 更新总账龄
  updateTotalAging(totalAging, customerAging) {
    for (const period in customerAging) {
      if (totalAging.hasOwnProperty(period)) {
        totalAging[period] += customerAging[period];
      }
    }
  },
  
  // 客户选择变化
  onCustomerChange(e) {
    const selectedCustomer = parseInt(e.detail.value);
    this.setData({
      selectedCustomer: selectedCustomer
    });
    this.calculateAging();
  },
  
  // 截止日期变化
  onAsOfDateChange(e) {
    this.setData({
      asOfDate: e.detail.value
    });
    this.calculateAging();
  },
  
  // 导出账龄分析
  exportAging() {
    const { agingData, totalAging, asOfDate, selectedCustomer, customers } = this.data;
    
    // 构建导出数据
    const exportData = {
      title: '应收账款账龄分析表',
      asOfDate: asOfDate,
      customer: customers[selectedCustomer] ? customers[selectedCustomer].name : '全部客户',
      totalAging: totalAging,
      details: agingData,
      exportTime: new Date().toLocaleString()
    };
    
    // 转换为CSV格式
    let csvContent = '应收账款账龄分析表\n';
    csvContent += `截止日期,${asOfDate}\n`;
    csvContent += `客户,${customers[selectedCustomer] ? customers[selectedCustomer].name : '全部客户'}\n`;
    csvContent += `导出时间,${new Date().toLocaleString()}\n\n`;
    
    // 汇总数据
    csvContent += '账龄汇总\n';
    csvContent += '账龄区间,金额\n';
    csvContent += `0-30天,${totalAging['0-30天'] ? totalAging['0-30天'].toFixed(2) : '0.00'}\n`;
    csvContent += `31-60天,${totalAging['31-60天'] ? totalAging['31-60天'].toFixed(2) : '0.00'}\n`;
    csvContent += `61-90天,${totalAging['61-90天'] ? totalAging['61-90天'].toFixed(2) : '0.00'}\n`;
    csvContent += `91-180天,${totalAging['91-180天'] ? totalAging['91-180天'].toFixed(2) : '0.00'}\n`;
    csvContent += `180天以上,${totalAging['180天以上'] ? totalAging['180天以上'].toFixed(2) : '0.00'}\n`;
    csvContent += `合计,${totalAging.total ? totalAging.total.toFixed(2) : '0.00'}\n\n`;
    
    // 客户明细
    csvContent += '客户账龄明细\n';
    csvContent += '客户名称,0-30天,31-60天,61-90天,91-180天,180天以上,合计\n';
    
    agingData.forEach(item => {
      csvContent += `${item.customerName},`;
      csvContent += `${item['0-30天'] ? item['0-30天'].toFixed(2) : '0.00'},`;
      csvContent += `${item['31-60天'] ? item['31-60天'].toFixed(2) : '0.00'},`;
      csvContent += `${item['61-90天'] ? item['61-90天'].toFixed(2) : '0.00'},`;
      csvContent += `${item['91-180天'] ? item['91-180天'].toFixed(2) : '0.00'},`;
      csvContent += `${item['180天以上'] ? item['180天以上'].toFixed(2) : '0.00'},`;
      csvContent += `${item.total ? item.total.toFixed(2) : '0.00'}\n`;
    });
    
    // 保存到本地存储
    try {
      wx.setStorageSync('arAgingExport', csvContent);
      
      wx.showModal({
        title: '导出成功',
        content: '账龄分析数据已导出，是否保存到本地？',
        confirmText: '保存',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 在实际项目中，这里可以调用文件保存API
            wx.showToast({
              title: '数据已保存',
              icon: 'success'
            });
          }
        }
      });
    } catch (error) {
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  },
  
  // 计算图表条形宽度
  getBarWidth(periodName, total) {
    if (!total || total === 0) return 0;
    if (!this.data.totalAging || !this.data.totalAging[periodName]) return 5;
    const amount = this.data.totalAging[periodName];
    const percentage = (amount / total) * 100;
    return Math.max(percentage, 5); // 最小宽度5%
  },
  
  // 图表类型切换
  onChartTypeChange(e) {
    const chartTypeIndex = parseInt(e.detail.value);
    this.setData({
      chartTypeIndex: chartTypeIndex
    });
  },
  
  // 获取账龄区间颜色
  getPeriodColor(periodName) {
    const colorMap = {
      '0-30天': '#4CAF50',
      '31-60天': '#2196F3',
      '61-90天': '#FFC107',
      '91-180天': '#FF9800',
      '180天以上': '#F44336'
    };
    return colorMap[periodName] || '#9E9E9E';
  }
});
