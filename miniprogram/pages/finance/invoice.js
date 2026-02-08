Page({
  data: {
    invoiceList: [],
    filteredList: [],
    loading: false,
    refreshing: false,
    searchText: '',
    statusFilter: '全部',
    typeFilter: '全部',
    selectedInvoices: [],
    showBatchActions: false,
    totalAmount: 0,
    totalTax: 0
  },
  
  onLoad() {
    this.loadInvoiceData();
  },
  
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadInvoiceData(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    });
  },
  
  loadInvoiceData(callback) {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          invoiceNo: 'INV20260203001',
          invoiceType: '增值税专用发票',
          buyerName: '北京科技有限公司',
          sellerName: '上海商贸有限公司',
          amount: '12,345.67',
          tax: '1,576.50',
          totalAmount: '13,922.17',
          invoiceDate: '2026-02-03',
          status: '已认证',
          category: '采购'
        },
        {
          id: 2,
          invoiceNo: 'INV20260202002',
          invoiceType: '增值税普通发票',
          buyerName: '深圳创新科技',
          sellerName: '广州制造企业',
          amount: '8,765.43',
          tax: '1,051.85',
          totalAmount: '9,817.28',
          invoiceDate: '2026-02-02',
          status: '待认证',
          category: '销售'
        },
        {
          id: 3,
          invoiceNo: 'INV20260201003',
          invoiceType: '增值税专用发票',
          buyerName: '杭州智能系统',
          sellerName: '北京科技集团',
          amount: '23,456.78',
          tax: '3,049.38',
          totalAmount: '26,506.16',
          invoiceDate: '2026-02-01',
          status: '已认证',
          category: '采购'
        },
        {
          id: 4,
          invoiceNo: 'INV20260131004',
          invoiceType: '增值税普通发票',
          buyerName: '成都软件公司',
          sellerName: '武汉服务中心',
          amount: '5,432.10',
          tax: '651.85',
          totalAmount: '6,083.95',
          invoiceDate: '2026-01-31',
          status: '已作废',
          category: '费用'
        },
        {
          id: 5,
          invoiceNo: 'INV20260130005',
          invoiceType: '增值税专用发票',
          buyerName: '南京智能设备',
          sellerName: '西安供应商',
          amount: '15,678.90',
          tax: '2,038.26',
          totalAmount: '17,717.16',
          invoiceDate: '2026-01-30',
          status: '待认证',
          category: '采购'
        }
      ];
      
      const totalAmount = mockData.reduce((sum, item) => sum + parseFloat(item.totalAmount.replace(/,/g, '')), 0);
      const totalTax = mockData.reduce((sum, item) => sum + parseFloat(item.tax.replace(/,/g, '')), 0);
      
      this.setData({
        invoiceList: mockData,
        filteredList: mockData,
        loading: false,
        totalAmount: totalAmount.toFixed(2),
        totalTax: totalTax.toFixed(2)
      });
      
      if (callback) callback();
    }, 1000);
  },
  
  onSearchInput(e) {
    const searchText = e.detail.value;
    this.setData({ searchText });
    this.filterData();
  },
  
  onStatusFilterChange(e) {
    const statusFilter = e.detail.value;
    this.setData({ statusFilter });
    this.filterData();
  },
  
  onTypeFilterChange(e) {
    const typeFilter = e.detail.value;
    this.setData({ typeFilter });
    this.filterData();
  },
  
  filterData() {
    const { invoiceList, searchText, statusFilter, typeFilter } = this.data;
    let filtered = invoiceList;
    
    if (searchText) {
      filtered = filtered.filter(item => 
        item.invoiceNo.includes(searchText) || 
        item.buyerName.includes(searchText) ||
        item.sellerName.includes(searchText)
      );
    }
    
    if (statusFilter !== '全部') {
      filtered = filtered.filter(item => item.状态 === statusFilter);
    }
    
    if (typeFilter !== '全部') {
      filtered = filtered.filter(item => item.invoiceType === typeFilter);
    }
    
    this.setData({ filteredList: filtered });
  },
  
  onSelectInvoice(e) {
    const id = e.currentTarget.dataset.id;
    let { selectedInvoices } = this.data;
    
    if (selectedInvoices.includes(id)) {
      selectedInvoices = selectedInvoices.filter(item => item !== id);
    } else {
      selectedInvoices.push(id);
    }
    
    this.setData({ 
      selectedInvoices,
      showBatchActions: selectedInvoices.length > 0
    });
  },
  
  batchVerify() {
    const { selectedInvoices, invoiceList } = this.data;
    
    if (selectedInvoices.length === 0) {
      wx.showToast({ title: '请选择要认证的发票', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '批量认证',
      content: `确定要认证选中的 ${selectedInvoices.length} 张发票吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在认证...' });
          
          setTimeout(() => {
            const updatedList = invoiceList.map(item => {
              if (selectedInvoices.includes(item.id) && item.status === '待认证') {
                return { ...item, status: '已认证' };
              }
              return item;
            });
            
            this.setData({
              invoiceList: updatedList,
              filteredList: updatedList,
              selectedInvoices: [],
              showBatchActions: false
            });
            
            wx.hideLoading();
            wx.showToast({ title: '认证完成', icon: 'success' });
          }, 2000);
        }
      }
    });
  },
  
  cancelSelection() {
    this.setData({
      selectedInvoices: [],
      showBatchActions: false
    });
  },
  
  viewInvoiceDetail(e) {
    const id = e.currentTarget.dataset.id;
    const invoice = this.data.invoiceList.find(item => item.id === id);
    
    wx.showModal({
      title: '发票详情',
      content: `发票号码: ${invoice.invoiceNo}\n发票类型: ${invoice.invoiceType}\n购买方: ${invoice.buyerName}\n销售方: ${invoice.sellerName}\n金额: ¥${invoice.amount}\n税额: ¥${invoice.tax}\价税合计: ¥${invoice.totalAmount}\n开票日期: ${invoice.invoiceDate}\n状态: ${invoice.status}\n类别: ${invoice.category}`,
      showCancel: false,
      confirmText: '确定'
    });
  },
  
  addInvoice() {
    wx.showToast({ title: '打开发票录入页面', icon: 'none' });
  },
  
  scanInvoice() {
    wx.showToast({ title: '打开扫码识别功能', icon: 'none' });
  },
  
  exportInvoice() {
    wx.showActionSheet({
      itemList: ['导出 Excel', '导出 PDF'],
      success: (res) => {
        const formats = ['Excel', 'PDF'];
        const format = formats[res.tapIndex];
        
        wx.showLoading({ title: `正在导出${format}...` });
        
        setTimeout(() => {
          wx.hideLoading();
          wx.showToast({ title: `${format}已导出`, icon: 'success' });
        }, 1500);
      }
    });
  },
  
  verifyInvoice(e) {
    const id = e.currentTarget.dataset.id;
    const invoice = this.data.invoiceList.find(item => item.id === id);
    
    if (invoice.status !== '待认证') {
      wx.showToast({ title: '只能认证待认证的发票', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认认证',
      content: `确定要认证发票 ${invoice.invoiceNo} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在认证...' });
          
          setTimeout(() => {
            const updatedList = this.data.invoiceList.map(item => {
              if (item.id === id) {
                return { ...item, status: '已认证' };
              }
              return item;
            });
            
            this.setData({
              invoiceList: updatedList,
              filteredList: updatedList
            });
            
            wx.hideLoading();
            wx.showToast({ title: '认证成功', icon: 'success' });
          }, 1500);
        }
      }
    });
  }
});