<template>
  <div class="profile-container">
    <nut-navbar title="闲余" left-show @click-back="handleBack">
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

    <div v-else class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="avatar-section">
          <img
            :src="user?.avatar || '/default-avatar.png'"
            :alt="user?.username"
            class="avatar"
            @error="handleAvatarError"
          />
        </div>
        <div class="user-info">
          <h2>{{ user?.username }}</h2>
          <p>{{ user?.email }}</p>
          <p v-if="user?.phone" class="phone">{{ user.phone }}</p>
        </div>
      </div>

      <!-- 功能列表 -->
      <div class="menu-section">
        <nut-cell-group>
          <nut-cell title="我的发布" is-link @click="goToMyProducts">
            <template #icon>
              <Shop />
            </template>
          </nut-cell>
          <nut-cell title="我的订单" is-link @click="goToOrders">
            <template #icon>
              <Order />
            </template>
          </nut-cell>
          <nut-cell title="编辑资料" is-link @click="goToEditProfile">
            <template #icon>
              <Edit />
            </template>
          </nut-cell>
        </nut-cell-group>
      </div>

      <!-- 退出登录 -->
      <div class="logout-section">
        <nut-button type="danger" block @click="handleLogout">退出登录</nut-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUser, clearAuth, isAuthenticated as checkAuth } from '@/utils/auth'
import { getUserById } from '@/api/users'
import { showToast, showDialog } from '@nutui/nutui'
import type { User } from '@/types'
import { Shop, Edit, Order } from '@nutui/icons-vue'

const router = useRouter()

const user = ref<User | null>(null)

const isAuthenticated = computed(() => checkAuth())

const loadUserInfo = async () => {
  const localUser = getUser()
  if (!localUser) return

  try {
    const res = (await getUserById(localUser.id)) as unknown as User
    user.value = res;
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2U1ZTVlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+55So5oi3PC90ZXh0Pjwvc3ZnPg=='
}

const goToLogin = () => {
  router.push('/login')
}

const goToMyProducts = () => {
  router.push('/my-products')
}

const goToOrders = () => {
  router.push('/orders')
}

const goToEditProfile = () => {
  showToast.text('编辑功能开发中')
  // 这里可以跳转到编辑资料页面
}

const handleLogout = () => {
  showDialog({
    title: '确认退出',
    content: '确定要退出登录吗？',
    onOk: () => {
      clearAuth()
      showToast.success('已退出登录')
      router.push('/login')
    }
  })
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadUserInfo()
  }
})
</script>

<style scoped>
.profile-container {
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

.profile-content {
  padding-bottom: 20px;
}

.user-card {
  background: white;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f0f0f0;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.user-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.phone {
  color: #999;
}

.menu-section {
  margin-bottom: 10px;
}

.logout-section {
  padding: 20px;
}
</style>

