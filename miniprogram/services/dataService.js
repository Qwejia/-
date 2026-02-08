const storageManager = require('../utils/storageManager');
const { getStateManager } = require('../utils/stateManager');
const cloudConfig = require('../config/cloud');

const stateManager = getStateManager();

const VALID_DATA_TYPES = new Set([
  'categories', 'records', 'vouchers', 'voucherEntries',
  'customers', 'suppliers', 'auxAccountingTypes', 'departments',
  'projects', 'accounts', 'apInvoices', 'apPayments', 'apWriteOffs',
  'arInvoices', 'arReceipts', 'arWriteOffs', 'checkoutRecords',
  'invoices', 'invoiceItems'
]);

class DataService {
  initData(data, level = 'error') {
    stateManager.batch(() => {
      Object.keys(data).forEach(key => {
        try {
          const currentData = storageManager.get(key);
          if (!currentData || currentData.length === 0) {
            storageManager.set(key, data[key]);
            stateManager.set(key, data[key]);
          } else {
            stateManager.set(key, currentData);
          }
        } catch (error) {
          console.warn(`数据初始化失败 [${key}]`, error);
          stateManager.set(key, data[key]);
        }
      });
    });
  }

  getDataFromLocal(dataType) {
    if (!VALID_DATA_TYPES.has(dataType)) {
      console.error(`不支持的数据类型: ${dataType}`);
      return [];
    }
    
    const stateData = stateManager.get(dataType);
    if (stateData?.length > 0) {
      return stateData;
    }
    
    return storageManager.get(dataType) || [];
  }

  saveDataToLocal(dataType, data) {
    if (!VALID_DATA_TYPES.has(dataType)) {
      console.error(`不支持的数据类型: ${dataType}`);
      return;
    }
    
    storageManager.set(dataType, data);
    stateManager.set(dataType, data);
  }

  /**
   * 同步云数据到本地
   * 将云端最新数据同步到本地存储，确保数据一致性
   */
  async syncCloudToLocal(options = {}) {
    try {
      // 检查是否正在同步
      if (stateManager.get('isSyncing')) {
        console.log('已有同步任务正在进行中，本次同步请求将被忽略');
        return { success: false, message: '同步任务正在进行中' };
      }
      
      stateManager.set('isSyncing', true);
      
      // 检查云环境是否可用
      if (!wx.cloud || !stateManager.get('cloud')) {
        console.warn('云环境不可用，跳过云数据同步');
        stateManager.set('isSyncing', false);
        return { 
          success: false, 
          message: '云环境不可用，使用本地数据',
          useLocalData: true
        };
      }
      
      try {
        const db = wx.cloud.database();
        
        // 获取上次同步时间
        const lastSyncTime = stateManager.get('lastSyncTime') || 0;
        const syncStartTime = Date.now();
        
        // 需要同步的集合列表
        const collections = options.collections || [
          cloudConfig.database.collections.categories,
          cloudConfig.database.collections.records
        ];
        
        // 记录本次同步的更新数量
        const syncStats = {
          totalUpdated: 0,
          collections: {},
          startTime: syncStartTime,
          endTime: null
        };
        
        // 批量获取所有集合的数据
        const syncPromises = collections.map(async (collectionName) => {
          try {
            // 只获取自上次同步以来更新的数据
            const collectionRes = await db.collection(collectionName)
              .where({
                updatedAt: db.command.gt(lastSyncTime)
              })
              .field({
                // 只获取必要字段，减少数据传输
                _id: true,
                name: true,
                type: true,
                amount: true,
                date: true,
                status: true,
                updatedAt: true
              })
              .get();
            
            return { collectionName, data: collectionRes.data, error: null };
          } catch (error) {
            console.warn(`同步集合 ${collectionName} 失败，使用本地数据：`, error);
            return { collectionName, data: [], error };
          }
        });
        
        // 并行执行所有同步请求
        const syncResults = await Promise.all(syncPromises);
        
        // 处理同步结果
        let hasSuccessfulSync = false;
        syncResults.forEach(({ collectionName, data, error }) => {
          if (error) {
            // 特殊处理集合不存在的错误，不视为严重错误
            if (error.errCode === -502005) {
              console.warn(`云数据库集合 ${collectionName} 不存在，跳过同步：`, error.errMsg);
              syncStats.collections[collectionName] = 0; // 标记为跳过
            } else {
              console.warn(`同步集合 ${collectionName} 失败，使用本地数据：`, error);
              syncStats.collections[collectionName] = -1; // 标记为失败
            }
            return;
          }
          
          hasSuccessfulSync = true;
          
          if (data && data.length > 0) {
            // 获取本地现有数据
            const localData = this.getData(collectionName);
            
            // 更新本地数据（只替换或添加新数据）
            // 使用Map优化查找性能，从O(n)降到O(1)
            const localDataMap = new Map(localData.map(item => [item._id, item]));
            let updatedCount = 0;
            
            data.forEach(cloudItem => {
              // 只更新真正需要更新的数据
              const localItem = localDataMap.get(cloudItem._id);
              if (!localItem || cloudItem.updatedAt > (localItem.updatedAt || 0)) {
                localDataMap.set(cloudItem._id, cloudItem);
                updatedCount++;
              }
            });
            
            if (updatedCount > 0) {
              const updatedData = Array.from(localDataMap.values());
              
              // 保存更新后的数据
              this.saveData(collectionName, updatedData);
              
              // 更新同步统计
              syncStats.totalUpdated += updatedCount;
              syncStats.collections[collectionName] = updatedCount;
              
              console.log(`成功同步集合 ${collectionName} 的 ${updatedCount} 条数据`);
            } else {
              syncStats.collections[collectionName] = 0;
              console.log(`集合 ${collectionName} 没有需要更新的数据`);
            }
          } else {
            syncStats.collections[collectionName] = 0;
            console.log(`集合 ${collectionName} 没有新数据需要同步`);
          }
        });
        
        // 记录本次同步时间
        stateManager.set('lastSyncTime', syncStartTime);
        this.saveData('lastSyncTime', syncStartTime);
        
        syncStats.endTime = Date.now();
        syncStats.duration = syncStats.endTime - syncStats.startTime;
        
        // 清除同步状态
        stateManager.set('isSyncing', false);
        
        if (hasSuccessfulSync) {
          console.log('云数据同步到本地成功', syncStats);
          return { 
            success: true, 
            stats: syncStats,
            message: '云数据同步成功' 
          };
        } else {
          console.warn('云数据同步失败，使用本地数据');
          return { 
            success: false, 
            message: '云数据同步失败，使用本地数据',
            useLocalData: true
          };
        }
      } catch (error) {
        console.warn('云数据同步失败，使用本地数据：', error);
        
        // 清除同步状态
        stateManager.set('isSyncing', false);
        
        return { 
          success: false, 
          message: '云数据同步失败，使用本地数据',
          useLocalData: true,
          error 
        };
      }
    } catch (error) {
      console.warn('云数据同步失败，使用本地数据：', error);
      
      // 清除同步状态
      stateManager.set('isSyncing', false);
      
      return { 
        success: false, 
        message: '云数据同步失败，使用本地数据',
        useLocalData: true,
        error 
      };
    }
  }

  // 通用数据存取方法
  // 基于storageManager封装的统一数据操作接口
  
  // 获取数据
  getData(key) {
    try {
      // 先从状态管理获取数据
      const stateData = stateManager.get(key);
      if (stateData !== undefined) {
        return stateData;
      }
      // 从本地存储获取数据
      const result = storageManager.get(key);
      // 同步到状态管理
      if (result !== undefined) {
        stateManager.set(key, result);
      }
      return result;
    } catch (error) {
      console.error(`获取数据 [${key}] 失败：`, error);
      // 返回空数组或空对象，避免应用崩溃
      // 根据数据类型的常见用法返回默认值
      return [];
    }
  }
  
  // 保存数据
  saveData(key, data) {
    try {
      // 保存到本地存储
      storageManager.set(key, data);
      // 保存到状态管理
      stateManager.set(key, data);
      return true;
    } catch (error) {
      console.error(`保存数据 [${key}] 失败：`, error);
      return false;
    }
  }
  
  // 添加单条记录
  addDataItem(key, item) {
    try {
      // 从状态管理获取现有数据
      let existingData = stateManager.get(key) || [];
      // 添加新记录
      existingData.push(item);
      // 保存到本地存储
      storageManager.set(key, existingData);
      // 保存到状态管理
      stateManager.set(key, existingData);
      return true;
    } catch (error) {
      console.error(`添加数据项 [${key}] 失败：`, error);
      return false;
    }
  }
  
  // 批量添加记录
  addDataItems(key, items) {
    try {
      // 从状态管理获取现有数据
      let existingData = stateManager.get(key) || [];
      // 添加新记录
      const newData = [...existingData, ...items];
      // 保存到本地存储
      storageManager.set(key, newData);
      // 保存到状态管理
      stateManager.set(key, newData);
      return true;
    } catch (error) {
      console.error(`批量添加数据项 [${key}] 失败：`, error);
      return false;
    }
  }
  
  // 更新记录
  updateDataItem(key, idField, idValue, updateData) {
    try {
      // 从状态管理获取现有数据
      let existingData = stateManager.get(key) || [];
      // 查找并更新记录
      const index = existingData.findIndex(item => item[idField] === idValue);
      if (index !== -1) {
        existingData[index] = { ...existingData[index], ...updateData };
        // 保存到本地存储
        storageManager.set(key, existingData);
        // 保存到状态管理
        stateManager.set(key, existingData);
      }
      return true;
    } catch (error) {
      console.error(`更新数据项 [${key}] 失败：`, error);
      return false;
    }
  }
  
  // 删除记录
  deleteDataItem(key, idField, idValue) {
    try {
      // 从状态管理获取现有数据
      let existingData = stateManager.get(key) || [];
      // 过滤掉要删除的记录
      const filteredData = existingData.filter(item => item[idField] !== idValue);
      // 保存到本地存储
      storageManager.set(key, filteredData);
      // 保存到状态管理
      stateManager.set(key, filteredData);
      return true;
    } catch (error) {
      console.error(`删除数据项 [${key}] 失败：`, error);
      return false;
    }
  }
  
  // 根据条件查找记录
  findDataItems(key, condition) {
    try {
      // 从状态管理获取数据
      const data = stateManager.get(key) || storageManager.get(key) || [];
      // 根据条件过滤
      return data.filter(condition);
    } catch (error) {
      console.error(`查找数据项 [${key}] 失败：`, error);
      return [];
    }
  }
  
  // 根据条件查找单条记录
  findDataItem(key, condition) {
    try {
      // 从状态管理获取数据
      const data = stateManager.get(key) || storageManager.get(key) || [];
      // 根据条件查找
      return data.find(condition);
    } catch (error) {
      console.error(`查找单条数据项 [${key}] 失败：`, error);
      return null;
    }
  }
}

// 导出单例实例
let dataServiceInstance = null;

const getDataService = () => {
  if (!dataServiceInstance) {
    dataServiceInstance = new DataService();
  }
  return dataServiceInstance;
};

module.exports = {
  DataService,
  getDataService
};