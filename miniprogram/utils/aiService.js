const networkManager = require('./networkManager');

const AI_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DEFAULT_MODEL = 'deepseek-v3-250324';

class AIService {
  constructor() {
    this.apiUrl = AI_API_URL;
    this.apiKey = this.getApiKey();
    this.defaultModel = DEFAULT_MODEL;
    this.requestCache = new Map();
  }

  getApiKey() {
    try {
      const cloudConfig = require('../config/cloud');
      if (cloudConfig && cloudConfig.ai && cloudConfig.ai.apiKey && cloudConfig.ai.apiKey.trim() !== '') {
        return cloudConfig.ai.apiKey;
      }
      console.log('配置文件中未设置API密钥');
    } catch (error) {
      console.log('无法从配置文件获取AI API密钥');
    }
    return '';
  }

  async requestAI(options) {
    const {
      prompt = '请提供财务分析',
      model = this.defaultModel
    } = options;

    const safePrompt = prompt && typeof prompt === 'string' ? prompt : '请提供财务分析';
    
    const cacheKey = `${model}:${safePrompt}`;
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }

    if (!this.apiKey || this.apiKey.trim() === '') {
      console.log('未配置API密钥，返回模拟数据');
      return this.getMockResponse(safePrompt);
    }

    try {
      const requestOptions = {
        url: this.apiUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        data: {
          model: model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的财务助手，擅长回答各种财务、税务、会计相关的问题。请用简洁、准确、专业的语言回答用户的问题。'
            },
            {
              role: 'user',
              content: safePrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        cache: false
      };

      console.log('发送AI请求:', this.apiUrl);
      const response = await networkManager.request(requestOptions);
      console.log('收到AI响应:', response);
      
      let aiResponseText = '';
      if (response && response.choices && response.choices[0] && response.choices[0].message) {
        aiResponseText = response.choices[0].message.content || 'AI分析完成';
      }
      
      if (!aiResponseText) {
        console.log('AI响应为空，使用本地知识库');
        aiResponseText = this.getMockResponse(safePrompt);
      }
      
      const aiResponse = {
        output: [
          {
            content: [
              {
                text: aiResponseText
              }
            ]
          }
        ]
      };
      
      this.requestCache.set(cacheKey, aiResponse);
      if (this.requestCache.size > 50) {
        const firstKey = this.requestCache.keys().next().value;
        this.requestCache.delete(firstKey);
      }
      
      return aiResponse;
    } catch (error) {
      console.log('AI请求错误:', error);
      return this.getMockResponse(safePrompt);
    }
  }

  getMockResponse(prompt) {
    return {
      output: [
        {
          content: [
            {
              text: `# 财务分析报告\n\n## 1. 财务状况分析\n- 财务数据分析完成\n- 收支平衡状况良好\n\n## 2. 经营成果分析\n- 经营状况稳定\n- 财务指标健康\n\n## 3. 存在的问题\n- 数据样本较少，分析深度有限\n- 缺乏历史数据对比\n\n## 4. 改进建议\n- 增加数据采集范围\n- 建立长期财务监控机制\n\n## 系统提示\n- 由于网络原因或API密钥未配置，使用了模拟数据\n- 实际AI分析可能会更加准确\n\n如需使用在线AI功能，请点击页面右上角的🔑图标配置API密钥。`
            }
          ]
        }
      ]
    };
  }

  async financialAssistant(question) {
    const prompt = `请回答以下财务问题：${question}\n\n请提供详细、准确的回答，包括相关的财务知识和建议。`;
    return this.requestAI({ prompt });
  }

  async bookkeepingAssistant(description) {
    const prompt = `请根据以下交易描述，建议合适的记账分类和相关信息：\n\n交易描述：${description}\n\n请提供：\n1. 建议的记账分类（如：管理费用、主营业务收入等）\n2. 交易类型（收入/支出/转账）\n3. 相关的会计科目\n4. 其他建议信息`;
    return this.requestAI({ prompt });
  }

  async reportAnalysis(financialData) {
    const safeFinancialData = financialData && typeof financialData === 'object' ? financialData : {};
    const prompt = `请分析以下财务数据：\n\n${JSON.stringify(safeFinancialData, null, 2)}\n\n请提供：\n1. 财务状况分析\n2. 经营成果分析\n3. 存在的问题\n4. 改进建议`;
    return this.requestAI({ prompt });
  }

  async invoiceRecognition(invoiceInfo) {
    const prompt = `请从以下发票信息中提取关键数据：\n\n${invoiceInfo}\n\n请提取：\n1. 发票类型\n2. 发票号码\n3. 开票日期\n4. 购买方信息\n5. 销售方信息\n6. 金额（含税/不含税）\n7. 税率\n8. 税额\n9. 货物或服务名称`;
    return this.requestAI({ prompt });
  }

  async taxAdvice(taxData) {
    const prompt = `请根据以下财务数据提供税务建议：\n\n${JSON.stringify(taxData, null, 2)}\n\n请提供：\n1. 税务风险评估\n2. 合理避税建议\n3. 税务筹划方案\n4. 合规性建议`;
    return this.requestAI({ prompt });
  }

  clearCache() {
    this.requestCache.clear();
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setDefaultModel(model) {
    this.defaultModel = model;
  }
}

let aiServiceInstance = null;

function getAIService() {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

const aiService = getAIService();

module.exports = aiService;
