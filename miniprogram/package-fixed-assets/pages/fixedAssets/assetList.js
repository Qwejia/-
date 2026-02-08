// 资产列表页面逻辑
Page({
  data: {
    assets: [],
    filteredAssets: [],
    searchKeyword: '',
    categoryFilter: '',
    statusFilter: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    categories: ['', '房屋及建筑物', '机器设备', '运输工具', '电子设备', '办公设备'],
    statuses: ['', '在用', '闲置', '报废', '出售']
  },

  onLoad() {
    this.loadAssets();
  },

  onShow() {
    this.loadAssets();
  },

  // 加载资产数据
  loadAssets() {
    // 加载模拟数据
    const fixedAssetsData = require('../../../data/fixedAssetsData');
    this.setData({
      assets: fixedAssetsData,
      filteredAssets: fixedAssetsData
    });
    this.filterAssets();
  },

  // 搜索资产
  handleSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterAssets();
  },

  // 选择资产类别
  handleCategoryChange(e) {
    this.setData({
      categoryFilter: e.detail.value
    });
    this.filterAssets();
  },

  // 选择资产状态
  handleStatusChange(e) {
    this.setData({
      statusFilter: e.detail.value
    });
    this.filterAssets();
  },

  // 排序资产
  handleSortChange(e) {
    const sortBy = e.detail.value;
    let sortOrder = 'asc';
    if (this.data.sortBy === sortBy) {
      sortOrder = this.data.sortOrder === 'asc' ? 'desc' : 'asc';
    }
    this.setData({
      sortBy,
      sortOrder
    });
    this.filterAssets();
  },

  // 过滤和排序资产
  filterAssets() {
    let { assets, searchKeyword, categoryFilter, statusFilter, sortBy, sortOrder } = this.data;

    // 搜索过滤
    if (searchKeyword) {
      assets = assets.filter(asset => 
        asset.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 类别过滤
    if (categoryFilter) {
      assets = assets.filter(asset => asset.category === categoryFilter);
    }

    // 状态过滤
    if (statusFilter) {
      const statusMap = {
        '在用': 'inUse',
        '闲置': 'idle',
        '报废': 'scrapped',
        '出售': 'sold'
      };
      assets = assets.filter(asset => asset.status === statusMap[statusFilter]);
    }

    // 排序
    assets.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'originalValue':
          compareValue = a.originalValue - b.originalValue;
          break;
        case 'purchaseDate':
          compareValue = new Date(a.purchaseDate) - new Date(b.purchaseDate);
          break;
        case 'createdAt':
        default:
          compareValue = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    this.setData({
      filteredAssets: assets
    });
  },

  // 跳转到资产详情
  goToAssetDetail(e) {
    const { assetId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/fixedAssets/assetDetail?id=${assetId}`
    });
  },

  // 跳转到资产新增
  goToAssetAdd() {
    wx.navigateTo({
      url: '/pages/fixedAssets/assetAdd'
    });
  },

  // 跳转到折旧计提
  goToDepreciation() {
    wx.navigateTo({
      url: '/pages/fixedAssets/depreciation'
    });
  }
});