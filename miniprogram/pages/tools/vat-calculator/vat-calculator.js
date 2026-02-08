Page({
  data: {
    amount: '',
    tax: '0.00',
    total: '0.00'
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '增值税计算器'
    });
  },

  onAmountInput(e) {
    const amount = parseFloat(e.detail.value);
    if (!isNaN(amount) && amount >= 0) {
      const tax = amount * 0.13;
      const total = amount + tax;
      this.setData({
        amount: e.detail.value,
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      });
    } else {
      this.setData({
        amount: e.detail.value,
        tax: '0.00',
        total: '0.00'
      });
    }
  },

  copyResult() {
    if (!this.data.amount) {
      wx.showToast({
        title: '请先输入金额',
        icon: 'none'
      });
      return;
    }

    const result = `不含税金额：¥${this.data.amount}\n增值税（13%）：¥${this.data.tax}\n含税金额：¥${this.data.total}`;
    
    wx.setClipboardData({
      data: result,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  }
});
