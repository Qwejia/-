// 采购订单列表页面逻辑
Page({
  data: {
    orders: [],
    filteredOrders: [],
    searchKeyword: '',
    statusFilter: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    statuses: ['', '待处理', '已完成', '处理中']
  },

  onLoad() {
    this.loadOrders();
  },

  // 加载采购订单
  loadOrders() {
    // 加载模拟数据
    const { purchaseOrdersData } = require('../../data/supplyChainData');
    this.setData({
      orders: purchaseOrdersData,
      filteredOrders: purchaseOrdersData
    });
    this.filterOrders();
  },

  // 搜索订单
  handleSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterOrders();
  },

  // 选择订单状态
  handleStatusChange(e) {
    this.setData({
      statusFilter: e.detail.value
    });
    this.filterOrders();
  },

  // 排序订单
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
    this.filterOrders();
  },

  // 过滤和排序订单
  filterOrders() {
    let { orders, searchKeyword, statusFilter, sortBy, sortOrder } = this.data;

    // 搜索过滤
    if (searchKeyword) {
      orders = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter) {
      const statusMap = {
        '待处理': 'pending',
        '已完成': 'completed',
        '处理中': 'processing'
      };
      orders = orders.filter(order => order.status === statusMap[statusFilter]);
    }

    // 排序
    orders.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'orderNumber':
          compareValue = a.orderNumber.localeCompare(b.orderNumber);
          break;
        case 'supplierName':
          compareValue = a.supplierName.localeCompare(b.supplierName);
          break;
        case 'orderDate':
          compareValue = new Date(a.orderDate) - new Date(b.orderDate);
          break;
        case 'totalAmount':
          compareValue = a.totalAmount - b.totalAmount;
          break;
        case 'createdAt':
        default:
          compareValue = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    this.setData({
      filteredOrders: orders
    });
  },

  // 跳转到订单详情
  goToOrderDetail(e) {
    const { orderId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/purchase/orderDetail?id=${orderId}`
    });
  },

  // 跳转到订单新增
  goToOrderAdd() {
    wx.navigateTo({
      url: '/pages/purchase/orderAdd'
    });
  }
});