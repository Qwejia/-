/**
 * 图表管理器 - 提供多种图表绘制功能
 */
class ChartManager {
  constructor(canvasId, options = {}) {
    this.canvasId = canvasId;
    this.ctx = wx.createCanvasContext(canvasId);
    this.width = options.width || 300;
    this.height = options.height || 300;
    this.options = {
      padding: 20,
      backgroundColor: '#ffffff',
      title: '',
      titleColor: '#333333',
      titleFontSize: 16,
      legend: true,
      legendPosition: 'bottom', // top, bottom, left, right
      ...options
    };
    
    // 预设颜色
    this.colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
  }

  /**
   * 绘制饼图
   * @param {Array} data - 饼图数据，格式：[{name: '名称', value: 值, color: '颜色(可选)'}]
   * @param {Object} options - 饼图选项
   */
  drawPieChart(data, options = {}) {
    // 快速检查数据有效性和变化
    if (!data || data.length === 0) {
      this.clearCanvas();
      return;
    }
    
    // 缓存数据，避免重复绘制相同内容
    const dataKey = JSON.stringify(data) + JSON.stringify(options);
    if (this.lastDrawnDataKey === dataKey) {
      return; // 数据未变化，跳过绘制
    }
    this.lastDrawnDataKey = dataKey;
    
    const { padding, backgroundColor } = this.options;
    const { centerX = this.width / 2, centerY = this.height / 2 - 30, radius = Math.min(this.width, this.height) / 4.5, showLabel = true, labelRadius = radius + 35 } = options;
    
    // 清除画布
    this.clearCanvas();
    
    // 绘制背景
    this.ctx.setFillStyle(backgroundColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 计算总数值
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    if (totalValue === 0) return;
    
    // 绘制饼图
    let startAngle = -Math.PI / 2; // 从顶部开始
    
    data.forEach((item, index) => {
      const value = item.value;
      const percentage = value / totalValue;
      const endAngle = startAngle + percentage * 2 * Math.PI;
      const color = item.color || this.colors[index % this.colors.length];
      
      // 绘制扇形
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.setFillStyle(color);
      this.ctx.fill();
      
      // 绘制标签
      if (showLabel) {
        const labelAngle = startAngle + percentage * Math.PI;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        this.ctx.setFillStyle('#333333');
        this.ctx.setFontSize(10);
        this.ctx.setTextAlign(labelX > centerX ? 'left' : 'right');
        this.ctx.setTextBaseline(labelY > centerY ? 'top' : 'bottom');
        this.ctx.fillText(`${item.name} ${percentage.toFixed(1)}%`, labelX, labelY);
      }
      
      // 更新起始角度
      startAngle = endAngle;
    });
    
    // 绘制中心圆
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    this.ctx.setFillStyle('#ffffff');
    this.ctx.fill();
    
    // 绘制饼图中心文字
    this.ctx.setFillStyle('#333333');
    this.ctx.setFontSize(12);
    this.ctx.setTextAlign('center');
    this.ctx.setTextBaseline('middle');
    this.ctx.fillText(`总计`, centerX, centerY - 8);
    this.ctx.setFontSize(11);
    this.ctx.fillText(`¥${totalValue.toFixed(2)}`, centerX, centerY + 8);
    
    // 绘制完成
    this.ctx.draw();
  }
  
  /**
   * 清除画布
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.lastDrawnDataKey = null; // 清除缓存标识
    
    // 绘制完成
    this.ctx.draw();
  }

  /**
   * 绘制柱状图
   * @param {Array} data - 柱状图数据，格式：[{name: '名称', value: 值, color: '颜色(可选)'}]
   * @param {Object} options - 柱状图选项
   */
  drawBarChart(data, options = {}) {
    const { padding, backgroundColor, title } = this.options;
    const { barWidth = 40, barGap = 20, showValue = true, valueFontSize = 12 } = options;
    
    // 清除画布
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 绘制背景
    this.ctx.setFillStyle(backgroundColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    if (data.length === 0) return;
    
    // 计算最大值
    const maxValue = Math.max(...data.map(item => item.value), 0);
    
    // 计算图表区域
    const chartWidth = this.width - padding * 2;
    const chartHeight = this.height - padding * 3 - (title ? 30 : 0);
    const chartTop = padding + (title ? 30 : 0);
    const chartLeft = padding;
    
    // 绘制标题
    if (title) {
      this.ctx.setFillStyle(this.options.titleColor);
      this.ctx.setFontSize(this.options.titleFontSize);
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, padding + 15);
    }
    
    // 绘制坐标轴
    this.drawAxis(chartLeft, chartTop, chartWidth, chartHeight, maxValue);
    
    // 计算每个柱子的位置
    const totalBarWidth = data.length * barWidth + (data.length - 1) * barGap;
    const startX = chartLeft + (chartWidth - totalBarWidth) / 2;
    
    data.forEach((item, index) => {
      const x = startX + index * (barWidth + barGap);
      const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
      const y = chartTop + chartHeight - barHeight;
      const color = item.color || this.colors[index % this.colors.length];
      
      // 绘制柱子
      this.ctx.setFillStyle(color);
      this.ctx.fillRect(x, y, barWidth, barHeight);
      
      // 绘制柱子数值
      if (showValue && item.value > 0) {
        this.ctx.setFillStyle('#333333');
        this.ctx.setFontSize(valueFontSize);
        this.ctx.setTextAlign('center');
        this.ctx.fillText(`¥${item.value.toFixed(2)}`, x + barWidth / 2, y - 5);
      }
      
      // 绘制柱子名称
      this.ctx.setFillStyle('#666666');
      this.ctx.setFontSize(10);
      this.ctx.setTextAlign('center');
      this.ctx.fillText(item.name, x + barWidth / 2, chartTop + chartHeight + 15);
    });
    
    // 绘制图例
    if (this.options.legend) {
      this.drawLegend(data, this.options.legendPosition);
    }
    
    // 绘制完成
    this.ctx.draw();
  }

  /**
   * 绘制折线图
   * @param {Array} data - 折线图数据，格式：[{name: '名称', value: 值, color: '颜色(可选)'}]
   * @param {Object} options - 折线图选项
   */
  drawLineChart(data, options = {}) {
    const { padding, backgroundColor, title } = this.options;
    const { showPoints = true, pointRadius = 4, showArea = false, showValue = false } = options;
    
    // 清除画布
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // 绘制背景
    this.ctx.setFillStyle(backgroundColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    if (data.length < 2) {
      this.ctx.draw();
      return;
    }
    
    // 计算最大值
    const maxValue = Math.max(...data.map(item => item.value), 0);
    
    // 计算图表区域
    const chartWidth = this.width - padding * 2;
    const chartHeight = this.height - padding * 3 - (title ? 30 : 0);
    const chartTop = padding + (title ? 30 : 0);
    const chartLeft = padding;
    
    // 绘制标题
    if (title) {
      this.ctx.setFillStyle(this.options.titleColor);
      this.ctx.setFontSize(this.options.titleFontSize);
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, padding + 15);
    }
    
    // 绘制坐标轴
    this.drawAxis(chartLeft, chartTop, chartWidth, chartHeight, maxValue);
    
    // 计算每个点的位置
    const pointDistance = chartWidth / (data.length - 1);
    
    // 绘制折线
    this.ctx.beginPath();
    const color = options.color || this.colors[0];
    
    data.forEach((item, index) => {
      const x = chartLeft + index * pointDistance;
      const y = chartTop + chartHeight - (maxValue > 0 ? (item.value / maxValue) * chartHeight : 0);
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.setStrokeStyle(color);
    this.ctx.setLineWidth(2);
    this.ctx.stroke();
    
    // 绘制填充区域
    if (showArea) {
      this.ctx.lineTo(chartLeft + chartWidth, chartTop + chartHeight);
      this.ctx.lineTo(chartLeft, chartTop + chartHeight);
      this.ctx.closePath();
      
      // 创建渐变
      const gradient = this.ctx.createLinearGradient(0, chartTop, 0, chartTop + chartHeight);
      // 将十六进制颜色转换为RGBA
      const rgbaColor = this.hexToRgba(color, 0.25);
      gradient.addColorStop(0, rgbaColor);
      gradient.addColorStop(1, this.hexToRgba(color, 0));
      
      this.ctx.setFillStyle(gradient);
      this.ctx.fill();
    }
    
    // 绘制数据点
    if (showPoints) {
      data.forEach((item, index) => {
        const x = chartLeft + index * pointDistance;
        const y = chartTop + chartHeight - (maxValue > 0 ? (item.value / maxValue) * chartHeight : 0);
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
        this.ctx.setFillStyle(color);
        this.ctx.fill();
        
        // 绘制数值
        if (showValue) {
          this.ctx.setFillStyle('#333333');
          this.ctx.setFontSize(10);
          this.ctx.setTextAlign('center');
          this.ctx.fillText(`¥${item.value.toFixed(2)}`, x, y - 10);
        }
        
        // 绘制点名称
        this.ctx.setFillStyle('#666666');
        this.ctx.setFontSize(10);
        this.ctx.setTextAlign('center');
        this.ctx.fillText(item.name, x, chartTop + chartHeight + 15);
      });
    }
    
    // 绘制完成
    this.ctx.draw();
  }

  /**
   * 绘制坐标轴
   * @param {number} x - 坐标轴起始x坐标
   * @param {number} y - 坐标轴起始y坐标
   * @param {number} width - 坐标轴宽度
   * @param {number} height - 坐标轴高度
   * @param {number} maxValue - 最大值
   */
  drawAxis(x, y, width, height, maxValue) {
    // 绘制坐标轴
    this.ctx.setStrokeStyle('#999999');
    this.ctx.setLineWidth(1);
    
    // x轴
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.stroke();
    
    // y轴
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y + height);
    this.ctx.stroke();
    
    // 绘制刻度和数值
    const scaleCount = 5;
    this.ctx.setFillStyle('#666666');
    this.ctx.setFontSize(10);
    this.ctx.setTextAlign('right');
    this.ctx.setTextBaseline('middle');
    
    for (let i = 0; i <= scaleCount; i++) {
      const value = (maxValue * i / scaleCount).toFixed(0);
      const scaleY = y + height - (height * i / scaleCount);
      
      // 绘制刻度线
      this.ctx.beginPath();
      this.ctx.moveTo(x - 5, scaleY);
      this.ctx.lineTo(x, scaleY);
      this.ctx.stroke();
      
      // 绘制刻度值
      this.ctx.fillText(value, x - 10, scaleY);
    }
  }

  /**
   * 绘制图例
   * @param {Array} data - 数据
   * @param {string} position - 图例位置
   */
  drawLegend(data, position) {
    if (data.length === 0) return;
    
    const legendItemHeight = 20;
    const legendItemWidth = 120;
    const legendGap = 10;
    
    this.ctx.setFontSize(12);
    this.ctx.setTextAlign('left');
    this.ctx.setTextBaseline('middle');
    
    data.forEach((item, index) => {
      const color = item.color || this.colors[index % this.colors.length];
      
      let x, y;
      
      switch (position) {
        case 'top':
          x = this.width / 2 - (data.length * (legendItemWidth + legendGap) - legendGap) / 2 + index * (legendItemWidth + legendGap);
          y = this.options.padding + 10;
          break;
        case 'bottom':
          x = this.width / 2 - (data.length * (legendItemWidth + legendGap) - legendGap) / 2 + index * (legendItemWidth + legendGap);
          y = this.height - this.options.padding - 10;
          break;
        case 'left':
          x = this.options.padding + 10;
          y = this.height / 2 - (data.length * (legendItemHeight + legendGap) - legendGap) / 2 + index * (legendItemHeight + legendGap);
          break;
        case 'right':
          x = this.width - this.options.padding - legendItemWidth - 10;
          y = this.height / 2 - (data.length * (legendItemHeight + legendGap) - legendGap) / 2 + index * (legendItemHeight + legendGap);
          break;
        default:
          x = this.width / 2 - (data.length * (legendItemWidth + legendGap) - legendGap) / 2 + index * (legendItemWidth + legendGap);
          y = this.height - this.options.padding - 10;
      }
      
      // 绘制图例颜色块
      this.ctx.setFillStyle(color);
      this.ctx.fillRect(x, y - 8, 16, 16);
      
      // 绘制图例文本
      this.ctx.setFillStyle('#333333');
      this.ctx.fillText(item.name, x + 24, y);
    });
  }

  /**
   * 更新图表尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  /**
   * 更新图表选项
   * @param {Object} options - 选项
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * 将十六进制颜色转换为RGBA
   * @param {string} hex - 十六进制颜色值
   * @param {number} alpha - 透明度 (0-1)
   * @returns {string} RGBA颜色值
   */
  hexToRgba(hex, alpha = 1) {
    let r = 0, g = 0, b = 0;
    
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * 清空画布
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.draw();
  }
}

// 导出单例实例
let chartManagerInstance = null;

const getChartManager = (canvasId, options = {}) => {
  if (!chartManagerInstance || chartManagerInstance.canvasId !== canvasId) {
    chartManagerInstance = new ChartManager(canvasId, options);
  }
  return chartManagerInstance;
};

module.exports = {
  ChartManager,
  getChartManager
};
