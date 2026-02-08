// 财商课堂页面逻辑
Page({
  data: {
    // 搜索关键词
    searchKeyword: '',
    // 推荐课程
    recommendedCourses: [],
    // 精选文章
    featuredArticles: [],
    // 学习进度
    learningProgress: []
  },
  
  onLoad() {
    this.initializePage();
  },
  
  onShow() {
    this.refreshData();
  },
  
  // 初始化页面
  initializePage() {
    this.loadRecommendedCourses();
    this.loadFeaturedArticles();
    this.loadLearningProgress();
  },
  
  // 刷新数据
  refreshData() {
    this.loadRecommendedCourses();
    this.loadFeaturedArticles();
    this.loadLearningProgress();
  },
  
  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },
  
  // 执行搜索
  onSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (keyword) {
      // 这里可以实现搜索逻辑
      wx.showToast({
        title: `搜索: ${keyword}`,
        icon: 'success'
      });
    }
  },
  
  // 导航到课程列表
  navigateToCourses(e) {
    const category = e ? e.currentTarget.dataset.category : '';
    wx.navigateTo({
      url: `/pages/business-education/courses?category=${category}`
    });
  },
  
  // 导航到文章列表
  navigateToArticles() {
    wx.navigateTo({
      url: '/pages/business-education/articles'
    });
  },
  
  // 加载推荐课程
  loadRecommendedCourses() {
    try {
      // 模拟数据
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
        }
      ];
      this.setData({ recommendedCourses: courses });
    } catch (error) {
      console.error('加载推荐课程失败:', error);
      this.setData({ recommendedCourses: [] });
    }
  },
  
  // 加载精选文章
  loadFeaturedArticles() {
    try {
      // 模拟数据
      const articles = [
        {
          id: 1,
          title: '小规模纳税人如何合规避税',
          excerpt: '本文详细介绍小规模纳税人可享受的税收优惠政策，以及如何通过合法手段降低税负...',
          date: '2026-01-20',
          reads: '1,258',
          likes: '89',
          comments: '23',
          author: '税务专家 张明',
          category: 'tax',
          icon: '📝'
        },
        {
          id: 2,
          title: '电商企业成本核算技巧',
          excerpt: '电商企业的成本核算与传统企业有所不同，本文分享电商企业成本核算的实用技巧...',
          date: '2026-01-18',
          reads: '986',
          likes: '67',
          comments: '15',
          author: '财务顾问 王强',
          category: 'ecommerce',
          icon: '💡'
        },
        {
          id: 3,
          title: '如何通过财务报表分析企业经营状况',
          excerpt: '财务报表是企业经营状况的晴雨表，本文教你如何通过财务报表快速分析企业经营状况...',
          date: '2026-01-15',
          reads: '1,567',
          likes: '124',
          comments: '31',
          author: '财务分析师 赵静',
          category: 'finance',
          icon: '📈'
        },
        {
          id: 4,
          title: '创业企业如何做好财务管理',
          excerpt: '创业初期的财务管理至关重要，本文分享创业企业财务管理的核心要点和实用技巧...',
          date: '2026-01-12',
          reads: '1,023',
          likes: '76',
          comments: '19',
          author: '创业导师 李强',
          category: 'startup',
          icon: '🚀'
        }
      ];
      this.setData({ featuredArticles: articles });
    } catch (error) {
      console.error('加载精选文章失败:', error);
      this.setData({ featuredArticles: [] });
    }
  },
  
  // 加载学习进度
  loadLearningProgress() {
    try {
      // 模拟数据
      const progress = [
        {
          id: 1,
          title: '小微企业税收优惠政策解析',
          percentage: 60
        },
        {
          id: 2,
          title: '零基础学账务处理',
          percentage: 85
        }
      ];
      this.setData({ learningProgress: progress });
    } catch (error) {
      console.error('加载学习进度失败:', error);
      this.setData({ learningProgress: [] });
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
  },
  
  // 阅读文章
  readArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '阅读文章',
      icon: 'success'
    });
    // 跳转到文章详情页
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/business-education/article-detail?id=${articleId}`
      });
    }, 500);
  },
  
  // 继续学习
  continueLearning(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '继续学习',
      icon: 'success'
    });
    // 跳转到课程详情页
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/business-education/course-detail?id=${courseId}&continue=true`
      });
    }, 500);
  }
});