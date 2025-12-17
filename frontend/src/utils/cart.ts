import { ref, reactive, computed } from 'vue'
import type { CartItem, CartState, Product } from '@/types'
import { showToast } from '@nutui/nutui'
import * as cartAPI from '../api/cart'

// 购物车状态
const cartState = reactive<CartState>({
  items: []
})

// 是否加载中
const isLoading = ref(false)

// 购物车是否有未保存的更改
const hasUnsavedChanges = ref(false)

// 获取当前用户ID
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.id || 0
}

// 从后端获取购物车数据
const fetchCartList = async () => {
  const userId = getCurrentUserId()
  if (!userId) return false
  
  try {
    isLoading.value = true
    const response = await cartAPI.getCartListAPI(userId)
    
    // 将后端返回的数据转换为前端需要的格式
    cartState.items = response.map((item: any) => ({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
      selected: item.selected || false
    }))
    
    return true
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    showToast.fail('获取购物车数据失败')
    return false
  } finally {
    isLoading.value = false
  }
}

// 添加商品到购物车
const addToCart = async (product: Product, quantity: number = 1) => {
  if (product.stock <= 0) {
    showToast.fail('商品库存不足')
    return false
  }

  const userId = getCurrentUserId()
  if (!userId) {
    showToast.fail('请先登录')
    return false
  }

  try {
    isLoading.value = true
    await cartAPI.addToCartAPI(userId, product.id, quantity)
    await fetchCartList() // 重新获取购物车数据
    showToast.success('添加购物车成功')
    return true
  } catch (error) {
    showToast.fail('添加购物车失败')
    return false
  } finally {
    isLoading.value = false
  }
}

// 从购物车中删除商品
const removeFromCart = async (itemId: number) => {
  const userId = getCurrentUserId()
  if (!userId) {
    showToast.fail('请先登录')
    return false
  }

  try {
    isLoading.value = true
    await cartAPI.deleteCartItemAPI(itemId, userId)
    await fetchCartList() // 重新获取购物车数据
    showToast.success('删除商品成功')
    return true
  } catch (error) {
    showToast.fail('删除商品失败')
    return false
  } finally {
    isLoading.value = false
  }
}

// 更新商品数量（仅本地更新）
const updateQuantity = (itemId: number, quantity: number) => {
  const item = cartState.items.find(item => item.id === itemId)
  if (item) {
    item.quantity = quantity
    hasUnsavedChanges.value = true
    return true
  }
  return false
}

// 清空购物车
const clearCart = async () => {
  const userId = getCurrentUserId()
  if (!userId) {
    showToast.fail('请先登录')
    return false
  }

  try {
    isLoading.value = true
    await cartAPI.clearCartAPI(userId)
    cartState.items = [] // 清空本地状态
    showToast.success('清空购物车成功')
    return true
  } catch (error) {
    showToast.fail('清空购物车失败')
    return false
  } finally {
    isLoading.value = false
  }
}

// 获取购物车中商品的总数量
const getTotalCount = computed(() => {
  return cartState.items.reduce((count, item) => {
    return count + item.quantity
  }, 0)
})

// 计算购物车中商品的总金额
const getTotalPrice = computed(() => {
  return cartState.items.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)
})

// 批量提交购物车更改
const submitCartChanges = async () => {
  const userId = getCurrentUserId()
  if (!userId) {
    showToast.fail('请先登录')
    return false
  }

  try {
    isLoading.value = true
    const updatePromises: Promise<any>[] = []
    
    // 收集所有需要更新的商品
    cartState.items.forEach(item => {
      // 更新数量和选中状态
      updatePromises.push(cartAPI.updateCartItemAPI(item.id, userId, { 
        quantity: item.quantity, 
        selected: item.selected 
      }))
    })
    
    // 并行执行所有更新请求
    await Promise.all(updatePromises)
    
    // 重置未保存状态
    hasUnsavedChanges.value = false
    
    // 重新获取购物车数据以确保一致性
    await fetchCartList()
    
    showToast.success('购物车已更新')
    return true
  } catch (error) {
    showToast.fail('更新购物车失败')
    return false
  } finally {
    isLoading.value = false
  }
}



export {
  cartState,
  isLoading,
  hasUnsavedChanges,
  fetchCartList,
  addToCart,
  removeFromCart,
  updateQuantity,
  submitCartChanges,
  getTotalCount,
  getTotalPrice
}
