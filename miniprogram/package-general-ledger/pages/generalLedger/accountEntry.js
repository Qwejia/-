// pages/generalLedger/accountEntry.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    accountId: '',
    formData: {
      code: '',
      name: '',
      category: 'asset',
      categoryIndex: 0,
      parentId: '',
      parentAccountIndex: 0,
      balanceDirection: 'debit',
      balanceDirectionIndex: 0,
      auxAccounting: [],
      isEnabled: true,
      isLeaf: true,
      initialBalance: 0
    },
    categoryOptions: [
      { value: 'asset', text: '资产类' },
      { value: 'liability', text: '负债类' },
      { value: 'equity', text: '所有者权益类' },
      { value: 'income', text: '损益类' },
      { value: 'cost', text: '成本类' }
    ],
    parentAccountOptions: [
      { _id: '', displayName: '无' }
    ],
    balanceDirectionOptions: [
      { value: 'debit', text: '借方' },
      { value: 'credit', text: '贷方' }
    ],
    auxAccountingOptions: [
      { type: 'customer', text: '客户', description: '按客户进行核算' },
      { type: 'supplier', text: '供应商', description: '按供应商进行核算' },
      { type: 'department', text: '部门', description: '按部门进行核算' },
      { type: 'project', text: '项目', description: '按项目进行核算' }
    ]
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    if (id) {
      this.setData({ isEdit: true, accountId: id });
      this.loadAccountData(id);
    }
    this.loadParentAccountOptions();
  },
  
  // 加载上级科目选项
  loadParentAccountOptions() {
    const app = getApp();
    const accounts = app.globalData.accounts || [];
    
    // 按科目代码排序
    const sortedAccounts = accounts.sort((a, b) => a.code.localeCompare(b.code));
    
    // 转换为选择器选项格式
    const options = [
      { _id: '', displayName: '无' }
    ];
    
    sortedAccounts.forEach(account => {
      options.push({
        _id: account._id,
        displayName: `${account.code} ${account.name}`
      });
    });
    
    this.setData({
      parentAccountOptions: options
    });
  },
  
  // 加载会计科目数据（编辑模式）
  loadAccountData(id) {
    const app = getApp();
    const accounts = app.globalData.accounts || [];
    const account = accounts.find(acc => acc._id === id);
    
    if (account) {
      // 设置科目类别索引
      const categoryIndex = this.data.categoryOptions.findIndex(option => option.value === account.category);
      
      // 设置上级科目索引
      const parentAccountIndex = this.data.parentAccountOptions.findIndex(option => option._id === account.parentId);
      
      // 设置余额方向索引
      const balanceDirectionIndex = this.data.balanceDirectionOptions.findIndex(option => option.value === account.balanceDirection);
      
      this.setData({
        formData: {
          code: account.code,
          name: account.name,
          category: account.category,
          categoryIndex: categoryIndex,
          parentId: account.parentId,
          parentAccountIndex: parentAccountIndex,
          balanceDirection: account.balanceDirection,
          balanceDirectionIndex: balanceDirectionIndex,
          auxAccounting: account.auxAccounting || [],
          isEnabled: account.isEnabled !== false,
          isLeaf: account.isLeaf !== false,
          initialBalance: account.initialBalance || 0
        }
      });
    }
  },
  
  // 输入事件处理
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },
  
  // 科目类别变化
  onCategoryChange(e) {
    const { value } = e.detail;
    const category = this.data.categoryOptions[value].value;
    
    this.setData({
      'formData.categoryIndex': value,
      'formData.category': category
    });
  },
  
  // 上级科目变化
  onParentAccountChange(e) {
    const { value } = e.detail;
    const parentId = this.data.parentAccountOptions[value]._id;
    
    this.setData({
      'formData.parentAccountIndex': value,
      'formData.parentId': parentId
    });
  },
  
  // 余额方向变化
  onBalanceDirectionChange(e) {
    const { value } = e.detail;
    const balanceDirection = this.data.balanceDirectionOptions[value].value;
    
    this.setData({
      'formData.balanceDirectionIndex': value,
      'formData.balanceDirection': balanceDirection
    });
  },
  
  // 辅助核算变化
  onAuxAccountingChange(e) {
    const { type } = e.currentTarget.dataset;
    const { checked } = e.detail;
    let { auxAccounting } = this.data.formData;
    
    if (checked) {
      // 添加辅助核算
      if (!auxAccounting.includes(type)) {
        auxAccounting.push(type);
      }
    } else {
      // 移除辅助核算
      auxAccounting = auxAccounting.filter(item => item !== type);
    }
    
    this.setData({
      'formData.auxAccounting': auxAccounting
    });
  },
  
  // 启用状态变化
  onEnabledChange(e) {
    const { checked } = e.detail;
    
    this.setData({
      'formData.isEnabled': checked
    });
  },
  
  // 末级科目变化
  onLeafChange(e) {
    const { checked } = e.detail;
    
    this.setData({
      'formData.isLeaf': checked
    });
  },
  
  // 保存会计科目
  saveAccount(e) {
    // 验证表单数据
    if (!this.validateForm()) {
      return;
    }
    
    const app = getApp();
    let accounts = app.globalData.accounts || [];
    const { formData, isEdit, accountId } = this.data;
    
    // 计算科目级次
    const level = formData.parentId ? 
      (accounts.find(acc => acc._id === formData.parentId)?.level + 1 || 2) : 1;
    
    // 构造会计科目对象
    const account = {
      _id: isEdit ? accountId : Date.now().toString(),
      code: formData.code,
      name: formData.name,
      category: formData.category,
      parentId: formData.parentId,
      level: level,
      balanceDirection: formData.balanceDirection,
      auxAccounting: formData.auxAccounting,
      isEnabled: formData.isEnabled,
      isLeaf: formData.isLeaf,
      initialBalance: parseFloat(formData.initialBalance) || 0,
      currentDebit: 0,
      currentCredit: 0,
      endingBalance: parseFloat(formData.initialBalance) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (isEdit) {
      // 编辑模式：更新现有科目
      accounts = accounts.map(acc => {
        if (acc._id === accountId) {
          return { ...acc, ...account };
        }
        return acc;
      });
    } else {
      // 新增模式：添加新科目
      accounts.push(account);
    }
    
    // 更新全局数据
    app.globalData.accounts = accounts;
    
    // 保存到本地存储（如果有）
    if (app.saveAccountsToLocal) {
      app.saveAccountsToLocal(accounts);
    }
    
    wx.showToast({
      title: isEdit ? '科目更新成功' : '科目添加成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  // 验证表单数据
  validateForm() {
    const { formData } = this.data;
    
    if (!formData.code) {
      wx.showToast({
        title: '请输入科目代码',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.name) {
      wx.showToast({
        title: '请输入科目名称',
        icon: 'none'
      });
      return false;
    }
    
    // 验证科目代码唯一性（编辑模式除外）
    if (!this.data.isEdit) {
      const app = getApp();
      const accounts = app.globalData.accounts || [];
      if (accounts.some(acc => acc.code === formData.code)) {
        wx.showToast({
          title: '科目代码已存在',
          icon: 'none'
        });
        return false;
      }
    }
    
    return true;
  },
  
  // 取消
  cancel() {
    wx.navigateBack();
  }
});