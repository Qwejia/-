// 物料清单页面逻辑
Page({
  data: {
    billOfMaterials: [],
    loading: false
  },

  onLoad() {
    this.loadBillOfMaterials();
  },

  // 加载物料清单
  loadBillOfMaterials() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { billOfMaterialsData } = require('../../data/productionData');
      this.setData({
        billOfMaterials: billOfMaterialsData,
        loading: false
      });
    }, 1000);
  },

  // 查看物料清单详情
  viewBOMDetail(e) {
    const { bomId } = e.currentTarget.dataset;
    const bom = this.data.billOfMaterials.find(item => item._id === bomId);
    
    let content = `物料清单编号: ${bom.bomNumber}\n产品名称: ${bom.productName}\n\n物料明细:\n`;
    bom.items.forEach((item, index) => {
      content += `${index + 1}. ${item.materialName} (${item.spec}) - ${item.quantity} ${item.unit}\n`;
    });
    
    wx.showModal({
      title: '物料清单详情',
      content: content,
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 导出物料清单
  exportBOM() {
    wx.showLoading({ title: '导出物料清单中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '物料清单已导出', icon: 'success' });
    }, 1500);
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadBillOfMaterials();
    wx.stopPullDownRefresh();
  }
});