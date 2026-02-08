Page({
  data: {
    taxTypes: ['增值税', '企业所得税', '个人所得税'],
    taxTypeIndex: 0,
    amount: '',
    rate: '13',
    calculatedTax: '0.00',
    showResult: false,
    resultDetail: '',
    
    companyTypes: ['小微企业', '一般纳税人企业', '个体工商户', '个人独资企业'],
    companyTypeIndex: 0,
    revenue: '',
    suggestions: [],
    showSuggestions: false,
    
    taxPolicies: [
      {
        id: 1,
        title: '小微企业增值税减免政策',
        tag: '增值税',
        date: '2024-01-01',
        content: '月销售额10万元以下（季度30万元以下）的增值税小规模纳税人，免征增值税。'
      },
      {
        id: 2,
        title: '小微企业所得税优惠政策',
        tag: '所得税',
        date: '2024-01-01',
        content: '年应纳税所得额不超过300万元的部分，减按25%计入应纳税所得额，按20%的税率缴纳企业所得税。'
      },
      {
        id: 3,
        title: '研发费用加计扣除政策',
        tag: '所得税',
        date: '2024-01-01',
        content: '企业开展研发活动中实际发生的研发费用，未形成无形资产计入当期损益的，在按规定据实扣除的基础上，在2018年1月1日至2020年12月31日期间，再按照实际发生额的75%在税前加计扣除；在2021年1月1日起，再按照实际发生额的100%在税前加计扣除。'
      },
      {
        id: 4,
        title: '科技型中小企业税收优惠',
        tag: '综合',
        date: '2024-01-01',
        content: '科技型中小企业开展研发活动中实际发生的研发费用，未形成无形资产计入当期损益的，在按规定据实扣除的基础上，自2022年1月1日起，再按照实际发生额的100%在税前加计扣除。'
      }
    ],
    selectedPolicy: null,
    showPolicyDetail: false
  },

  onLoad(options) {},

  onReady() {},

  onShow() {},

  onHide() {},

  onUnload() {},

  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  onReachBottom() {},

  onShareAppMessage() {},

  navigateBack() {
    wx.navigateBack({ delta: 1 });
  },

  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '税务筹划工具可以帮助您计算税额、获取智能税务建议和了解最新税收优惠政策。\n\n1. 税额计算器：输入金额和税率，计算应纳税额\n2. 智能税务建议：根据企业类型和营业额获取个性化税务建议\n3. 税收优惠政策：查看最新的税收优惠政策详情',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  bindTaxTypeChange(e) {
    this.setData({ taxTypeIndex: e.detail.value });
  },

  bindAmountInput(e) {
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

  bindRateInput(e) {
    let rate = e.detail.value.replace(/[^0-9.]/g, '');
    const parts = rate.split('.');
    if (parts.length > 2) {
      rate = parts[0] + '.' + parts[1];
    }
    if (parts.length === 2 && parts[1].length > 2) {
      rate = parts[0] + '.' + parts[1].substring(0, 2);
    }
    this.setData({ rate });
  },

  calculateTax() {
    const { taxTypeIndex, amount, rate } = this.data;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入有效的金额', icon: 'none' });
      return;
    }
    
    let calculatedTax = 0;
    let resultDetail = '';
    const amountValue = parseFloat(amount);
    
    switch (taxTypeIndex) {
      case 0:
        if (!rate || isNaN(rate) || parseFloat(rate) <= 0) {
          wx.showToast({ title: '请输入有效的税率', icon: 'none' });
          return;
        }
        const rateValue = parseFloat(rate) / 100;
        calculatedTax = amountValue * rateValue;
        resultDetail = `增值税 = 金额 × 税率 = ${amountValue.toFixed(2)} × ${(rateValue * 100).toFixed(2)}% = ${calculatedTax.toFixed(2)}`;
        break;
        
      case 1:
        calculatedTax = amountValue * 0.25;
        resultDetail = `企业所得税 = 应纳税所得额 × 税率 = ${amountValue.toFixed(2)} × 25% = ${calculatedTax.toFixed(2)}`;
        break;
        
      case 2:
        if (amountValue <= 5000) {
          calculatedTax = 0;
          resultDetail = '月收入不超过5000元，免征个人所得税';
        } else if (amountValue <= 8000) {
          calculatedTax = (amountValue - 5000) * 0.03;
          resultDetail = `个人所得税 = (月收入 - 起征点) × 税率 = (${amountValue.toFixed(2)} - 5000) × 3% = ${calculatedTax.toFixed(2)}`;
        } else if (amountValue <= 17000) {
          calculatedTax = (amountValue - 5000) * 0.1 - 210;
          resultDetail = `个人所得税 = (月收入 - 起征点) × 税率 - 速算扣除数 = (${amountValue.toFixed(2)} - 5000) × 10% - 210 = ${calculatedTax.toFixed(2)}`;
        } else {
          calculatedTax = (amountValue - 5000) * 0.2 - 1410;
          resultDetail = `个人所得税 = (月收入 - 起征点) × 税率 - 速算扣除数 = (${amountValue.toFixed(2)} - 5000) × 20% - 1410 = ${calculatedTax.toFixed(2)}`;
        }
        break;
    }
    
    this.setData({
      calculatedTax: calculatedTax.toFixed(2),
      showResult: true,
      resultDetail: resultDetail
    });
  },

  clearTaxCalculation() {
    this.setData({
      amount: '',
      rate: '13',
      calculatedTax: '0.00',
      showResult: false,
      resultDetail: ''
    });
  },

  bindCompanyTypeChange(e) {
    this.setData({ companyTypeIndex: e.detail.value });
  },

  bindRevenueInput(e) {
    let revenue = e.detail.value.replace(/[^0-9.]/g, '');
    const parts = revenue.split('.');
    if (parts.length > 2) {
      revenue = parts[0] + '.' + parts[1];
    }
    if (parts.length === 2 && parts[1].length > 2) {
      revenue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    this.setData({ revenue });
  },

  generateSuggestions() {
    const { companyTypeIndex, revenue } = this.data;
    
    if (!revenue || isNaN(revenue) || parseFloat(revenue) <= 0) {
      wx.showToast({ title: '请输入有效的年营业额', icon: 'none' });
      return;
    }
    
    const revenueValue = parseFloat(revenue);
    let suggestions = [];
    
    switch (companyTypeIndex) {
      case 0:
        suggestions = [
          {
            icon: '💡',
            text: '作为小微企业，您可以享受增值税减免政策，月销售额10万元以下免征增值税。'
          },
          {
            icon: '💰',
            text: '企业所得税优惠：年应纳税所得额不超过300万元的部分，减按25%计入应纳税所得额，按20%的税率缴纳企业所得税。'
          },
          {
            icon: '📋',
            text: '建议建立规范的财务核算制度，确保能够享受小微企业税收优惠政策。'
          }
        ];
        if (revenueValue < 1000000) {
          suggestions.push({
            icon: '🎯',
            text: '您的年营业额较低，建议申请成为小规模纳税人，享受更多税收优惠。'
          });
        }
        break;
        
      case 1:
        suggestions = [
          {
            icon: '💡',
            text: '作为一般纳税人，您可以抵扣进项税额，建议及时取得并认证增值税专用发票。'
          },
          {
            icon: '💰',
            text: '合理规划企业成本结构，增加可扣除项目，降低应纳税所得额。'
          },
          {
            icon: '📋',
            text: '建议利用研发费用加计扣除政策，提高研发投入，享受税收优惠。'
          }
        ];
        if (revenueValue > 10000000) {
          suggestions.push({
            icon: '🎯',
            text: '您的企业规模较大，建议考虑设立子公司或分公司，进行合理的税务筹划。'
          });
        }
        break;
        
      case 2:
        suggestions = [
          {
            icon: '💡',
            text: '作为个体工商户，您可以选择核定征收或查账征收方式，根据自身情况选择最优方案。'
          },
          {
            icon: '💰',
            text: '合理区分家庭费用和经营费用，确保经营费用能够在税前扣除。'
          },
          {
            icon: '📋',
            text: '建议建立简单的财务核算制度，便于税务申报和享受税收优惠。'
          }
        ];
        break;
        
      case 3:
        suggestions = [
          {
            icon: '💡',
            text: '作为个人独资企业，您需要缴纳个人所得税，不需要缴纳企业所得税。'
          },
          {
            icon: '💰',
            text: '合理规划企业利润分配，避免个人所得税税负过高。'
          },
          {
            icon: '📋',
            text: '建议建立规范的财务核算制度，确保税务合规。'
          }
        ];
        break;
    }
    
    this.setData({
      suggestions: suggestions,
      showSuggestions: true
    });
  },

  showPolicyDetail(e) {
    const policyId = e.currentTarget.dataset.id;
    const selectedPolicy = this.data.taxPolicies.find(policy => policy.id === policyId);
    if (selectedPolicy) {
      this.setData({ selectedPolicy, showPolicyDetail: true });
    }
  },

  closePolicyDetail() {
    this.setData({ showPolicyDetail: false, selectedPolicy: null });
  },

  copyCalculationResult() {
    const result = this.data.resultDetail + '\n应纳税额：' + this.data.calculatedTax + '元';
    wx.setClipboardData({
      data: result,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  }
});