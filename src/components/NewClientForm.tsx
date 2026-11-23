
import { useState, type FormEvent } from 'react'

import './NewClientForm.css'


export type NewClient = {
  name: string
  branch: string
  industrySector: string
}

type NewClientFormProps = {
  onSave: (client: NewClient) => void
  onCancel: () => void
}

const sectors = [
  'Real estate / property',
  'Food & hospitality',
  'Health & wellness',
  'Finance & holdings',
  'Trading & retail',
  'Construction & industrial',
  'Services & professional',
  'Other',
]

function NewClientForm({
  onSave,
  onCancel,
}: NewClientFormProps) {
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('')
  const [industrySector, setIndustrySector] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) return

    onSave({
      name: name.trim(),
      branch: branch.trim(),
      industrySector,
    })
  }

  return (
    <div className="new-client-overlay">
      <div
        className="new-client-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-client-title"
      >
        <h2 id="new-client-title">Register New Client</h2>
        <p>Enter the company's information.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-client-name">
            Business Name *
          </label>
          <input
            id="new-client-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="new-client-branch">
            Branch (Optional)
          </label>
          <input
            id="new-client-branch"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />

          <label htmlFor="new-client-sector">
            Industry Sector (Optional)
          </label>
          <select
            id="new-client-sector"
            value={industrySector}
            onChange={(e) => setIndustrySector(e.target.value)}
          >
            <option value="">Not specified</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>

          <div className="new-client-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewClientForm
