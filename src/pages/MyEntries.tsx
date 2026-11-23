import { useState } from 'react'
import Icon from '../components/Icon'
import './Dashboard.css'

type PaymentStatus = 'PAID' | 'UNPAID' | 'CANCELLED' | 'UNKNOWN'

type EncoderEntry = {
  id: number
  txnDate: string
  client: string
  branch?: string
  premium: number
  paymentStatus: PaymentStatus
  primaryAgent: string
  logbookPage: string
}

const initialEntries: EncoderEntry[] = [
  {
    id: 1,
    txnDate: '2026-01-22',
    client: 'ABC Properties Inc.',
    branch: 'Greenbelt 5 BR',
    premium: 8500,
    paymentStatus: 'PAID',
    primaryAgent: 'Maria Santos',
    logbookPage: 'p. 64',
  },
  {
    id: 2,
    txnDate: '2026-01-22',
    client: 'Golden Harvest Foods',
    branch: 'Makati Main',
    premium: 3198,
    paymentStatus: 'UNPAID',
    primaryAgent: 'Carlo Reyes',
    logbookPage: 'p. 64',
  },
  {
    id: 3,
    txnDate: '2026-01-21',
    client: 'Blue Ocean Retail',
    branch: 'Salcedo Village',
    premium: 1122,
    paymentStatus: 'PAID',
    primaryAgent: 'Angela Cruz',
    logbookPage: 'p. 63',
  },
]

const peso = (value: number) => `₱${value.toLocaleString('en-PH')}`

const paymentBadge: Record<PaymentStatus, string> = {
  PAID: 'badge-success',
  UNPAID: 'badge-warning',
  CANCELLED: 'badge-danger',
  UNKNOWN: 'badge-neutral',
}

function MyEntries() {
  const [entries, setEntries] = useState<EncoderEntry[]>(initialEntries)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPremium, setEditPremium] = useState('')
  const [editStatus, setEditStatus] = useState<PaymentStatus>('UNKNOWN')
  const [editPage, setEditPage] = useState('')
  const [notice, setNotice] = useState('')

  const filteredEntries = entries.filter((entry) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      entry.client.toLowerCase().includes(q) ||
      (entry.branch ?? '').toLowerCase().includes(q) ||
      entry.primaryAgent.toLowerCase().includes(q) ||
      entry.logbookPage.toLowerCase().includes(q)
    )
  })

  function startEdit(entry: EncoderEntry) {
    setEditingId(entry.id)
    setEditPremium(String(entry.premium))
    setEditStatus(entry.paymentStatus)
    setEditPage(entry.logbookPage)
    setNotice('')
  }

  function saveEdit(id: number) {
    const parsedPremium = Number(editPremium)
    if (Number.isNaN(parsedPremium) || parsedPremium <= 0) return

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              premium: parsedPremium,
              paymentStatus: editStatus,
              logbookPage: editPage.trim() || entry.logbookPage,
            }
          : entry
      )
    )
    setEditingId(null)
    setNotice('Entry updated in local sample data.')
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>
          <h1>My Entries</h1>
          <p>Review transactions you encoded and fix typos if needed.</p>
        </div>
      </header>

      <p className="sample-banner">
        Edits are stored locally until backend integration.
      </p>

      {notice && (
        <p role="status" className="alert alert-success">
          <Icon name="checkCircle" size={16} />
          {notice}
        </p>
      )}

      <section className="dashboard-panel">
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" size={16} />
            <input
              type="search"
              className="control"
              placeholder="Search by client, agent, or logbook page..."
              aria-label="Search my entries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="toolbar-count">
            {filteredEntries.length} entries displayed
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th className="cell-num">Premium</th>
              <th>Status</th>
              <th>Primary Agent</th>
              <th>Logbook Page</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => {
              const isEditing = editingId === entry.id

              return (
                <tr
                  key={entry.id}
                  className={isEditing ? 'row-selected' : undefined}
                >
                  <td>{entry.txnDate}</td>
                  <td>
                    <strong>{entry.client}</strong>
                    {entry.branch && (
                      <span className="cell-sub">{entry.branch}</span>
                    )}
                  </td>
                  <td className="cell-num">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="control control-sm"
                        aria-label="Premium"
                        value={editPremium}
                        onChange={(e) => setEditPremium(e.target.value)}
                        style={{ width: '110px', textAlign: 'right' }}
                      />
                    ) : (
                      peso(entry.premium)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        className="control control-sm"
                        aria-label="Payment status"
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as PaymentStatus)
                        }
                      >
                        <option value="PAID">PAID</option>
                        <option value="UNPAID">UNPAID</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="UNKNOWN">UNKNOWN</option>
                      </select>
                    ) : (
                      <span className={`badge ${paymentBadge[entry.paymentStatus]}`}>
                        {entry.paymentStatus}
                      </span>
                    )}
                  </td>
                  <td>{entry.primaryAgent}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        className="control control-sm"
                        aria-label="Logbook page"
                        value={editPage}
                        onChange={(e) => setEditPage(e.target.value)}
                        style={{ width: '90px' }}
                      />
                    ) : (
                      entry.logbookPage
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => saveEdit(entry.id)}
                        >
                          <Icon name="check" size={14} />
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-soft btn-sm"
                        onClick={() => startEdit(entry)}
                      >
                        <Icon name="pencil" size={14} />
                        Fix Typo
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredEntries.length === 0 && (
          <div className="empty-state">
            <Icon name="search" size={28} />
            No entries match your search.
          </div>
        )}
      </section>
    </div>
  )
}

export default MyEntries