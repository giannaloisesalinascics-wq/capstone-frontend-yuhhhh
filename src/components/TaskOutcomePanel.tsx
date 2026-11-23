import { useState, type FormEvent } from 'react'
import Icon from './Icon'
import './TaskOutcomePanel.css'

export type TaskOutcome =
  | 'RENEWED'
  | 'LOST'
  | 'NO_ANSWER'
  | 'CALLBACK'
  | 'WRONG_NUMBER'

type TaskOutcomePanelProps = {
  clientName: string
  onClose: () => void
  onSave: (
    outcome: TaskOutcome,
    note: string,
    callbackDate?: string
  ) => void
}

const instantOutcomes: {
  value: Exclude<TaskOutcome, 'CALLBACK'>
  label: string
  variant: string
}[] = [
  { value: 'RENEWED', label: 'Renewed', variant: 'renewed' },
  { value: 'LOST', label: 'Lost', variant: 'lost' },
  { value: 'NO_ANSWER', label: 'No Answer', variant: 'neutral' },
  { value: 'WRONG_NUMBER', label: 'Wrong Number', variant: 'neutral' },
]

function TaskOutcomePanel({
  clientName,
  onClose,
  onSave,
}: TaskOutcomePanelProps) {
  const [note, setNote] = useState('')
  const [showCallback, setShowCallback] = useState(false)
  const [callbackDate, setCallbackDate] = useState('')

  function handleInstantSave(value: Exclude<TaskOutcome, 'CALLBACK'>) {
    onSave(value, note.trim())
  }

  function handleCallbackSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!callbackDate) return
    onSave('CALLBACK', note.trim(), callbackDate)
  }

  return (
    <div className="outcome-overlay" onClick={onClose}>
      <div
        className="outcome-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outcome-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="outcome-header">
          <div>
            <h2 id="outcome-title">Log Outcome</h2>
            <p className="outcome-client">{clientName}</p>
          </div>

          <button
            type="button"
            className="outcome-close"
            onClick={onClose}
            aria-label="Close panel"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <label htmlFor="outcome-note" className="outcome-label">
          Note (optional — add before tapping an outcome)
        </label>
        <textarea
          id="outcome-note"
          className="outcome-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a quick note..."
          rows={3}
        />

        <p className="outcome-section-label">One-Tap Outcomes</p>

        <div className="outcome-buttons">
          {instantOutcomes.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`outcome-btn outcome-btn-${item.variant}`}
              onClick={() => handleInstantSave(item.value)}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            className={`outcome-btn outcome-btn-callback ${
              showCallback ? 'active' : ''
            }`}
            onClick={() => setShowCallback((prev) => !prev)}
          >
            <Icon name="calendar" size={16} />
            Schedule Callback
          </button>
        </div>

        {showCallback && (
          <form className="callback-form" onSubmit={handleCallbackSubmit}>
            <label htmlFor="callback-date" className="outcome-label">
              Callback Date *
            </label>
            <input
              id="callback-date"
              type="date"
              className="outcome-input"
              value={callbackDate}
              onChange={(e) => setCallbackDate(e.target.value)}
              required
            />
            <button type="submit" className="callback-save-btn">
              Save Callback
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default TaskOutcomePanel