import { createApp, h } from 'vue'
import Toast from '@/components/Toast.vue'
import type { ToastProps } from '@/components/Toast.vue'

export type ToastType = 'error' | 'warning' | 'info'

export interface ToastOptions extends Partial<ToastProps> {
  message: string
}

class ToastManager {
  private currentToast: ReturnType<typeof createApp> | null = null

  private destroy() {
    if (this.currentToast) {
      this.currentToast.unmount()
      this.currentToast = null
    }
  }

  private show(options: ToastOptions) {
    this.destroy()

    const div = document.createElement('div')
    document.body.appendChild(div)

    const app = createApp({
      render() {
        return h(Toast, {
          message: options.message,
          type: options.type || 'info',
          duration: options.duration ?? 3000,
          showButton: options.showButton ?? false,
          buttonText: options.buttonText ?? '知道了',
        })
      },
    })

    this.currentToast = app
    app.mount(div)

    const duration = options.duration ?? 3000
    if (duration > 0) {
      setTimeout(() => {
        this.destroy()
      }, duration + 300)
    }
  }

  error(message: string, options?: Omit<ToastOptions, 'message' | 'type'>) {
    this.show({ message, type: 'error', ...options })
  }

  warning(message: string, options?: Omit<ToastOptions, 'message' | 'type'>) {
    this.show({ message, type: 'warning', ...options })
  }

  info(message: string, options?: Omit<ToastOptions, 'message' | 'type'>) {
    this.show({ message, type: 'info', ...options })
  }
}

export const toast = new ToastManager()

export default toast
