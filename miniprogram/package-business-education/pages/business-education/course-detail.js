// 课程详情页逻辑
Page({
  data: {
    course: null,
    loading: true
  },

  onLoad(options) {
    const courseId = options.id;
    this.loadCourseDetail(courseId);
  },

  // 加载课程详情
  loadCourseDetail(courseId) {
    this.setData({ loading: true });
    
    // 模拟课程详情数据
    const course = {
      id: courseId,
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
      category: 'accounting',
      chapters: [
        {
          id: 1,
          title: '课程介绍',
          duration: '5分钟',
          description: '了解课程内容和学习目标'
        },
        {
          id: 2,
          title: '账务处理基础',
          duration: '15分钟',
          description: '掌握账务处理的基本概念和流程'
        },
        {
          id: 3,
          title: '凭证填制',
          duration: '15分钟',
          description: '学习如何正确填制会计凭证'
        },
        {
          id: 4,
          title: '账簿登记',
          duration: '15分钟',
          description: '掌握各种账簿的登记方法'
        },
        {
          id: 5,
          title: '财务报表编制',
          duration: '10分钟',
          description: '学习如何编制基本财务报表'
        }
      ],
      requirements: '零基础即可学习',
      whatYouLearn: [
        '掌握账务处理的基本概念和流程',
        '学会正确填制会计凭证',
        '掌握各种账簿的登记方法',
        '学会编制基本财务报表',
        '了解小微企业财务管理的基本要求'
      ]
    };
    
    // 根据ID获取对应课程
    if (courseId == 2) {
      course.title = '电商企业成本核算实战';
      course.description = '针对电商企业特点，讲解成本核算方法和优化策略';
      course.author = '财务顾问 王强';
      course.duration = '50分钟';
      course.rating = 4.7;
      course.students = '1,890';
      course.level = '中级';
      course.category = 'ecommerce';
      course.icon = '💰';
    } else if (courseId == 3) {
      course.title = '财务报表分析实战';
      course.description = '教你如何通过财务报表分析企业经营状况，做出正确决策';
      course.author = '财务分析师 赵静';
      course.duration = '55分钟';
      course.rating = 4.6;
      course.students = '1,560';
      course.level = '中级';
      course.category = 'business';
      course.icon = '📈';
    }
    
    this.setData({ 
      course: course,
      loading: false 
    });
  },

  // 开始学习
  startLearning() {
    wx.showToast({
      title: '开始学习课程',
      icon: 'success'
    });
  },

  // 分享课程
  shareCourse() {
    wx.showToast({
      title: '分享成功',
      icon: 'success'
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});