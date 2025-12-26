<template>
  <div class="cart-container">
    <nut-navbar title="购物车" left-show @click-back="handleBack">
      <template #left>
        <!-- <Left /> -->
      </template>
    </nut-navbar>
    
    <!-- 空购物车提示 -->
    <div v-if="cartState.items.length === 0" class="empty-cart">
      <nut-icon name="cart" size="80" color="#ccc" />
      <p class="empty-cart-text">购物车还是空的</p>
      <nut-button type="primary" @click="goToProducts">去逛逛</nut-button>
    </div>
    
    <!-- 购物车商品列表 -->
    <div v-else class="cart-items">
      <!-- 加载中提示 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">加载中...</div>
      </div>
      
      <!-- 商品列表 -->
      <div class="cart-list">
        <div v-for="item in cartState.items" :key="item.id" class="cart-item">
          <!-- 商品图片 -->
          <div class="item-image">
            <img 
              :src="item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.png'"
              :alt="item.product.title"
              @click="goToDetail(item.product.id)"
            />
          </div>
          
          <!-- 商品信息 -->
          <div class="item-info">
            <div class="item-title" @click="goToDetail(item.product.id)">
              {{ item.product.title }}
            </div>
            <div class="item-price">¥{{ item.product.price }}</div>
            <div class="item-stock">库存: {{ item.product.stock }}</div>
            
            <!-- 数量调整 -->
            <div class="item-quantity">
              <nut-stepper 
              v-model="item.quantity" 
              :min="1" 
              :max="item.product.stock"
              @change="(value) => handleQuantityChange(item.id, value)"
            />
            </div>
          </div>
          
          <!-- 删除按钮 -->
          <div class="item-delete">
            <nut-button type="danger" size="small" @click="handleDeleteItem(item.id)">删除</nut-button>
          </div>
        </div>
      </div>
      
      <!-- 底部结算栏 -->
      <div class="cart-footer">
        <div class="total-info">
          <div class="total-text">合计：</div>
          <div class="total-price">¥{{ totalPrice.toFixed(2) }}</div>
        </div>
        <nut-button type="primary" class="checkout-btn" @click="handleCheckout">结算({{ totalCount }})</nut-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IconFont as NutIcon } from '@nutui/icons-vue'
import { InputNumber as NutStepper, Button as NutButton, showToast, showDialog } from '@nutui/nutui'
import { cartState, isLoading, hasUnsavedChanges, updateQuantity, removeFromCart, fetchCartList, getTotalCount, getTotalPrice, submitCartChanges } from '@/utils/cart'
import { createOrderAPI } from '@/api/orders'
import { getUser } from '@/utils/auth'

const router = useRouter()

// 页面加载时获取购物车数据
onMounted(() => {
  fetchCartList()
})

// 计算属性：购物车商品总金额
const totalPrice = computed(() => {
  return getTotalPrice.value
})

// 计算属性：购物车商品总数量
const totalCount = computed(() => {
  return getTotalCount.value
})

// 返回上一页
const handleBack = () => {
  router.back()
}

// 跳转到商品列表
const goToProducts = () => {
  router.push('/products')
}

// 跳转到商品详情
const goToDetail = (id: number) => {
  router.push(`/product/${id}`)
}

// 处理数量变化（确保为数字类型）
const handleQuantityChange = (itemId: number, newQuantity: number | string) => {
  const quantityNumber = Number(newQuantity)
  if (Number.isNaN(quantityNumber) || quantityNumber < 1) {
    showToast.fail('数量格式不正确')
    return
  }
  updateQuantity(itemId, quantityNumber)
}

// 删除单个商品
const handleDeleteItem = (itemId: number) => {
  // 获取要删除的商品信息
  const item = cartState.items.find(item => item.id === itemId)
  if (!item) return
  
  // 显示确认对话框
  showDialog({
    title: '确认删除',
    content: `确定要删除商品"${item.product.title}"吗？`,
    onOk: async () => {
      // 用户确认删除
      const success = await removeFromCart(itemId)
      if (success) {
        showToast.success('删除成功')
      }
    },
    onCancel: () => {
      // 用户取消删除
      showToast.text('已取消删除')
    }
  })
}

// 处理结算
const handleCheckout = async () => {
  if (totalCount.value === 0) {
    showToast.fail('购物车为空，无法结算')
    return
  }

  const user = getUser()
  if (!user) {
    showToast.fail('请先登录')
    router.push('/login')
    return
  }

  // 确认结算
  showDialog({
    title: '确认结算',
    content: `确定要结算这 ${totalCount.value} 件商品吗？`,
    onOk: async () => {
      // 如果有未保存的更改，先提交到后端
      if (hasUnsavedChanges.value) {
        const success = await submitCartChanges()
        if (!success) return
      }

      try {
        isLoading.value = true
        // 按当前购物车中的商品逐个创建订单
        for (const item of cartState.items) {
          await createOrderAPI({
            user_id: user.id,
            product_id: item.product.id,
            quantity: Number(item.quantity),
            shipping_address: user.address || '',
            payment_method: '微信支付'
          })
          // 注意：这里不需要使用返回的订单数据，因为我们直接跳转到订单列表
        }

        showToast.success('结算成功，订单已生成')
        // 后端在创建订单时会删除对应购物车记录，这里重新拉取购物车列表
        await fetchCartList()
        // 跳转到订单页查看
        router.push('/orders')
      } catch (error: any) {
        console.error('结算失败:', error)
        const errorMessage = error.response?.data?.message || '结算失败，请重试'
        showToast.fail(errorMessage)
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.cart-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 空购物车样式 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

/* 空购物车图标样式 */
.empty-cart :deep(.nut-icon) {
  margin-bottom: 20px;
}

.empty-cart-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

/* 购物车商品列表样式 */
.cart-items {
  padding-bottom: 80px;
}

/* 全选 */
.select-all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
}

.select-all :deep(.nut-checkbox-label) {
  font-size: 14px;
  color: #333;
}

.delete-selected {
  font-size: 14px;
  color: #ff6b35;
  cursor: pointer;
}

.delete-selected.disabled {
  color: #ccc;
  cursor: not-allowed;
}

/* 商品列表 */
.cart-list {
  background-color: white;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

/* 选择框 */
.item-select {
  margin-right: 10px;
}

/* 商品图片 */
.item-image {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息 */
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 80px;
}

.item-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  cursor: pointer;
}

.item-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b35;
  margin: 2px 0;
}

.item-stock {
  font-size: 12px;
  color: #999;
  margin: 2px 0;
}

/* 数量调整 */
.item-quantity {
  display: flex;
  justify-content: flex-start;
}

.item-quantity :deep(.nut-stepper) {
  width: 100px;
}

/* 删除按钮 */
.item-delete {
  margin-left: 10px;
  color: #999;
  cursor: pointer;
}

.item-delete :deep(.nut-icon) {
  font-size: 20px;
}

.item-delete:hover {
  color: #ff6b35;
}

/* 底部结算栏 */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.total-info {
  display: flex;
  align-items: baseline;
}

.total-text {
  font-size: 14px;
  color: #333;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b35;
  margin-left: 5px;
}

.checkout-btn {
  width: 120px;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* 加载指示器样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  font-size: 16px;
  color: #ff6b35;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
