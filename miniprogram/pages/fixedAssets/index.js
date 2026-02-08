// 固定资产模块首页逻辑
Page({
  data: {
    assets: [],
    totalAssets: 0,
    totalDepreciation: 0,
    assetCategories: [
      { id: '1', name: '房屋及建筑物', icon: '🏠' },
      { id: '2', name: '机器设备', icon: '🏭' },
      { id: '3', name: '运输工具', icon: '🚗' },
      { id: '4', name: '电子设备', icon: '💻' },
      { id: '5', name: '办公设备', icon: '📱' }
    ],
    menuItems: [
      { id: '1', name: '资产新增', icon: '➕', url: '/pages/fixedAssets/assetAdd' },
      { id: '2', name: '资产列表', icon: '📋', url: '/pages/fixedAssets/assetList' },
      { id: '3', name: '折旧计提', icon: '📉', url: '/pages/fixedAssets/depreciation' },
      { id: '4', name: '资产变动', icon: '🔄', url: '/pages/fixedAssets/assetChange' },
      { id: '5', name: '资产处置', icon: '❌', url: '/pages/fixedAssets/assetDispose' },
      { id: '6', name: '资产报表', icon: '📊', url: '/pages/fixedAssets/assetReport' }
    ]
  },

  onLoad() {
    this.loadAssets();
  },

  onShow() {
    this.loadAssets();
  },

  // 加载固定资产数据
  loadAssets() {
    const app = getApp();
    const assets = app.getData('fixedAssets') || [];
    
    // 计算资产总值和累计折旧
    let totalAssets = 0;
    let totalDepreciation = 0;
    
    assets.forEach(asset => {
      totalAssets += asset.originalValue;
      totalDepreciation += asset.accumulatedDepreciation;
    });

    // 计算净值
    const netAssets = totalAssets - totalDepreciation;

    this.setData({
      assets,
      totalAssets,
      totalDepreciation,
      netAssets
    });
  },

  // 跳转到功能页面
  navigateToPage(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    });
  },

  // 跳转到资产详情
  goToAssetDetail(e) {
    const { assetId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/fixedAssets/assetDetail?id=${assetId}`
    });
  }
});