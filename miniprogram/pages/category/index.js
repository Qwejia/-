// pages/category/index.js
const app = getApp()
let db = null
let categoryCollection = null

// 节流函数
const throttle = (func, delay) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      return func.apply(this, args)
    }
  }
}

// 尝试初始化云数据库连接
if (wx.cloud) {
  try {
    db = wx.cloud.database()
    categoryCollection = db.collection('categories')
  } catch (error) {
    console.error('云数据库初始化失败：', error)
    // 云数据库初始化失败不影响页面加载，会使用模拟数据
  }
}



Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'expense',
    categories: [],
    allCategories: [],
    editModalVisible: false,
    editCategory: null,
    isMoving: false,
    newCategory: {
      name: '',
      icon: '',
      type: 'expense'
    },
    availableIcons: ['🍔', '🚗', '🛒', '🎮', '🏥', '🏠', '💰', '🏆', '📈', '📝', '📚', '🏃', '🎨', '🎵', '📱', '💻', '📦', '🎁', '🍕', '🍺', '🎪', '🏖️', '🎯', '🎲', '🎭']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchCategories()
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.fetchCategories()
  },

  /**
   * 获取所有分类（优先从本地存储获取，其次从云数据库获取）
   */
  async fetchCategories() {
    try {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      
      let allCategories = [];
      
      // 优先从本地存储获取分类数据
      allCategories = app.getCategoriesFromLocal();
      
      // 如果本地存储没有数据，尝试从云数据库获取
      if (!allCategories || allCategories.length === 0) {
        if (app.globalData.cloud && categoryCollection) {
          try {
            const res = await categoryCollection.orderBy('sort', 'asc').get()
            allCategories = res.data || [];
            
            // 如果云数据库获取到数据，保存到本地存储
            if (allCategories.length > 0) {
              app.saveCategoriesToLocal(allCategories);
            }
          } catch (cloudErr) {
            console.error('云数据库获取分类失败：', cloudErr);
          }
        }
      }
      
      this.setData({
        allCategories: allCategories,
      })
      this.filterCategories()
    } catch (err) {
      console.error('获取分类失败：', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    this.filterCategories()
  },

  filterCategories() {
    const { activeTab, allCategories } = this.data
    const filtered = allCategories.filter(item => item.type === activeTab)
    // 按sort字段排序
    filtered.sort((a, b) => (a.sort || 0) - (b.sort || 0))
    this.setData({
      categories: filtered
    })
  },

  // 拖动开始事件
  onTouchStart() {
    this.setData({ isMoving: true })
  },

  // 拖动排序处理函数（使用节流优化性能）
  onMoveChange: throttle(function(e) {
    const { id: movedId, index: movedIndex } = e.currentTarget.dataset
    const y = e.detail.y
    
    // 获取当前分类列表
    const categories = [...this.data.categories]
    const categoryHeight = 150 // 每个分类项的高度（单位：rpx）
    
    // 计算列表边界
    const maxY = (categories.length - 1) * categoryHeight
    const constrainedY = Math.max(0, Math.min(y, maxY))
    
    // 计算新的位置索引
    const newIndex = Math.max(0, Math.min(Math.round(constrainedY / categoryHeight), categories.length - 1))
    
    // 如果位置发生变化，更新排序
    if (movedIndex !== newIndex) {
      // 更新分类在数组中的位置
      const movedCategory = categories.splice(movedIndex, 1)[0]
      categories.splice(newIndex, 0, movedCategory)
      
      // 更新排序值
      const updatedCategories = categories.map((category, index) => ({
        ...category,
        sort: index + 1
      }))
      
      // 更新所有分类
      const allCategories = [...this.data.allCategories]
      updatedCategories.forEach(updatedCategory => {
        const index = allCategories.findIndex(c => c._id === updatedCategory._id)
        if (index !== -1) {
          allCategories[index] = updatedCategory
        }
      })
      
      // 更新页面数据
      this.setData({
        categories: updatedCategories,
        allCategories: allCategories
      })
      
      // 优化本地存储策略：只在拖拽结束时保存
    }
  }, 100), // 100ms节流间隔
  
  // 拖动结束事件，添加最终的排序保存
  onTouchEnd() {
    this.setData({ isMoving: false })
    
    // 拖拽结束时才保存到本地存储和云数据库
    const { allCategories } = this.data
    app.saveCategoriesToLocal(allCategories)
    
    // 如果云功能可用，批量同步到云数据库
    if (app.globalData.cloud && categoryCollection) {
      // 获取当前活动分类
      const activeCategoryIds = this.data.categories.map(c => c._id)
      
      // 只更新活动分类的排序
      const categoriesToUpdate = allCategories
        .filter(category => activeCategoryIds.includes(category._id))
        .map(category => ({
          _id: category._id,
          sort: category.sort
        }))
      
      // 使用批量更新API（如果可用）
      categoriesToUpdate.forEach(category => {
        categoryCollection.doc(category._id).update({
          data: { sort: category.sort }
        }).catch(err => {
          console.error(`云数据库更新分类 ${category._id} 排序失败：`, err)
        })
      })
    }
  },

  // 显示添加分类弹窗
  addCategory() {
    this.setData({
      editModalVisible: true,
      editCategory: null,
      newCategory: {
        name: '',
        icon: '',
        type: this.data.activeTab
      }
    })
  },

  // 显示编辑分类弹窗
  editCategory(e) {
    const id = e.currentTarget.dataset.id
    const category = this.data.allCategories.find(item => item._id === id)
    if (category) {
      this.setData({
        editModalVisible: true,
        editCategory: category,
        newCategory: {
          name: category.name,
          icon: category.icon,
          type: category.type
        }
      })
    }
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      editModalVisible: false,
      editCategory: null,
      newCategory: {
        name: '',
        icon: '',
        type: this.data.activeTab
      }
    })
  },

  // 选择图标
  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon
    // 强制更新整个newCategory对象，确保属性正确设置
    this.setData({
      newCategory: {
        ...this.data.newCategory,
        icon: icon
      }
    })
  },

  // 输入分类名称（添加实时验证）
  onNameInput(e) {
    const value = e.detail.value
    this.setData({
      newCategory: {
        ...this.data.newCategory,
        name: value
      }
    })
    
    // 实时验证：如果输入超过10个字符，显示提示
    if (value.trim().length > 10) {
      wx.showToast({
        title: '分类名称不能超过10个字符',
        icon: 'none',
        duration: 1500
      })
    }
  },

  /**
   * 保存分类
   */
  async saveCategory() {
    const { newCategory, editCategory } = this.data
    const categoryName = newCategory.name.trim()
    
    // 表单验证
    if (!categoryName) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    if (categoryName.length > 10) {
      wx.showToast({
        title: '分类名称不能超过10个字符',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    if (!newCategory.icon) {
      wx.showToast({
        title: '请选择图标',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    // 检查分类名称是否重复
    const allCategories = app.getCategoriesFromLocal();
    const isDuplicate = allCategories.some(category => {
      return category.name === categoryName && 
             category.type === newCategory.type && 
             (!editCategory || category._id !== editCategory._id)
    })
    
    if (isDuplicate) {
      wx.showToast({
        title: '该分类名称已存在',
        icon: 'none',
        duration: 1500
      })
      return
    }
    
    wx.showLoading({
      title: editCategory ? '保存中...' : '添加中...',
      mask: true
    })
    
    try {
      if (editCategory) {
        // 更新分类
        const updatedCategories = allCategories.map(category => {
          if (category._id === editCategory._id) {
            return { ...category, name: categoryName, icon: newCategory.icon }
          }
          return category
        })
        
        // 保存到本地存储
        app.saveCategoriesToLocal(updatedCategories);
        
        // 如果云功能可用，同时更新到云数据库
        if (app.globalData.cloud && categoryCollection) {
          try {
            await categoryCollection.doc(editCategory._id).update({
              data: {
                name: categoryName,
                icon: newCategory.icon
              }
            })
          } catch (cloudErr) {
            console.error('云数据库更新分类失败：', cloudErr)
            // 云数据库更新失败不影响本地更新
          }
        }
        
        wx.showToast({
          title: '编辑成功',
          icon: 'success',
          duration: 1500
        })
      } else {
        // 新增分类
        // 获取当前类型的最大排序值
        const maxSort = Math.max(...allCategories
          .filter(category => category.type === newCategory.type)
          .map(category => category.sort || 0), 0)
        
        // 生成唯一ID
        const categoryId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        
        const categoryData = {
          _id: categoryId,
          name: categoryName,
          icon: newCategory.icon,
          type: newCategory.type,
          sort: maxSort + 1
        }
        
        // 保存到本地存储
        const updatedCategories = [...allCategories, categoryData];
        app.saveCategoriesToLocal(updatedCategories);
        
        // 如果云功能可用，同时保存到云数据库
        if (app.globalData.cloud && categoryCollection) {
          try {
            await categoryCollection.add({
              data: {
                ...categoryData,
                createTime: db.serverDate()
              }
            })
          } catch (cloudErr) {
            console.error('云数据库添加分类失败：', cloudErr)
            // 云数据库添加失败不影响本地添加
          }
        }
        
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1500
        })
      }
      
      this.closeModal()
      this.fetchCategories()
    } catch (err) {
      console.error('保存分类失败：', err)
      wx.showToast({
        title: editCategory ? '编辑失败，请重试' : '添加失败，请重试',
        icon: 'none',
        duration: 1500
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 删除分类
   */
  deleteCategory(e) {
    const id = e.currentTarget.dataset.id
    const category = this.data.allCategories.find(item => item._id === id)
    
    if (!category) return
    
    wx.showModal({
      title: '删除分类',
      content: `确定要删除"${category.name}"分类吗？`,
      cancelText: '取消',
      confirmText: '删除',
      confirmColor: '#e64340',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({
              title: '删除中...',
              mask: true
            })
            
            // 从本地存储中移除分类
            const allCategories = app.getCategoriesFromLocal();
            const updatedCategories = allCategories.filter(item => item._id !== id)
            app.saveCategoriesToLocal(updatedCategories);
            
            // 如果云功能可用，同时从云数据库删除
            if (app.globalData.cloud && categoryCollection) {
              try {
                await categoryCollection.doc(id).remove()
              } catch (cloudErr) {
                console.error('云数据库删除分类失败：', cloudErr)
                // 云数据库删除失败不影响本地删除
              }
            }
            
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            })
            
            this.fetchCategories()
          } catch (err) {
            console.error('删除分类失败：', err)
            wx.showToast({
              title: '删除失败，请重试',
              icon: 'none',
              duration: 1500
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.fetchCategories()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
