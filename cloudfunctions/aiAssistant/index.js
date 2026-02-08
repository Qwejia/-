const https = require('https');

exports.main = async (event, context) => {
  console.log('云函数被调用，参数:', event);
  
  const { userMessage } = event;
  
  if (!userMessage) {
    console.log('错误：userMessage为空');
    return { success: false, error: 'userMessage不能为空' };
  }
  
  const apiKey = 'a59845bc-e908-45f8-a558-c6c2f57ad6c3';
  const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  
  const requestData = JSON.stringify({
    model: 'deepseek-v3-250324',
    messages: [
      {
        role: 'system',
        content: '你是专业的财务AI助手，精通税务、财务分析、成本优化等领域。请用简洁专业的语言回答用户的问题。'
      },
      {
        role: 'user',
        content: userMessage
      }
    ]
  });
  
  console.log('准备调用AI API，请求参数:', requestData);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ark.cn-beijing.volces.com',
      port: 443,
      path: '/api/v3/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 25000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('AI API响应，长度:', data.length);
        try {
          const response = JSON.parse(data);
          console.log('解析成功，choices数量:', response.choices ? response.choices.length : 0);
          resolve({ success: true, data: response });
        } catch (error) {
          console.error('解析响应失败:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('AI API调用失败:', error);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error('AI API请求超时');
      reject(new Error('AI API请求超时'));
    });
    
    req.write(requestData);
    req.end();
  });
};