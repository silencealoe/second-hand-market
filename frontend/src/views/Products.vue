<template>
  <div class="products-container">
    <nut-navbar title="闲余" left-show @click-back="handleBack">
      <template #left>
        <!-- <Left /> -->
      </template>
    </nut-navbar>
    
    <div class="brand-banner">
      <div class="brand-content">
        <h1 class="brand-name">闲余</h1>
        <p class="brand-slogan">你的闲余，他人的刚需</p>
      </div>
    </div>
    
    <div class="filter-bar">
      <nut-tabs v-model="activeFilter">
        <nut-tab-pane title="全部" pane-key="all" />
        <nut-tab-pane title="在售" pane-key="on_sale" />
        <nut-tab-pane title="已售" pane-key="sold" />
      </nut-tabs>
    </div>

    <div class="products-grid" ref="gridRef">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-card"
        @click="goToDetail(product.id)"
      >
        <div class="product-image-wrapper">
          <img
            :src="product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'"
            :alt="product.title"
            class="product-image"
            :class="{ 'sold-image': product.status === 'sold' }"
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
            <span class="location">{{ product.location || '未知地区' }}</span>
            <span class="views">浏览 {{ product.view_count }}</span>
          </div>
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts } from '@/api/products'
import type { Product } from '@/types'
import { showToast } from '@nutui/nutui'

const router = useRouter()
const gridRef = ref<HTMLElement>()

const products = ref<Product[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const limit = ref(10)
const activeFilter = ref('all')

const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const params: any = {
      page: page.value,
      limit: limit.value
    }
    
    if (activeFilter.value !== 'all') {
      params.status = activeFilter.value
    }
    
    const res = (await getProducts(params)) as unknown as {
      data: Product[]
      total: number
      page: number
      limit: number
      totalPages: number
    }
    
    // 处理响应数据
    if (res && res.data && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        hasMore.value = false
      } else {
        products.value = [...products.value, ...res.data]
        // 检查是否还有更多数据
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

// 监听筛选条件变化，重新加载商品
watch(activeFilter, (newVal) => {
  if (newVal !== undefined) {
    products.value = []
    page.value = 1
    hasMore.value = true
    loadMore()
  }
}, { immediate: false })

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg=='
}

const goToDetail = (id: number) => {
  router.push(`/product/${id}`)
}

const handleBack = () => {
  router.back()
}

// 初始化加载
loadMore()
</script>

<style scoped>
.products-container {
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

.filter-bar {
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-bar :deep(.nut-tabs__content) {
  height: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:active {
  transform: scale(0.98);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background-color: #f0f0f0;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
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
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.product-info {
  padding: 10px;
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
  min-height: 40px;
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
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

</style>

