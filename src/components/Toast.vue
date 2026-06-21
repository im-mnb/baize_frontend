<template>
  <Teleport to="body">
    <div class="toast-container">
      <Transition name="toast-fade">
        <div v-if="visible" :class="['toast', `toast-${type}`]">
          <div class="toast-content">
            <span class="toast-icon">{{ iconMap[type] }}</span>
            <span class="toast-message">{{ message }}</span>
          </div>
          <div v-if="showButton" class="toast-btn-wrap">
            <button class="toast-btn" @click="handleButtonClick">
              {{ buttonText }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface ToastProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  duration?: number
  showButton?: boolean
  buttonText?: string
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 3000,
  showButton: false,
  buttonText: '知道了',
})

const emit = defineEmits<{
  buttonClick: []
  close: []
}>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const iconMap = {
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const show = () => {
  visible.value = true
  if (props.duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, props.duration)
  }
}

const hide = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  emit('close')
}

const handleButtonClick = () => {
  hide()
  emit('buttonClick')
}

onMounted(() => {
  show()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})

defineExpose({
  show,
  hide,
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.toast {
  min-width: 280px;
  max-width: 500px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-message {
  font-size: 14px;
  line-height: 1.5;
  color: #fff;
  flex: 1;
}

.toast-btn-wrap {
  display: flex;
  justify-content: center;
}

.toast-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  flex-shrink: 0;
  transition: background 0.2s;
}

.toast-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.toast-error {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
}

.toast-warning {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.toast-info {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
</style>
