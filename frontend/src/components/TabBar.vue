<template>
  <nut-tabbar v-model="activeTab" @tab-switch="handleTabSwitch" safe-area-inset-bottom>
    <nut-tabbar-item tab-title="商品" name="0">
      <template #icon>
        <Shop />
      </template>
    </nut-tabbar-item>
    <nut-tabbar-item tab-title="购物车" name="1">
      <template #icon>
        <Cart />
      </template>
      <template #info>
        <span v-if="getTotalCount > 0" class="cart-count">{{ getTotalCount }}</span>
      </template>
    </nut-tabbar-item>
    <nut-tabbar-item tab-title="发布" name="2">
      <template #icon>
        <Add />
      </template>
    </nut-tabbar-item>
    <nut-tabbar-item tab-title="我的" name="3">
      <template #icon>
        <My />
      </template>
    </nut-tabbar-item>
  </nut-tabbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'  
import { useRouter, useRoute } from 'vue-router'
import { Shop, Add, My, Cart } from '@nutui/icons-vue'
import { getTotalCount } from '@/utils/cart'

const router = useRouter()
const route = useRoute()

const activeTab = ref('0')

// 根据路由设置当前选中的 tab
watch(
  () => route.path,
  (path) => {
    if (path === '/products' || path.startsWith('/product/')) {
      activeTab.value = '0'
    } else if (path === '/cart') {
      activeTab.value = '1'
    } else if (path === '/publish') {
      activeTab.value = '2'
    } else if (path === '/profile') {
      activeTab.value = '3'
    }
  },
  { immediate: true }
)

const handleTabSwitch = (item: { name: string }) => {
  // 处理参数可能是对象或数字的情况
  
  // 根据 index 跳转到对应路由
  switch (item.name) {
    case '0':
      router.push('/products')
      break
    case '1':
      router.push('/cart')
      break
    case '2':
      router.push('/publish')
      break
    case '3':
      router.push('/profile')
      break
    default:
      break
  }
}
</script>

<style scoped>
</style>

