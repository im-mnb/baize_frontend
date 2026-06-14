<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginText } from '@/constants/loginText'
import { authApi } from '@/api/auth.api'
import EyeIcon from '@/components/EyeIcon.vue'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert(loginText.validation.required)
    return
  }

  loading.value = true
  try {
    const result = await authApi.login({
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('token', result.access)
    localStorage.setItem('refreshToken', result.refresh)
    console.log('登录成功:', result)
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">{{ loginText.title }}</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-item">
          <label>{{ loginText.form.username }}</label>
          <input
            v-model="username"
            type="text"
            :placeholder="loginText.form.placeholder.username"
            class="form-input"
          />
        </div>
        <div class="form-item">
          <label>{{ loginText.form.password }}</label>
          <div class="password-input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="loginText.form.placeholder.password"
              class="form-input"
            />
            <span class="eye-icon" @click="togglePassword">
              <EyeIcon :closed="showPassword" />
            </span>
          </div>
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? loginText.button.loading : loginText.button.login }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('@assets/login-background.png') center/cover no-repeat;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .form-input {
  width: 100%;
  padding-right: 40px;
  box-sizing: border-box;
}

.eye-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  height: 100%;
}

.eye-icon:hover {
  color: #667eea;
}

.login-btn {
  padding: 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
