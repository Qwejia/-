/**
 * UI管理器 - 统一处理加载状态和错误提示
 */
const app = getApp();

// 加载状态配置
const LOADING_CONFIG = {
  DEFAULT: {
    title: '加载中...',
    mask: true
  },
  LOAD_MORE: {
    title: '加载更多...',
    mask: false
  },
  SUBMIT: {
    title: '提交中...',
    mask: true
  },
  SAVE: {
    title: '保存中...',
    mask: true
  },
  DELETE: {
    title: '删除中...',
    mask: true
  }
};

// 错误提示配置
const ERROR_CONFIG = {
  DEFAULT: {
    title: '操作失败',
    duration: 2000
  },
  NETWORK: {
    title: '网络连接失败',
    duration: 3000
  },
  DATA_EMPTY: {
    title: '暂无数据',
    duration: 2000
  },
  PERMISSION_DENIED: {
    title: '权限不足',
    duration: 2000
  },
  SYSTEM_ERROR: {
    title: '系统错误',
    duration: 3000
  }
};

// 成功提示配置
const SUCCESS_CONFIG = {
  DEFAULT: {
    title: '操作成功',
    duration: 1500
  },
  SAVE: {
    title: '保存成功',
    duration: 1500
  },
  DELETE: {
    title: '删除成功',
    duration: 1500
  },
  SUBMIT: {
    title: '提交成功',
    duration: 1500
  }
};

class UIManager {
  constructor(page) {
    this.page = page;
    this.loadingTasks = new Set();
    this.progressCallbacks = new Map();
  }

  /**
   * 显示加载提示
   * @param {string} type - 加载类型
   * @param {string} title - 自定义标题
   */
  showLoading(type = 'DEFAULT', title = '') {
    const config = LOADING_CONFIG[type] || LOADING_CONFIG.DEFAULT;
    const loadingTitle = title || config.title;
    
    this.loadingTasks.add(type);
    
    wx.showLoading({
      title: loadingTitle,
      mask: config.mask
    });
    
    // 更新页面数据中的加载状态（延迟批量更新，减少渲染次数）
    if (this.page && this.page.setData) {
      this.schedulePageUpdate(type, true);
    }
  }

  /**
   * 隐藏加载提示
   * @param {string} type - 加载类型
   */
  hideLoading(type = 'DEFAULT') {
    this.loadingTasks.delete(type);
    
    // 如果没有其他加载任务，隐藏全局加载提示
    if (this.loadingTasks.size === 0) {
      wx.hideLoading();
    }
    
    // 更新页面数据中的加载状态（延迟批量更新，减少渲染次数）
    if (this.page && this.page.setData) {
      this.schedulePageUpdate(type, false);
    }
  }

  /**
   * 调度页面更新，批量处理加载状态变化
   * @param {string} type - 加载类型
   * @param {boolean} value - 加载状态值
   */
  schedulePageUpdate(type, value) {
    const loadingKey = this.getLoadingKey(type);
    
    // 清理之前的定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    
    // 创建或更新待更新数据
    if (!this.pendingUpdates) {
      this.pendingUpdates = {};
    }
    this.pendingUpdates[loadingKey] = value;
    
    // 设置新的定时器，延迟执行批量更新
      this.updateTimer = setTimeout(() => {
        if (this.page && this.page.setData) {
          this.page.setData(this.pendingUpdates);
        }
        this.pendingUpdates = null;
        this.updateTimer = null;
      }, 16); // 约60fps的时间间隔，减少渲染次数
  }

  /**
   * 根据类型获取对应的加载状态key
   * @param {string} type - 加载类型
   * @returns {string} 加载状态key
   */
  getLoadingKey(type) {
    const keyMap = {
      'DEFAULT': 'loading',
      'LOAD_MORE': 'loadingMore',
      'SUBMIT': 'loadingSubmit',
      'SAVE': 'loadingSave',
      'DELETE': 'loadingDelete'
    };
    return keyMap[type] || 'loading';
  }

  /**
   * 显示错误提示
   * @param {string|Error} error - 错误信息或Error对象
   * @param {string} type - 错误类型
   * @param {object} options - 额外配置选项
   */
  showError(error, type = 'DEFAULT', options = {}) {
    // 解析错误信息
    let errorMessage = this.parseError(error);
    
    // 获取错误配置
    const config = ERROR_CONFIG[type] || ERROR_CONFIG.DEFAULT;
    const title = errorMessage || config.title;
    
    // 显示错误提示
    wx.showToast({
      title: title,
      icon: 'none',
      duration: options.duration || config.duration
    });
    
    // 更新页面数据中的错误信息
    if (this.page && this.page.setData) {
      this.page.setData({ error: title });
    }
    
    // 如果是网络错误，额外处理
    if (type === 'NETWORK' && app.globalData.debug) {
      console.error('网络错误详细信息:', error);
    }
  }

  /**
   * 显示成功提示
   * @param {string} message - 成功信息
   * @param {string} type - 成功类型
   * @param {object} options - 额外配置选项
   */
  showSuccess(message = '', type = 'DEFAULT', options = {}) {
    // 获取成功配置
    const config = SUCCESS_CONFIG[type] || SUCCESS_CONFIG.DEFAULT;
    const title = message || config.title;
    
    wx.showToast({
      title: title,
      icon: 'success',
      duration: options.duration || config.duration
    });
  }

  /**
   * 显示确认对话框
   * @param {object} options - 对话框配置
   * @returns {Promise} Promise对象
   */
  showConfirm(options) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: options.title || '确认',
        content: options.content || '',
        showCancel: options.showCancel !== false,
        cancelText: options.cancelText || '取消',
        confirmText: options.confirmText || '确认',
        confirmColor: options.confirmColor || '#1677ff',
        success: (res) => {
          if (res.confirm) {
            resolve(true);
          } else if (res.cancel) {
            resolve(false);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 显示加载进度
   * @param {number} progress - 进度值(0-100)
   * @param {string} message - 进度提示信息
   */
  showProgress(progress, message = '') {
    // 确保进度值在0-100之间
    const safeProgress = Math.min(100, Math.max(0, progress));
    
    // 更新页面数据中的进度信息
    if (this.page && this.page.setData) {
      this.page.setData({
        loadingProgress: safeProgress,
        showProgress: true,
        progressMessage: message
      });
    }
  }

  /**
   * 隐藏加载进度
   */
  hideProgress() {
    if (this.page && this.page.setData) {
      this.page.setData({
        showProgress: false,
        loadingProgress: 0,
        progressMessage: ''
      });
    }
  }

  /**
   * 解析错误信息
   * @param {string|Error} error - 错误信息或Error对象
   * @returns {string} 解析后的错误信息
   */
  parseError(error) {
    if (!error) return '';
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'object' && error.errMsg) {
      return error.errMsg;
    }
    
    return JSON.stringify(error);
  }

  /**
   * 统一处理异步操作的加载和错误
   * @param {Function} asyncFunction - 异步函数
   * @param {object} options - 配置选项
   * @returns {Promise} Promise对象
   */
  async handleAsync(asyncFunction, options = {}) {
    const { 
      loadingType = 'DEFAULT', 
      loadingTitle = '',
      successMessage = '',
      errorType = 'DEFAULT'
    } = options;
    
    try {
      this.showLoading(loadingType, loadingTitle);
      const result = await asyncFunction();
      this.hideLoading(loadingType);
      
      if (successMessage) {
        this.showSuccess(successMessage, 'DEFAULT');
      }
      
      return result;
    } catch (error) {
      this.hideLoading(loadingType);
      this.showError(error, errorType);
      throw error;
    }
  }

  /**
   * 清理资源
   */
  destroy() {
    this.loadingTasks.clear();
    this.progressCallbacks.clear();
    wx.hideLoading();
    // 清理定时器，避免内存泄漏和页面销毁后的错误
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    // 清除对页面的引用
    this.page = null;
  }
}

// 导出单例实例
let uiManagerInstance = null;

const getUIManager = (page = null) => {
  if (!uiManagerInstance) {
    uiManagerInstance = new UIManager(page);
  } else if (page) {
    uiManagerInstance.page = page;
  }
  return uiManagerInstance;
};

// 导出工具方法
module.exports = {
  getUIManager,
  UIManager,
  // 快捷方法
  showLoading: (...args) => getUIManager().showLoading(...args),
  hideLoading: (...args) => getUIManager().hideLoading(...args),
  showError: (...args) => getUIManager().showError(...args),
  showSuccess: (...args) => getUIManager().showSuccess(...args),
  showConfirm: (...args) => getUIManager().showConfirm(...args),
  showProgress: (...args) => getUIManager().showProgress(...args),
  hideProgress: (...args) => getUIManager().hideProgress(...args),
  handleAsync: (...args) => getUIManager().handleAsync(...args)
};
