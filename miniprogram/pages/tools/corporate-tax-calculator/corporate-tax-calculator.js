Page({
  data: {
    income: '',
    tax: '0.00',
    afterTax: '0.00',
    taxRate: '0.00'
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '企业所得税计算器'
    });
  },

  onIncomeInput(e) {
    const income = parseFloat(e.detail.value);
    if (!isNaN(income) && income >= 0) {
      const tax = this.calculateCorporateTax(income);
      const afterTax = income - tax;
      const taxRate = income > 0 ? ((tax / income) * 100).toFixed(2) : '0.00';
      this.setData({
        income: e.detail.value,
        tax: tax.toFixed(2),
        afterTax: afterTax.toFixed(2),
        taxRate
      });
    } else {
      this.setData({
        income: e.detail.value,
        tax: '0.00',
        afterTax: '0.00',
        taxRate: '0.00'
      });
    }
  },

  calculateCorporateTax(income) {
    const standardRate = 0.25;
    let tax = income * standardRate;
    
    if (income <= 300000) {
      tax = income * 0.05;
    } else if (income <= 1000000) {
      tax = income * 0.10;
    }
    
    return tax;
  },

  copyResult() {
    if (!this.data.income) {
      wx.showToast({
        title: '请先输入金额',
        icon: 'none'
      });
      return;
    }

    const result = `应纳税所得额：¥${this.data.income}万元\n企业所得税：¥${this.data.tax}万元\n税后利润：¥${this.data.afterTax}万元\n实际税率：${this.data.taxRate}%`;
    
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
