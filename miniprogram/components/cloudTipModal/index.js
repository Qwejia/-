Component({
  /**
   * 初始数据
   */
  data: {
    showTip: false
  },
  properties: {
    showTipProps: Boolean,
    title: String,
    content: String
  },
  observers: {
    showTipProps(showTipProps) {
      this.setData({
        showTip: showTipProps
      });
    }
  },
  methods: {
    onClose() {
      this.setData({
        showTip: !this.data.showTip
      });
    }
  }
});
