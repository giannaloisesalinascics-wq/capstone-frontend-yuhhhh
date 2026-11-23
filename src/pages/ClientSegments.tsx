
import { useState, type CSSProperties } from 'react'
import './Dashboard.css'

type Client = {
  id: number
  name: string
  premium: number
  seasons: number
  segment: string
}

const segments = [
  {
    id: 'loyal',
    name: 'Loyal Multi-Season Clients',
    description: 'Established clients with regular renewals.',
    renewalRate: '65%',
    color: '#2563eb',
  },
  {
    id: 'regular',
    name: 'Regular Premium Clients',
    description: 'Clients with moderate renewal activity.',
    renewalRate: '42%',
    color: '#16a34a',
  },
  {
    id: 'new',
    name: 'New and Occasional Clients',
    description: 'Newer clients with limited renewal history.',
    renewalRate: '20%',
    color: '#f59e0b',
  },
]

const clients: Client[] = [
  { id: 1, name: 'ABC Properties Inc.', premium: 8500, seasons: 5, segment: 'loyal' },
  { id: 2, name: 'Metro Realty Corp.', premium: 5600, seasons: 4, segment: 'loyal' },
  { id: 3, name: 'Golden Harvest Foods', premium: 3198, seasons: 4, segment: 'loyal' },
  { id: 4, name: 'Summit Trading Inc.', premium: 2244, seasons: 3, segment: 'regular' },
  { id: 5, name: 'Greenfield Services', premium: 2805, seasons: 2, segment: 'regular' },
  { id: 6, name: 'Bright Future Corp.', premium: 3198, seasons: 3, segment: 'regular' },
  { id: 7, name: 'Blue Ocean Retail', premium: 1122, seasons: 1, segment: 'new' },
  { id: 8, name: 'Northside Cafe', premium: 1683, seasons: 1, segment: 'new' },
  { id: 9, name: 'Eastpoint Ventures', premium: 2244, seasons: 1, segment: 'new' },
]

const peso = (value: number) =>
  `₱${value.toLocaleString('en-PH')}`

function ClientSegments() {
  const [selectedSegment, setSelectedSegment] = useState('all')

  const filteredClients = clients.filter(
    (client) =>
      selectedSegment === 'all' ||
      client.segment === selectedSegment
  )

  function getColor(segmentId: string) {
    return segments.find((segment) => segment.id === segmentId)?.color ?? '#64748b'
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>
          <h1>Client Segments</h1>
          <p>Analyze clients grouped by premium and renewal behavior.</p>
        </div>
      </header>

      <p className="sample-banner">
        Segments and renewal rates are illustrative, not actual
        machine-learning results.
      </p>

      <div className="segment-grid">
        {segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            className="segment-card"
            aria-pressed={selectedSegment === segment.id}
            onClick={() => setSelectedSegment(segment.id)}
            style={{ '--segment-color': segment.color } as CSSProperties}
          >
            <span className="segment-card-label">
              <i aria-hidden="true" />
              Client Segment
            </span>

            <h3>{segment.name}</h3>

            <p>{segment.description}</p>

            <div className="segment-card-stats">
              <div>
                <span>Sample clients</span>
                <strong>
                  {clients.filter((c) => c.segment === segment.id).length}
                </strong>
              </div>
              <div>
                <span>Renewal rate</span>
                <strong>{segment.renewalRate}</strong>
              </div>
            </div>
          </button>
        ))}
      </div>

      <section className="dashboard-panel">
        <h2>Client Cluster Visualization</h2>
        <p>
          Number of renewal seasons (x-axis) versus premium amount on a log scale (y-axis).
          Each point represents one sample client.
        </p>

        <svg
          viewBox="0 0 640 290"
          role="img"
          aria-label="Scatter chart showing number of seasons on the x-axis and log-scale client premiums on the y-axis"
          className="dashboard-chart-svg"
          style={{ maxWidth: '760px', margin: '0 auto' }}
        >
          {[1000, 2500, 5000, 10000].map((amount) => {
            const y = 230 - (Math.log10(amount) - 3) * 190
            return (
              <g key={amount}>
                <line
                  x1="80"
                  y1={y}
                  x2="600"
                  y2={y}
                  className="chart-gridline"
                />
                <text x="72" y={y + 4} textAnchor="end" className="chart-tick">
                  {peso(amount)}
                </text>
              </g>
            )
          })}

          <line x1="80" y1="236" x2="600" y2="236" className="chart-axis" />

          {[1, 2, 3, 4, 5].map((season) => {
            const x = 110 + (season - 1) * 115
            return (
              <text
                key={season}
                x={x}
                y="253"
                textAnchor="middle"
                className="chart-tick is-strong"
              >
                {season}
              </text>
            )
          })}

          {filteredClients.map((client) => {
            const x = 110 + (client.seasons - 1) * 115
            const y = 230 - (Math.log10(client.premium) - 3) * 190

            return (
              <circle
                key={client.id}
                cx={x}
                cy={y}
                r="8"
                fill={getColor(client.segment)}
                fillOpacity="0.85"
                className="scatter-point"
              >
                <title>
                  {`${client.name}: ${client.seasons} season(s), ${peso(client.premium)}`}
                </title>
              </circle>
            )
          })}

          <text x="340" y="280" textAnchor="middle" className="chart-tick is-strong">
            Number of Seasons
          </text>
          <text
            x="14"
            y="135"
            textAnchor="middle"
            className="chart-tick is-strong"
            transform="rotate(-90 14 135)"
          >
            Premium Amount (log scale)
          </text>
        </svg>

        <div className="chart-legend" style={{ justifyContent: 'center' }}>
          {segments.map((segment) => (
            <span key={segment.id}>
              <i style={{ background: segment.color, borderRadius: '50%' }} />
              {segment.name}
            </span>
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Segment Client List</h2>
            <p>{filteredClients.length} clients displayed</p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedSegment('all')}
            disabled={selectedSegment === 'all'}
          >
            Show All Clients
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Segment</th>
              <th className="cell-num">Premium</th>
              <th className="cell-num">Seasons</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td>
                  <strong>{client.name}</strong>
                </td>
                <td>
                  <span
                    className="segment-tag"
                    style={{ '--segment-color': getColor(client.segment) } as CSSProperties}
                  >
                    <i aria-hidden="true" />
                    {segments.find((s) => s.id === client.segment)?.name}
                  </span>
                </td>
                <td className="cell-num">{peso(client.premium)}</td>
                <td className="cell-num">{client.seasons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default ClientSegments
