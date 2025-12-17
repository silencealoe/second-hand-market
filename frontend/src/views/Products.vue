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
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <nut-input
        v-model="searchTitle"
        placeholder="搜索商品名称..."
        clearable
        @clear="handleClearSearch"
      >
        <template #right>
          <nut-button type="primary" size="small" @click="handleSearch">搜索</nut-button>
        </template>
      </nut-input>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <nut-tabs v-model="activeFilter">
        <nut-tab-pane title="全部" pane-key="all" />
        <nut-tab-pane title="在售" pane-key="on_sale" />
        <nut-tab-pane title="已售" pane-key="sold" />
      </nut-tabs>
      <div class="filter-toggle" @click="showFilterPanel = !showFilterPanel">
        <nut-icon name="filter" />
        <span>筛选</span>
      </div>
    </div>

    <!-- 筛选面板 -->
    <div v-if="showFilterPanel" class="filter-panel">
      <div class="filter-item">
        <label>分类：</label>
        <nut-input
          v-model="filterCategory"
          placeholder="输入分类"
          clearable
        />
      </div>
      <div class="filter-item">
        <label>价格范围：</label>
        <div class="price-range">
          <nut-input
            v-model.number="filterMinPrice"
            type="number"
            placeholder="最低价"
            clearable
          />
          <span>-</span>
          <nut-input
            v-model.number="filterMaxPrice"
            type="number"
            placeholder="最高价"
            clearable
          />
        </div>
      </div>
      <div class="filter-item">
        <label>所在地：</label>
        <nut-input
          v-model="filterLocation"
          placeholder="输入所在地"
          clearable
        />
      </div>
      <div class="filter-item">
        <label>排序方式：</label>
        <nut-radio-group v-model="sortBy">
          <nut-radio label="created_at" value="created_at">发布时间</nut-radio>
          <nut-radio label="price">价格</nut-radio>
          <nut-radio label="view_count">浏览量</nut-radio>
        </nut-radio-group>
        <nut-radio-group v-model="sortOrder" style="margin-top: 10px;">
          <nut-radio label="DESC" value="DESC">降序</nut-radio>
          <nut-radio label="ASC" value="ASC">升序</nut-radio>
        </nut-radio-group>
      </div>
      <div class="filter-actions">
        <nut-button type="primary" size="small" @click="applyFilters">应用筛选</nut-button>
        <nut-button size="small" @click="resetFilters">重置</nut-button>
      </div>
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
            :class="{ 'sold-image': product.stock === 0 }"
            @error="handleImageError"
          />
          <div v-if="product.stock === 0" class="sold-overlay"></div>
          <div v-if="product.stock === 0" class="sold-badge">卖掉了</div>
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
      <div class="product-stock">
        <span :class="{ 'stock-available': product.stock > 0, 'stock-unavailable': product.stock === 0 }">
          {{ product.stock > 0 ? `库存: ${product.stock}` : '已售罄' }}
        </span>
      </div>
      <!-- <div 
        class="add-to-cart-btn"
        v-if="product.status === 'on_sale' && product.stock > 0"
        @click="handleAddToCart($event, product)"
      >
        <nut-icon name="shopping-cart" size="16" />
        <span>加入购物车</span>
      </div> -->
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
import { addToCart } from '@/utils/cart'

const router = useRouter()
const products = ref<Product[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const limit = ref(10)
const activeFilter = ref('all')
const showFilterPanel = ref(false)

// 搜索和筛选参数
const searchTitle = ref('')
const filterCategory = ref('')
const filterMinPrice = ref<number | undefined>(undefined)
const filterMaxPrice = ref<number | undefined>(undefined)
const filterLocation = ref('')
const sortBy = ref('created_at')
const sortOrder = ref<'ASC' | 'DESC'>('DESC')

const buildParams = () => {
  const params: any = {
    page: page.value,
    limit: limit.value
  }
  
  if (activeFilter.value !== 'all') {
    params.status = activeFilter.value
  }
  
  if (searchTitle.value.trim()) {
    params.title = searchTitle.value.trim()
  }
  
  if (filterCategory.value.trim()) {
    params.category = filterCategory.value.trim()
  }
  
  // 确保价格参数是有效的数字
  if (filterMinPrice.value !== undefined && filterMinPrice.value !== null) {
    const minPrice = Number(filterMinPrice.value)
    if (!isNaN(minPrice) && minPrice >= 0) {
      params.min_price = minPrice
    }
  }
  
  if (filterMaxPrice.value !== undefined && filterMaxPrice.value !== null) {
    const maxPrice = Number(filterMaxPrice.value)
    if (!isNaN(maxPrice) && maxPrice >= 0) {
      params.max_price = maxPrice
    }
  }
  
  if (filterLocation.value.trim()) {
    params.location = filterLocation.value.trim()
  }
  
  if (sortBy.value) {
    params.sort_by = sortBy.value
  }
  
  if (sortOrder.value) {
    params.sort_order = sortOrder.value
  }
  
  return params
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const params = buildParams()
    
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

const handleSearch = () => {
  products.value = []
  page.value = 1
  hasMore.value = true
  loadMore()
}

const handleClearSearch = () => {
  searchTitle.value = ''
  products.value = []
  page.value = 1
  hasMore.value = true
  loadMore()
}

const applyFilters = () => {
  showFilterPanel.value = false
  products.value = []
  page.value = 1
  hasMore.value = true
  loadMore()
}

const resetFilters = () => {
  filterCategory.value = ''
  filterMinPrice.value = undefined
  filterMaxPrice.value = undefined
  filterLocation.value = ''
  sortBy.value = 'created_at'
  sortOrder.value = 'DESC'
  applyFilters()
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

// （保留占位，如后续需要从列表直接加入购物车，可以在此实现）

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

.search-bar {
  background: white;
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 11;
}

.filter-bar {
  background: white;
  position: sticky;
  top: 56px;
  z-index: 10;
  display: flex;
  align-items: center;
  border-top: 1px solid #f0f0f0;
}

.filter-bar :deep(.nut-tabs) {
  flex: 1;
}

.filter-bar :deep(.nut-tabs__content) {
  height: 0;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 15px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  border-left: 1px solid #f0f0f0;
}

.filter-panel {
  background: white;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-item {
  margin-bottom: 15px;
}

.filter-item:last-of-type {
  margin-bottom: 20px;
}

.filter-item label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-range span {
  color: #999;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
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
  position: relative;
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

.product-stock {
  margin-top: 8px;
  font-size: 12px;
}

.stock-available {
  color: #4CAF50;
}

.stock-unavailable {
  color: #F44336;
}

.add-to-cart-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  transition: all 0.3s;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.5);
}

.add-to-cart-btn:active {
  transform: scale(0.95);
}

</style>

