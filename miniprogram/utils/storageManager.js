/**
 * 本地存储管理器
 * 封装微信小程序的本地存储API，提供统一的数据存取接口
 */

class StorageManager {
  /**
   * 错误类型定义
   */
  static Errors = {
    STORAGE_WRITE_FAILED: '本地存储写入失败',
    STORAGE_READ_FAILED: '本地存储读取失败',
    STORAGE_DELETE_FAILED: '本地存储删除失败',
    STORAGE_CLEAR_FAILED: '本地存储清空失败',
    INVALID_KEY: '无效的存储键名',
    INVALID_DATA: '无效的数据格式',
    DATA_NOT_FOUND: '找不到指定数据',
    OPERATION_FAILED: '操作执行失败'
  };
  constructor() {
    // 存储键名前缀，避免与其他小程序冲突
    this.prefix = 'accounting_';
    // 常用数据类型的默认值配置
    this.defaults = {
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
      auxAccountingTypes: [],
      departments: [],
      projects: [],
      currencies: [],
      paymentMethods: [],
      voucherTypes: [],
      checkoutRecords: []
    };
    // 索引配置，用于提高常用数据的查找效率
    this.indices = {
      categories: '_id',
      records: '_id',
      accounts: '_id',
      vouchers: '_id',
      voucherEntries: 'voucherId',
      customers: '_id',
      arInvoices: '_id',
      arReceipts: '_id',
      arWriteOffs: '_id',
      suppliers: '_id',
      apInvoices: '_id',
      apPayments: '_id',
      apWriteOffs: '_id'
    };
    // 内存缓存配置
    this.cache = {
      // 缓存数据
      data: {},
      // 缓存元数据（过期时间、访问时间等）
      meta: {},
      // 缓存大小限制（以项数为单位）
      maxSize: 50,
      // 默认缓存过期时间（毫秒）
      defaultExpiry: 30 * 60 * 1000, // 30分钟
      // LRU缓存实现（使用双向链表和哈希表提高性能）
      lru: {
        // 哈希表，key: 节点引用
        map: new Map(),
        // 双向链表的头（最近使用）和尾（最少使用）
        head: null,
        tail: null
      }
    };
  }

  /**
   * 生成带前缀的存储键名
   * @param {string} key - 原始键名
   * @returns {string} - 带前缀的键名
   */
  getKey(key) {
    return this.prefix + key;
  }

  /**
   * 验证存储键名是否有效
   * @param {string} key - 存储键名
   * @returns {boolean} - 键名是否有效
   */
  isValidKey(key) {
    return typeof key === 'string' && key.trim() !== '';
  }

  /**
   * 验证数据格式是否有效
   * @param {any} data - 要验证的数据
   * @returns {boolean} - 数据是否有效
   */
  isValidData(data) {
    // 允许基本数据类型和对象、数组
    return data !== undefined && data !== null;
  }

  /**
   * 创建错误对象
   * @param {string} errorType - 错误类型
   * @param {string} message - 错误消息
   * @returns {Error} - 错误对象
   */
  createError(errorType, message) {
    const error = new Error(message || errorType);
    error.type = errorType;
    return error;
  }

  /**
   * 保存数据到本地存储
   * @param {string} key - 存储键名
   * @param {any} data - 要存储的数据
   * @param {number} expiry - 过期时间（秒）
   * @returns {boolean} - 操作是否成功
   * @throws {Error} - 当键名或数据无效时抛出错误
   */
  set(key, data, expiry) {
    // 验证键名
    if (!this.isValidKey(key)) {
      const error = this.createError(StorageManager.Errors.INVALID_KEY, '存储键名不能为空');
      console.error(error);
      throw error;
    }
    
    // 验证数据
    if (!this.isValidData(data)) {
      const error = this.createError(StorageManager.Errors.INVALID_DATA, '存储数据不能为空');
      console.error(error);
      throw error;
    }
    
    try {
      wx.setStorageSync(this.getKey(key), data);
      // 更新内存缓存
      this.cache.data[key] = data;
      const expiryTime = expiry ? expiry * 1000 : this.cache.defaultExpiry;
      this.cache.meta[key] = {
        expiresAt: Date.now() + expiryTime,
        lastAccessed: Date.now(),
        size: JSON.stringify(data).length
      };
      // 更新访问顺序
      this.updateCacheAccessTime(key);
      // 更新索引
      this.updateIndex(key, data);
      // 检查并淘汰缓存
      this.evictCache();
      return true;
    } catch (error) {
      const storageError = this.createError(StorageManager.Errors.STORAGE_WRITE_FAILED, `保存数据失败: ${error.message}`);
      console.error(storageError, { key, data });
      throw storageError;
    }
  }

  /**
   * 从本地存储获取数据
   * @param {string} key - 存储键名
   * @param {any} defaultValue - 默认值
   * @returns {any} - 获取的数据或默认值
   * @throws {Error} - 当键名无效时抛出错误
   */
  get(key, defaultValue = null) {
    // 验证键名
    if (!this.isValidKey(key)) {
      const error = this.createError(StorageManager.Errors.INVALID_KEY, '存储键名不能为空');
      console.error(error);
      throw error;
    }
    
    // 先从缓存获取
    if (this.cache.data[key] !== undefined && !this.isCacheExpired(key)) {
      this.updateCacheAccessTime(key);
      return this.cache.data[key];
    }
    
    try {
      const data = wx.getStorageSync(this.getKey(key));
      // 检查数据是否存在且有效
      const hasData = data !== '' && data !== null && data !== undefined;
      const result = hasData ? data : (defaultValue !== null ? defaultValue : null);
      
      // 只有当数据存在时才存入缓存
      if (hasData) {
        this.cache.data[key] = result;
        this.cache.meta[key] = {
          expiresAt: Date.now() + this.cache.defaultExpiry,
          lastAccessed: Date.now(),
          size: JSON.stringify(result).length
        };
        
        // 更新访问顺序
        this.updateCacheAccessTime(key);
        
        // 初始化索引
        this.updateIndex(key, result);
        
        // 检查并淘汰缓存
        this.evictCache();
      }
      
      return result;
    } catch (error) {
      const storageError = this.createError(StorageManager.Errors.STORAGE_READ_FAILED, `读取数据失败: ${error.message}`);
      console.error(storageError, { key });
      
      // 读取失败时返回默认值，不抛出错误，避免影响应用运行
      return defaultValue !== null ? defaultValue : null;
    }
  }

  /**
   * 检查缓存是否过期
   * @param {string} key - 缓存键名
   * @returns {boolean} - 缓存是否过期
   */
  isCacheExpired(key) {
    if (!this.cache.meta[key]) {
      return true;
    }
    const now = Date.now();
    return now > this.cache.meta[key].expiresAt;
  }
  
  /**
   * 创建链表节点
   * @param {string} key - 缓存键名
   * @returns {Object} - 链表节点
   */
  createNode(key) {
    return {
      key: key,
      prev: null,
      next: null
    };
  }

  /**
   * 从链表中移除节点
   * @param {Object} node - 要移除的节点
   */
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.cache.lru.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.cache.lru.tail = node.prev;
    }

    // 清除节点引用
    node.prev = null;
    node.next = null;
  }

  /**
   * 将节点添加到链表头部
   * @param {Object} node - 要添加的节点
   */
  addNodeToHead(node) {
    node.next = this.cache.lru.head;
    
    if (this.cache.lru.head) {
      this.cache.lru.head.prev = node;
    }
    
    this.cache.lru.head = node;
    
    if (!this.cache.lru.tail) {
      this.cache.lru.tail = node;
    }
  }

  /**
   * 更新缓存访问时间
   * @param {string} key - 缓存键名
   */
  updateCacheAccessTime(key) {
    // 更新访问时间
    if (this.cache.meta[key]) {
      this.cache.meta[key].lastAccessed = Date.now();
    }
    
    // 更新LRU链表（将访问的节点移到头部）
    const lruMap = this.cache.lru.map;
    
    // 如果节点已存在，先移除并移到头部
    if (lruMap.has(key)) {
      const existingNode = lruMap.get(key);
      this.removeNode(existingNode);
      this.addNodeToHead(existingNode);
    } else {
      // 创建新节点并添加到头部
      const newNode = this.createNode(key);
      this.addNodeToHead(newNode);
      lruMap.set(key, newNode);
    }
  }
  
  /**
   * 淘汰过期或最少使用的缓存项
   */
  evictCache() {
    // 先删除过期缓存
    const now = Date.now();
    Object.keys(this.cache.meta).forEach(key => {
      if (this.cache.meta[key].expiresAt < now) {
        this.removeFromCache(key);
      }
    });
    
    // 如果仍然超过限制，使用LRU策略删除最少使用的项（链表尾部）
    while (Object.keys(this.cache.data).length > this.cache.maxSize) {
      const leastUsedNode = this.cache.lru.tail;
      if (leastUsedNode) {
        this.removeFromCache(leastUsedNode.key);
      } else {
        break; // 没有可删除的节点了
      }
    }
  }
  
  /**
   * 从缓存中删除指定项
   * @param {string} key - 缓存键名
   */
  removeFromCache(key) {
    delete this.cache.data[key];
    delete this.cache.meta[key];
    
    // 从LRU链表中移除
    const lruMap = this.cache.lru.map;
    if (lruMap.has(key)) {
      const node = lruMap.get(key);
      this.removeNode(node);
      lruMap.delete(key);
    }
    
    // 如果是索引数据，也删除对应的索引
    if (this.cache.data['_indices'] && this.cache.data['_indices'][key]) {
      delete this.cache.data['_indices'][key];
    }
  }

  /**
   * 更新数据索引
   * @param {string} key - 存储键名
   * @param {Array} data - 要索引的数据
   */
  updateIndex(key, data) {
    // 检查是否需要创建索引
    if (!this.indices[key] || !Array.isArray(data)) {
      return;
    }
    
    const indexField = this.indices[key];
    if (!this.cache.data['_indices']) {
      this.cache.data['_indices'] = {};
    }
    
    // 创建或更新索引
    const index = {};
    data.forEach(item => {
      if (item[indexField]) {
        index[item[indexField]] = item;
      }
    });
    
    this.cache.data['_indices'][key] = index;
  }

  /**
   * 删除本地存储中的数据
   * @param {string} key - 存储键名
   * @returns {boolean} - 操作是否成功
   * @throws {Error} - 当键名无效时抛出错误
   */
  remove(key) {
    // 验证键名
    if (!this.isValidKey(key)) {
      const error = this.createError(StorageManager.Errors.INVALID_KEY, '存储键名不能为空');
      console.error(error);
      throw error;
    }
    
    try {
      wx.removeStorageSync(this.getKey(key));
      // 清理缓存
      this.removeFromCache(key);
      return true;
    } catch (error) {
      const storageError = this.createError(StorageManager.Errors.STORAGE_DELETE_FAILED, `删除数据失败: ${error.message}`);
      console.error(storageError, { key });
      throw storageError;
    }
  }

  /**
   * 清空所有与当前应用相关的本地存储数据
   * @returns {boolean} - 操作是否成功
   */
  clear() {
    try {
      // 获取所有存储键
      const keys = wx.getStorageInfoSync().keys;
      // 过滤并删除本应用的存储数据
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          wx.removeStorageSync(key);
        }
      });
      // 重置缓存结构
      this.cache = {
        data: {},
        meta: {},
        maxSize: this.cache.maxSize || 50,
        defaultExpiry: this.cache.defaultExpiry || 30 * 60 * 1000, // 30分钟
        lru: {
          map: new Map(),
          head: null,
          tail: null
        }
      };
      return true;
    } catch (error) {
      const storageError = this.createError(StorageManager.Errors.STORAGE_CLEAR_FAILED, `清空数据失败: ${error.message}`);
      console.error(storageError);
      throw storageError;
    }
  }

  /**
   * 保存数据到本地存储并同步到全局数据
   * @param {string} key - 存储键名
   * @param {any} data - 要存储的数据
   * @param {object} globalData - 应用全局数据对象
   */
  setWithGlobalSync(key, data, globalData) {
    this.set(key, data);
    if (globalData && typeof globalData === 'object') {
      globalData[key] = data;
    }
  }

  /**
   * 添加单个记录到数组类型的数据中
   * @param {string} key - 存储键名
   * @param {object} item - 要添加的记录
   * @param {object} globalData - 应用全局数据对象
   * @returns {Array} - 更新后的数组
   */
  addItem(key, item, globalData) {
    const items = this.get(key);
    items.push(item);
    this.setWithGlobalSync(key, items, globalData);
    return items;
  }

  /**
   * 更新数组类型数据中的单个记录
   * @param {string} key - 存储键名
   * @param {string} idField - 唯一标识字段名
   * @param {string} idValue - 唯一标识值
   * @param {object} updateData - 更新的数据
   * @param {object} globalData - 应用全局数据对象
   * @returns {Array} - 更新后的数组
   */
  updateItem(key, idField, idValue, updateData, globalData) {
    const items = this.get(key);
    
    // 使用索引快速定位记录
    if (this.cache['_indices'] && this.cache['_indices'][key] && idField === this.indices[key]) {
      const item = this.cache['_indices'][key][idValue];
      if (item) {
        // 更新内存中的记录
        Object.assign(item, updateData);
        // 同步到本地存储和全局数据
        this.setWithGlobalSync(key, items, globalData);
        return items;
      }
    }
    
    // 后备方案：遍历查找
    const index = items.findIndex(item => item[idField] === idValue);
    if (index !== -1) {
      items[index] = { ...items[index], ...updateData };
      this.setWithGlobalSync(key, items, globalData);
    }
    return items;
  }

  /**
   * 删除数组类型数据中的单个记录
   * @param {string} key - 存储键名
   * @param {string} idField - 唯一标识字段名
   * @param {string} idValue - 唯一标识值
   * @param {object} globalData - 应用全局数据对象
   * @returns {Array} - 更新后的数组
   */
  deleteItem(key, idField, idValue, globalData) {
    const items = this.get(key);
    
    // 使用索引快速定位记录位置
    let index = -1;
    if (idField === this.indices[key]) {
      const item = this.findById(key, idValue);
      if (item) {
        index = items.indexOf(item);
      }
    }
    
    // 后备方案：遍历查找
    if (index === -1) {
      index = items.findIndex(item => item[idField] === idValue);
    }
    
    if (index !== -1) {
      items.splice(index, 1);
      this.setWithGlobalSync(key, items, globalData);
    }
    
    return items;
  }

  /**
   * 根据条件查找数组类型数据中的记录
   * @param {string} key - 存储键名
   * @param {function} condition - 条件函数
   * @returns {Array} - 符合条件的记录数组
   */
  findItems(key, condition) {
    const items = this.get(key);
    return items.filter(condition);
  }

  /**
   * 根据条件查找数组类型数据中的单个记录
   * @param {string} key - 存储键名
   * @param {function|object} condition - 条件函数或对象
   * @returns {object|null} - 符合条件的记录或null
   */
  findOne(key, condition) {
    // 如果使用索引字段进行精确查找，使用索引提高效率
    if (this.cache['_indices'] && this.cache['_indices'][key] && typeof condition === 'object') {
      const indexField = this.indices[key];
      if (condition[indexField]) {
        return this.cache['_indices'][key][condition[indexField]] || null;
      }
    }
    
    // 否则使用条件函数查找
    const items = this.get(key);
    if (typeof condition === 'function') {
      return items.find(condition) || null;
    }
    
    // 如果是对象条件，遍历属性进行匹配
    if (typeof condition === 'object') {
      return items.find(item => {
        return Object.keys(condition).every(field => item[field] === condition[field]);
      }) || null;
    }
    
    return null;
  }

  /**
   * 根据ID快速查找记录（使用索引）
   * @param {string} key - 存储键名
   * @param {string} id - 记录ID
   * @returns {object|null} - 找到的记录或null
   */
  findById(key, id) {
    if (this.cache['_indices'] && this.cache['_indices'][key]) {
      return this.cache['_indices'][key][id] || null;
    }
    
    // 后备方案：遍历查找
    const items = this.get(key);
    return items.find(item => item._id === id) || null;
  }

  /**
   * 初始化所有数据的本地存储
   * @param {object} appInstance - 应用实例
   */
  initAllData(appInstance) {
    const globalData = appInstance.globalData;
    
    // 初始化所有默认数据
    Object.keys(this.defaults).forEach(key => {
      const data = this.get(key);
      if (!data || data.length === 0) {
        this.setWithGlobalSync(key, this.defaults[key], globalData);
      } else {
        globalData[key] = data;
      }
    });
  }
}

// 创建单例实例
const storageManager = new StorageManager();

module.exports = storageManager;