// pages/generalLedger/checkout.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    checkoutRecords: [],
    isLoading: false,
    message: '',
    showMessage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadCheckoutRecords();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadCheckoutRecords();
  },

  /**
   * 加载结账记录
   */
  loadCheckoutRecords() {
    const checkoutRecords = app.getCheckoutRecordsFromLocal();
    
    // 按年份和月份排序，最新的在前面
    checkoutRecords.sort((a, b) => {
      const dateA = new Date(a.year, a.month, 1);
      const dateB = new Date(b.year, b.month, 1);
      return dateB - dateA;
    });
    
    this.setData({
      checkoutRecords
    });
  },

  /**
   * 选择年份
   */
  onYearChange(e) {
    this.setData({
      currentYear: parseInt(e.detail.value)
    });
  },

  /**
   * 选择月份
   */
  onMonthChange(e) {
    this.setData({
      currentMonth: parseInt(e.detail.value)
    });
  },

  /**
   * 进行期末结账
   */
  doCheckout() {
    const { currentYear, currentMonth } = this.data;
    
    this.setData({
      isLoading: true,
      message: '',
      showMessage: false
    });
    
    try {
      // 调用期末结账方法
      const result = app.monthEndCheckout(currentYear, currentMonth);
      
      this.setData({
        message: `${currentYear}年${currentMonth}月结账成功！`,
        showMessage: true
      });
      
      // 重新加载结账记录
      this.loadCheckoutRecords();
      
    } catch (error) {
      this.setData({
        message: `结账失败：${error.message}`,
        showMessage: true
      });
    } finally {
      this.setData({
        isLoading: false
      });
    }
  },

  /**
   * 关闭提示消息
   */
  closeMessage() {
    this.setData({
      showMessage: false
    });
  }
});