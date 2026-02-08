// 安全性管理工具 - 提供统一的安全性管理接口
// 包括数据加密、解密、安全存储等功能

class SecurityManager {
  constructor() {
    // 加密算法配置
    this.encryptionConfig = {
      algorithm: 'AES-256-CBC',
      keyLength: 32,
      ivLength: 16
    };
    
    // 安全存储配置
    this.storageConfig = {
      securePrefix: 'secure_',
      keyExpiry: 30 * 24 * 60 * 60 * 1000 // 30天过期
    };
    
    // 敏感数据字段
    this.sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'openid',
      'unionid',
      'phone',
      'email',
      'idCard'
    ];
  }
  
  // 生成随机密钥
  generateKey(length = this.encryptionConfig.keyLength) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
  
  // 生成初始化向量
  generateIV(length = this.encryptionConfig.ivLength) {
    return this.generateKey(length);
  }
  
  // 加密数据（模拟实现，实际项目中应使用真实的加密算法）
  encrypt(data, key = this.generateKey()) {
    try {
      // 检查数据类型
      if (typeof data === 'object' && data !== null) {
        data = JSON.stringify(data);
      } else if (typeof data !== 'string') {
        data = String(data);
      }
      
      // 模拟加密（实际项目中应使用真实的加密算法）
      // 这里使用简单的base64编码作为模拟
      const encryptedData = btoa(encodeURIComponent(data));
      
      return {
        encryptedData,
        key,
        iv: this.generateIV(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('加密数据失败:', error);
      return null;
    }
  }
  
  // 解密数据（模拟实现，实际项目中应使用真实的加密算法）
  decrypt(encryptedData, key) {
    try {
      // 模拟解密（实际项目中应使用真实的加密算法）
      // 这里使用简单的base64解码作为模拟
      const decryptedData = decodeURIComponent(atob(encryptedData));
      
      // 尝试解析为JSON对象
      try {
        return JSON.parse(decryptedData);
      } catch {
        return decryptedData;
      }
    } catch (error) {
      console.error('解密数据失败:', error);
      return null;
    }
  }
  
  // 安全存储数据
  secureStore(key, data, expiry = this.storageConfig.keyExpiry) {
    try {
      // 加密数据
      const encryptedResult = this.encrypt(data);
      if (!encryptedResult) {
        return false;
      }
      
      // 构建安全存储对象
      const secureData = {
        ...encryptedResult,
        expiry: Date.now() + expiry,
        key: this.storageConfig.securePrefix + key
      };
      
      // 存储到本地存储
      wx.setStorageSync(this.storageConfig.securePrefix + key, secureData);
      return true;
    } catch (error) {
      console.error('安全存储数据失败:', error);
      return false;
    }
  }
  
  // 安全获取数据
  secureGet(key) {
    try {
      // 从本地存储获取数据
      const secureData = wx.getStorageSync(this.storageConfig.securePrefix + key);
      if (!secureData) {
        return null;
      }
      
      // 检查是否过期
      if (Date.now() > secureData.expiry) {
        // 删除过期数据
        this.secureRemove(key);
        return null;
      }
      
      // 解密数据
      const decryptedData = this.decrypt(secureData.encryptedData, secureData.key);
      return decryptedData;
    } catch (error) {
      console.error('安全获取数据失败:', error);
      return null;
    }
  }
  
  // 安全删除数据
  secureRemove(key) {
    try {
      wx.removeStorageSync(this.storageConfig.securePrefix + key);
      return true;
    } catch (error) {
      console.error('安全删除数据失败:', error);
      return false;
    }
  }
  
  // 清除所有安全存储数据
  secureClear() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(this.storageConfig.securePrefix)) {
          wx.removeStorageSync(key);
        }
      });
      return true;
    } catch (error) {
      console.error('清除安全存储数据失败:', error);
      return false;
    }
  }
  
  // 脱敏处理敏感数据
  maskSensitiveData(data, fields = this.sensitiveFields) {
    try {
      if (typeof data === 'object' && data !== null) {
        // 深拷贝数据
        const maskedData = JSON.parse(JSON.stringify(data));
        
        // 递归处理对象
        const maskObject = (obj) => {
          Object.keys(obj).forEach(key => {
            if (fields.includes(key.toLowerCase())) {
              // 脱敏处理
              const value = obj[key];
              if (typeof value === 'string') {
                if (value.length <= 4) {
                  obj[key] = '****';
                } else {
                  obj[key] = value.substring(0, 2) + '****' + value.substring(value.length - 2);
                }
              }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              maskObject(obj[key]);
            }
          });
        };
        
        maskObject(maskedData);
        return maskedData;
      } else if (typeof data === 'string') {
        // 检查是否为敏感数据
        if (fields.some(field => data.toLowerCase().includes(field.toLowerCase()))) {
          return data.length <= 4 ? '****' : data.substring(0, 2) + '****' + data.substring(data.length - 2);
        }
        return data;
      }
      return data;
    } catch (error) {
      console.error('脱敏处理敏感数据失败:', error);
      return data;
    }
  }
  
  // 验证数据安全性
  validateDataSecurity(data) {
    try {
      // 检查数据大小
      const dataSize = JSON.stringify(data).length;
      if (dataSize > 1024 * 1024) { // 1MB
        console.warn('数据大小超过1MB，可能存在安全风险');
        return false;
      }
      
      // 检查敏感字段
      const hasSensitiveFields = this.sensitiveFields.some(field => {
        if (typeof data === 'object' && data !== null) {
          return field in data;
        } else if (typeof data === 'string') {
          return data.toLowerCase().includes(field.toLowerCase());
        }
        return false;
      });
      
      if (hasSensitiveFields) {
        console.warn('数据包含敏感字段，应使用安全存储');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('验证数据安全性失败:', error);
      return false;
    }
  }
  
  // 生成安全的随机ID
  generateSecureId(prefix = 'id', length = 16) {
    const timestamp = Date.now().toString(36);
    const randomPart = this.generateKey(length).toLowerCase();
    return `${prefix}_${timestamp}_${randomPart}`;
  }
  
  // 验证ID安全性
  validateId(id) {
    try {
      // 检查ID格式
      const idRegex = /^[a-zA-Z0-9_-]{8,36}$/;
      if (!idRegex.test(id)) {
        return false;
      }
      
      // 检查ID长度
      if (id.length > 36) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('验证ID安全性失败:', error);
      return false;
    }
  }
  
  // 获取安全性配置
  getConfig() {
    return {
      encryptionConfig: this.encryptionConfig,
      storageConfig: this.storageConfig,
      sensitiveFields: this.sensitiveFields
    };
  }
  
  // 设置安全性配置
  setConfig(config) {
    if (config.encryptionConfig) {
      this.encryptionConfig = { ...this.encryptionConfig, ...config.encryptionConfig };
    }
    if (config.storageConfig) {
      this.storageConfig = { ...this.storageConfig, ...config.storageConfig };
    }
    if (config.sensitiveFields) {
      this.sensitiveFields = [...this.sensitiveFields, ...config.sensitiveFields];
    }
  }
}

// 导出单例实例
let securityManagerInstance = null;

function getSecurityManager() {
  if (!securityManagerInstance) {
    securityManagerInstance = new SecurityManager();
  }
  return securityManagerInstance;
}

// 导出实例，方便直接使用
const securityManager = getSecurityManager();

module.exports = securityManager;