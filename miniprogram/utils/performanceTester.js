/**
 * 性能测试工具 - 用于测量关键函数的执行时间
 */

class PerformanceTester {
  constructor() {
    this.testResults = {};
  }

  /**
   * 测量函数执行时间
   * @param {string} testName - 测试名称
   * @param {Function} func - 要测试的函数
   * @param {Array} args - 函数参数
   * @returns {any} 函数执行结果
   */
  measure(testName, func, args = []) {
    const startTime = Date.now();
    const result = func(...args);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // 保存测试结果
    if (!this.testResults[testName]) {
      this.testResults[testName] = {
        totalTime: 0,
        count: 0,
        averageTime: 0
      };
    }

    this.testResults[testName].totalTime += duration;
    this.testResults[testName].count += 1;
    this.testResults[testName].averageTime = this.testResults[testName].totalTime / this.testResults[testName].count;

    console.log(`[性能测试] ${testName}: ${duration}ms`);
    return result;
  }

  /**
   * 异步测量函数执行时间
   * @param {string} testName - 测试名称
   * @param {Function} asyncFunc - 要测试的异步函数
   * @param {Array} args - 函数参数
   * @returns {Promise<any>} 函数执行结果
   */
  async measureAsync(testName, asyncFunc, args = []) {
    const startTime = Date.now();
    const result = await asyncFunc(...args);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // 保存测试结果
    if (!this.testResults[testName]) {
      this.testResults[testName] = {
        totalTime: 0,
        count: 0,
        averageTime: 0
      };
    }

    this.testResults[testName].totalTime += duration;
    this.testResults[testName].count += 1;
    this.testResults[testName].averageTime = this.testResults[testName].totalTime / this.testResults[testName].count;

    console.log(`[性能测试] ${testName}: ${duration}ms`);
    return result;
  }

  /**
   * 运行性能基准测试
   */
  runBenchmark() {
    console.log('\n========== 性能基准测试开始 ==========');

    // 测试storageManager的性能
    this.testStorageManager();

    // 测试数据处理性能
    this.testDataProcessing();

    console.log('\n========== 性能基准测试结果 ==========');
    this.printResults();
  }

  /**
   * 测试storageManager的性能
   */
  testStorageManager() {
    const storageManager = require('./storageManager');

    // 准备测试数据
    const testData = {
      testArray: Array(1000).fill().map((_, i) => ({ id: i, name: `Item ${i}`, value: Math.random() }))
    };

    // 测试写入性能
    this.measure('storageManager写入1000条数据', () => {
      storageManager.set('testBenchmarkData', testData);
    });

    // 测试读取性能
    this.measure('storageManager读取1000条数据', () => {
      storageManager.get('testBenchmarkData');
    });

    // 测试缓存读取性能
    this.measure('storageManager缓存读取1000条数据', () => {
      storageManager.get('testBenchmarkData');
    });

    // 清理测试数据
    storageManager.remove('testBenchmarkData');
  }

  /**
   * 测试数据处理性能
   */
  testDataProcessing() {
    // 准备测试数据
    const testRecords = Array(10000).fill().map((_, i) => ({
      id: i,
      type: i % 2 === 0 ? 'income' : 'expense',
      amount: Math.random() * 1000,
      category: i % 10 === 0 ? '餐饮' : i % 10 === 1 ? '交通' : i % 10 === 2 ? '购物' : '其他',
      date: `2026-01-${String(i % 28 + 1).padStart(2, '0')}`
    }));

    // 测试数据过滤性能
    this.measure('过滤10000条记录', () => {
      return testRecords.filter(record => record.date.startsWith('2026-01-15') && record.type === 'expense');
    });

    // 测试数据映射性能
    this.measure('映射10000条记录', () => {
      return testRecords.map(record => ({
        ...record,
        formattedAmount: record.amount.toFixed(2),
        isLargeAmount: record.amount > 500
      }));
    });

    // 测试数据聚合性能
    this.measure('聚合10000条记录', () => {
      return testRecords.reduce((result, record) => {
        if (!result[record.category]) {
          result[record.category] = {
            count: 0,
            totalAmount: 0
          };
        }
        result[record.category].count += 1;
        result[record.category].totalAmount += record.amount;
        return result;
      }, {});
    });
  }

  /**
   * 打印测试结果
   */
  printResults() {
    Object.keys(this.testResults).forEach(testName => {
      const result = this.testResults[testName];
      console.log(`${testName}: 平均 ${result.averageTime.toFixed(2)}ms (执行 ${result.count} 次)`);
    });
  }

  /**
   * 清除测试结果
   */
  clearResults() {
    this.testResults = {};
  }

  /**
   * 获取测试结果
   * @returns {Object} 测试结果
   */
  getResults() {
    return this.testResults;
  }
}

// 导出单例实例
let performanceTesterInstance = null;

const getPerformanceTester = () => {
  if (!performanceTesterInstance) {
    performanceTesterInstance = new PerformanceTester();
  }
  return performanceTesterInstance;
};

module.exports = {
  PerformanceTester,
  getPerformanceTester
};
