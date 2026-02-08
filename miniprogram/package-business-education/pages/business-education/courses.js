// pages/business-education/courses.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    courses: [],
    filteredCourses: [],
    categories: [
      { id: 'all', name: '全部' },
      { id: 'tax', name: '税务筹划' },
      { id: 'accounting', name: '账务处理' },
      { id: 'finance', name: '财务管理' },
      { id: 'business', name: '经营分析' },
      { id: 'ecommerce', name: '电商财务' },
      { id: 'startup', name: '创业财务' },
      { id: 'investment', name: '投资分析' },
      { id: 'risk', name: '风险控制' }
    ],
    selectedCategory: 'all',
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取传入的分类参数
    if (options.category) {
      this.setData({ selectedCategory: options.category });
    }
    this.loadCourses();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadCourses();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 加载课程数据
  loadCourses() {
    this.setData({ loading: true });
    
    // 模拟课程数据
    const courses = [
      {
        id: 1,
        title: '小微企业税收优惠政策解析',
        description: '详解2026年小微企业最新税收优惠政策，帮助企业合理节税',
        author: '税务专家 张明',
        duration: '45分钟',
        price: '0',
        isFree: true,
        icon: '📋',
        rating: 4.8,
        students: '2,580',
        level: '初级',
        category: 'tax'
      },
      {
        id: 2,
        title: '零基础学账务处理',
        description: '从入门到精通，掌握小微企业日常账务处理技巧',
        author: '会计师 李华',
        duration: '60分钟',
        price: '0',
        isFree: true,
        icon: '📊',
        rating: 4.9,
        students: '3,240',
        level: '初级',
        category: 'accounting'
      },
      {
        id: 3,
        title: '电商企业成本核算实战',
        description: '针对电商企业特点，讲解成本核算方法和优化策略',
        author: '财务顾问 王强',
        duration: '50分钟',
        price: '0',
        isFree: true,
        icon: '💰',
        rating: 4.7,
        students: '1,890',
        level: '中级',
        category: 'ecommerce'
      },
      {
        id: 4,
        title: '财务报表分析实战',
        description: '教你如何通过财务报表分析企业经营状况，做出正确决策',
        author: '财务分析师 赵静',
        duration: '55分钟',
        price: '0',
        isFree: true,
        icon: '📈',
        rating: 4.6,
        students: '1,560',
        level: '中级',
        category: 'business'
      },
      {
        id: 5,
        title: '创业企业如何做好财务管理',
        description: '创业初期的财务管理至关重要，本文分享创业企业财务管理的核心要点和实用技巧',
        author: '创业导师 李强',
        duration: '40分钟',
        price: '0',
        isFree: true,
        icon: '🚀',
        rating: 4.5,
        students: '1,230',
        level: '初级',
        category: 'startup'
      },
      {
        id: 6,
        title: '投资分析基础',
        description: '学习投资分析的基本方法和技巧，提高投资决策能力',
        author: '投资顾问 陈宇',
        duration: '50分钟',
        price: '0',
        isFree: true,
        icon: '💹',
        rating: 4.4,
        students: '980',
        level: '中级',
        category: 'investment'
      },
      {
        id: 7,
        title: '企业财务风险控制',
        description: '识别和控制企业财务风险，保障企业健康发展',
        author: '风控专家 刘芳',
        duration: '45分钟',
        price: '0',
        isFree: true,
        icon: '🛡️',
        rating: 4.7,
        students: '1,120',
        level: '中级',
        category: 'risk'
      },
      {
        id: 8,
        title: '企业成本控制策略',
        description: '学习企业成本控制的有效方法，提高企业盈利能力',
        author: '成本管理专家 张伟',
        duration: '55分钟',
        price: '0',
        isFree: true,
        icon: '📊',
        rating: 4.6,
        students: '1,350',
        level: '中级',
        category: 'finance'
      }
    ];
    
    this.setData({ 
      courses: courses,
      filteredCourses: courses,
      loading: false 
    });
    
    // 如果有分类参数，筛选课程
    if (this.data.selectedCategory !== 'all') {
      this.filterCourses(this.data.selectedCategory);
    }
  },

  // 筛选课程
  filterCourses(e) {
    // 支持两种调用方式：事件对象或直接的categoryId
    let categoryId;
    if (typeof e === 'object' && e.currentTarget) {
      categoryId = e.currentTarget.dataset.categoryId;
    } else {
      categoryId = e;
    }
    
    this.setData({ selectedCategory: categoryId });
    
    if (categoryId === 'all') {
      this.setData({ filteredCourses: this.data.courses });
    } else {
      const filtered = this.data.courses.filter(course => course.category === categoryId);
      this.setData({ filteredCourses: filtered });
    }
  },

  // 报名/学习课程
  enrollCourse(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '开始学习课程',
      icon: 'success'
    });
    // 跳转到课程详情页
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/business-education/course-detail?id=${courseId}`
      });
    }, 500);
  }
})