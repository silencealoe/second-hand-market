<template>
  <div class="order-confirmation-container">
    <nut-navbar title="订单确认" left-show @click-back="handleBack">
    </nut-navbar>
    
    <!-- <div class="brand-banner">
      <div class="brand-content">
        <h1 class="brand-name">闲余</h1>
        <p class="brand-slogan">你的闲余，他人的刚需</p>
      </div>
    </div> -->

    <div v-if="loading" class="loading">
      <nut-loading type="spinner" />
    </div>

    <div v-else-if="order" class="confirmation-content">
      <!-- 支付成功提示 -->
      <div v-if="order.status === 'paid'" class="payment-success-section">
        <div class="success-icon">✓</div>
        <div class="success-title">支付成功</div>
        <div class="success-desc">您的订单已支付成功，请等待发货</div>
      </div>

      <!-- 倒计时区域（仅待支付订单显示） -->
      <div v-else-if="order.status === 'pending'" class="countdown-section">
        <span class="countdown-label">订单有效期剩余：</span>
        <span class="countdown-time" :class="{ warning: remainingTime <= 5 }">
          {{ formatTime(remainingTime) }}
        </span>
        <span class="countdown-tip">请在{{ order?.paymentTimeoutSeconds || 15 }}秒内完成支付，超时订单将自动取消</span>
      </div>

      <!-- 商品信息 -->
      <div class="section">
        <h3 class="section-title">商品信息</h3>
        <div class="product-info">
          <div class="product-image">
            <img 
              :src="order.product?.images?.[0] || defaultImg" 
              :alt="order.product?.title" 
              @error="handleImageError"
            />
          </div>
          <div class="product-details">
            <div class="product-name">{{ order.product?.title }}</div>
            <div class="product-price">¥{{ order.unit_price }}</div>
          </div>
          <div class="product-quantity">
            <span class="quantity-label">数量：</span>
            <span class="quantity-value">{{ order.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="section">
        <h3 class="section-title">订单信息</h3>
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ order.order_number }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">总金额：</span>
            <span class="value total-price">¥{{ order.total_price }}</span>
          </div>
        </div>
      </div>

      <!-- 配送地址 -->
      <div class="section">
        <h3 class="section-title">配送地址</h3>
        <div class="address-info">
          <div v-if="shippingAddress" class="address-content">
            <div class="address-text">{{ shippingAddress }}</div>
          </div>
          <div v-else class="no-address">
            <span>暂无配送地址，请前往个人中心设置</span>
            <nut-button type="primary" size="small" @click="goToProfile">设置地址</nut-button>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section">
        <h3 class="section-title">支付方式</h3>
        <div class="payment-method">
          <div class="method-item active">
            <div class="method-icon">
              <img src="https://gw.alipayobjects.com/zos/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" alt="支付宝" />
            </div>
            <div class="method-name">支付宝</div>
            <nut-icon name="right" class="check-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <div class="total-section">
        <span class="total-label">实付金额：</span>
        <span class="total-amount">¥{{ order?.total_price || 0 }}</span>
      </div>
      <div class="button-group">
        <!-- 已支付订单：只显示返回按钮 -->
        <template v-if="order?.status === 'paid'">
          <nut-button 
            type="primary" 
            block 
            @click="goToOrders"
          >
            返回订单列表
          </nut-button>
        </template>
        <!-- 待支付订单：显示取消和支付按钮 -->
        <template v-else-if="order?.status === 'pending'">
          <nut-button 
            type="default" 
            block 
            @click="handleCancelOrder"
            :disabled="cancelling"
          >
            {{ cancelling ? '取消中...' : '取消订单' }}
          </nut-button>
          <nut-button 
            type="primary" 
            block 
            @click="handleConfirmPayment"
            :disabled="paying || remainingTime <= 0"
          >
            {{ paying ? '支付中...' : '确认支付' }}
          </nut-button>
        </template>
        <!-- 其他状态：显示返回按钮 -->
        <template v-else>
          <nut-button 
            type="primary" 
            block 
            @click="goToOrders"
          >
            返回订单列表
          </nut-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrderByIdAPI as getOrderById, cancelOrderAPI as cancelOrder, alipayPaymentAPI } from '@/api/orders'
import { showToast, showDialog } from '@nutui/nutui'
import { getUser } from '@/utils/auth'
import type { Order } from '@/types'

const router = useRouter()
const route = useRoute()

const order = ref<(Order & { remainingPaymentSeconds?: number; paymentTimeoutSeconds?: number }) | null>(null)
const loading = ref(true)
const paying = ref(false)
const cancelling = ref(false)
// 订单有效期（从后端获取）
const remainingTime = ref(15)
const timer = ref<number | null>(null)
const defaultImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg=='

// 计算配送地址
const shippingAddress = computed(() => {
  const user = getUser()
  return user?.address || ''
})

// 格式化时间（秒数转分:秒）
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

// 轮询检查订单状态（支付成功后使用）
const pollOrderStatus = async (orderId: number, maxAttempts: number = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒
      const data = (await getOrderById(orderId)) as unknown as Order & { 
        remainingPaymentSeconds?: number
        paymentTimeoutSeconds?: number
      }
      console.log(`轮询检查订单状态 (${i + 1}/${maxAttempts}):`, data.status)
      
      // 更新订单数据
      order.value = data
      
      if (data.status === 'paid') {
        // 停止倒计时
        if (timer.value) {
          clearInterval(timer.value)
          timer.value = null
        }
        remainingTime.value = 0
        showToast.success('支付成功！')
        return true
      }
    } catch (error) {
      console.error('轮询检查订单状态失败:', error)
    }
  }
  
  return false
}

// 加载订单信息
const loadOrder = async () => {
  const orderId = Number(route.params.id)
  if (!orderId) {
    showToast.fail('订单ID无效')
    router.back()
    return
  }

  try {
    // 接口实际返回的是 data，本地直接按 Order 使用
    const data = (await getOrderById(orderId)) as unknown as Order & { 
      remainingPaymentSeconds?: number
      paymentTimeoutSeconds?: number
    }
    order.value = data

    console.log('data', data) 
    
    // 检查URL参数，如果支付成功但订单状态还是pending，则轮询检查
    if (route.query.payment === 'success') {
      if (data.status === 'paid') {
        showToast.success('支付成功！')
      } else if (data.status === 'pending') {
        // 支付成功但订单状态还是pending，轮询检查订单状态
        console.log('支付成功但订单状态还是pending，开始轮询检查...')
        showToast.text('正在确认支付状态...')
        const success = await pollOrderStatus(orderId, 10)
        if (!success) {
          showToast.fail('支付状态确认超时，请刷新页面查看')
        }
      }
    }
    
    // 只有待支付订单才计算剩余时间
    if (data.status === 'pending') {
      // 使用后端返回的剩余时间，如果没有则根据创建时间计算
      if (data.remainingPaymentSeconds !== undefined) {
        remainingTime.value = Math.max(0, data.remainingPaymentSeconds)
      } else {
        // 兜底：根据创建时间计算剩余时间
        const createdTime = new Date(data.created_at as unknown as string).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - createdTime) / 1000)
        const timeoutSeconds = data.paymentTimeoutSeconds || 15
        remainingTime.value = Math.max(0, timeoutSeconds - elapsed)
      }
    } else {
      // 已支付或其他状态，不显示倒计时
      remainingTime.value = 0
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    showToast.fail('加载订单失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 启动倒计时（仅待支付订单）
const startCountdown = () => {
  // 只有待支付订单才启动倒计时
  console.log('adasdas', order.value?.status)
  if (order.value?.status !== 'pending') {
    return
  }
  
  timer.value = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timer.value!)
      // 倒计时结束，自动取消订单
      handleAutoCancel()
    }
  }, 1000)
}

// 自动取消订单
const handleAutoCancel = async () => {
  if (!order.value) return
  
  try {
    await cancelOrder(order.value.id)
    showToast.success('订单已超时自动取消')
    router.push('/orders')
  } catch (error) {
    console.error('自动取消订单失败:', error)
  }
}

// 处理图片加载失败
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = defaultImg
}

// 处理取消订单
const handleCancelOrder = async () => {
  if (!order.value) return
  
  showDialog({
    title: '取消订单',
    content: '确定要取消这个订单吗？',
    onOk: async () => {
      cancelling.value = true
      try {
        await cancelOrder(order.value!.id)
        showToast.success('订单已取消')
        router.push('/orders')
      } catch (error: any) {
        console.error('取消订单失败:', error)
        const errorMessage = error.response?.data?.message || '取消订单失败，请重试'
        showToast.fail(errorMessage)
      } finally {
        cancelling.value = false
      }
    }
  })
}

// 处理确认支付
const handleConfirmPayment = async () => {
  if (!order.value || remainingTime.value <= 0) return
  
  showDialog({
    title: '确认支付',
    content: `确定要支付¥${order.value.total_price}吗？`,
    onOk: async () => {
      paying.value = true
      try {
        // 调用支付宝支付接口
        const formHtml = await alipayPaymentAPI(order.value!.id)
        console.log('formHtml', formHtml)
        // 检查返回的HTML是否有效
        if (!formHtml || typeof formHtml !== 'string') {
          throw new Error('支付表单生成失败，请重试')
        }
        
        // 创建新窗口显示支付页面
        const newWindow = window.open('', '_blank')
        if (newWindow) {
          newWindow.document.write(formHtml)
          newWindow.document.close()
          showToast.text('正在跳转到支付宝支付页面...')
        } else {
          // 如果弹窗被阻止，使用表单提交方式
          const form = document.createElement('form')
          form.innerHTML = formHtml
          form.target = '_blank'
          form.method = 'POST'
          form.action = 'https://openapi.alipay.com/gateway.do'
          document.body.appendChild(form)
          form.submit()
          document.body.removeChild(form)
          showToast.text('正在跳转到支付宝支付页面...')
        }
        
        // 不立即跳转，等待用户完成支付
        // 支付完成后会通过回调地址跳转回来
      } catch (error: any) {
        console.error('支付失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '支付失败，请重试'
        showToast.fail(errorMessage)
      } finally {
        paying.value = false
      }
    }
  })
}

// 返回上一页
const handleBack = () => {
  // 已支付的订单可以直接返回
  if (order.value?.status === 'paid') {
    router.back()
    return
  }
  
  // 待支付订单需要确认，离开会取消订单
  if (order.value?.status === 'pending') {
    showDialog({
      title: '提示',
      content: '您确定要离开订单确认页面吗？离开将导致订单取消。',
      onOk: async () => {
        if (order.value) {
          await cancelOrder(order.value.id)
        }
        router.back()
      }
    })
  } else {
    router.back()
  }
}

// 前往个人中心设置地址
const goToProfile = () => {
  router.push('/profile')
}

// 返回订单列表
const goToOrders = () => {
  router.push('/orders')
}

onMounted( async () => {
  await loadOrder()
  startCountdown()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.order-confirmation-container {
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.confirmation-content {
  padding-bottom: 120px;
}

/* 倒计时区域 */
.countdown-section {
  background: #fff3cd;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.countdown-label {
  font-size: 14px;
  color: #856404;
}

.countdown-time {
  font-size: 18px;
  font-weight: bold;
  color: #856404;
}

.countdown-time.warning {
  color: #dc3545;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.countdown-tip {
  font-size: 12px;
  color: #856404;
  width: 100%;
  text-align: center;
}

/* 支付成功区域 */
.payment-success-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  margin-bottom: 15px;
  text-align: center;
  color: white;
  border-radius: 8px;
}

.success-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.success-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.success-desc {
  font-size: 14px;
  opacity: 0.9;
}

/* 通用区块样式 */
.section {
  background: white;
  margin-bottom: 15px;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

/* 商品信息 */
.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b35;
}

.product-quantity {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

/* 订单信息 */
.order-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  color: #333;
}

.info-item .total-price {
  color: #ff6b35;
  font-weight: bold;
}

/* 配送地址 */
.address-info {
  font-size: 14px;
}

.address-content {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.address-text {
  color: #333;
  line-height: 1.6;
}

.no-address {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: #999;
}

/* 支付方式 */
.payment-method {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover {
  border-color: #667eea;
}

.method-item.active {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.method-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.method-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.method-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.check-icon {
  color: #667eea;
  font-size: 18px;
}

/* 操作区域 */
.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.total-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
}

.total-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.total-amount {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b35;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group .nut-button {
  flex: 1;
}
</style>
