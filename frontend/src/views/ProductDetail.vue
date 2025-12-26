<template>
  <div class="product-detail-container">
    <nut-navbar title="闲余" left-show @click-back="handleBack">
    </nut-navbar>
    
    <div class="brand-banner">
      <div class="brand-content">
        <h1 class="brand-name">闲余</h1>
        <p class="brand-slogan">你的闲余，他人的刚需</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <nut-loading type="spinner" />
    </div>

    <div v-else-if="product" class="detail-content">
      <!-- 图片轮播 -->
      <nut-swiper
        v-if="product.images && product.images.length > 0"
        :pagination-visible="true"
        :pagination-clickable="true"
        :loop="true"
        :height="375"
      >
        <nut-swiper-item v-for="(image, index) in product.images" :key="index">
          <img :src="image" :alt="product.title" class="detail-image" />
        </nut-swiper-item>
      </nut-swiper>
      <div v-else class="no-image">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg==" alt="无图片" />
      </div>

      <!-- 商品信息 -->
      <div class="product-info">
        <div class="price-section">
          <span class="current-price">¥{{ product.price }}</span>
          <span v-if="product.original_price" class="original-price">
            原价 ¥{{ product.original_price }}
          </span>
        </div>
        <h2 class="title">{{ product.title }}</h2>
        <div class="meta-info">
          <span
            class="status"
            :class="product.stock > 0 ? 'on_sale' : 'sold'"
          >
            {{ product.stock > 0 ? '在售' : '已售罄' }}
          </span>
          <span class="views">浏览 {{ product.view_count }}</span>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="description-section">
        <h3>商品描述</h3>
        <p>{{ product.description || '暂无描述' }}</p>
      </div>

      <!-- 商品详情 -->
      <div class="detail-section">
        <div class="detail-item">
          <span class="label">分类：</span>
          <span class="value">{{ product.category || '未分类' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">所在地：</span>
          <span class="value">{{ product.location || '未知' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">库存：</span>
          <span class="value">{{ product.stock }}件</span>
        </div>
        <div class="detail-item">
          <span class="label">发布时间：</span>
          <span class="value">{{ formatDate(product.created_at) }}</span>
        </div>
      </div>

      <!-- 购买按钮：仅当有库存时显示 -->
      <div v-if="product.stock > 0" class="buy-section">
  <nut-button type="primary" block size="large" @click="handleBuy">
    立即购买
  </nut-button>
  <nut-button type="default" block size="large" @click="handleAddToCart" style="margin-top: 10px;">
    加入购物车
  </nut-button>
</div>

      <!-- 评论输入区域 -->
      <div class="comment-input-section">
        <h3>发表评论</h3>
        <nut-textarea
          v-model="commentContent"
          placeholder="请输入评论内容..."
          :rows="3"
          :limit="500"
          :max-length="500"
        />
        <nut-button
          type="primary"
          size="small"
          :disabled="!commentContent.trim() || submittingComment"
          @click="handleSubmitComment"
          style="margin-top: 10px;"
        >
          {{ submittingComment ? '发布中...' : '发布评论' }}
        </nut-button>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section">
        <h3>评论 ({{ comments.length }})</h3>
        <div v-if="comments.length === 0" class="no-comments">
          暂无评论
        </div>
        <div v-else class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <div class="comment-user-info">
                <span class="comment-user">{{ getCommentUsername(comment) }}</span>
                <span v-if="isProductOwner(comment.user_id)" class="owner-badge">发布人</span>
              </div>
              <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProductById, updateProduct } from '@/api/products'
import { getComments, createComment } from '@/api/comments'
import { createOrderAPI } from '@/api/orders'
import type { Product, Comment } from '@/types'
import { showToast, showDialog } from '@nutui/nutui'
import { getUser } from '@/utils/auth'
import { addToCart } from '@/utils/cart'

const router = useRouter()
const route = useRoute()

const product = ref<Product | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(true)
const commentContent = ref('')
const submittingComment = ref(false)
const buying = ref(false)

// 商品状态文案改为完全依赖库存的显示（>0 在售，=0 已售罄）

// 判断是否是商品发布人
const isProductOwner = (userId: number) => {
  return product.value && product.value.user_id === userId
}

// 获取评论用户名
const getCommentUsername = (comment: Comment) => {
  const commentWithUser = comment as Comment & { user?: { username?: string } }
  return commentWithUser.user?.username || `用户${comment.user_id}`
}

const loadProduct = async () => {
  const id = Number(route.params.id)
  if (!id) {
    showToast.fail('商品ID无效')
    router.back()
    return
  }

  try {
    const res = await getProductById(id) as unknown as Product
    product.value = res
  } catch (error) {
    console.error('加载商品失败:', error)
    showToast.fail('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  const id = Number(route.params.id)
  if (!id) return

  try {
    const res = await getComments({ product_id: String(id) }) as unknown as Comment[]
    comments.value = res
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

const handleSubmitComment = async () => {
  const user = getUser()
  if (!user) {
    showToast.fail('请先登录')
    router.push('/login')
    return
  }

  if (!commentContent.value.trim()) {
    showToast.fail('请输入评论内容')
    return
  }

  const productId = Number(route.params.id)
  if (!productId) {
    showToast.fail('商品ID无效')
    return
  }

  submittingComment.value = true
  try {
    await createComment({
      product_id: productId,
      user_id: user.id,
      content: commentContent.value.trim()
    })
    showToast.success('评论发布成功')
    commentContent.value = ''
    // 重新加载评论列表
    await loadComments()
  } catch (error) {
    console.error('发布评论失败:', error)
    showToast.fail('发布评论失败，请重试')
  } finally {
    submittingComment.value = false
  }
}

const handleBuy = () => {
  const user = getUser()
  if (!user) {
    showToast.fail('请先登录')
    router.push('/login')
    return
  }

  if (!product.value) {
    showToast.fail('商品信息加载失败')
    return
  }

  // 防止重复提交
  if (buying.value) {
    return
  }

  // 不能购买自己的商品
  if (product.value.user_id === user.id) {
    showToast.fail('不能购买自己发布的商品')
    return
  }

  showDialog({
    title: '确认购买',
    content: `确定要以 ¥${product.value.price} 的价格购买"${product.value.title}"吗？`,
    onOk: async () => {
      await confirmBuy()
    }
  })
}

const confirmBuy = async () => {
  if (!product.value) return

  const user = getUser()
  if (!user) {
    showToast.fail('请先登录')
    router.push('/login')
    return
  }

  buying.value = true
  try {
    // 创建待付款订单（不立即完成购买）
    const order = await createOrderAPI({
      user_id: user.id,
      product_id: product.value.id,
      quantity: 1,
      shipping_address: user.address || '',
      payment_method: '支付宝'
    })
    
    showToast.success('订单已生成')
    
    // 跳转到订单确认页面
    router.push({ name: 'OrderConfirmation', params: { id: order.id } })
  } catch (error: any) {
    console.error('创建订单失败:', error)
    const errorMessage = error.response?.data?.message || '创建订单失败，请重试'
    showToast.fail(errorMessage)
  } finally {
    buying.value = false
  }
}

// 加入购物车
const handleAddToCart = async () => {
  if (!product.value) return

  const user = getUser()
  if (!user) {
    showToast.fail('请先登录')
    router.push('/login')
    return
  }

  // 不能将自己发布的商品加入购物车
  if (product.value.user_id === user.id) {
    showToast.fail('不能添加自己发布的商品')
    return
  }

  await addToCart(product.value, 1)
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

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadProduct()
  loadComments()
})
</script>

<style scoped>
.product-detail-container {
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

.detail-content {
  padding-bottom: 20px;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 375px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image img {
  width: 100px;
  height: 100px;
  opacity: 0.5;
}

.product-info {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #ff6b35;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
}

.status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.status.on_sale {
  background: #e8f5e9;
  color: #4caf50;
}

.status.sold {
  background: #ffebee;
  color: #f44336;
}

.status.off_shelf {
  background: #f5f5f5;
  color: #999;
}

.views {
  color: #999;
}

.description-section,
.detail-section {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.description-section h3,
.detail-section h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.description-section p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.detail-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #999;
  width: 80px;
}

.detail-item .value {
  color: #333;
  flex: 1;
}

.comments-section {
  background: white;
  padding: 20px;
}

.comments-section h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.no-comments {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.comment-user {
  color: #333;
  font-weight: 500;
}

.comment-time {
  color: #999;
}

.comment-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.buy-section {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.comment-input-section {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.comment-input-section h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-badge {
  background: #ff6b35;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  font-weight: 500;
}
</style>

