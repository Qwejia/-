Page({
  data: {
    salary: '',
    tax: '0.00',
    afterTax: '0.00'
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '个税计算器'
    });
  },

  onSalaryInput(e) {
    const salary = parseFloat(e.detail.value);
    if (!isNaN(salary) && salary >= 0) {
      const tax = this.calculatePersonalTax(salary);
      const afterTax = salary - tax;
      this.setData({
        salary: e.detail.value,
        tax: tax.toFixed(2),
        afterTax: afterTax.toFixed(2)
      });
    } else {
      this.setData({
        salary: e.detail.value,
        tax: '0.00',
        afterTax: '0.00'
      });
    }
  },

  calculatePersonalTax(salary) {
    const threshold = 5000;
    const taxableIncome = Math.max(0, salary - threshold);
    
    if (taxableIncome <= 0) {
      return 0;
    }
    
    const brackets = [
      { limit: 36000, rate: 0.03, deduction: 0 },
      { limit: 144000, rate: 0.1, deduction: 2520 },
      { limit: 300000, rate: 0.2, deduction: 16920 },
      { limit: 420000, rate: 0.25, deduction: 31920 },
      { limit: 660000, rate: 0.3, deduction: 52920 },
      { limit: 960000, rate: 0.35, deduction: 85920 },
      { limit: Infinity, rate: 0.45, deduction: 181920 }
    ];
    
    for (const bracket of brackets) {
      if (taxableIncome <= bracket.limit) {
        return taxableIncome * bracket.rate - bracket.deduction;
      }
    }
    
    return taxableIncome * 0.45 - 181920;
  },

  copyResult() {
    if (!this.data.salary) {
      wx.showToast({
        title: '请先输入工资',
        icon: 'none'
      });
      return;
    }

    const result = `税前工资：¥${this.data.salary}\n个人所得税：¥${this.data.tax}\n税后工资：¥${this.data.afterTax}`;
    
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
