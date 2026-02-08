// 文章详情页逻辑
Page({
  data: {
    article: null,
    loading: true
  },

  onLoad(options) {
    const articleId = options.id;
    this.loadArticleDetail(articleId);
  },

  // 加载文章详情
  loadArticleDetail(articleId) {
    this.setData({ loading: true });
    
    // 模拟文章详情数据
    const article = {
      id: articleId,
      title: '小规模纳税人如何合规避税',
      excerpt: '本文详细介绍小规模纳税人可享受的税收优惠政策，以及如何通过合法手段降低税负...',
      content: '本文详细介绍小规模纳税人可享受的税收优惠政策，以及如何通过合法手段降低税负。\n\n一、小规模纳税人的定义\n小规模纳税人是指年销售额不超过500万元的增值税纳税人。\n\n二、小规模纳税人的税收优惠政策\n1. 增值税优惠：月销售额不超过10万元（季度不超过30万元）的小规模纳税人，免征增值税。\n2. 企业所得税优惠：年应纳税所得额不超过300万元的小型微利企业，减按20%的税率征收企业所得税。\n3. 印花税优惠：对金融机构与小型、微型企业签订的借款合同免征印花税。\n\n三、合法避税的方法\n1. 合理利用税收优惠政策\n2. 规范会计核算\n3. 合理规划企业架构\n4. 及时申报纳税\n\n四、注意事项\n1. 合法合规是前提\n2. 保留完整的税务资料\n3. 及时了解税收政策变化\n\n通过以上方法，小规模纳税人可以在合法合规的前提下，有效降低企业税负，提高企业盈利能力。',
      date: '2026-01-20',
      reads: '1,258',
      likes: '89',
      comments: '23',
      author: '税务专家 张明',
      category: 'tax',
      icon: '📝'
    };
    
    // 根据ID获取对应文章
    if (articleId == 2) {
      article.title = '电商企业成本核算技巧';
      article.excerpt = '电商企业的成本核算与传统企业有所不同，本文分享电商企业成本核算的实用技巧...';
      article.content = '电商企业的成本核算与传统企业有所不同，本文分享电商企业成本核算的实用技巧。\n\n一、电商企业成本的特点\n1. 成本构成复杂\n2. 订单量大数据量大\n3. 退换货频繁\n\n二、电商企业成本核算方法\n1. 品种法\n2. 分批法\n3. 分步法\n\n三、电商企业成本核算的实用技巧\n1. 建立完善的成本核算体系\n2. 利用信息化工具提高核算效率\n3. 加强对间接成本的分摊\n4. 定期进行成本分析\n\n四、成本控制策略\n1. 优化采购流程\n2. 降低物流成本\n3. 提高库存周转率\n4. 加强人力资源管理\n\n通过以上方法，电商企业可以更加准确地核算成本，为企业的经营决策提供可靠的依据。';
      article.date = '2026-01-18';
      article.reads = '986';
      article.likes = '67';
      article.comments = '15';
      article.author = '财务顾问 王强';
      article.category = 'ecommerce';
      article.icon = '💡';
    } else if (articleId == 3) {
      article.title = '如何通过财务报表分析企业经营状况';
      article.excerpt = '财务报表是企业经营状况的晴雨表，本文教你如何通过财务报表快速分析企业经营状况...';
      article.content = '财务报表是企业经营状况的晴雨表，本文教你如何通过财务报表快速分析企业经营状况。\n\n一、财务报表的构成\n1. 资产负债表\n2. 利润表\n3. 现金流量表\n\n二、资产负债表分析\n1. 资产结构分析\n2. 负债结构分析\n3. 所有者权益分析\n4. 偿债能力分析\n\n三、利润表分析\n1. 收入分析\n2. 成本费用分析\n3. 盈利能力分析\n4. 利润质量分析\n\n四、现金流量表分析\n1. 经营活动现金流量分析\n2. 投资活动现金流量分析\n3. 筹资活动现金流量分析\n4. 现金流量质量分析\n\n五、财务比率分析\n1. 偿债能力比率\n2. 运营能力比率\n3. 盈利能力比率\n4. 发展能力比率\n\n通过以上方法，你可以快速分析企业的经营状况，做出正确的经营决策。';
      article.date = '2026-01-15';
      article.reads = '1,567';
      article.likes = '124';
      article.comments = '31';
      article.author = '财务分析师 赵静';
      article.category = 'finance';
      article.icon = '📈';
    }
    
    this.setData({ 
      article: article,
      loading: false 
    });
  },

  // 点赞文章
  likeArticle() {
    const article = this.data.article;
    article.likes = parseInt(article.likes) + 1;
    this.setData({ article });
    wx.showToast({
      title: '点赞成功',
      icon: 'success'
    });
  },

  // 分享文章
  shareArticle() {
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