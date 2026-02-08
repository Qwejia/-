class ErrorHandler {
  constructor() {
    this.errorTypes = {
      NETWORK: 'network',
      STORAGE: 'storage',
      AUTH: 'auth',
      VALIDATION: 'validation',
      SERVER: 'server',
      CLIENT: 'client',
      UNKNOWN: 'unknown'
    };
    
    this.errorLevels = {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
      FATAL: 'fatal'
    };
    
    this.errorLog = [];
    this.maxErrorLogCount = 100;
  }
  
  catchError(error, options = {}) {
    const {
      type = this.errorTypes.UNKNOWN,
      level = this.errorLevels.ERROR,
      message = '未知错误',
      context = {},
      showToast = false
    } = options;
    
    const standardizedError = this.standardizeError(error);
    
    const errorInfo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      level,
      message,
      error: standardizedError,
      context,
      stack: standardizedError.stack
    };
    
    this.logError(errorInfo);
    
    if (showToast) {
      this.showErrorToast(message);
    }
    
    return errorInfo;
  }
  
  standardizeError(error) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if (typeof error === 'string') {
      return {
        name: 'Error',
        message: error,
        stack: new Error(error).stack
      };
    } else if (typeof error === 'object' && error !== null) {
      return {
        name: error.name || 'Error',
        message: error.message || JSON.stringify(error),
        stack: error.stack || new Error(JSON.stringify(error)).stack
      };
    } else {
      return {
        name: 'Error',
        message: String(error),
        stack: new Error(String(error)).stack
      };
    }
  }
  
  logError(errorInfo) {
    this.errorLog.push(errorInfo);
    
    if (this.errorLog.length > this.maxErrorLogCount) {
      this.errorLog.shift();
    }
    
    this.outputErrorLog(errorInfo);
  }
  
  outputErrorLog(errorInfo) {
    const { level, type, message, error } = errorInfo;
    
    switch (level) {
      case this.errorLevels.DEBUG:
        console.debug(`[${type}] ${message}:`, error);
        break;
      case this.errorLevels.INFO:
        console.info(`[${type}] ${message}:`, error);
        break;
      case this.errorLevels.WARN:
        console.warn(`[${type}] ${message}:`, error);
        break;
      case this.errorLevels.ERROR:
        console.error(`[${type}] ${message}:`, error);
        break;
      case this.errorLevels.FATAL:
        console.error(`[${type}] ${message}:`, error);
        break;
      default:
        console.error(`[${type}] ${message}:`, error);
    }
  }
  
  showErrorToast(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
  
  showSuccessToast(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });
  }
  
  showLoadingToast(message) {
    wx.showLoading({
      title: message,
      mask: true
    });
  }
  
  hideLoadingToast() {
    wx.hideLoading();
  }
  
  showConfirmDialog(options) {
    const {
      title = '确认操作',
      content = '确定要执行此操作吗？',
      confirmText = '确定',
      cancelText = '取消',
      success = () => {},
      fail = () => {},
      complete = () => {}
    } = options;
    
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      success,
      fail,
      complete
    });
  }
  
  getErrorLog() {
    return this.errorLog;
  }
  
  clearErrorLog() {
    this.errorLog = [];
  }
  
  exportErrorLog() {
    const logContent = JSON.stringify(this.errorLog, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `error-log-${timestamp}.json`;
    
    console.log('导出错误日志:', fileName, logContent);
    
    return {
      fileName,
      content: logContent
    };
  }
  
  wrapAsyncFunction(func, options = {}) {
    return async (...args) => {
      try {
        return await func(...args);
      } catch (error) {
        this.catchError(error, options);
        if (options.throwError) {
          throw error;
        }
        return options.defaultValue;
      }
    };
  }
  
  wrapFunction(func, options = {}) {
    return (...args) => {
      try {
        return func(...args);
      } catch (error) {
        this.catchError(error, options);
        if (options.throwError) {
          throw error;
        }
        return options.defaultValue;
      }
    };
  }
}

let errorHandlerInstance = null;

function getErrorHandler() {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandler();
  }
  return errorHandlerInstance;
}

const errorHandler = getErrorHandler();

module.exports = errorHandler;