Page({
  data: {
    currentType: 'expense',
    amount: '',
    selectedCategory: '',
    remark: '',
    currentDate: '',
    selectedAccount: '现金',
    showDatePicker: false,
    datePickerValue: [],
    yearArray: [],
    monthArray: [],
    dayArray: [],
    showAccountPicker: false,
    accounts: ['现金', '银行卡', '支付宝', '微信'],
    showAIModal: false,
    aiInput: '',
    aiResult: null,
    analyzing: false,
    focusAmount: false
  },

  onLoad() {
    this.initDatePicker();
    this.setCurrentDate();
  },

  initDatePicker() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const yearArray = [];
    for (let i = year - 5; i <= year + 5; i++) {
      yearArray.push(i);
    }
    
    const monthArray = Array.from({ length: 12 }, (_, i) => i + 1);
    const dayArray = Array.from({ length: 31 }, (_, i) => i + 1);
    
    this.setData({
      yearArray,
      monthArray,
      dayArray,
      datePickerValue: [5, month - 1, day - 1]
    });
  },

  setCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    this.setData({ currentDate });
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentType: type, selectedCategory: '' });
  },

  onAmountChange(e) {
    let amount = e.detail.value.replace(/[^0-9.]/g, '');
    const parts = amount.split('.');
    if (parts.length > 2) {
      amount = parts[0] + '.' + parts[1];
    }
    if (parts.length === 2 && parts[1].length > 2) {
      amount = parts[0] + '.' + parts[1].substring(0, 2);
    }
    this.setData({ amount });
  },

  selectQuickAmount(e) {
    const amount = e.currentTarget.dataset.amount;
    this.setData({ amount: amount.toString(), focusAmount: false });
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category });
  },

  onRemarkChange(e) {
    this.setData({ remark: e.detail.value });
  },

  showDatePicker() {
    this.setData({ showDatePicker: true });
  },

  onDateChange(e) {
    const value = e.detail.value;
    const year = this.data.yearArray[value[0]];
    const month = String(this.data.monthArray[value[1]]).padStart(2, '0');
    const day = String(this.data.dayArray[value[2]]).padStart(2, '0');
    this.setData({
      datePickerValue: value,
      currentDate: `${year}-${month}-${day}`,
      showDatePicker: false
    });
  },

  onDatePickStart() {},

  onDatePickEnd() {},

  showAccountPicker() {
    this.setData({ showAccountPicker: true });
  },

  hideAccountPicker() {
    this.setData({ showAccountPicker: false });
  },

  selectAccount(e) {
    const account = e.currentTarget.dataset.account;
    this.setData({ selectedAccount: account, showAccountPicker: false });
  },

  stopPropagation() {},

  showAIAssistant() {
    this.setData({ showAIModal: true, aiInput: '', aiResult: null });
  },

  hideAIModal() {
    this.setData({ showAIModal: false, aiInput: '', aiResult: null, analyzing: false });
  },

  onAIInputChange(e) {
    this.setData({ aiInput: e.detail.value });
  },

  analyzeWithAI() {
    if (!this.data.aiInput.trim()) {
      wx.showToast({ title: '请输入消费描述', icon: 'none' });
      return;
    }

    this.setData({ analyzing: true });

    setTimeout(() => {
      const aiResult = {
        type: 'expense',
        amount: '35',
        category: 'food',
        remark: this.data.aiInput.trim(),
        date: this.data.currentDate
      };

      this.setData({ aiResult, analyzing: false });
    }, 1500);
  },

  applyAIResult() {
    if (!this.data.aiResult) return;

    const aiResult = this.data.aiResult;
    this.setData({
      currentType: aiResult.type,
      amount: aiResult.amount,
      selectedCategory: aiResult.category,
      remark: aiResult.remark,
      currentDate: aiResult.date,
      showAIModal: false
    });
  },

  clearForm() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前表单吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            amount: '',
            selectedCategory: '',
            remark: '',
            selectedAccount: '现金',
            focusAmount: true
          });
        }
      }
    });
  },

  saveRecord() {
    if (!this.data.amount) {
      wx.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }

    if (!this.data.selectedCategory) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }

    const record = {
      id: Date.now().toString(),
      type: this.data.currentType,
      amount: parseFloat(this.data.amount),
      category: this.data.selectedCategory,
      remark: this.data.remark,
      date: this.data.currentDate,
      account: this.data.selectedAccount,
      createTime: new Date().toISOString()
    };

    this.saveRecordToStorage(record);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        this.setData({
          amount: '',
          selectedCategory: '',
          remark: '',
          focusAmount: true
        });
      }
    });
  },

  saveRecordToStorage(record) {
    try {
      const existingRecords = wx.getStorageSync('records') || [];
      existingRecords.unshift(record);
      wx.setStorageSync('records', existingRecords);
      console.log('记录保存成功:', record);
    } catch (error) {
      console.error('保存记录失败:', error);
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  }
});
