// 销售订单新增页面逻辑
Page({
  data: {
    orderForm: {
      customerId: '',
      customerName: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      remark: ''
    },
    orderItems: [
      {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }
    ],
    loading: false,
    customers: []
  },

  onLoad() {
    this.loadCustomers();
  },

  // 加载客户列表
  loadCustomers() {
    const { customersData } = require('../../data/supplyChainData');
    this.setData({ customers: customersData });
  },

  // 更新订单表单
  updateOrderForm(e) {
    const { key } = e.currentTarget.dataset;
    const value = e.detail.value;
    const orderForm = { ...this.data.orderForm };
    orderForm[key] = value;
    this.setData({ orderForm });
  },

  // 更新订单商品
  updateOrderItem(e) {
    const { index, key } = e.currentTarget.dataset;
    const value = e.detail.value;
    const orderItems = [...this.data.orderItems];
    
    if (key === 'quantity' || key === 'unitPrice') {
      orderItems[index][key] = parseFloat(value) || 0;
      orderItems[index].amount = orderItems[index].quantity * orderItems[index].unitPrice;
    } else {
      orderItems[index][key] = value;
    }
    
    this.setData({ orderItems });
  },

  // 添加商品行
  addOrderItem() {
    const orderItems = [...this.data.orderItems];
    orderItems.push({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    });
    this.setData({ orderItems });
  },

  // 删除商品行
  deleteOrderItem(e) {
    const { index } = e.currentTarget.dataset;
    const orderItems = [...this.data.orderItems];
    if (orderItems.length > 1) {
      orderItems.splice(index, 1);
      this.setData({ orderItems });
    }
  },

  // 提交订单
  submitOrder() {
    wx.showLoading({ title: '提交订单中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '订单已提交', icon: 'success' });
      
      // 跳回订单列表
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1500);
  }
});