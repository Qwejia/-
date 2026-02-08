Page({
  data: {
    username: '',
    password: '',
    loading: false,
    error: ''
  },

  handleUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  handlePasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  login() {
    const { username, password } = this.data;
    
    if (!username || !password) {
      this.setData({ error: '请输入用户名和密码' });
      return;
    }

    this.setData({ loading: true, error: '' });

    setTimeout(() => {
      if (username === 'admin' && password === '123456') {
        wx.setStorageSync('userInfo', {
          username: 'admin',
          role: 'admin',
          name: '系统管理员',
          permissions: ['generalLedger', 'accountsReceivable', 'accountsPayable', 'fixedAssets', 'purchase', 'sales', 'inventory', 'production', 'hr']
        });

        wx.switchTab({ url: '/pages/index/index' });
      } else {
        this.setData({ error: '用户名或密码错误', loading: false });
      }
    }, 1000);
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/auth/register' });
  },

  goToForgotPassword() {
    wx.navigateTo({ url: '/pages/auth/forgotPassword' });
  }
});