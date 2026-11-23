import { useState } from 'react'
import Icon from '../components/Icon'
import './Dashboard.css'

type ClientTxn = {
  date: string
  premium: number
  status: 'PAID' | 'UNPAID' | 'CANCELLED' | 'UNKNOWN'
  agent: string
  logbookPage: string
}

type ClientRecord = {
  id: number
  name: string
  branch?: string
  sector: string
  seasons: number
  lastPremium: number
  pLapse: number
  contactPerson?: string
  phone?: string
  transactions: ClientTxn[]
}

type ClientsProps = {
  showProbabilities?: boolean
}

const sampleClients: ClientRecord[] = [
  {
    id: 1,
    name: 'ABC Properties Inc.',
    branch: 'Greenbelt 5 BR',
    sector: 'Real estate / property',
    seasons: 4,
    lastPremium: 8500,
    pLapse: 0.85,
    contactPerson: 'Elena Mendoza',
    phone: '0917-555-0142',
    transactions: [
      { date: '2026-01-14', premium: 8500, status: 'PAID', agent: 'Maria Santos', logbookPage: 'p. 42' },
      { date: '2025-01-12', premium: 8500, status: 'PAID', agent: 'Carlo Reyes', logbookPage: 'p. 19' },
    ],
  },
  {
    id: 2,
    name: 'Golden Harvest Foods',
    branch: 'Makati Main',
    sector: 'Food & hospitality',
    seasons: 3,
    lastPremium: 3198,
    pLapse: 0.76,
    contactPerson: 'Ramon Villanueva',
    phone: '0918-555-0198',
    transactions: [
      { date: '2026-01-18', premium: 3198, status: 'PAID', agent: 'Maria Santos', logbookPage: 'p. 55' },
      { date: '2025-01-20', premium: 3198, status: 'PAID', agent: 'Angela Cruz', logbookPage: 'p. 31' },
    ],
  },
  {
    id: 3,
    name: 'Summit Trading Inc.',
    sector: 'Trading & retail',
    seasons: 2,
    lastPremium: 2244,
    pLapse: 0.62,
    transactions: [
      { date: '2026-01-09', premium: 2244, status: 'UNPAID', agent: 'Angela Cruz', logbookPage: 'p. 27' },
    ],
  },
  {
    id: 4,
    name: 'Blue Ocean Retail',
    branch: 'Salcedo Village',
    sector: 'Trading & retail',
    seasons: 1,
    lastPremium: 1122,
    pLapse: 0.38,
    transactions: [
      { date: '2026-01-22', premium: 1122, status: 'PAID', agent: 'Carlo Reyes', logbookPage: 'p. 63' },
    ],
  },
  {
    id: 5,
    name: 'Metro Realty Corp.',
    branch: 'Ayala Ave',
    sector: 'Real estate / property',
    seasons: 5,
    lastPremium: 5600,
    pLapse: 0.22,
    contactPerson: 'Liza Tan',
    phone: '0917-555-0881',
    transactions: [
      { date: '2026-01-05', premium: 5600, status: 'PAID', agent: 'Carlo Reyes', logbookPage: 'p. 11' },
      { date: '2025-01-07', premium: 5600, status: 'PAID', agent: 'Carlo Reyes', logbookPage: 'p. 08' },
    ],
  },
]

const peso = (value: number) => `₱${value.toLocaleString('en-PH')}`

const paymentBadge: Record<ClientTxn['status'], string> = {
  PAID: 'badge-success',
  UNPAID: 'badge-warning',
  CANCELLED: 'badge-danger',
  UNKNOWN: 'badge-neutral',
}

function Clients({ showProbabilities = false }: ClientsProps) {
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('ALL')
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  const sectors = Array.from(new Set(sampleClients.map((c) => c.sector)))

  const filteredClients = sampleClients.filter((client) => {
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

  const selectedClient = sampleClients.find((c) => c.id === selectedClientId)

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
        Client directory and history are sample data for demonstration only.
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
              {showProbabilities && <th>Lapse Risk</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => {
              const lapsePct = Math.round(client.pLapse * 100)
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
                  <td className="cell-num">{peso(client.lastPremium)}</td>
                  {showProbabilities && (
                    <td>
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
                    </td>
                  )}
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
              {selectedClient.transactions.map((txn, idx) => (
                <tr key={idx}>
                  <td>{txn.date}</td>
                  <td className="cell-num">{peso(txn.premium)}</td>
                  <td>
                    <span className={`badge ${paymentBadge[txn.status]}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td>{txn.agent}</td>
                  <td>{txn.logbookPage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

export default Clients