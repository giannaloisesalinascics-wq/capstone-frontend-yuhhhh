
import { useState } from 'react'
import Icon from '../components/Icon'
import './Dashboard.css'

type RiskBand = 'High' | 'Moderate' | 'Low'

type ForecastClient = {
  id: number
  name: string
  premium: number
  pLapse: number
  seasons: number
  segment: string
  reason: string
}

const sampleClients: ForecastClient[] = [
  {
    id: 1,
    name: 'ABC Properties Inc.',
    premium: 8500,
    pLapse: 0.85,
    seasons: 4,
    segment: 'Loyal Multi-Season Clients',
    reason: 'Renewal activity has decreased.',
  },
  {
    id: 2,
    name: 'Golden Harvest Foods',
    premium: 3198,
    pLapse: 0.76,
    seasons: 3,
    segment: 'Regular Premium Clients',
    reason: 'Previous renewal was delayed.',
  },
  {
    id: 3,
    name: 'Summit Trading Inc.',
    premium: 2244,
    pLapse: 0.62,
    seasons: 2,
    segment: 'Regular Premium Clients',
    reason: 'Limited renewal history.',
  },
  {
    id: 4,
    name: 'Greenfield Services',
    premium: 2805,
    pLapse: 0.48,
    seasons: 2,
    segment: 'Regular Premium Clients',
    reason: 'Moderate renewal uncertainty.',
  },
  {
    id: 5,
    name: 'Blue Ocean Retail',
    premium: 1122,
    pLapse: 0.38,
    seasons: 1,
    segment: 'New and Occasional Clients',
    reason: 'New client with limited history.',
  },
  {
    id: 6,
    name: 'Metro Realty Corp.',
    premium: 5600,
    pLapse: 0.22,
    seasons: 5,
    segment: 'Loyal Multi-Season Clients',
    reason: 'Consistent previous renewals.',
  },
]

function getRiskBand(pLapse: number): RiskBand {
  if (pLapse >= 0.7) return 'High'
  if (pLapse >= 0.4) return 'Moderate'
  return 'Low'
}

const riskStyles: Record<RiskBand, { badge: string; meter: string }> = {
  High: { badge: 'badge-danger', meter: 'meter-fill-danger' },
  Moderate: { badge: 'badge-warning', meter: 'meter-fill-warning' },
  Low: { badge: 'badge-success', meter: 'meter-fill-success' },
}

function RenewalForecast() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')

  const filteredClients = sampleClients
    .filter((client) => {
      const matchesSearch = client.name
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesRisk =
        riskFilter === 'All' ||
        getRiskBand(client.pLapse) === riskFilter

      return matchesSearch && matchesRisk
    })
    .sort((a, b) => b.pLapse - a.pLapse)

  const highRisk = sampleClients.filter(
    (client) => getRiskBand(client.pLapse) === 'High'
  ).length

  const moderateRisk = sampleClients.filter(
    (client) => getRiskBand(client.pLapse) === 'Moderate'
  ).length

  const lowRisk = sampleClients.filter(
    (client) => getRiskBand(client.pLapse) === 'Low'
  ).length

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>

          <h1>Renewal Forecast</h1>

          <p>
            Monitor client renewal risk and prioritize
            retention efforts.
          </p>
        </div>
      </header>

      <p className="sample-banner">
        Risk probabilities are fictional demonstration values, not ML
        predictions.
      </p>

      {/* Risk Summary */}
      <section className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>High Risk Clients</p>
            <span className="kpi-icon kpi-icon-danger">
              <Icon name="alert" />
            </span>
          </div>
          <h2>{highRisk}</h2>
          <span className="kpi-sub">Lapse probability ≥ 70%</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Moderate Risk Clients</p>
            <span className="kpi-icon kpi-icon-warning">
              <Icon name="clock" />
            </span>
          </div>
          <h2>{moderateRisk}</h2>
          <span className="kpi-sub">Lapse probability 40–69%</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Low Risk Clients</p>
            <span className="kpi-icon kpi-icon-success">
              <Icon name="shield" />
            </span>
          </div>
          <h2>{lowRisk}</h2>
          <span className="kpi-sub">Lapse probability below 40%</span>
        </div>
      </section>

      {/* Client Forecast Table */}
      <section className="dashboard-panel">
        <h2>Client Renewal Risk</h2>

        <p>
          Clients are ranked by their estimated probability
          of not renewing.
        </p>

        {/* Search and Filters */}
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" size={16} />
            <input
              type="search"
              className="control"
              placeholder="Search client..."
              aria-label="Search clients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={riskFilter}
            className="control"
            aria-label="Filter by risk level"
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <span className="toolbar-count">
            {filteredClients.length} clients displayed
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th className="cell-num">Premium</th>
              <th className="cell-num">Seasons</th>
              <th>Lapse Probability</th>
              <th>Risk Level</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.map((client) => {
              const risk = getRiskBand(client.pLapse)
              const isColdStart = client.seasons < 2
              const lapsePct = Math.round(client.pLapse * 100)

              return (
                <tr key={client.id}>
                  <td>
                    <strong>{client.name}</strong>

                    <span className="cell-sub">{client.segment}</span>

                    {isColdStart && (
                      <span
                        className="badge badge-brand"
                        style={{ marginTop: '6px', fontSize: '11px' }}
                      >
                        New Account · Cold Start
                      </span>
                    )}
                  </td>

                  <td className="cell-num">
                    ₱{client.premium.toLocaleString('en-PH')}
                  </td>

                  <td className="cell-num">{client.seasons}</td>

                  <td>
                    <div className="meter">
                      <div className="meter-track">
                        <div
                          className={`meter-fill ${riskStyles[risk].meter}`}
                          style={{ width: `${lapsePct}%` }}
                        />
                      </div>
                      <span className="meter-value">{lapsePct}%</span>
                    </div>
                  </td>

                  <td>
                    <span className={`badge badge-dot ${riskStyles[risk].badge}`}>
                      {risk}
                    </span>
                  </td>

                  <td style={{ minWidth: '200px' }}>{client.reason}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="empty-state">
            <Icon name="search" size={28} />
            No clients match the selected filters.
          </div>
        )}
      </section>
    </div>
  )
}

export default RenewalForecast
