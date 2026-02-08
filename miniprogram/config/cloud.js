const envList = require('../envList').envList;

const defaultCloudConfig = {
  envId: envList[0]?.envId || '',
  traceUser: true,
  
  functions: {
    initCategories: 'initCategories',
    quickstartFunctions: 'quickstartFunctions'
  },
  
  database: {
    collections: {
      categories: 'categories',
      records: 'records',
      accounts: 'accounts',
      vouchers: 'vouchers',
      voucherEntries: 'voucherEntries',
      customers: 'customers',
      suppliers: 'suppliers',
      arInvoices: 'arInvoices',
      arReceipts: 'arReceipts',
      arWriteOffs: 'arWriteOffs',
      apInvoices: 'apInvoices',
      apPayments: 'apPayments',
      apWriteOffs: 'apWriteOffs',
      checkoutRecords: 'checkoutRecords',
      invoices: 'invoices',
      invoiceItems: 'invoiceItems'
    }
  },
  
  storage: {
    paths: {
      images: 'images/',
      documents: 'documents/',
      videos: 'videos/',
      audios: 'audios/',
      temp: 'temp/'
    }
  },
  
  ai: {
    apiKey: 'a59845bc-e908-45f8-a558-c6c2f57ad6c3',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    defaultModel: 'deepseek-v3-250324',
    parameters: {
      temperature: 0.7,
      max_tokens: 1000
    }
  },
  
  init(options = {}) {
    if (!wx.cloud) {
      console.error('当前基础库版本不支持云开发');
      return false;
    }
    
    wx.cloud.init({
      env: options.envId || this.envId,
      traceUser: options.traceUser !== undefined ? options.traceUser : this.traceUser
    });
    
    console.log('云开发环境初始化成功');
    return true;
  },
  
  getFunction(name) {
    return wx.cloud.callFunction({ name });
  },
  
  getDatabase() {
    return wx.cloud.database();
  },
  
  getStorage() {
    return wx.cloud.getStorage();
  }
};

module.exports = defaultCloudConfig;