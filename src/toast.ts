export type ToastVariant = 'success' | 'info' | 'warning'

export type Toast = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
  leaving?: boolean
}

export const TOAST_DURATION = 4200
const EXIT = 180

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function dismissToast(id: number) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t))
  emit()
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, EXIT)
}

// Show a short confirmation in the corner; auto-dismisses after ~4s
export function toast(title: string, options: { description?: string; variant?: ToastVariant } = {}) {
  const id = nextId++
  toasts = [...toasts.slice(-3), { id, title, description: options.description, variant: options.variant ?? 'success' }]
  emit()
  window.setTimeout(() => dismissToast(id), TOAST_DURATION)
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getToasts() {
  return toasts
}
