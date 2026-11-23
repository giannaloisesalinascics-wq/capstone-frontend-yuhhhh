export type TaskType =
  | 'RENEWAL_CALL'
  | 'AT_RISK'
  | 'CROSS_SELL'
  | 'MONITOR'

export const TASK_TYPE_META: Record<
  TaskType,
  { label: string; bg: string; color: string; border: string }
> = {
  RENEWAL_CALL: {
    label: 'Immediate Renewal Call',
    bg: 'var(--brand-50)',
    color: 'var(--brand-text)',
    border: 'var(--brand-100)',
  },
  AT_RISK: {
    label: 'At-Risk Retention',
    bg: 'var(--danger-50)',
    color: 'var(--danger-700)',
    border: 'var(--danger-border)',
  },
  CROSS_SELL: {
    label: 'Cross-Sell',
    bg: 'var(--violet-50)',
    color: 'var(--violet-700)',
    border: 'var(--violet-border)',
  },
  MONITOR: {
    label: 'Standard Monitoring',
    bg: 'var(--gray-100)',
    color: 'var(--gray-600)',
    border: 'var(--gray-300)',
  },
}