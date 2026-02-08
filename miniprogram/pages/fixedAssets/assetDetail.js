// 资产详情页面逻辑
Page({
  data: {
    asset: null
  },

  onLoad(options) {
    const { id } = options;
    this.loadAssetDetail(id);
  },

  // 加载资产详情
  loadAssetDetail(id) {
    // 加载模拟数据
    const fixedAssetsData = require('../../../data/fixedAssetsData');
    const asset = fixedAssetsData.find(asset => asset._id === id);
    if (asset) {
      this.setData({ asset });
    } else {
      wx.showToast({
        title: '资产不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    }
  },

  // 返回列表
  goBack() {
    wx.navigateBack();
  },

  // 编辑资产
  editAsset() {
    const { _id } = this.data.asset;
    wx.navigateTo({
      url: `/pages/fixedAssets/assetEdit?id=${_id}`
    });
  },

  // 计提折旧
  calculateDepreciation() {
    wx.showModal({
      title: '计提折旧',
      content: '确定要对该资产计提折旧吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟计提折旧
          wx.showToast({
            title: '折旧计提成功',
            icon: 'success'
          });
          // 重新加载数据
          const { _id } = this.data.asset;
          this.loadAssetDetail(_id);
        }
      }
    });
  }
});