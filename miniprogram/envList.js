const envList = [
  {
    envId: 'cloud1-2gt9701k60beb27b',
    alias: 'cloud1'
  }
];

const isMac = false;

const config = {
  env: {
    list: envList,
    isMac: isMac,
    currentEnv: envList[0]
  },
  
  app: {
    name: '智能财务系统',
    version: '1.0.0',
    debug: false,
    logLevel: 'warn'
  },
  
  performance: {
    enableBenchmark: false,
    cacheTimeout: 300000,
    maxCacheSize: 100
  },
  
  security: {
    enableEncryption: true,
    sessionTimeout: 30 * 60 * 1000,
    maxLoginAttempts: 5
  },
  
  network: {
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000
  },
  
  getCurrentEnv() {
    return this.env.currentEnv;
  },
  
  setCurrentEnv(envId) {
    const env = this.env.list.find(e => e.envId === envId);
    if (env) {
      this.env.currentEnv = env;
      return true;
    }
    return false;
  },
  
  get(key) {
    const keys = key.split('.');
    let value = this;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return undefined;
      }
    }
    return value;
  },
  
  set(key, value) {
    const keys = key.split('.');
    let obj = this;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in obj)) {
        obj[k] = {};
      }
      obj = obj[k];
    }
    obj[keys[keys.length - 1]] = value;
  }
};

module.exports = {
  envList,
  isMac,
  config
};
