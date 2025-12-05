<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="brand-name">闲余</h1>
      <p class="brand-slogan">你的闲余，他人的刚需</p>
      <p class="welcome-text">欢迎回来</p>
    </div>
    <nut-form ref="formRef" :model-value="formData" :rules="rules">
      <nut-form-item prop="usernameOrEmail" label="">
        <nut-input
          v-model="formData.usernameOrEmail"
          placeholder="请输入用户名或邮箱"
          type="text"
          clearable
        />
      </nut-form-item>
      <nut-form-item prop="password" label="">
        <nut-input
          v-model="formData.password"
          placeholder="请输入密码"
          type="password"
          clearable
          show-password
        />
      </nut-form-item>
      <nut-form-item>
        <nut-button
          type="primary"
          block
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </nut-button>
      </nut-form-item>
      <nut-form-item>
        <div class="register-link">
          还没有账号？
          <span @click="goToRegister">立即注册</span>
        </div>
      </nut-form-item>
    </nut-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/users'
import { saveAuth } from '@/utils/auth'
import { showToast } from '@nutui/nutui'
import type { FormInstance } from '@nutui/nutui'

const router = useRouter()
const formRef = ref<FormInstance>()

const loading = ref(false)

const formData = reactive({
  usernameOrEmail: '',
  password: ''
})

const rules = {
  usernameOrEmail: [
    { required: true, message: '请输入用户名或邮箱' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度不能少于6位' }
  ]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    const res = await login(formData)
    saveAuth(res)
    showToast.success('登录成功')
    router.push('/products')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 60px 20px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.brand-name {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 8px;
  letter-spacing: 3px;
}

.brand-slogan {
  font-size: 16px;
  opacity: 0.95;
  font-weight: 300;
  margin-bottom: 20px;
}

.welcome-text {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.register-link {
  text-align: center;
  color: white;
  font-size: 14px;
}

.register-link span {
  color: #ffd700;
  font-weight: bold;
  cursor: pointer;
}
</style>

