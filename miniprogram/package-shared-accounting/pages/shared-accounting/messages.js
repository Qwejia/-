// pages/shared-accounting/messages.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    conversations: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadConversations();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadConversations();
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 加载消息列表
   */
  loadConversations() {
    // 模拟消息数据
    const conversations = [
      {
        id: '1',
        name: '张会计',
        avatar: '张',
        lastMessage: {
          content: '您好，我已经开始处理您的税务申报任务了。',
          time: '2026-02-01 14:30'
        },
        unreadCount: 2
      },
      {
        id: '2',
        name: '李会计',
        avatar: '李',
        lastMessage: {
          content: '您的财务分析报告已经完成，请查收。',
          time: '2026-01-31 10:15'
        },
        unreadCount: 0
      },
      {
        id: '3',
        name: '王会计',
        avatar: '王',
        lastMessage: {
          content: '您好，请问您的任务具体需要哪些资料？',
          time: '2026-01-30 16:45'
        },
        unreadCount: 1
      }
    ];

    this.setData({
      conversations
    });
  },

  /**
   * 打开对话
   */
  openConversation(e) {
    const conversationId = e.currentTarget.dataset.id;
    const conversation = this.data.conversations.find(c => c.id === conversationId);
    if (conversation) {
      wx.navigateTo({
        url: '/pages/shared-accounting/chat?id=' + conversationId + '&name=' + conversation.name + '&avatar=' + conversation.avatar
      });
    }
  }
});