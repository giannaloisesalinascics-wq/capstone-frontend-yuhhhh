import { useSyncExternalStore } from 'react'
import Icon, { type IconName } from './Icon'
import { TOAST_DURATION, dismissToast, getToasts, subscribeToasts, type ToastVariant } from '../toast'
import './Toaster.css'

const icons: Record<ToastVariant, IconName> = {
  success: 'checkCircle',
  info: 'sparkle',
  warning: 'alert',
}

function Toaster() {
  const items = useSyncExternalStore(subscribeToasts, getToasts)

  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.variant} ${t.leaving ? 'toast-leaving' : ''}`}
        >
          <span className="toast-icon">
            <Icon name={icons[t.variant]} size={16} />
          </span>
          <div className="toast-body">
            <strong>{t.title}</strong>
            {t.description && <p>{t.description}</p>}
          </div>
          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(t.id)}
          >
            <Icon name="x" size={14} />
          </button>
          <span
            className="toast-timer"
            style={{ animationDuration: `${TOAST_DURATION}ms` }}
          />
        </div>
      ))}
    </div>
  )
}

export default Toaster
