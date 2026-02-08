// 忘记密码页面逻辑
Page({
  data: {
    username: '',
    phone: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: '',
    success: '',
    countdown: 0
  },

  // 输入用户名
  handleUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 输入手机号
  handlePhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 输入验证码
  handleVerificationCodeInput(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },

  // 输入新密码
  handleNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    });
  },

  // 确认新密码
  handleConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  // 发送验证码
  sendVerificationCode() {
    const { phone } = this.data;
    
    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      this.setData({
        error: '请输入正确的手机号'
      });
      return;
    }

    // 开始倒计时
    this.setData({
      countdown: 60,
      error: ''
    });

    // 倒计时逻辑
    const timer = setInterval(() => {
      this.setData({
        countdown: this.data.countdown - 1
      });
      
      if (this.data.countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // 模拟发送验证码
    wx.showToast({
      title: '验证码已发送',
      icon: 'success',
      duration: 2000
    });
  },

  // 重置密码
  resetPassword() {
    const { username, phone, verificationCode, newPassword, confirmPassword } = this.data;
    
    // 表单验证
    if (!username || !phone || !verificationCode || !newPassword || !confirmPassword) {
      this.setData({
        error: '请填写所有必填字段'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      this.setData({
        error: '两次输入的密码不一致'
      });
      return;
    }

    if (newPassword.length < 6) {
      this.setData({
        error: '密码长度至少为6位'
      });
      return;
    }

    this.setData({
      loading: true,
      error: '',
      success: ''
    });

    // 模拟重置密码请求
    setTimeout(() => {
      // 这里应该调用云函数进行密码重置
      // 暂时使用模拟数据
      this.setData({
        loading: false,
        success: '密码重置成功，请登录'
      });

      // 3秒后跳转到登录页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/auth/login'
        });
      }, 3000);
    }, 1500);
  },

  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/auth/login'
    });
  }
});