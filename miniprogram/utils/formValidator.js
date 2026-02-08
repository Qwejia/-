/**
 * 表单验证工具 - 统一处理表单验证逻辑
 */

// 验证规则配置
const VALIDATION_RULES = {
  // 必填项
  required: {
    validate: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return false;
    },
    message: '此项为必填项'
  },
  
  // 数字验证
  number: {
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(parseFloat(value));
    },
    message: '请输入有效的数字'
  },
  
  // 正数验证
  positive: {
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    },
    message: '请输入正数'
  },
  
  // 非负数验证
  nonNegative: {
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    },
    message: '请输入非负数'
  },
  
  // 会计凭证借贷平衡验证
  balanced: {
    validate: (debit, credit) => {
      const debitTotal = parseFloat(debit) || 0;
      const creditTotal = parseFloat(credit) || 0;
      return Math.abs(debitTotal - creditTotal) < 0.01;
    },
    message: '借贷金额必须平衡'
  },
  
  // 最小长度验证
  minLength: {
    validate: (value, min) => {
      if (value === '' || value === null || value === undefined) return true;
      return value.toString().length >= min;
    },
    message: (min) => `长度不能少于${min}个字符`
  },
  
  // 最大长度验证
  maxLength: {
    validate: (value, max) => {
      if (value === '' || value === null || value === undefined) return true;
      return value.toString().length <= max;
    },
    message: (max) => `长度不能超过${max}个字符`
  },
  
  // 手机号码验证
  phone: {
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return /^1[3-9]\d{9}$/.test(value);
    },
    message: '请输入有效的手机号码'
  },
  
  // 身份证号码验证
  idCard: {
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
    },
    message: '请输入有效的身份证号码'
  },
  
  // 日期格式验证 (YYYY-MM-DD)
  date: {
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    },
    message: '请输入有效的日期格式 (YYYY-MM-DD)'
  }
};

class FormValidator {
  constructor(page) {
    this.page = page;
    this.errors = {};
    this.validators = {};
  }

  /**
   * 添加验证规则
   * @param {string} field - 字段名
   * @param {Array} rules - 验证规则数组
   */
  addRule(field, rules) {
    this.validators[field] = rules;
  }

  /**
   * 验证单个字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @returns {Object} 验证结果 {isValid, message}
   */
  validateField(field, value) {
    const rules = this.validators[field];
    if (!rules || rules.length === 0) {
      return { isValid: true, message: '' };
    }

    for (const ruleConfig of rules) {
      const ruleName = ruleConfig.rule;
      const ruleParams = Array.isArray(ruleConfig.params) ? ruleConfig.params : [ruleConfig.params];
      const customMessage = ruleConfig.message;
      
      const rule = VALIDATION_RULES[ruleName];
      if (!rule) {
        console.warn(`验证规则 ${ruleName} 不存在`);
        continue;
      }

      const isValid = rule.validate(value, ...ruleParams);
      if (!isValid) {
        const message = customMessage || (typeof rule.message === 'function' ? rule.message(...ruleParams) : rule.message);
        return { isValid: false, message: message };
      }
    }

    return { isValid: true, message: '' };
  }

  /**
   * 验证整个表单
   * @param {Object} formData - 表单数据
   * @returns {Object} 验证结果 {isValid, errors}
   */
  validateForm(formData) {
    const errors = {};
    let isValid = true;

    // 验证所有字段
    for (const field in this.validators) {
      const value = formData[field];
      const validationResult = this.validateField(field, value);
      
      if (!validationResult.isValid) {
        errors[field] = validationResult.message;
        isValid = false;
      }
    }

    // 更新页面中的错误状态
    if (this.page && this.page.setData) {
      this.page.setData({ errors: errors });
    }

    this.errors = errors;
    return { isValid, errors };
  }

  /**
   * 实时验证字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @returns {Object} 验证结果 {isValid, message}
   */
  validateFieldRealtime(field, value) {
    const validationResult = this.validateField(field, value);
    
    // 更新错误信息
    if (!validationResult.isValid) {
      this.errors[field] = validationResult.message;
    } else {
      delete this.errors[field];
    }
    
    // 更新页面中的错误状态
    if (this.page && this.page.setData) {
      this.page.setData({ errors: this.errors });
    }
    
    return validationResult;
  }

  /**
   * 获取特定字段的错误信息
   * @param {string} field - 字段名
   * @returns {string} 错误信息
   */
  getError(field) {
    return this.errors[field] || '';
  }

  /**
   * 清空所有错误信息
   */
  clearErrors() {
    this.errors = {};
    if (this.page && this.page.setData) {
      this.page.setData({ errors: {} });
    }
  }

  /**
   * 显示错误提示
   * @param {string} message - 错误信息
   */
  showError(message) {
    if (wx && wx.showToast) {
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    }
  }

  /**
   * 显示成功提示
   * @param {string} message - 成功信息
   */
  showSuccess(message) {
    if (wx && wx.showToast) {
      wx.showToast({
        title: message,
        icon: 'success',
        duration: 1500
      });
    }
  }

  /**
   * 验证借贷平衡
   * @param {number} debit - 借方金额
   * @param {number} credit - 贷方金额
   * @returns {Object} 验证结果 {isValid, message}
   */
  validateBalanced(debit, credit) {
    const isValid = VALIDATION_RULES.balanced.validate(debit, credit);
    const message = VALIDATION_RULES.balanced.message;
    return { isValid, message };
  }

  /**
   * 验证辅助核算
   * @param {Array} entries - 凭证分录
   * @param {Array} accounts - 会计科目列表
   * @returns {Object} 验证结果 {isValid, message}
   */
  validateAuxAccounting(entries, accounts) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry.accountId) continue;
      
      // 获取当前科目信息
      const account = accounts.find(acc => acc._id === entry.accountId);
      if (!account || !account.auxAccounting || account.auxAccounting.length === 0) continue;
      
      // 检查是否所有需要的辅助核算都已填写
      for (const auxType of account.auxAccounting) {
        if (!entry.auxAccounting || !entry.auxAccounting[auxType]) {
          const message = `第${i + 1}行需填写${auxType}辅助核算`;
          return { isValid: false, message, line: i + 1, auxType: auxType };
        }
      }
    }
    
    return { isValid: true, message: '' };
  }

  /**
   * 统一处理表单提交
   * @param {Object} formData - 表单数据
   * @param {Function} submitFunction - 提交函数
   * @param {Object} options - 配置选项
   * @returns {Promise} Promise对象
   */
  async handleSubmit(formData, submitFunction, options = {}) {
    try {
      // 显示加载提示
      if (wx && wx.showLoading && options.showLoading !== false) {
        wx.showLoading({
          title: options.loadingTitle || '提交中...',
          mask: true
        });
      }
      
      // 验证表单
      const validationResult = this.validateForm(formData);
      if (!validationResult.isValid) {
        // 显示第一个错误
        const firstErrorField = Object.keys(validationResult.errors)[0];
        const firstError = validationResult.errors[firstErrorField];
        this.showError(firstError);
        return Promise.reject({ type: 'validation', errors: validationResult.errors });
      }
      
      // 执行提交函数
      const result = await submitFunction(formData);
      
      // 显示成功提示
      if (options.successMessage) {
        this.showSuccess(options.successMessage);
      }
      
      return result;
    } catch (error) {
      // 处理错误
      if (error.type === 'validation') {
        // 已经处理过的验证错误
      } else {
        this.showError(options.errorMessage || '提交失败，请稍后重试');
      }
      throw error;
    } finally {
      // 隐藏加载提示
      if (wx && wx.hideLoading) {
        wx.hideLoading();
      }
    }
  }
}

// 导出工具
module.exports = {
  FormValidator,
  VALIDATION_RULES,
  
  // 创建表单验证器实例
  createValidator: (page) => {
    return new FormValidator(page);
  },
  
  // 快捷验证方法
  validate: (value, rules) => {
    const validator = new FormValidator();
    validator.addRule('field', rules);
    return validator.validateField('field', value);
  }
};
