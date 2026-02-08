// pages/shared-accounting/accountant-detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountant: {
      id: '',
      name: '',
      avatar: '',
      title: '',
      rating: 0,
      experience: 0,
      responseTime: '',
      priceRange: '',
      specialties: [],
      bio: '',
      reviews: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const accountantId = options.id;
    this.loadAccountantData(accountantId);
  },

  /**
   * 加载会计数据
   */
  loadAccountantData(accountantId) {
    // 模拟会计数据
    const accountants = [
      {
        id: '1',
        name: '张会计',
        avatar: '张',
        title: '高级会计师',
        rating: 4.9,
        experience: 8,
        responseTime: '1小时内',
        priceRange: '300-500',
        specialties: ['税务申报', '账务处理', '财务分析'],
        bio: '拥有8年财务工作经验，曾在大型企业担任财务主管，熟悉各类企业的财务处理和税务筹划。专业知识扎实，服务态度好，深受客户好评。',
        reviews: [
          {
            reviewerName: '李总',
            rating: 5,
            date: '2026-01-20',
            content: '张会计专业水平很高，处理税务问题非常熟练，节省了我们公司很多时间和成本。',
            service: '税务申报'
          },
          {
            reviewerName: '王经理',
            rating: 4.5,
            date: '2026-01-15',
            content: '服务态度很好，响应及时，财务分析报告做的很详细，对我们公司的发展很有帮助。',
            service: '财务分析'
          }
        ]
      },
      {
        id: '2',
        name: '李会计',
        avatar: '李',
        title: '注册会计师',
        rating: 4.8,
        experience: 10,
        responseTime: '30分钟内',
        priceRange: '500-800',
        specialties: ['财务审计', '税务筹划', '企业咨询'],
        bio: '注册会计师，10年以上财务审计经验，曾在四大会计师事务所工作，熟悉各类企业的审计流程和财务规范。提供专业的财务审计和咨询服务。',
        reviews: [
          {
            reviewerName: '赵总',
            rating: 5,
            date: '2026-01-18',
            content: '李会计审计经验丰富，工作认真负责，审计报告质量很高，帮助我们公司发现了很多财务问题并提供了解决方案。',
            service: '财务审计'
          }
        ]
      },
      {
        id: '3',
        name: '王会计',
        avatar: '王',
        title: '中级会计师',
        rating: 4.7,
        experience: 5,
        responseTime: '2小时内',
        priceRange: '200-400',
        specialties: ['账务处理', '税务申报', '成本核算'],
        bio: '5年财务工作经验，熟悉中小企业的财务处理和税务申报流程，服务价格合理，态度热情，为客户提供专业的财务服务。',
        reviews: [
          {
            reviewerName: '陈总',
            rating: 4.5,
            date: '2026-01-10',
            content: '王会计服务态度很好，账务处理很仔细，价格也很合理，是我们公司的长期合作伙伴。',
            service: '账务处理'
          }
        ]
      },
      {
        id: '4',
        name: '刘会计',
        avatar: '刘',
        title: '税务专家',
        rating: 4.9,
        experience: 12,
        responseTime: '45分钟内',
        priceRange: '600-1000',
        specialties: ['税务筹划', '税务咨询', '税务争议解决'],
        bio: '12年税务工作经验，曾在税务局工作，熟悉国家税收政策和法规，擅长为企业进行税务筹划，降低税务风险和成本。',
        reviews: [
          {
            reviewerName: '孙总',
            rating: 5,
            date: '2026-01-22',
            content: '刘会计税务知识非常专业，为我们公司制定的税务筹划方案节省了大量税款，非常感谢！',
            service: '税务筹划'
          },
          {
            reviewerName: '周总',
            rating: 5,
            date: '2026-01-16',
            content: '刘会计对税务政策的理解很深入，帮助我们解决了一个复杂的税务争议问题，避免了大额罚款。',
            service: '税务争议解决'
          }
        ]
      },
      {
        id: '5',
        name: '陈会计',
        avatar: '陈',
        title: '财务顾问',
        rating: 4.6,
        experience: 7,
        responseTime: '1.5小时内',
        priceRange: '300-600',
        specialties: ['财务咨询', '预算编制', '资金管理'],
        bio: '7年财务顾问经验，为多家企业提供财务咨询服务，擅长预算编制和资金管理，帮助企业优化财务流程，提高资金使用效率。',
        reviews: [
          {
            reviewerName: '吴总',
            rating: 4.5,
            date: '2026-01-12',
            content: '陈会计的财务咨询很有价值，为我们公司制定的预算方案很合理，帮助我们更好地控制成本。',
            service: '预算编制'
          }
        ]
      }
    ];

    const accountant = accountants.find(a => a.id === accountantId) || accountants[0];
    this.setData({
      accountant
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 联系会计
   */
  contactAccountant() {
    wx.showModal({
      title: '联系会计',
      content: `确定要联系 ${this.data.accountant.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已发送联系请求',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 预约会计
   */
  hireAccountant() {
    wx.navigateTo({
      url: '/pages/shared-accounting/post-task?accountantId=' + this.data.accountant.id
    });
  }
});