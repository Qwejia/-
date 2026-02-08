// pages/generalLedger/voucherDetail.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    voucher: null,
    entries: [],
    accounts: []
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.loadVoucherDetail(id);
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 重新加载数据以确保显示最新状态
    const { voucher } = this.data;
    if (voucher) {
      this.loadVoucherDetail(voucher._id);
    }
  },
  
  // 加载凭证详情
  loadVoucherDetail(id) {
    const app = getApp();
    const vouchers = app.getVouchersFromLocal();
    const entries = app.getVoucherEntriesFromLocal();
    
    const voucher = vouchers.find(v => v._id === id);
    const voucherEntries = entries.filter(entry => entry.voucherId === id);
    
    if (!voucher) {
      wx.showToast({
        title: '凭证不存在',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }
    
    this.setData({
      voucher: voucher,
      entries: voucherEntries,
      accounts: app.globalData.accounts || []
    });
  },
  
  // 审核凭证
  approveVoucher() {
    const { voucher } = this.data;
    if (voucher.status === 'approved') {
      wx.showToast({
        title: '凭证已审核',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认审核',
      content: '确定要审核此凭证吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const vouchers = app.getVouchersFromLocal();
          const updatedVouchers = vouchers.map(v => {
            if (v._id === voucher._id) {
              return { ...v, status: 'approved', approvedAt: new Date().toISOString() };
            }
            return v;
          });
          
          app.saveVouchersToLocal(updatedVouchers);
          this.loadVoucherDetail(voucher._id);
          
          wx.showToast({
            title: '凭证已审核',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 记账凭证
  postVoucher() {
    const { voucher } = this.data;
    if (voucher.status !== 'approved') {
      wx.showToast({
        title: '凭证需要先审核',
        icon: 'none'
      });
      return;
    }
    
    if (voucher.status === 'posted') {
      wx.showToast({
        title: '凭证已记账',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认记账',
      content: '确定要记账此凭证吗？记账后不可修改',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const vouchers = app.getVouchersFromLocal();
          const updatedVouchers = vouchers.map(v => {
            if (v._id === voucher._id) {
              return { ...v, status: 'posted', postedAt: new Date().toISOString() };
            }
            return v;
          });
          
          app.saveVouchersToLocal(updatedVouchers);
          this.loadVoucherDetail(voucher._id);
          
          wx.showToast({
            title: '凭证已记账',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 删除凭证
  deleteVoucher() {
    const { voucher } = this.data;
    if (voucher.status === 'approved' || voucher.status === 'posted') {
      wx.showToast({
        title: '已审核/已记账的凭证不能删除',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此凭证吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          // 删除凭证
          let vouchers = app.getVouchersFromLocal();
          vouchers = vouchers.filter(v => v._id !== voucher._id);
          app.saveVouchersToLocal(vouchers);
          
          // 删除凭证分录
          let entries = app.getVoucherEntriesFromLocal();
          entries = entries.filter(entry => entry.voucherId !== voucher._id);
          app.saveVoucherEntriesToLocal(entries);
          
          wx.showToast({
            title: '凭证已删除',
            icon: 'success'
          });
          
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
