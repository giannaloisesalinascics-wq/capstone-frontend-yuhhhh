import { useState } from 'react'
import Icon from '../components/Icon'
import { peso } from '../format'
import {
  clientStats,
  useClients,
  useTransactions,
  type PaymentStatus,
} from '../data/records'
import './Dashboard.css'

const paymentBadge: Record<PaymentStatus, string> = {
  PAID: 'badge-success',
  UNPAID: 'badge-warning',
  CANCELLED: 'badge-danger',
  UNKNOWN: 'badge-neutral',
}

function Clients() {
  const clientList = useClients()
  const transactions = useTransactions()
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('ALL')
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  const clients = clientList
    .map((c) => ({ ...c, ...clientStats(c.id, transactions) }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const sectors = Array.from(new Set(clients.map((c) => c.sector))).sort()

  const filteredClients = clients.filter((client) => {
    const query = search.trim().toLowerCase()
    const matchesSearch =
      !query ||
      client.name.toLowerCase().includes(query) ||
      (client.branch ?? '').toLowerCase().includes(query) ||
      client.sector.toLowerCase().includes(query)

    const matchesSector =
      sectorFilter === 'ALL' || client.sector === sectorFilter

    return matchesSearch && matchesSector
  })

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const selectedHistory = transactions
    .filter((t) => t.clientId === selectedClientId)
    .sort((a, b) => b.txnDate.localeCompare(a.txnDate))

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>
          <h1>Clients</h1>
          <p>Search corporate clients, branches, and policy transaction history.</p>
        </div>
      </header>

      <p className="sample-banner">
        Clients and transaction history are shared with Transaction Entry and My Entries, saved in this browser until backend integration.
      </p>

      <section className="dashboard-panel">
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" size={16} />
            <input
              type="search"
              className="control"
              placeholder="Search by client name, branch, or sector..."
              aria-label="Search clients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter by sector"
            className="control"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>

          <span className="toolbar-count">
            {filteredClients.length} clients found
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Client & Branch</th>
              <th>Industry Sector</th>
              <th className="cell-num">Seasons</th>
              <th className="cell-num">Last Premium</th>
              <th>Lapse Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => {
              const lapsePct = client.pLapse === null ? null : Math.round(client.pLapse * 100)
              const isSelected = selectedClientId === client.id

              return (
                <tr
                  key={client.id}
                  className={isSelected ? 'row-selected' : undefined}
                >
                  <td>
                    <strong>{client.name}</strong>
                    {client.branch && (
                      <span className="cell-sub">{client.branch}</span>
                    )}
                  </td>
                  <td>{client.sector}</td>
                  <td className="cell-num">{client.seasons}</td>
                  <td className="cell-num">
                    {client.lastPremium === null ? <span className="cell-sub">No transactions</span> : peso(client.lastPremium)}
                  </td>
                  <td>
                    {lapsePct === null ? (
                      <span className="badge badge-brand" title="Not enough history for a model score yet">
                        New Account · Cold Start
                      </span>
                    ) : (
                    <div className="meter">
                      <div className="meter-track">
                        <div
                          className={`meter-fill ${
                            lapsePct >= 70
                              ? 'meter-fill-danger'
                              : lapsePct >= 40
                                ? 'meter-fill-warning'
                                : 'meter-fill-success'
                          }`}
                          style={{ width: `${lapsePct}%` }}
                        />
                      </div>
                      <span className="meter-value">{lapsePct}%</span>
                    </div>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-soft'}`}
                      aria-expanded={isSelected}
                      onClick={() =>
                        setSelectedClientId(isSelected ? null : client.id)
                      }
                    >
                      {isSelected ? 'Hide' : 'View Profile'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="empty-state">
            <Icon name="search" size={28} />
            No clients match your search.
          </div>
        )}
      </section>

      {selectedClient && (
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>
                {selectedClient.name}
                {selectedClient.branch ? ` — ${selectedClient.branch}` : ''}
              </h2>
              <div className="detail-meta">
                <span>
                  <Icon name="building" size={15} />
                  {selectedClient.sector}
                </span>
                <span>
                  <Icon name="user" size={15} />
                  {selectedClient.contactPerson ?? 'Contact missing'}
                </span>
                {selectedClient.contactPerson && (
                  <span>
                    <Icon name="phone" size={15} />
                    {selectedClient.phone ?? 'No phone'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedClientId(null)}
              aria-label="Close client profile"
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th className="cell-num">Premium</th>
                <th>Status</th>
                <th>Primary Agent</th>
                <th>Logbook Page</th>
              </tr>
            </thead>
            <tbody>
              {selectedHistory.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.txnDate}</td>
                  <td className="cell-num">{peso(txn.premium)}</td>
                  <td>
                    <span className={`badge ${paymentBadge[txn.paymentStatus]}`}>
                      {txn.paymentStatus}
                    </span>
                  </td>
                  <td>{txn.primaryAgent}</td>
                  <td>{txn.logbookPage ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedHistory.length === 0 && (
            <div className="empty-state">
              <Icon name="fileText" size={28} />
              No transactions recorded for this client yet.
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Clients