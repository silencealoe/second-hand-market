<template>
  <div class="my-products-container">
    <nut-navbar title="闲余" left-show @click-back="handleBack">
    </nut-navbar>
    
    <div class="brand-banner">
      <div class="brand-content">
        <h1 class="brand-name">闲余</h1>
        <p class="brand-slogan">你的闲余，他人的刚需</p>
      </div>
    </div>

    <div v-if="loading && products.length === 0" class="loading">
      <nut-loading type="spinner" />
    </div>

    <div v-else-if="products.length === 0" class="empty-state">
      <p>您还没有发布任何商品</p>
      <nut-button type="primary" @click="goToPublish">去发布</nut-button>
    </div>

    <div v-else class="products-list">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-item"
      >
        <div class="product-content" @click="goToDetail(product.id)">
          <div class="product-image-wrapper">
            <img
              :src="product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'"
              :alt="product.title"
              class="product-image"
              @error="handleImageError"
            />
            <div v-if="product.status === 'sold'" class="sold-overlay"></div>
            <div v-if="product.status === 'sold'" class="sold-badge">卖掉了</div>
          </div>
          <div class="product-info">
            <h3 class="product-title">{{ product.title }}</h3>
            <div class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span v-if="product.original_price" class="original-price">
                ¥{{ product.original_price }}
              </span>
            </div>
            <div class="product-meta">
              <span class="status" :class="product.status">
                {{ statusText[product.status] }}
              </span>
              <span class="views">浏览 {{ product.view_count }}</span>
            </div>
          </div>
        </div>
        <div class="product-actions">
          <nut-button
            type="primary"
            size="small"
            plain
            @click.stop="handleEdit(product)"
          >
            编辑
          </nut-button>
          <nut-button
            type="danger"
            size="small"
            plain
            @click.stop="handleDelete(product)"
          >
            删除
          </nut-button>
        </div>
      </div>
    </div>

    <nut-infinite-loading
      v-model="loading"
      :has-more="hasMore"
      load-more-text="加载中..."
      load-txt="没有更多了"
      @load-more="loadMore"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts, deleteProduct, updateProduct } from '@/api/products'
import { getUser } from '@/utils/auth'
import { showToast, showDialog } from '@nutui/nutui'
import type { Product, ProductStatus } from '@/types'

const router = useRouter()

const products = ref<Product[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const limit = ref(10)

const statusText: Record<ProductStatus, string> = {
  on_sale: '在售',
  sold: '已售',
  off_shelf: '已下架'
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  const user = getUser()
  if (!user) {
    showToast.fail('请先登录')
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const res = (await getProducts({
      user_id: String(user.id),
      page: page.value,
      limit: limit.value
    })) as unknown as {
      data: Product[]
      total: number
      page: number
      limit: number
      totalPages: number
    }

    if (res && res.data && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        hasMore.value = false
      } else {
        products.value = [...products.value, ...res.data]
        if (page.value >= res.totalPages) {
          hasMore.value = false
        } else {
          page.value++
        }
      }
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载商品失败:', error)
    showToast.fail('加载失败，请重试')
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

const handleEdit = (product: Product) => {
  router.push({
    path: '/publish',
    query: {
      id: product.id.toString(),
      edit: 'true'
    }
  })
}

const handleDelete = (product: Product) => {
  showDialog({
    title: '确认删除',
    content: `确定要删除商品"${product.title}"吗？此操作不可恢复。`,
    onOk: async () => {
      await confirmDelete(product.id)
    }
  })
}

const confirmDelete = async (productId: number) => {
  try {
    await deleteProduct(productId)
    showToast.success('删除成功')
    // 从列表中移除
    products.value = products.value.filter(p => p.id !== productId)
  } catch (error) {
    console.error('删除商品失败:', error)
    showToast.fail('删除失败，请重试')
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg=='
}

const goToDetail = (id: number) => {
  router.push(`/product/${id}`)
}

const goToPublish = () => {
  router.push('/publish')
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadMore()
})
</script>

<style scoped>
.my-products-container {
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state p {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.products-list {
  padding: 10px;
}

.product-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-content {
  display: flex;
  padding: 10px;
  gap: 10px;
  cursor: pointer;
}

.product-image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s;
}

.product-image.sold-image {
  opacity: 0.5;
}

.sold-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.sold-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  z-index: 2;
  white-space: nowrap;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b35;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
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

.product-actions {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #f0f0f0;
  justify-content: flex-end;
}
</style>

