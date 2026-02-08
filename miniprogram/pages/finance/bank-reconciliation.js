Page({
  data: {
    reconciliationStatus: 0,
    reconciliationData: [],
    filteredData: [],
    loading: false,
    refreshing: false,
    searchText: '',
    statusFilter: '全部',
    selectedItems: [],
    showBatchActions: false
  },
  
  onLoad() {
    this.initializePage();
  },
  
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadBankReconciliationData(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    });
  },
  
  initializePage() {
    this.loadBankReconciliationData();
  },
  
  loadBankReconciliationData(callback) {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          bankName: '工商银行',
          account: '6222 **** **** 1234',
          reconciliationDate: '2026-02-03',
          status: '待对账',
          amount: '12,345.67',
          difference: '890.00',
          transactionCount: 156,
          lastUpdated: '2026-02-03 15:30'
        },
        {
          id: 2,
          bankName: '建设银行',
          account: '6227 **** **** 5678',
          reconciliationDate: '2026-02-02',
          status: '已对账',
          amount: '8,765.43',
          difference: '0.00',
          transactionCount: 89,
          lastUpdated: '2026-02-02 14:20'
        },
        {
          id: 3,
          bankName: '农业银行',
          account: '6228 **** **** 9012',
          reconciliationDate: '2026-02-01',
          status: '对账中',
          amount: '5,432.10',
          difference: '123.45',
          transactionCount: 67,
          lastUpdated: '2026-02-01 16:45'
        },
        {
          id: 4,
          bankName: '招商银行',
          account: '6214 **** **** 3456',
          reconciliationDate: '2026-01-31',
          status: '待对账',
          amount: '23,456.78',
          difference: '2,345.00',
          transactionCount: 234,
          lastUpdated: '2026-01-31 10:15'
        },
        {
          id: 5,
          bankName: '中国银行',
          account: '6216 **** **** 7890',
          reconciliationDate: '2026-01-30',
          status: '已对账',
          amount: '15,678.90',
          difference: '0.00',
          transactionCount: 178,
          lastUpdated: '2026-01-30 11:30'
        }
      ];
      
      this.setData({
        reconciliationData: mockData,
        filteredData: mockData,
        loading: false
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
    const statusFilter = e.currentTarget.dataset.filter;
    this.setData({ statusFilter });
    this.filterData();
  },
  
  filterData() {
    const { reconciliationData, searchText, statusFilter } = this.data;
    let filtered = reconciliationData;
    
    if (searchText) {
      filtered = filtered.filter(item => 
        item.bankName.includes(searchText) || 
        item.account.includes(searchText)
      );
    }
    
    if (statusFilter !== '全部') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    this.setData({ filteredData: filtered });
  },
  
  onSelectItem(e) {
    const id = e.currentTarget.dataset.id;
    let { selectedItems } = this.data;
    
    if (selectedItems.includes(id)) {
      selectedItems = selectedItems.filter(item => item !== id);
    } else {
      selectedItems.push(id);
    }
    
    this.setData({ 
      selectedItems,
      showBatchActions: selectedItems.length > 0
    });
  },
  
  batchReconcile() {
    const { selectedItems, reconciliationData } = this.data;
    
    if (selectedItems.length === 0) {
      wx.showToast({ title: '请选择要操作的项目', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '批量对账',
      content: `确定要对选中的 ${selectedItems.length} 项进行对账吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在批量对账...' });
          
          setTimeout(() => {
            const updatedData = reconciliationData.map(item => {
              if (selectedItems.includes(item.id) && item.status === '待对账') {
                return { ...item, status: '已对账', difference: '0.00' };
              }
              return item;
            });
            
            this.setData({
              reconciliationData: updatedData,
              filteredData: updatedData,
              selectedItems: [],
              showBatchActions: false
            });
            
            wx.hideLoading();
            wx.showToast({ title: '批量对账完成', icon: 'success' });
          }, 2000);
        }
      }
    });
  },
  
  cancelSelection() {
    this.setData({
      selectedItems: [],
      showBatchActions: false
    });
  },
  
  startReconciliation(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.reconciliationData.find(item => item.id === id);
    
    if (item.status !== '待对账') {
      wx.showToast({ title: '只能对待对账项目进行操作', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认对账',
      content: `确定要对 ${item.bankName} (${item.account}) 进行对账吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '正在对账...' });
          
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '对账完成', icon: 'success' });
            
            const updatedData = this.data.reconciliationData.map(item => {
              if (item.id === id) {
                return { ...item, status: '已对账', difference: '0.00' };
              }
              return item;
            });
            
            this.setData({ 
              reconciliationData: updatedData,
              filteredData: updatedData
            });
          }, 2000);
        }
      }
    });
  },
  
  viewDetails(e) {
    const id = e.currentTarget.dataset.id;
    const data = this.data.reconciliationData.find(item => item.id === id);
    
    wx.showModal({
      title: '对账详情',
      content: `银行: ${data.bankName}\n账户: ${data.account}\n对账日期: ${data.reconciliationDate}\n状态: ${data.status}\n对账金额: ¥${data.amount}\n差异金额: ¥${data.difference}\n交易笔数: ${data.transactionCount}\n最后更新: ${data.lastUpdated}`,
      showCancel: false,
      confirmText: '确定'
    });
  },
  
  exportReport() {
    wx.showActionSheet({
      itemList: ['导出 Excel', '导出 PDF', '导出 CSV'],
      success: (res) => {
        const formats = ['Excel', 'PDF', 'CSV'];
        const format = formats[res.tapIndex];
        
        wx.showLoading({ title: `正在导出${format}...` });
        
        setTimeout(() => {
          wx.hideLoading();
          wx.showToast({ 
            title: `${format}报告已导出`, 
            icon: 'success',
            duration: 2000
          });
        }, 1500);
      }
    });
  },
  
  onRefresh() {
    this.setData({ refreshing: true });
    this.loadBankReconciliationData(() => {
      this.setData({ refreshing: false });
    });
  },
  
  viewTransactionHistory(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.reconciliationData.find(item => item.id === id);
    
    wx.showToast({ 
      title: `查看${item.bankName}交易明细`, 
      icon: 'none' 
    });
  },
  
  viewDifferenceDetails(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.reconciliationData.find(item => item.id === id);
    
    if (item.difference === '0.00') {
      wx.showToast({ title: '无差异', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '差异详情',
      content: `银行: ${item.bankName}\n账户: ${item.account}\n差异金额: ¥${item.difference}\n\n差异原因:\n1. 银行手续费: ¥${(parseFloat(item.difference.replace(/,/g, '')) * 0.3).toFixed(2)}\n2. 未达账项: ¥${(parseFloat(item.difference.replace(/,/g, '')) * 0.7).toFixed(2)}`,
      showCancel: false
    });
  },
  
  getBankInitials(bankName) {
    return bankName ? bankName.charAt(0) : '';
  }
});
