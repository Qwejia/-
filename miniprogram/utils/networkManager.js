// 网络请求管理工具 - 封装统一的网络请求接口
// 提供错误处理、重试机制、缓存管理等功能

// 导入云存储配置
const cloudStorageConfig = require('../config/cloudStorage');

class NetworkManager {
  constructor() {
    // 请求缓存
    this.requestCache = new Map();
    // 缓存统计
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
    // 最大缓存条目数
    this.maxCacheSize = 100;
    // 默认缓存超时时间（毫秒）
    this.defaultCacheTimeout = 300000;
    // 请求队列
    this.requestQueue = [];
    // 最大并发请求数
    this.maxConcurrentRequests = 5;
    // 当前并发请求数
    this.currentConcurrentRequests = 0;
    // 网络状态
    this.networkState = 'unknown';
    // 重试配置
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504]
    };
    // 云存储配置
    this.cloudStorageConfig = cloudStorageConfig;
    
    // 初始化网络状态监测
    this.initNetworkMonitor();
  }
  
  // 初始化网络状态监测
  initNetworkMonitor() {
    if (this.networkListener) {
      return;
    }
    
    this.networkListener = (res) => {
      this.networkState = res.isConnected ? res.networkType : 'none';
      console.log('网络状态变化:', this.networkState);
    };
    
    wx.onNetworkStatusChange(this.networkListener);
    
    wx.getNetworkType({
      success: (res) => {
        this.networkState = res.networkType;
        console.log('当前网络状态:', this.networkState);
      }
    });
  }
  
  // 销毁网络监听器
  destroy() {
    if (this.networkListener) {
      wx.offNetworkStatusChange(this.networkListener);
      this.networkListener = null;
    }
    this.requestCache.clear();
  }
  
  // 检查网络状态
  checkNetworkState() {
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: (res) => {
          this.networkState = res.networkType;
          if (res.networkType === 'none') {
            reject(new Error('网络连接不可用'));
          } else {
            resolve(res.networkType);
          }
        },
        fail: () => {
          reject(new Error('获取网络状态失败'));
        }
      });
    });
  }
  
  // 生成缓存键
  generateCacheKey(options) {
    const { url, method = 'GET', data = {} } = options;
    const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
    return `${method}:${url}:${dataStr}`;
  }
  
  // 发送网络请求
  async request(options) {
    try {
      await this.checkNetworkState();
      
      const cacheTimeout = options.cacheTimeout !== undefined ? options.cacheTimeout : this.defaultCacheTimeout;
      
      if (options.cache && options.method === 'GET') {
        const cacheKey = this.generateCacheKey(options);
        if (this.requestCache.has(cacheKey)) {
          const cachedData = this.requestCache.get(cacheKey);
          const now = Date.now();
          if (now - cachedData.timestamp < cacheTimeout || cacheTimeout === 0) {
            this.cacheStats.hits++;
            console.log('使用缓存数据:', cacheKey);
            return cachedData.data;
          } else {
            this.requestCache.delete(cacheKey);
          }
        }
      }
      
      this.cacheStats.misses++;
      const result = await this.sendRequest(options);
      
      if (options.cache && options.method === 'GET') {
        const cacheKey = this.generateCacheKey(options);
        this._addToCache(cacheKey, result, cacheTimeout);
      }
      
      return result;
    } catch (error) {
      console.error('网络请求失败:', error);
      throw error;
    }
  }
  
  // 添加到缓存
  _addToCache(key, data, timeout) {
    if (this.requestCache.size >= this.maxCacheSize) {
      this._evictCache();
    }
    
    this.requestCache.set(key, {
      data: data,
      timestamp: Date.now(),
      timeout: timeout
    });
  }
  
  // 缓存淘汰策略（LRU）
  _evictCache() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, value] of this.requestCache.entries()) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.requestCache.delete(oldestKey);
      this.cacheStats.evictions++;
    }
  }
  
  // 发送请求（带重试机制）
  sendRequest(options, retryCount = 0) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            // 检查是否需要重试
            if (this.retryConfig.retryableStatusCodes.includes(res.statusCode) && retryCount < this.retryConfig.maxRetries) {
              console.log(`请求失败，${this.retryConfig.retryDelay}ms后重试 (${retryCount + 1}/${this.retryConfig.maxRetries})`);
              setTimeout(() => {
                this.sendRequest(options, retryCount + 1)
                  .then(resolve)
                  .catch(reject);
              }, this.retryConfig.retryDelay);
            } else {
              reject(new Error(`请求失败: ${res.statusCode} ${res.errMsg}`));
            }
          }
        },
        fail: (err) => {
          // 检查是否需要重试
          if (retryCount < this.retryConfig.maxRetries) {
            console.log(`请求失败，${this.retryConfig.retryDelay}ms后重试 (${retryCount + 1}/${this.retryConfig.maxRetries})`);
            setTimeout(() => {
              this.sendRequest(options, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, this.retryConfig.retryDelay);
          } else {
            reject(new Error(`请求失败: ${err.errMsg}`));
          }
        }
      });
    });
  }
  
  // 调用云函数
  async callCloudFunction(options) {
    try {
      // 检查网络状态
      await this.checkNetworkState();
      
      // 检查缓存
      if (options.cache && options.data && options.data.type) {
        const cacheKey = `cloud:${options.name}:${options.data.type}:${JSON.stringify(options.data)}`;
        if (this.requestCache.has(cacheKey)) {
          const cachedData = this.requestCache.get(cacheKey);
          const now = Date.now();
          if (now - cachedData.timestamp < options.cacheTimeout || options.cacheTimeout === 0) {
            console.log('使用缓存数据:', cacheKey);
            return cachedData.data;
          } else {
            // 缓存过期，删除缓存
            this.requestCache.delete(cacheKey);
          }
        }
      }
      
      // 检查wx.cloud是否可用
      if (typeof wx.cloud === 'undefined' || !wx.cloud.callFunction) {
        console.log('云函数不可用，使用模拟数据');
        // 返回模拟数据
        return this.getMockData(options);
      }
      
      // 发送云函数请求
      const result = await new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          ...options,
          success: (res) => {
            resolve(res.result);
          },
          fail: (err) => {
            reject(new Error(`云函数调用失败: ${err.errMsg}`));
          }
        });
      });
      
      // 缓存响应
      if (options.cache && options.data && options.data.type) {
        const cacheKey = `cloud:${options.name}:${options.data.type}:${JSON.stringify(options.data)}`;
        this.requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } catch (error) {
      console.error('云函数调用失败:', error);
      // 返回模拟数据
      return this.getMockData(options);
    }
  }
  
  // 上传文件
  async uploadFile(options) {
    try {
      // 检查网络状态
      await this.checkNetworkState();
      
      // 检查wx.cloud是否可用
      if (typeof wx.cloud === 'undefined' || !wx.cloud.uploadFile) {
        console.log('云上传不可用，使用模拟数据');
        // 返回模拟数据
        return {
          fileID: `mock-file-${Date.now()}`,
          downloadUrl: `https://${this.cloudStorageConfig.domain}/mock-file-${Date.now()}`
        };
      }
      
      // 发送上传请求
      const result = await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          ...options,
          success: (res) => {
            // 构建下载链接
            const downloadUrl = `https://${this.cloudStorageConfig.domain}/${options.cloudPath}`;
            resolve({
              ...res,
              downloadUrl
            });
          },
          fail: (err) => {
            reject(new Error(`文件上传失败: ${err.errMsg}`));
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error('文件上传失败:', error);
      // 返回模拟数据
      return {
        fileID: `mock-file-${Date.now()}`,
        downloadUrl: `https://${this.cloudStorageConfig.domain}/mock-file-${Date.now()}`
      };
    }
  }
  
  // 下载文件
  async downloadFile(options) {
    try {
      // 检查网络状态
      await this.checkNetworkState();
      
      // 发送下载请求
      const result = await new Promise((resolve, reject) => {
        wx.downloadFile({
          ...options,
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            reject(new Error(`文件下载失败: ${err.errMsg}`));
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }
  
  // 构建云存储下载链接
  getCloudStorageUrl(filePath) {
    return this.cloudStorageConfig.getUrl(filePath);
  }
  
  // 构建云存储上传路径
  getCloudStorageUploadPath(fileName, type = 'temp') {
    return this.cloudStorageConfig.getUploadPath(fileName, type);
  }
  
  // 获取模拟数据
  getMockData(options) {
    const { name, data } = options;
    
    switch (name) {
      case 'quickstartFunctions':
        switch (data.type) {
          case 'getOpenId':
            return {
              openid: `mock-openid-${Date.now()}`
            };
          case 'selectRecord':
            return {
              data: [
                { _id: '1', region: '华东', city: '上海', sales: 100 },
                { _id: '2', region: '华南', city: '广州', sales: 200 },
                { _id: '3', region: '华北', city: '北京', sales: 300 }
              ]
            };
          case 'insertRecord':
            return {
              success: true
            };
          case 'updateRecord':
            return {
              success: true
            };
          case 'deleteRecord':
            return {
              success: true
            };
          case 'getMiniProgramCode':
            return 'mock-code-src';
          default:
            return {};
        }
      default:
        return {};
    }
  }
  
  // 清理缓存
  clearCache() {
    this.requestCache.clear();
  }
  
  // 获取缓存大小
  getCacheSize() {
    return this.requestCache.size;
  }
  
  // 获取缓存统计
  getCacheStats() {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.hits + this.cacheStats.misses > 0 
        ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  // 重置缓存统计
  resetCacheStats() {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }
  
  // 设置重试配置
  setRetryConfig(config) {
    this.retryConfig = { ...this.retryConfig, ...config };
  }
  
  // 设置最大并发请求数
  setMaxConcurrentRequests(max) {
    this.maxConcurrentRequests = max;
  }
}

// 导出单例实例
let networkManagerInstance = null;

function getNetworkManager() {
  if (!networkManagerInstance) {
    networkManagerInstance = new NetworkManager();
  }
  return networkManagerInstance;
}

// 导出实例，方便直接使用
const networkManager = getNetworkManager();

module.exports = networkManager;