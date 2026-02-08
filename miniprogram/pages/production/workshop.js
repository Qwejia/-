// 车间管理页面逻辑
Page({
  data: {
    workshops: [],
    workshopOrders: [],
    loading: false
  },

  onLoad() {
    this.loadWorkshopData();
  },

  // 加载车间数据
  loadWorkshopData() {
    this.setData({ loading: true });
    
    setTimeout(() => {
      const { workshopsData, workshopOrdersData } = require('../../data/productionData');
      this.setData({
        workshops: workshopsData,
        workshopOrders: workshopOrdersData,
        loading: false
      });
    }, 1000);
  },

  // 查看车间详情
  viewWorkshopDetail(e) {
    const { workshopId } = e.currentTarget.dataset;
    const workshop = this.data.workshops.find(item => item.workshopId === workshopId);
    
    wx.showModal({
      title: '车间详情',
      content: `车间名称: ${workshop.name}\n车间编码: ${workshop.workshopId}\n车间主管: ${workshop.managerName}\n车间描述: ${workshop.description}`,
      showCancel: false
    });
  },

  // 查看工单详情
  viewWorkshopOrderDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    const order = this.data.workshopOrders.find(item => item._id === orderId);
    
    wx.showModal({
      title: '工单详情',
      content: `工单编号: ${order.orderNumber}\n产品名称: ${order.productName}\n计划数量: ${order.quantity}\n已完成: ${order.completedQuantity}\n状态: ${order.status === 'completed' ? '已完成' : order.status === 'inProgress' ? '进行中' : '待开始'}`,
      showCancel: false
    });
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadWorkshopData();
    wx.stopPullDownRefresh();
  }
});