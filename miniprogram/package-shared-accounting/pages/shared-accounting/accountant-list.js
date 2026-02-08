// 会计列表页面逻辑
Page({
  data: {
    // 会计列表
    accountants: [],
    // 筛选后的会计列表
    filteredAccountants: [],
    // 筛选状态
    showSpecialtyFilter: false,
    showRatingFilter: false,
    showPriceFilter: false,
    // 筛选选项
    specialtyOptions: [
      { id: '1', label: '税务筹划', value: '税务筹划' },
      { id: '2', label: '账务处理', value: '账务处理' },
      { id: '3', label: '财务审计', value: '财务审计' },
      { id: '4', label: '财务咨询', value: '财务咨询' },
      { id: '5', label: '全部专长', value: '' }
    ],
    // 当前筛选条件
    selectedSpecialty: '',
    ratingSort: 'desc', // desc 降序, asc 升序
    priceSort: 'asc' // asc 升序, desc 降序
  },
  
  onLoad() {
    this.initializePage();
  },
  
  onShow() {
    this.loadAccountants();
  },
  
  // 初始化页面
  initializePage() {
    this.loadAccountants();
  },
  
  // 加载会计列表
  loadAccountants() {
    try {
      // 模拟数据
      const accountants = [
        {
          id: '1',
          name: '张会计',
          avatar: '张',
          rating: 4.9,
          specialty: '税务筹划、账务处理',
          experience: 8,
          completedTasks: 156,
          price: 200,
          description: '注册会计师，拥有8年企业财税服务经验，擅长税务筹划和账务处理，为多家中小企业提供专业服务。',
          certifications: ['注册会计师', '税务师'],
          reviews: [
            { id: '1', user: '李总', content: '服务专业，效率高，税务筹划方案很实用。', rating: 5, date: '2026-01-20' },
            { id: '2', user: '王总', content: '账务处理很细致，值得推荐。', rating: 4, date: '2026-01-15' }
          ]
        },
        {
          id: '2',
          name: '李会计',
          avatar: '李',
          rating: 4.8,
          specialty: '财务审计、税务申报',
          experience: 10,
          completedTasks: 218,
          price: 250,
          description: '资深审计师，10年财务审计经验，熟悉企业财务流程和审计规范，提供专业的审计服务。',
          certifications: ['注册会计师', '审计师'],
          reviews: [
            { id: '3', user: '赵总', content: '审计报告专业详细，非常满意。', rating: 5, date: '2026-01-18' }
          ]
        },
        {
          id: '3',
          name: '王会计',
          avatar: '王',
          rating: 4.7,
          specialty: '小微企业财务咨询',
          experience: 6,
          completedTasks: 98,
          price: 180,
          description: '专注于小微企业财务咨询，熟悉小微企业财务特点和税收优惠政策，提供个性化的财务解决方案。',
          certifications: ['中级会计师'],
          reviews: []
        },
        {
          id: '4',
          name: '刘会计',
          avatar: '刘',
          rating: 4.6,
          specialty: '税务申报、账务处理',
          experience: 5,
          completedTasks: 85,
          price: 160,
          description: '5年财税服务经验，擅长税务申报和日常账务处理，服务态度好，价格实惠。',
          certifications: ['中级会计师'],
          reviews: []
        },
        {
          id: '5',
          name: '陈会计',
          avatar: '陈',
          rating: 4.9,
          specialty: '财务分析、投资咨询',
          experience: 12,
          completedTasks: 186,
          price: 300,
          description: '资深财务分析师，12年经验，擅长财务分析和投资咨询，为企业提供战略财务规划。',
          certifications: ['注册会计师', '高级会计师'],
          reviews: []
        }
      ];
      
      this.setData({ 
        accountants,
        filteredAccountants: accountants
      });
    } catch (error) {
      console.error('加载会计列表失败:', error);
      this.setData({ 
        accountants: [],
        filteredAccountants: []
      });
    }
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  },
  
  // 切换筛选弹窗
  toggleFilter(e) {
    const type = e.currentTarget.dataset.type;
    
    // 重置所有筛选弹窗状态
    this.setData({
      showSpecialtyFilter: false,
      showRatingFilter: false,
      showPriceFilter: false
    });
    
    // 显示选中的筛选弹窗
    if (type === 'specialty') {
      this.setData({ showSpecialtyFilter: true });
    } else if (type === 'rating') {
      this.setData({ showRatingFilter: true });
      this.toggleRatingSort();
    } else if (type === 'price') {
      this.setData({ showPriceFilter: true });
      this.togglePriceSort();
    }
  },
  
  // 选择专长
  selectSpecialty(e) {
    const specialty = e.currentTarget.dataset.specialty;
    this.setData({ 
      selectedSpecialty: specialty,
      showSpecialtyFilter: false
    });
    this.filterAccountants();
  },
  
  // 切换评分排序
  toggleRatingSort() {
    const newSort = this.data.ratingSort === 'desc' ? 'asc' : 'desc';
    this.setData({ ratingSort: newSort });
    this.filterAccountants();
  },
  
  // 切换价格排序
  togglePriceSort() {
    const newSort = this.data.priceSort === 'asc' ? 'desc' : 'asc';
    this.setData({ priceSort: newSort });
    this.filterAccountants();
  },
  
  // 筛选会计
  filterAccountants() {
    let filtered = [...this.data.accountants];
    
    // 按专长筛选
    if (this.data.selectedSpecialty) {
      filtered = filtered.filter(accountant => 
        accountant.specialty.includes(this.data.selectedSpecialty)
      );
    }
    
    // 按评分排序
    filtered.sort((a, b) => {
      if (this.data.ratingSort === 'desc') {
        return b.rating - a.rating;
      } else {
        return a.rating - b.rating;
      }
    });
    
    // 按价格排序
    filtered.sort((a, b) => {
      if (this.data.priceSort === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
    
    this.setData({ filteredAccountants: filtered });
  },
  
  // 查看会计详情
  viewAccountantDetail(e) {
    const accountantId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shared-accounting/accountant-detail?id=${accountantId}`
    });
  },
  
  // 雇佣会计
  hireAccountant(e) {
    const accountantId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '预约成功',
      icon: 'success'
    });
  }
});