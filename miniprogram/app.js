// app.js
const { getPerformanceTester } = require('./utils/performanceTester');
const { getStateManager } = require('./utils/stateManager');
const errorHandler = require('./utils/errorHandler');
const storageManager = require('./utils/storageManager');
const { getDataService } = require('./services/dataService');
const { getFinanceService } = require('./services/financeService');
const cloudConfig = require('./config/cloud');
const { checkPagePermission } = require('./config/permission');

// 创建状态管理实例
const stateManager = getStateManager();
// 创建服务实例
const dataService = getDataService();
const financeService = getFinanceService();

App({
  onLaunch() {
    console.log('小程序启动中...');
    
    try {
      // 初始化状态管理工具
      const initialState = {
        // 不配置具体的云环境，使用默认环境
        debug: false, // 默认关闭调试模式，提高启动性能
        isSyncing: false, // 同步状态标记
        cloud: false, // 云环境状态
        lastSyncTime: 0, // 上次同步时间
        userInfo: null, // 用户信息
        // 核心数据
        categories: [],
        records: [],
        accounts: [],
        vouchers: [],
        voucherEntries: [],
        customers: [],
        arInvoices: [],
        arReceipts: [],
        arWriteOffs: [],
        suppliers: [],
        apInvoices: [],
        apPayments: [],
        apWriteOffs: [],
        // 其他数据
        auxAccountingTypes: [],
        departments: [],
        projects: [],
        checkoutRecords: [],
        currencies: [],
        paymentMethods: [],
        voucherTypes: [],
        invoices: [],
        invoiceItems: []
      };
      
      stateManager.init(initialState);
      
      // 加载用户信息
      this.loadUserInfo();
      
      // 初始化核心数据
      this.initCoreData();
      
      // 加载上次同步时间
      const loadLastSyncTime = errorHandler.wrapFunction(() => {
        const lastSyncTime = storageManager.get('lastSyncTime');
        stateManager.set('lastSyncTime', lastSyncTime || 0);
      }, {
        type: 'storage',
        level: 'info',
        message: '加载上次同步时间失败',
        defaultValue: null
      });
      
      loadLastSyncTime();
      
      // 延迟加载非核心数据
      this.lazyLoadNonCoreData();
      
      // 启用云环境初始化（非阻塞）
      if (wx.cloud) {
        try {
          const initCloud = errorHandler.wrapFunction(() => {
            const success = cloudConfig.init();
            if (success) {
              console.log('云环境初始化成功');
              stateManager.set('cloud', true);
            } else {
              console.warn('云环境初始化失败，使用本地数据');
              stateManager.set('cloud', false);
            }
            return success;
          }, {
            type: 'cloud',
            level: 'warn',
            message: '云环境初始化失败',
            defaultValue: false,
            throwError: false
          });
          
          const result = initCloud();
          if (!result) {
            stateManager.set('cloud', false);
          }
        } catch (error) {
          console.warn('云环境初始化异常，使用本地数据:', error);
          stateManager.set('cloud', false);
        }
      } else {
        console.warn("当前基础库版本不支持云能力");
        stateManager.set('cloud', false);
      }
      
      console.log('小程序启动完成');
    } catch (error) {
      console.error('小程序启动失败:', error);
      // 即使启动失败，也要确保应用能正常运行
    }
  },

  // 加载用户信息
  loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        stateManager.set('userInfo', userInfo);
      }
    } catch (error) {
      console.warn('加载用户信息失败', error);
      stateManager.set('userInfo', null);
    }
  },

  // 路由拦截
  onPageNotFound(res) {
    console.log('页面不存在:', res);
    wx.redirectTo({
      url: '/pages/auth/login'
    });
  },

  // 检查页面权限
  checkPagePermission(pagePath) {
    const userInfo = stateManager.get('userInfo');
    return checkPagePermission(pagePath, userInfo);
  },

  // 登录
  login(userInfo) {
    stateManager.set('userInfo', userInfo);
    wx.setStorageSync('userInfo', userInfo);
  },

  // 登出
  logout() {
    stateManager.set('userInfo', null);
    wx.removeStorageSync('userInfo');
    wx.redirectTo({
      url: '/pages/auth/login'
    });
  },

  /**
   * 从本地获取数据（通用方法）
   * @param {string} dataType - 数据类型
   * @returns {Array} 数据列表
   */
  getDataFromLocal(dataType) {
    return dataService.getDataFromLocal(dataType);
  },

  /**
   * 保存数据到本地（通用方法）
   * @param {string} dataType - 数据类型
   * @param {Array} data - 数据列表
   */
  saveDataToLocal(dataType, data) {
    dataService.saveDataToLocal(dataType, data);
  },

  /**
   * 获取发票列表
   * @returns {Array} 发票列表
   */
  getInvoicesFromLocal: function() {
    return this.getDataFromLocal('invoices');
  },

  /**
   * 保存发票列表
   * @param {Array} invoices - 发票列表
   */
  saveInvoicesToLocal: function(invoices) {
    this.saveDataToLocal('invoices', invoices);
  },

  /**
   * 获取发票明细项
   * @returns {Array} 发票明细项
   */
  getInvoiceItemsFromLocal: function() {
    return this.getDataFromLocal('invoiceItems');
  },

  /**
   * 保存发票明细项
   * @param {Array} invoiceItems - 发票明细项
   */
  saveInvoiceItemsToLocal: function(invoiceItems) {
    this.saveDataToLocal('invoiceItems', invoiceItems);
  },

  /**
   * 从本地获取分类数据
   * @returns {Array} 分类数据列表
   */
  getCategoriesFromLocal: function() {
    return this.getDataFromLocal('categories');
  },

  /**
   * 保存分类数据到本地
   * @param {Array} categories - 分类数据列表
   */
  saveCategoriesToLocal: function(categories) {
    this.saveDataToLocal('categories', categories);
  },

  /**
   * 从本地获取记录数据
   * @returns {Array} 记录数据列表
   */
  getRecordsFromLocal: function() {
    return this.getDataFromLocal('records');
  },

  /**
   * 保存记录数据到本地
   * @param {Array} records - 记录数据列表
   */
  saveRecordsToLocal: function(records) {
    this.saveDataToLocal('records', records);
  },

  /**
   * 从本地获取凭证数据
   * @returns {Array} 凭证数据列表
   */
  getVouchersFromLocal: function() {
    return this.getDataFromLocal('vouchers');
  },

  /**
   * 保存凭证数据到本地
   * @param {Array} vouchers - 凭证数据列表
   */
  saveVouchersToLocal: function(vouchers) {
    this.saveDataToLocal('vouchers', vouchers);
  },

  /**
   * 初始化数据
   * @param {Object} data - 数据对象
   * @param {string} level - 错误级别
   */
  initData: function(data, level = 'error') {
    // 批量更新状态
    stateManager.batch(() => {
      Object.keys(data).forEach(key => {
        try {
          const currentData = storageManager.get(key);
          if (!currentData || currentData.length === 0) {
            // 保存到本地存储
            storageManager.set(key, data[key]);
            // 保存到状态管理
            stateManager.set(key, data[key]);
          } else {
            // 从本地存储加载到状态管理
            stateManager.set(key, currentData);
          }
        } catch (error) {
          console.warn(`数据初始化失败 [${key}]`, error);
          // 如果数据初始化失败，使用默认值确保应用能正常启动
          stateManager.set(key, data[key]);
        }
      });
    });
  },

  /**
   * 初始化核心数据
   * 应用启动时加载必要的基础数据，如分类、记录、会计科目等
   */
  initCoreData: function() {
    // 核心数据（应用启动必须的）
    const coreData = {
      categories: [
        { _id: '1', name: '餐饮', type: 'expense', icon: '🍔', sort: 1 },
        { _id: '2', name: '交通', type: 'expense', icon: '🚗', sort: 2 },
        { _id: '3', name: '购物', type: 'expense', icon: '🛒', sort: 3 },
        { _id: '4', name: '娱乐', type: 'expense', icon: '🎮', sort: 4 },
        { _id: '5', name: '医疗', type: 'expense', icon: '🏥', sort: 5 },
        { _id: '6', name: '工资', type: 'income', icon: '💰', sort: 6 },
        { _id: '7', name: '奖金', type: 'income', icon: '🏆', sort: 7 },
        { _id: '8', name: '投资', type: 'income', icon: '📈', sort: 8 }
      ],
      records: [
        { _id: '1', type: 'expense', amount: 35, category: '餐饮', date: new Date().toISOString().split('T')[0], note: '午餐' },
        { _id: '2', type: 'expense', amount: 20, category: '交通', date: new Date().toISOString().split('T')[0], note: '地铁' },
        { _id: '3', type: 'income', amount: 5000, category: '工资', date: '2026-01-01', note: '12月工资' },
        { _id: '4', type: 'expense', amount: 150, category: '购物', date: '2026-01-06', note: '生活用品' },
        { _id: '5', type: 'expense', amount: 80, category: '娱乐', date: '2026-01-06', note: '电影票' },
        { _id: '6', type: 'expense', amount: 120, category: '餐饮', date: '2026-01-05', note: '晚餐' },
        { _id: '7', type: 'income', amount: 1000, category: '奖金', date: '2026-01-02', note: '绩效奖金' }
      ],
      accounts: [
        { _id: '1', code: '1001', name: '库存现金', type: 'asset', parentId: '', auxAccounting: [] },
        { _id: '2', code: '1002', name: '银行存款', type: 'asset', parentId: '', auxAccounting: [] },
        { _id: '3', code: '1122', name: '应收账款', type: 'asset', parentId: '', auxAccounting: ['customer'] },
        { _id: '4', code: '1123', name: '预付账款', type: 'asset', parentId: '', auxAccounting: ['supplier'] },
        { _id: '5', code: '1221', name: '其他应收款', type: 'asset', parentId: '', auxAccounting: ['department', 'project'] },
        { _id: '6', code: '1401', name: '材料采购', type: 'asset', parentId: '', auxAccounting: [] },
        { _id: '7', code: '1403', name: '原材料', type: 'asset', parentId: '', auxAccounting: [] },
        { _id: '8', code: '1405', name: '库存商品', type: 'asset', parentId: '', auxAccounting: [] },
        { _id: '9', code: '1601', name: '固定资产', type: 'asset', parentId: '', auxAccounting: [] },
        { _id: '10', code: '1602', name: '累计折旧', type: 'asset', parentId: '', auxAccounting: [] },
        { _id: '11', code: '2001', name: '短期借款', type: 'liability', parentId: '', auxAccounting: [] },
        { _id: '12', code: '2202', name: '应付账款', type: 'liability', parentId: '', auxAccounting: ['supplier'] },
        { _id: '13', code: '2203', name: '预收账款', type: 'liability', parentId: '', auxAccounting: ['customer'] },
        { _id: '14', code: '2211', name: '应付职工薪酬', type: 'liability', parentId: '', auxAccounting: ['department'] },
        { _id: '15', code: '2221', name: '应交税费', type: 'liability', parentId: '', auxAccounting: [] },
        { _id: '16', code: '2241', name: '其他应付款', type: 'liability', parentId: '', auxAccounting: [] },
        { _id: '17', code: '4001', name: '实收资本', type: 'equity', parentId: '', auxAccounting: [] },
        { _id: '18', code: '4002', name: '资本公积', type: 'equity', parentId: '', auxAccounting: [] },
        { _id: '19', code: '4101', name: '盈余公积', type: 'equity', parentId: '', auxAccounting: [] },
        { _id: '20', code: '4103', name: '本年利润', type: 'equity', parentId: '', auxAccounting: [] },
        { _id: '21', code: '4104', name: '利润分配', type: 'equity', parentId: '', auxAccounting: [] },
        { _id: '22', code: '5001', name: '生产成本', type: 'expense', parentId: '', auxAccounting: ['project'] },
        { _id: '23', code: '5101', name: '制造费用', type: 'expense', parentId: '', auxAccounting: ['department', 'project'] },
        { _id: '24', code: '6001', name: '主营业务收入', type: 'income', parentId: '', auxAccounting: ['customer', 'department'] },
        { _id: '25', code: '6051', name: '其他业务收入', type: 'income', parentId: '', auxAccounting: [] },
        { _id: '26', code: '6301', name: '营业外收入', type: 'income', parentId: '', auxAccounting: [] },
        { _id: '27', code: '6401', name: '主营业务成本', type: 'expense', parentId: '', auxAccounting: ['project'] },
        { _id: '28', code: '6402', name: '其他业务成本', type: 'expense', parentId: '', auxAccounting: [] },
        { _id: '29', code: '6403', name: '营业税金及附加', type: 'expense', parentId: '', auxAccounting: [] },
        { _id: '30', code: '6601', name: '销售费用', type: 'expense', parentId: '', auxAccounting: ['department', 'project'] },
        { _id: '31', code: '6602', name: '管理费用', type: 'expense', parentId: '', auxAccounting: [] },
        { _id: '32', code: '6603', name: '财务费用', type: 'expense', parentId: '', auxAccounting: [] },
        { _id: '33', code: '6711', name: '营业外支出', type: 'expense', parentId: '', auxAccounting: [] },
        { _id: '34', code: '6801', name: '所得税费用', type: 'expense', parentId: '', auxAccounting: [] }
      ],
      // 发票相关数据
      invoices: [],
      invoiceItems: []
    };

    // 初始化核心数据
    this.initData(coreData);
    
    console.log('核心数据初始化完成');
  },

  /**
   * 延迟加载非核心数据
   * 应用启动后异步加载非必要数据，如辅助核算类型、部门、项目等
   */
  lazyLoadNonCoreData: function() {
    // 延迟1秒后加载非核心数据，避免阻塞应用启动
    setTimeout(() => {
      const nonCoreData = {
        // 辅助核算类别
        auxAccountingTypes: [
          { _id: '1', name: '客户', type: 'customer' },
          { _id: '2', name: '供应商', type: 'supplier' },
          { _id: '3', name: '部门', type: 'department' },
          { _id: '4', name: '项目', type: 'project' }
        ],
        // 部门
        departments: [
          { _id: '1', code: 'DEPT001', name: '财务部', status: 'active' },
          { _id: '2', code: 'DEPT002', name: '销售部', status: 'active' },
          { _id: '3', code: 'DEPT003', name: '采购部', status: 'active' },
          { _id: '4', code: 'DEPT004', name: '生产部', status: 'active' },
          { _id: '5', code: 'DEPT005', name: '管理部', status: 'active' }
        ],
        // 项目
        projects: [
          { _id: '1', code: 'PROJ001', name: '小程序开发', status: 'active', startDate: '2026-01-01', endDate: '2026-12-31' },
          { _id: '2', code: 'PROJ002', name: '产品升级', status: 'active', startDate: '2026-03-01', endDate: '2026-09-30' }
        ],
        // 凭证数据
        vouchers: [
          {
            _id: '1',
            number: '001',
            date: new Date().toISOString().split('T')[0],
            description: '支付办公用品费用',
            items: [
              { accountId: '1', debitAmount: 0, creditAmount: 500 }, // 库存现金
              { accountId: '31', debitAmount: 500, creditAmount: 0 } // 管理费用
            ],
            status: 'posted'
          },
          {
            _id: '2',
            number: '002',
            date: new Date().toISOString().split('T')[0],
            description: '销售产品收入',
            items: [
              { accountId: '2', debitAmount: 10000, creditAmount: 0 }, // 银行存款
              { accountId: '24', debitAmount: 0, creditAmount: 10000 } // 主营业务收入
            ],
            status: 'posted'
          },
          {
            _id: '3',
            number: '003',
            date: new Date().toISOString().split('T')[0],
            description: '购买原材料',
            items: [
              { accountId: '7', debitAmount: 2000, creditAmount: 0 }, // 原材料
              { accountId: '2', debitAmount: 0, creditAmount: 2000 } // 银行存款
            ],
            status: 'posted'
          }
        ],
        // 客户数据
        customers: [
          { _id: '1', code: 'C001', name: '北京科技有限公司', contact: '张三', phone: '13800138001', address: '北京市朝阳区', creditLimit: 100000, status: 'active' },
          { _id: '2', code: 'C002', name: '上海贸易有限公司', contact: '李四', phone: '13800138002', address: '上海市浦东新区', creditLimit: 200000, status: 'active' },
          { _id: '3', code: 'C003', name: '广州制造有限公司', contact: '王五', phone: '13800138003', address: '广州市天河区', creditLimit: 150000, status: 'active' }
        ],
        // 供应商数据
        suppliers: [
          { _id: '1', code: 'S001', name: '北京供应商有限公司', contact: '赵六', phone: '13900139001', address: '北京市海淀区', creditLimit: 200000, status: 'active' },
          { _id: '2', code: 'S002', name: '上海供应商有限公司', contact: '孙七', phone: '13900139002', address: '上海市徐汇区', creditLimit: 300000, status: 'active' },
          { _id: '3', code: 'S003', name: '广州供应商有限公司', contact: '周八', phone: '13900139003', address: '广州市越秀区', creditLimit: 150000, status: 'active' }
        ],
        // 币别数据
        currencies: [
          { _id: '1', code: 'CNY', name: '人民币', symbol: '¥', rate: 1, isDefault: true },
          { _id: '2', code: 'USD', name: '美元', symbol: '$', rate: 7.2, isDefault: false },
          { _id: '3', code: 'EUR', name: '欧元', symbol: '€', rate: 7.8, isDefault: false }
        ],
        // 结算方式
        paymentMethods: [
          { _id: '1', code: 'PAY001', name: '现金', status: 'active' },
          { _id: '2', code: 'PAY002', name: '银行转账', status: 'active' },
          { _id: '3', code: 'PAY003', name: '支票', status: 'active' },
          { _id: '4', code: 'PAY004', name: '电汇', status: 'active' },
          { _id: '5', code: 'PAY005', name: '支付宝', status: 'active' },
          { _id: '6', code: 'PAY006', name: '微信支付', status: 'active' }
        ],
        // 凭证类型
        voucherTypes: [
          { _id: '1', code: 'VT001', name: '记账凭证', prefix: '记', status: 'active' },
          { _id: '2', code: 'VT002', name: '收款凭证', prefix: '收', status: 'active' },
          { _id: '3', code: 'VT003', name: '付款凭证', prefix: '付', status: 'active' },
          { _id: '4', code: 'VT004', name: '转账凭证', prefix: '转', status: 'active' }
        ],
        // 其他数据（初始化时为空数组）
        voucherEntries: [],
        arInvoices: [],
        arReceipts: [],
        arWriteOffs: [],
        apInvoices: [],
        apPayments: [],
        apWriteOffs: [],
        checkoutRecords: []
      };

      // 初始化非核心数据
      this.initData(nonCoreData);

      console.log('非核心数据加载完成');
    }, 500); // 减少延迟时间，提高加载速度
  },

  
  /**
   * 同步云数据到本地
   * 将云端最新数据同步到本地存储，确保数据一致性
   */
  syncCloudToLocal: async function(options = {}) {
    return dataService.syncCloudToLocal(options);
  },

  getVoucherEntriesByVoucherId: function(voucherId) {
    return financeService.getVoucherEntriesByVoucherId(voucherId);
  },

  deleteVoucherEntriesByVoucherId: function(voucherId) {
    return financeService.deleteVoucherEntriesByVoucherId(voucherId);
  },

  updateArInvoiceBalance: function(invoiceId, amount) {
    return financeService.updateArInvoiceBalance(invoiceId, amount);
  },

  updateApInvoiceBalance: function(invoiceId, amount) {
    return financeService.updateApInvoiceBalance(invoiceId, amount);
  },

  monthEndCheckout: function(year, month) {
    return financeService.monthEndCheckout(year, month);
  },

  globalData: {
    get cloud() { return stateManager.get('cloud'); },
    set cloud(value) { stateManager.set('cloud', value); },
    get debug() { return stateManager.get('debug'); },
    set debug(value) { stateManager.set('debug', value); },
    get isSyncing() { return stateManager.get('isSyncing'); },
    set isSyncing(value) { stateManager.set('isSyncing', value); },
    get lastSyncTime() { return stateManager.get('lastSyncTime'); },
    set lastSyncTime(value) { stateManager.set('lastSyncTime', value); }
  }
});
