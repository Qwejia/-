// pages/shared-accounting/chat.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    conversationId: '',
    conversationName: '',
    conversationAvatar: '',
    messages: [],
    messageInput: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id, name, avatar } = options;
    this.setData({
      conversationId: id,
      conversationName: name,
      conversationAvatar: avatar
    });
    this.loadMessages();
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  },

  /**
   * 加载聊天记录
   */
  loadMessages() {
    // 模拟聊天数据
    const messages = [
      {
        sender: 'other',
        avatar: this.data.conversationAvatar,
        content: '您好，我是' + this.data.conversationName + '，很高兴为您服务。',
        time: '14:30'
      },
      {
        sender: 'me',
        avatar: '我',
        content: '您好，我需要咨询关于税务申报的问题。',
        time: '14:31'
      },
      {
        sender: 'other',
        avatar: this.data.conversationAvatar,
        content: '没问题，请问您具体需要了解哪方面的税务申报？',
        time: '14:32'
      },
      {
        sender: 'me',
        avatar: '我',
        content: '我需要了解一下企业所得税的申报流程。',
        time: '14:33'
      },
      {
        sender: 'other',
        avatar: this.data.conversationAvatar,
        content: '企业所得税的申报流程主要包括：1. 准备申报资料；2. 填写申报表；3. 网上申报；4. 缴纳税款。具体细节我可以为您详细说明。',
        time: '14:35'
      }
    ];

    this.setData({
      messages
    });

    // 滚动到底部
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    const query = wx.createSelectorQuery();
    query.select('#messageContent').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      if (res[0]) {
        wx.pageScrollTo({
          scrollTop: res[0].height,
          duration: 300
        });
      }
    });
  },

  /**
   * 输入消息
   */
  onMessageInput(e) {
    this.setData({
      messageInput: e.detail.value
    });
  },

  /**
   * 发送消息
   */
  sendMessage() {
    if (!this.data.messageInput.trim()) return;

    const newMessage = {
      sender: 'me',
      avatar: '我',
      content: this.data.messageInput.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...this.data.messages, newMessage];
    this.setData({
      messages: updatedMessages,
      messageInput: ''
    });

    // 滚动到底部
    this.scrollToBottom();

    // 模拟对方回复
    setTimeout(() => {
      const replyMessage = {
        sender: 'other',
        avatar: this.data.conversationAvatar,
        content: '好的，我明白了。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      const newMessages = [...updatedMessages, replyMessage];
      this.setData({
        messages: newMessages
      });
      this.scrollToBottom();
    }, 1000);
  }
});