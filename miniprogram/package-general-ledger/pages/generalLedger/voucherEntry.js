// pages/generalLedger/voucherEntry.js
const { createValidator } = require('../../utils/formValidator');
// AI服务实例
const aiService = require('../../utils/aiService');
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    voucherNumber: '',
    voucherDate: '',
    voucherType: '1',
    entries: [
      { id: Date.now() + 1, accountId: '', accountName: '', debit: '', credit: '', description: '', auxAccounting: {}, auxAccountingTypes: [] },
      { id: Date.now() + 2, accountId: '', accountName: '', debit: '', credit: '', description: '', auxAccounting: {}, auxAccountingTypes: [] }
    ],
    accounts: [],
    customers: [],
    suppliers: [],
    departments: [],
    projects: [],
    auxAccountingTypes: [],
    totalDebit: 0,
    totalCredit: 0,
    isBalanced: false,
    showAccountPicker: false,
    showAuxPicker: false,
    currentEntryId: '',
    currentAuxType: '',
    currentAuxTypeName: '',
    // 表单验证相关
    errors: {},
    entryErrors: [], // 用于存储每一行分录的错误信息
    // AI相关数据
    showAIAssistant: false,
    aiTradeInput: '',
    aiAnalysisResult: null,
    loadingAI: false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const app = getApp();
    const today = new Date().toISOString().split('T')[0];
    const voucherType = options.type || '1';
    const vouchers = app.getVouchersFromLocal();
    const voucherNumber = `V${today.replace(/-/g, '')}${String(vouchers.length + 1).padStart(4, '0')}`;
    
    // 初始化表单验证器
    this.validator = createValidator(this);
    
    this.setData({
      voucherDate: today,
      voucherType: voucherType,
      voucherNumber: voucherNumber,
      accounts: app.globalData.accounts || [],
      customers: app.globalData.customers || [],
      suppliers: app.globalData.suppliers || [],
      departments: app.globalData.departments || [],
      projects: app.globalData.projects || [],
      auxAccountingTypes: app.globalData.auxAccountingTypes || []
    });
  },
  
  // 选择凭证日期
  onDateChange(e) {
    this.setData({
      voucherDate: e.detail.value
    });
  },
  
  // 选择会计科目
  selectAccount(e) {
    const { entryId } = e.currentTarget.dataset;
    this.setData({
      showAccountPicker: true,
      currentEntryId: entryId
    });
  },
  
  // 确认选择会计科目
  confirmAccount(e) {
    const { id, name } = e.currentTarget.dataset;
    const { entries, accounts } = this.data;
    
    // 获取当前科目信息
    const account = accounts.find(acc => acc._id === id);
    const auxAccountingTypes = account?.auxAccounting || [];
    
    const updatedEntries = entries.map(entry => {
      if (entry.id === this.data.currentEntryId) {
        return { 
          ...entry, 
          accountId: id, 
          accountName: name,
          auxAccountingTypes: auxAccountingTypes
        };
      }
      return entry;
    });
    
    this.setData({
      entries: updatedEntries,
      showAccountPicker: false
    });
    
    this.calculateTotals();
  },
  
  // 取消选择会计科目
  cancelAccount() {
    this.setData({
      showAccountPicker: false
    });
  },
  
  // 输入借方金额
  onDebitInput(e) {
    const { entryId } = e.currentTarget.dataset;
    const { value } = e.detail;
    const { entries } = this.data;
    
    // 实时验证金额
    const isValidAmount = this.validator.validateField('amount', value);
    
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, debit: value, credit: '' };
      }
      return entry;
    });
    
    this.setData({
      entries: updatedEntries
    });
    
    this.calculateTotals();
    
    // 验证借贷平衡
    this.validateBalance();
  },

  // 输入贷方金额
  onCreditInput(e) {
    const { entryId } = e.currentTarget.dataset;
    const { value } = e.detail;
    const { entries } = this.data;
    
    // 实时验证金额
    const isValidAmount = this.validator.validateField('amount', value);
    
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, credit: value, debit: '' };
      }
      return entry;
    });
    
    this.setData({
      entries: updatedEntries
    });
    
    this.calculateTotals();
    
    // 验证借贷平衡
    this.validateBalance();
  },
  
  // 输入摘要
  onDescriptionInput(e) {
    const { entryId } = e.currentTarget.dataset;
    const { value } = e.detail;
    const { entries } = this.data;
    
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, description: value };
      }
      return entry;
    });
    
    this.setData({
      entries: updatedEntries
    });
  },
  
  // 计算借贷合计
  calculateTotals() {
    const { entries } = this.data;
    let totalDebit = 0;
    let totalCredit = 0;
    
    entries.forEach(entry => {
      totalDebit += parseFloat(entry.debit) || 0;
      totalCredit += parseFloat(entry.credit) || 0;
    });
    
    this.setData({
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2),
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    });
  },
  
  // 验证借贷平衡
  validateBalance() {
    const { totalDebit, totalCredit } = this.data;
    const balanceValidation = this.validator.validateBalanced(totalDebit, totalCredit);
    
    if (!balanceValidation.isValid) {
      this.validator.errors['balance'] = balanceValidation.message;
    } else {
      delete this.validator.errors['balance'];
    }
    
    this.setData({ errors: this.validator.errors });
    return balanceValidation;
  },
  
  // 添加分录行
  addEntry() {
    const { entries } = this.data;
    const newEntry = {
      id: Date.now(),
      accountId: '',
      accountName: '',
      debit: '',
      credit: '',
      description: '',
      auxAccounting: {},
      auxAccountingTypes: []
    };
    
    this.setData({
      entries: [...entries, newEntry]
    });
  },
  
  // 删除分录行
  deleteEntry(e) {
    const { entryId } = e.currentTarget.dataset;
    const { entries } = this.data;
    
    if (entries.length <= 2) {
      wx.showToast({
        title: '至少保留两行分录',
        icon: 'none'
      });
      return;
    }
    
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    this.setData({
      entries: updatedEntries
    });
    
    this.calculateTotals();
  },
  
  // 保存凭证
  saveVoucher() {
    // 验证凭证数据
    if (!this.validateVoucher()) {
      return;
    }
    
    const app = getApp();
    const { voucherNumber, voucherDate, voucherType, entries } = this.data;
    
    // 创建凭证对象
    const voucher = {
      _id: Date.now().toString(),
      number: voucherNumber,
      date: voucherDate,
      type: voucherType,
      status: 'draft', // draft: 草稿, submitted: 已提交, approved: 已审核, posted: 已记账
      totalDebit: parseFloat(this.data.totalDebit),
      totalCredit: parseFloat(this.data.totalCredit),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 创建凭证分录对象
    const voucherEntries = entries.map(entry => ({
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      voucherId: voucher._id,
      accountId: entry.accountId,
      accountName: entry.accountName,
      debit: parseFloat(entry.debit) || 0,
      credit: parseFloat(entry.credit) || 0,
      description: entry.description,
      auxAccounting: entry.auxAccounting
    }));
    
    // 验证辅助核算信息
    const auxValidation = this.validator.validateAuxAccounting(entries, this.data.accounts);
    if (!auxValidation.isValid) {
      this.validator.showError(auxValidation.message);
      return;
    }
    
    // 保存到本地存储
    app.addVoucherToLocal(voucher);
    app.addVoucherEntriesToLocal(voucherEntries);
    
    this.validator.showSuccess('凭证保存成功');
    
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 1500);
  },
  
  // 验证凭证数据
  validateVoucher() {
    const { entries } = this.data;
    const entryErrors = [];
    let isValid = true;
    
    // 检查是否有未选择的科目和未输入的金额
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryError = {};
      
      // 检查会计科目
      if (!entry.accountId) {
        entryError.account = '请选择会计科目';
        isValid = false;
      }
      
      // 检查金额
      if (!entry.debit && !entry.credit) {
        entryError.amount = '请输入金额';
        isValid = false;
      }
      
      entryErrors.push(entryError);
    }
    
    // 检查借贷是否平衡
    const balanceValidation = this.validateBalance();
    if (!balanceValidation.isValid) {
      isValid = false;
    }
    
    // 更新页面中的错误状态
    this.setData({ entryErrors: entryErrors });
    
    if (!isValid) {
      // 显示第一个错误
      for (let i = 0; i < entryErrors.length; i++) {
        const errors = Object.values(entryErrors[i]);
        if (errors.length > 0) {
          this.validator.showError(`第${i + 1}行: ${errors[0]}`);
          break;
        }
      }
    }
    
    return isValid;
  },
  
  // 通过ID获取会计科目信息
  getAccountById(accountId) {
    const { accounts } = this.data;
    return accounts.find(account => account._id === accountId);
  },
  
  // 获取辅助核算类型的名称
  getAuxTypeName(auxType) {
    const { auxAccountingTypes } = this.data;
    const type = auxAccountingTypes.find(type => type.type === auxType);
    return type ? type.name : auxType;
  },
  
  // 获取辅助核算的值
  getAuxValue(entryId, auxType) {
    const { entries } = this.data;
    const entry = entries.find(e => e.id === entryId);
    if (!entry || !entry.auxAccounting || !entry.auxAccounting[auxType]) return '';
    
    const value = entry.auxAccounting[auxType];
    if (auxType === 'customer') {
      const customer = this.data.customers.find(c => c._id === value);
      return customer ? customer.name : value;
    } else if (auxType === 'supplier') {
      const supplier = this.data.suppliers.find(s => s._id === value);
      return supplier ? supplier.name : value;
    } else if (auxType === 'department') {
      const department = this.data.departments.find(d => d._id === value);
      return department ? department.name : value;
    } else if (auxType === 'project') {
      const project = this.data.projects.find(p => p._id === value);
      return project ? project.name : value;
    }
    return value;
  },
  
  // 选择辅助核算
  selectAuxAccounting(e) {
    const { entryId, auxType } = e.currentTarget.dataset;
    const { auxAccountingTypes } = this.data;
    
    // 计算当前辅助核算类型的名称
    const auxTypeName = auxAccountingTypes.find(type => type.type === auxType)?.name || auxType;
    
    this.setData({
      showAuxPicker: true,
      currentEntryId: entryId,
      currentAuxType: auxType,
      currentAuxTypeName: auxTypeName
    });
  },
  
  // 确认选择辅助核算
  confirmAuxAccounting(e) {
    const { id, name } = e.currentTarget.dataset;
    const { currentEntryId, currentAuxType, entries } = this.data;
    
    const updatedEntries = entries.map(entry => {
      if (entry.id === currentEntryId) {
        return {
          ...entry,
          auxAccounting: {
            ...entry.auxAccounting,
            [currentAuxType]: name  // 存储名称而不是ID
          }
        };
      }
      return entry;
    });
    
    this.setData({
      entries: updatedEntries,
      showAuxPicker: false
    });
  },
  
  // 取消选择辅助核算
  cancelAuxAccounting() {
    this.setData({
      showAuxPicker: false
    });
  },
  
  // 取消并返回
  cancel() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 打开AI辅助记账模态框
   */
  openAIAssistant() {
    this.setData({
      showAIAssistant: true,
      aiTradeInput: '',
      aiAnalysisResult: null,
      loadingAI: false
    });
  },

  /**
   * 关闭AI辅助记账模态框
   */
  closeAIAssistant() {
    this.setData({
      showAIAssistant: false
    });
  },

  /**
   * 处理AI交易描述输入
   */
  onAITradeInput(e) {
    this.setData({
      aiTradeInput: e.detail.value
    });
  },

  /**
   * 使用AI分析交易
   */
  async analyzeWithAI() {
    const { aiTradeInput } = this.data;
    if (!aiTradeInput.trim()) return;

    this.setData({
      loadingAI: true
    });

    try {
      // 调用AI服务分析交易
      const response = await aiService.bookkeepingAssistant(aiTradeInput.trim());

      // 解析AI分析结果
      let analysisResult = null;
      if (response && response.output && response.output[0] && response.output[0].content) {
        const aiContent = response.output[0].content[0].text;
        
        // 简单解析AI回答，提取凭证分录信息
        // 这里需要根据AI返回的格式进行解析，可能需要更复杂的解析逻辑
        analysisResult = {
          entries: [
            {
              description: aiContent.match(/摘要：([^\n]+)/)?.[1] || '交易摘要',
              accountName: aiContent.match(/会计科目：([^\n]+)/)?.[1] || '管理费用',
              debit: parseFloat(aiContent.match(/金额：¥?(\d+(\.\d+)?)/)?.[1]) || 0,
              credit: 0
            },
            {
              description: aiContent.match(/摘要：([^\n]+)/)?.[1] || '交易摘要',
              accountName: '银行存款',
              debit: 0,
              credit: parseFloat(aiContent.match(/金额：¥?(\d+(\.\d+)?)/)?.[1]) || 0
            }
          ]
        };
      }

      this.setData({
        aiAnalysisResult: analysisResult,
        loadingAI: false
      });
    } catch (error) {
      console.error('AI分析交易失败:', error);
      wx.showToast({
        title: 'AI分析失败，请稍后再试',
        icon: 'none'
      });
      this.setData({
        loadingAI: false
      });
    }
  },

  /**
   * 应用AI分析结果到凭证
   */
  applyAIResult() {
    const { aiAnalysisResult } = this.data;
    if (!aiAnalysisResult || !aiAnalysisResult.entries) return;

    // 清空现有分录
    const newEntries = aiAnalysisResult.entries.map((entry, index) => ({
      id: Date.now() + index + 1,
      accountId: '',
      accountName: entry.accountName,
      debit: entry.debit.toString(),
      credit: entry.credit.toString(),
      description: entry.description,
      auxAccounting: {},
      auxAccountingTypes: []
    }));

    this.setData({
      entries: newEntries,
      showAIAssistant: false
    });

    // 重新计算借贷合计
    this.calculateTotals();

    wx.showToast({
      title: 'AI分析结果已应用',
      icon: 'success'
    });
  }
});
