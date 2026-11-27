import { useState } from 'react'
import Icon from '../components/Icon'
import { peso } from '../format'
import {
  updateTransaction,
  useClients,
  useTransactions,
  type PaymentStatus,
} from '../data/records'
import './Dashboard.css'

type EntryRecord = {
  id: number
  txnDate: string
  client: string
  branch?: string
  premium: number
  paymentStatus: PaymentStatus
  primaryAgent: string
  logbookPage: string
}

const paymentBadge: Record<PaymentStatus, string> = {
  PAID: 'badge-success',
  UNPAID: 'badge-warning',
  CANCELLED: 'badge-danger',
  UNKNOWN: 'badge-neutral',
}

function MyEntries({ currentUsername }: { currentUsername?: string }) {
  const clients = useClients()
  const transactions = useTransactions()

  // Transactions the signed-in user encoded, newest first
  const entries: EntryRecord[] = transactions
    .filter((t) => t.encodedBy === currentUsername)
    .sort((a, b) => b.txnDate.localeCompare(a.txnDate) || b.id - a.id)
    .map((t) => {
      const client = clients.find((c) => c.id === t.clientId)
      return {
        id: t.id,
        txnDate: t.txnDate,
        client: client?.name ?? 'Unknown client',
        branch: client?.branch,
        premium: t.premium,
        paymentStatus: t.paymentStatus,
        primaryAgent: t.primaryAgent,
        logbookPage: t.logbookPage ?? '—',
      }
    })

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

  function startEdit(entry: EntryRecord) {
    setEditingId(entry.id)
    setEditPremium(String(entry.premium))
    setEditStatus(entry.paymentStatus)
    setEditPage(entry.logbookPage === '—' ? '' : entry.logbookPage)
    setNotice('')
  }

  function saveEdit(id: number) {
    const parsedPremium = Number(editPremium)
    if (Number.isNaN(parsedPremium) || parsedPremium <= 0) return

    updateTransaction(id, {
      premium: parsedPremium,
      paymentStatus: editStatus,
      logbookPage: editPage.trim() || undefined,
    })
    setEditingId(null)
    setNotice('Entry updated. The client’s history reflects the change.')
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>
          <h1>My Entries</h1>
          <p>Review transactions you entered and fix typos if needed.</p>
        </div>
      </header>

      <p className="sample-banner">
        Entries and edits are saved in this browser and shared with Clients until backend integration.
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
            {entries.length === 0
              ? 'You haven’t encoded any transactions yet. Saved transactions from Transaction Entry appear here.'
              : 'No entries match your search.'}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyEntries