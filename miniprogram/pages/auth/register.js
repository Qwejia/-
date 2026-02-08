// 注册页面逻辑
Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: '',
    phone: '',
    loading: false,
    error: '',
    success: ''
  },

  // 输入用户名
  handleUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 输入密码
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 确认密码
  handleConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  // 输入姓名
  handleNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  // 输入部门
  handleDepartmentInput(e) {
    this.setData({
      department: e.detail.value
    });
  },

  // 输入手机号
  handlePhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 注册按钮点击
  register() {
    const { username, password, confirmPassword, name, department, phone } = this.data;
    
    // 表单验证
    if (!username || !password || !confirmPassword || !name || !department || !phone) {
      this.setData({
        error: '请填写所有必填字段'
      });
      return;
    }

    if (password !== confirmPassword) {
      this.setData({
        error: '两次输入的密码不一致'
      });
      return;
    }

    if (password.length < 6) {
      this.setData({
        error: '密码长度至少为6位'
      });
      return;
    }

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      this.setData({
        error: '请输入正确的手机号'
      });
      return;
    }

    this.setData({
      loading: true,
      error: '',
      success: ''
    });

    // 模拟注册请求
    setTimeout(() => {
      // 这里应该调用云函数进行注册
      // 暂时使用模拟数据
      this.setData({
        loading: false,
        success: '注册成功，请登录'
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