// 云存储配置
const cloudStorageConfig = {
  // 腾讯云存储域名
  domain: '636c-cloud1-2gt9701k60beb27b-1388281841.tcb.qcloud.la',
  
  // 云开发环境ID
  envId: 'cloud1-2gt9701k60beb27b',
  
  // 存储路径配置
  paths: {
    // 图片存储路径
    images: 'images/',
    
    // 文档存储路径
    documents: 'documents/',
    
    // 视频存储路径
    videos: 'videos/',
    
    // 音频存储路径
    audios: 'audios/',
    
    // 临时文件存储路径
    temp: 'temp/'
  },
  
  // 构建完整的云存储URL
  getUrl(filePath) {
    if (!filePath) return '';
    
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    const cleanPath = filePath.replace(/^\//, '');
    
    return `https://${this.domain}/${cleanPath}`;
  },
  
  // 构建云存储上传路径
  getUploadPath(fileName, type = 'temp') {
    const pathPrefix = this.paths[type] || this.paths.temp;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    
    return `${pathPrefix}${timestamp}_${randomStr}_${fileName}`;
  }
};

module.exports = cloudStorageConfig;