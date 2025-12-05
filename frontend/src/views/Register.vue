<template>
  <div class="register-container">
    <div class="register-header">
      <h1 class="brand-name">闲余</h1>
      <p class="brand-slogan">你的闲余，他人的刚需</p>
      <p class="welcome-text">创建您的账号</p>
    </div>
    <nut-form ref="formRef" :model-value="formData" :rules="rules">
      <nut-form-item prop="username" label="">
        <nut-input
          v-model="formData.username"
          placeholder="请输入用户名"
          type="text"
          clearable
        />
      </nut-form-item>
      <nut-form-item prop="email" label="">
        <nut-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          type="email"
          clearable
        />
      </nut-form-item>
      <nut-form-item prop="password" label="">
        <nut-input
          v-model="formData.password"
          placeholder="请输入密码（至少6位）"
          type="password"
          clearable
          show-password
        />
      </nut-form-item>
      <nut-form-item prop="phone" label="">
        <nut-input
          v-model="formData.phone"
          placeholder="请输入手机号（可选）"
          type="tel"
          clearable
        />
      </nut-form-item>
      <nut-form-item>
        <nut-button
          type="primary"
          block
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </nut-button>
      </nut-form-item>
      <nut-form-item>
        <div class="login-link">
          已有账号？
          <span @click="goToLogin">立即登录</span>
        </div>
      </nut-form-item>
    </nut-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/users'
import { saveAuth } from '@/utils/auth'
import { showToast } from '@nutui/nutui'
import type { FormInstance } from '@nutui/nutui'

const router = useRouter()
const formRef = ref<FormInstance>()

const loading = ref(false)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  phone: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度不能少于6位' }
  ]
}

const handleRegister = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    const res = (await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined
    })) as unknown as { access_token: string; user: any }
    saveAuth(res)
    showToast.success('注册成功')
    router.push('/products')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  padding: 60px 20px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-header {
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

.login-link {
  text-align: center;
  color: white;
  font-size: 14px;
}

.login-link span {
  color: #ffd700;
  font-weight: bold;
  cursor: pointer;
}
</style>

