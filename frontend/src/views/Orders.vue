<template>
  <div class="orders-container">
    <nut-navbar title="我的订单" left-show @click-back="handleBack">
    </nut-navbar>


    <div v-if="!isAuthenticated" class="not-login">
      <div class="login-prompt">
        <p>您还未登录</p>
        <nut-button type="primary" @click="goToLogin">立即登录</nut-button>
      </div>
    </div>

    <div v-else class="orders-content">
      <div v-if="loading" class="loading">
        <nut-loading type="spinner" />
      </div>

      <div v-else-if="orders.length === 0" class="empty-orders">
        <div class="empty-icon">
          <OrderIcon />
        </div>
        <p class="empty-text">暂无订单记录</p>
        <p class="empty-desc">快去购买心仪的商品吧</p>
        <nut-button type="primary" @click="goToProducts">去逛逛</nut-button>
      </div>

      <div v-else class="orders-list">
        <nut-cell-group>
          <nut-cell
            v-for="order in orders"
            :key="order.id"
            class="order-item"
          >
            
            <template #desc>
              <div class="order-content">
                <!-- 商品信息 -->
                <div class="product-section">
                  <div class="product-image">
                    <img 
                      :src="order.product?.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg=='" 
                      :alt="order.product?.title || '商品图片'"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="product-details">
                    <div class="product-name">{{ order.product?.title || '商品信息加载中' }}</div>
                    <div class="product-price">¥{{ order.unit_price }}</div>
                    <div class="product-quantity">数量: x{{ order.quantity }}</div>
                  </div>
                </div>
                
                <!-- 订单信息 -->
                <div class="order-summary">
                  <div class="order-meta">
                    <div class="order-number">订单号: {{ order.order_number }}</div>
                    <div class="order-time">下单时间: {{ formatDate(order.created_at) }}</div>
                  </div>
                  <div class="order-total">
                    <span class="total-label">成交总价:</span>
                    <span class="total-value">¥{{ order.total_price }}</span>
                  </div>
                </div>
              </div>
            </template>
          </nut-cell>
        </nut-cell-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserOrdersAPI } from '@/api/orders'
import { getUser, isAuthenticated as checkAuth } from '@/utils/auth'
import { showToast } from '@nutui/nutui'
import type { Order, Product } from '@/types'
import { Order as OrderIcon } from '@nutui/icons-vue'

const router = useRouter()

const orders = ref<Order[]>([])
const loading = ref(true)

const isAuthenticated = computed(() => checkAuth())

const statusText = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
}

const getStatusText = (status: string) => {
  return statusText[status as keyof typeof statusText] || status
}

const loadOrders = async () => {
  const user = getUser()
  if (!user) {
    loading.value = false
    return
  }

  try {
    const res = await getUserOrdersAPI(user.id)
    // 接口直接返回订单数组，因此不再从 data 字段取值
    console.log('Orders response:', res)
    orders.value = res || []
  } catch (error) {
    console.error('加载订单失败:', error)
    showToast.fail('加载订单失败')
  } finally {
    loading.value = false
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg=='
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const goToLogin = () => {
  router.push('/login')
}

const goToProducts = () => {
  router.push('/')
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadOrders()
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.brand-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  text-align: center;
  color: white;
}

.brand-content {
  max-width: 100%;
}

.brand-name {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.brand-slogan {
  font-size: 14px;
  margin: 0;
  opacity: 0.95;
  font-weight: 300;
}

.not-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-prompt {
  text-align: center;
}

.login-prompt p {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.orders-content {
  padding-bottom: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 0 40px;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-icon svg {
  width: 80px;
  height: 80px;
  color: #ccc;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #ccc;
  margin-bottom: 20px;
}

.order-item {
  margin: 15px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-number {
  font-size: 14px;
  color: #666;
}

.order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.order-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.order-status.paid {
  background-color: #d1ecf1;
  color: #0c5460;
}

.order-status.shipped {
  background-color: #d4edda;
  color: #155724;
}

.order-status.completed {
  background-color: #e2e3e5;
  color: #383d41;
}

.order-status.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-content {
  padding: 10px 0;
}

/* 商品信息样式 */
.product-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 5px;
}

.product-quantity {
  font-size: 12px;
  color: #999;
}

/* 订单信息样式 */
.order-summary {
  padding-top: 15px;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.order-meta .order-number {
  font-size: 12px;
  color: #666;
}

.order-meta .order-time {
  font-size: 12px;
  color: #999;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-value {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
}
</style>