<template>
  <div class="orders-container">
    <nut-navbar title="我的订单" left-show @click-back="handleBack">
    </nut-navbar>
    
    <div class="brand-banner">
      <div class="brand-content">
        <h1 class="brand-name">闲余</h1>
        <p class="brand-slogan">你的闲余，他人的刚需</p>
      </div>
    </div>

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
            <template #title>
              <div class="order-header">
                <span class="order-number">订单号: {{ order.order_number }}</span>
                <span class="order-status" :class="order.status">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
            </template>
            
            <template #description>
              <div class="order-info">
                <div class="order-product">
                  <div class="product-thumb">
                    <img
                      :src="order.product?.images?.[0] || '/placeholder.png'"
                      :alt="order.product?.title || '商品图片'"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="product-detail">
                    <div class="product-info">
                      <span class="product-name">{{ order.product?.title || '商品信息加载中' }}</span>
                      <span class="quantity">x{{ order.quantity }}</span>
                    </div>
                    <div class="price-info">
                      <span class="unit-price">单价: ¥{{ order.unit_price }}</span>
                      <span class="total-price">总价: ¥{{ order.total_price }}</span>
                    </div>
                    <div class="order-time">
                      下单时间: {{ formatDate(order.created_at) }}
                    </div>
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

// 后端返回的订单包含 product 关联信息，这里在类型上做一个扩展
type OrderWithRelations = Order & { product?: Product }

const orders = ref<OrderWithRelations[]>([])
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
    orders.value = (res as unknown as OrderWithRelations[]) || []
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
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
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
  margin-bottom: 10px;
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

.order-info {
  padding-left: 0;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  font-size: 14px;
  color: #333;
  flex: 1;
  margin-right: 10px;
}

.quantity {
  font-size: 12px;
  color: #999;
}

.price-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.unit-price, .total-price {
  font-size: 12px;
  color: #666;
}

.total-price {
  font-weight: bold;
  color: #e74c3c;
}

.order-time {
  font-size: 12px;
  color: #999;
}
</style>