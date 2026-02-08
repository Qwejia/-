// 资产新增页面逻辑
Page({
  data: {
    assetName: '',
    category: '',
    originalValue: '',
    usefulLife: '',
    depreciationMethod: 'straightLine',
    purchaseDate: '',
    supplier: '',
    department: '',
    location: '',
    description: '',
    loading: false,
    error: '',
    success: ''
  },

  onLoad() {
    const today = new Date().toISOString().split('T')[0];
    this.setData({
      purchaseDate: today
    });
  },

  // 输入资产名称
  handleAssetNameInput(e) {
    this.setData({
      assetName: e.detail.value
    });
  },

  // 选择资产类别
  handleCategoryChange(e) {
    this.setData({
      category: e.detail.value
    });
  },

  // 输入原值
  handleOriginalValueInput(e) {
    this.setData({
      originalValue: e.detail.value
    });
  },

  // 输入使用年限
  handleUsefulLifeInput(e) {
    this.setData({
      usefulLife: e.detail.value
    });
  },

  // 选择折旧方法
  handleDepreciationMethodChange(e) {
    this.setData({
      depreciationMethod: e.detail.value
    });
  },

  // 选择购买日期
  handlePurchaseDateChange(e) {
    this.setData({
      purchaseDate: e.detail.value
    });
  },

  // 输入供应商
  handleSupplierInput(e) {
    this.setData({
      supplier: e.detail.value
    });
  },

  // 输入使用部门
  handleDepartmentInput(e) {
    this.setData({
      department: e.detail.value
    });
  },

  // 输入存放地点
  handleLocationInput(e) {
    this.setData({
      location: e.detail.value
    });
  },

  // 输入描述
  handleDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    });
  },

  // 保存资产
  saveAsset() {
    const { assetName, category, originalValue, usefulLife, depreciationMethod, purchaseDate } = this.data;
    
    // 表单验证
    if (!assetName || !category || !originalValue || !usefulLife || !purchaseDate) {
      this.setData({
        error: '请填写所有必填字段'
      });
      return;
    }

    if (parseFloat(originalValue) <= 0) {
      this.setData({
        error: '原值必须大于0'
      });
      return;
    }

    if (parseInt(usefulLife) <= 0) {
      this.setData({
        error: '使用年限必须大于0'
      });
      return;
    }

    this.setData({
      loading: true,
      error: '',
      success: ''
    });

    // 模拟保存请求
    setTimeout(() => {
      const app = getApp();
      const assets = app.getData('fixedAssets') || [];
      
      // 创建资产对象
      const asset = {
        _id: Date.now().toString(),
        name: assetName,
        category: category,
        originalValue: parseFloat(originalValue),
        usefulLife: parseInt(usefulLife),
        depreciationMethod: depreciationMethod,
        purchaseDate: purchaseDate,
        supplier: this.data.supplier,
        department: this.data.department,
        location: this.data.location,
        description: this.data.description,
        accumulatedDepreciation: 0,
        netValue: parseFloat(originalValue),
        status: 'inUse',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 保存到本地存储
      assets.push(asset);
      app.saveData('fixedAssets', assets);

      this.setData({
        loading: false,
        success: '资产新增成功',
        assetName: '',
        category: '',
        originalValue: '',
        usefulLife: '',
        depreciationMethod: 'straightLine',
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        department: '',
        location: '',
        description: ''
      });

      // 3秒后跳转到资产列表页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/fixedAssets/assetList'
        });
      }, 1500);
    }, 1000);
  },

  // 取消并返回
  cancel() {
    wx.navigateBack({
      delta: 1
    });
  }
});