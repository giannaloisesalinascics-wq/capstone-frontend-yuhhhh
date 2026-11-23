import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import CountUp from '../components/CountUp'
import BorderBeam from '../components/ui/BorderBeam'
import SplitText from '../components/reactbits/SplitText'
import Magnet from '../components/reactbits/Magnet'
import GlareHover from '../components/reactbits/GlareHover'
import AnimatedContent from '../components/reactbits/AnimatedContent'
import './Dashboard.css'

type SeasonStats = {
  label: string
  premium: number
  vsLastSeason: string
  activeClients: number
  clientsDue: number
  clientsRenewed: number
  tasksDone: number
  tasksOpen: number
  closedToday: number
  monthly: { month: string; amount: number }[]
}

const seasonData: Record<string, SeasonStats> = {
  '2026': {
    label: 'Season 2026 (Nov 2025–Feb 2026)',
    premium: 3850000,
    vsLastSeason: 'In progress · 76% of Season 2025 total',
    activeClients: 1190,
    clientsDue: 1190,
    clientsRenewed: 333,
    tasksDone: 15,
    tasksOpen: 18,
    closedToday: 19240,
    monthly: [
      { month: 'Nov', amount: 180000 },
      { month: 'Dec', amount: 420000 },
      { month: 'Jan', amount: 2890000 },
      { month: 'Feb', amount: 360000 },
    ],
  },
  '2025': {
    label: 'Season 2025 (Nov 2024–Feb 2025)',
    premium: 5050000,
    vsLastSeason: '+18.5% vs Season 2024',
    activeClients: 1286,
    clientsDue: 1286,
    clientsRenewed: 437,
    tasksDone: 84,
    tasksOpen: 4,
    closedToday: 0,
    monthly: [
      { month: 'Nov', amount: 210000 },
      { month: 'Dec', amount: 540000 },
      { month: 'Jan', amount: 3820000 },
      { month: 'Feb', amount: 480000 },
    ],
  },
  '2024': {
    label: 'Season 2024 (Nov 2023–Feb 2024)',
    premium: 4260000,
    vsLastSeason: '+9.2% vs Season 2023',
    activeClients: 1054,
    clientsDue: 1054,
    clientsRenewed: 327,
    tasksDone: 72,
    tasksOpen: 0,
    closedToday: 0,
    monthly: [
      { month: 'Nov', amount: 160000 },
      { month: 'Dec', amount: 410000 },
      { month: 'Jan', amount: 3310000 },
      { month: 'Feb', amount: 380000 },
    ],
  },
}

const premiumPerSeason = [
  { year: '2021', amount: 2950000 },
  { year: '2022', amount: 4680000 },
  { year: '2023', amount: 3900000 },
  { year: '2024', amount: 4260000 },
  { year: '2025', amount: 5050000 },
  { year: '2026', amount: 3850000 },
]

const segments = [
  { name: 'Loyal High-Premium', clients: 45, avgPremium: 8500, color: 'var(--seg-1)' },
  { name: 'Regular', clients: 82, avgPremium: 3198, color: 'var(--seg-2)' },
  { name: 'New & Occasional', clients: 61, avgPremium: 1122, color: 'var(--seg-3)' },
]

const agents = [
  { name: 'Maria Santos', completed: 6, assigned: 8 },
  { name: 'Carlo Reyes', completed: 4, assigned: 5 },
  { name: 'Angela Cruz', completed: 5, assigned: 7 },
]

const peso = (value: number) => `₱${value.toLocaleString('en-PH')}`

const shortPeso = (value: number) =>
  value >= 1000000
    ? `₱${(value / 1000000).toFixed(2)}M`
    : `₱${Math.round(value / 1000)}k`

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Smooth curve through points (Catmull-Rom converted to cubic Béziers)
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ''
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x},${p2.y}`
  }
  return d
}

// Keep tooltips inside the card near the left/right edges
const tooltipEdge = (ratio: number) =>
  ratio > 0.82 ? 'align-end' : ratio < 0.18 ? 'align-start' : ''

/* ---------- Renewal ring ---------- */

function RenewalRing({ renewed, due }: { renewed: number; due: number }) {
  const rate = due > 0 ? renewed / due : 0
  const radius = 62
  const circumference = 2 * Math.PI * radius

  return (
    <section className="bento-card bento-ring">
      <header className="bento-head">
        <div>
          <h2>Renewal progress</h2>
          <p>Clients renewed out of those due this season</p>
        </div>
      </header>

      <div className="ring-wrap">
        <svg viewBox="0 0 160 160" className="ring-svg" role="img" aria-label={`${Math.round(rate * 100)}% of due clients renewed`}>
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" className="stop-brand-light" />
              <stop offset="70%" className="stop-brand" />
              <stop offset="100%" className="stop-gold" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={radius} className="ring-track-circle" />
          {[0.25, 0.5, 0.75].map((tick) => (
            <line
              key={tick}
              x1="80"
              y1="8"
              x2="80"
              y2="15"
              className="ring-tick"
              transform={`rotate(${tick * 360} 80 80)`}
            />
          ))}
          <circle
            key={`${renewed}-${due}`}
            cx="80"
            cy="80"
            r={radius}
            className="ring-value"
            stroke="url(#ring-grad)"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - rate)}
            style={{ '--ring-c': circumference } as React.CSSProperties}
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div className="ring-center">
          <strong>
            <CountUp value={Math.round(rate * 100)} />%
          </strong>
          <span>renewed</span>
        </div>
      </div>

      <dl className="ring-stats">
        <div>
          <dt>
            <i className="dot dot-brand" /> Renewed
          </dt>
          <dd>{renewed.toLocaleString('en-PH')}</dd>
        </div>
        <div>
          <dt>
            <i className="dot dot-muted" /> Remaining
          </dt>
          <dd>{(due - renewed).toLocaleString('en-PH')}</dd>
        </div>
        <div>
          <dt>
            <i className="dot dot-gold" /> Due
          </dt>
          <dd>{due.toLocaleString('en-PH')}</dd>
        </div>
      </dl>
    </section>
  )
}

/* ---------- Premium trend (area chart, click to pick a season) ---------- */

function PremiumTrend({
  season,
  onSelect,
}: {
  season: string
  onSelect: (year: string) => void
}) {
  const [hover, setHover] = useState<number | null>(null)
  const gradientId = useId()

  const W = 640
  const H = 250
  const pad = { top: 24, right: 24, bottom: 34, left: 56 }
  const max = Math.max(...premiumPerSeason.map((s) => s.amount)) * 1.12
  const x = (i: number) => pad.left + (i / (premiumPerSeason.length - 1)) * (W - pad.left - pad.right)
  const y = (v: number) => pad.top + (1 - v / max) * (H - pad.top - pad.bottom)

  const points = premiumPerSeason.map((s, i) => ({ x: x(i), y: y(s.amount) }))
  const line = smoothPath(points)
  const area = `${line} L${points[points.length - 1].x},${H - pad.bottom} L${points[0].x},${H - pad.bottom} Z`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)

  const shown = hover ?? premiumPerSeason.findIndex((s) => s.year === season)
  const shownItem = premiumPerSeason[shown]
  const prev = premiumPerSeason[shown - 1]
  const change = prev ? ((shownItem.amount - prev.amount) / prev.amount) * 100 : null

  return (
    <section className="bento-card bento-wide">
      <header className="bento-head">
        <div>
          <h2>Are we growing?</h2>
          <p>Total premium per season · click a season to explore it</p>
        </div>
        <span className="bento-chip">
          <Icon name="trending" size={14} /> 2021–2026
        </span>
      </header>

      <div className="chart-frame" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label="Area chart of total premium per season, 2021 to 2026">
          <defs>
            <linearGradient id={`${gradientId}-area`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className="stop-area-top" />
              <stop offset="100%" className="stop-area-bottom" />
            </linearGradient>
            <linearGradient id={`${gradientId}-line`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" className="stop-brand-light" />
              <stop offset="80%" className="stop-brand" />
              <stop offset="100%" className="stop-gold" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'chart-axis' : 'chart-gridline'} />
              <text x={pad.left - 10} y={y(t) + 4} textAnchor="end" className="chart-tick">
                {t === 0 ? '₱0' : shortPeso(t)}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#${gradientId}-area)`} className="chart-area" />
          <path d={line} stroke={`url(#${gradientId}-line)`} className="chart-line" pathLength={1} />

          {shown >= 0 && (
            <line x1={points[shown].x} x2={points[shown].x} y1={pad.top} y2={H - pad.bottom} className="chart-crosshair" />
          )}

          {premiumPerSeason.map((s, i) => {
            const selectable = s.year in seasonData
            return (
              <g key={s.year}>
                <text x={points[i].x} y={H - 10} textAnchor="middle" className={`chart-tick ${s.year === season ? 'is-strong' : ''}`}>
                  {s.year}
                </text>
                <circle
                  cx={points[i].x}
                  cy={points[i].y}
                  r={s.year === season ? 6 : 4}
                  className={`chart-point ${s.year === season ? 'is-selected' : ''} ${hover === i ? 'is-hover' : ''}`}
                />
                {/* Generous invisible hit area */}
                <rect
                  x={points[i].x - (W - pad.left - pad.right) / (premiumPerSeason.length - 1) / 2}
                  y={pad.top}
                  width={(W - pad.left - pad.right) / (premiumPerSeason.length - 1)}
                  height={H - pad.top - pad.bottom}
                  className={`chart-hit ${selectable ? 'is-selectable' : ''}`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => selectable && onSelect(s.year)}
                >
                  <title>{`Season ${s.year}: ${peso(s.amount)}`}</title>
                </rect>
              </g>
            )
          })}
        </svg>

        {shown >= 0 && (
          <div
            className={`chart-tooltip ${tooltipEdge(points[shown].x / W)}`}
            style={{ left: `${(points[shown].x / W) * 100}%`, top: `${(points[shown].y / H) * 100}%` }}
          >
            <small>Season {shownItem.year}</small>
            <strong>{peso(shownItem.amount)}</strong>
            {change !== null && (
              <span className={change >= 0 ? 'is-up' : 'is-down'}>
                {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% vs {prev.year}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Monthly premium bars ---------- */

function MonthlyBars({ season, monthly }: { season: string; monthly: SeasonStats['monthly'] }) {
  const [hover, setHover] = useState<number | null>(null)
  const gradientId = useId()
  const total = monthly.reduce((sum, m) => sum + m.amount, 0)
  const peak = monthly.reduce((best, m) => (m.amount > best.amount ? m : best), monthly[0])

  const W = 560
  const H = 240
  const pad = { top: 28, bottom: 34, left: 20, right: 20 }
  const max = Math.max(...monthly.map((m) => m.amount)) * 1.08
  const slot = (W - pad.left - pad.right) / monthly.length
  const barW = slot * 0.52

  return (
    <section className="bento-card bento-wide">
      <header className="bento-head">
        <div>
          <h2>Premium by month</h2>
          <p>Season {season} · how the renewal window is distributed</p>
        </div>
        <span className="bento-chip bento-chip-gold">
          <Icon name="sparkle" size={13} /> Peak: {peak.month} ({Math.round((peak.amount / total) * 100)}%)
        </span>
      </header>

      <div className="chart-frame" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label={`Bar chart of monthly premium for Season ${season}`}>
          <defs>
            <linearGradient id={`${gradientId}-peak`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className="stop-gold-light" />
              <stop offset="100%" className="stop-gold-dark" />
            </linearGradient>
            <linearGradient id={`${gradientId}-bar`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className="stop-brand-light" />
              <stop offset="100%" className="stop-brand" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1={pad.left} x2={W - pad.right} y1={pad.top + (1 - t) * (H - pad.top - pad.bottom)} y2={pad.top + (1 - t) * (H - pad.top - pad.bottom)} className="chart-gridline" />
          ))}
          <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} className="chart-axis" />

          {monthly.map((m, i) => {
            const h = (m.amount / max) * (H - pad.top - pad.bottom)
            const bx = pad.left + i * slot + (slot - barW) / 2
            const by = H - pad.bottom - h
            const isPeak = m === peak
            const dim = hover !== null && hover !== i
            return (
              <g key={`${season}-${m.month}`} onMouseEnter={() => setHover(i)} className={dim ? 'is-dim' : ''}>
                <rect x={pad.left + i * slot} y={pad.top} width={slot} height={H - pad.top - pad.bottom} className="chart-hit" />
                <rect
                  x={bx}
                  y={by}
                  width={barW}
                  height={Math.max(h, 2)}
                  rx="8"
                  fill={`url(#${gradientId}-${isPeak ? 'peak' : 'bar'})`}
                  className="chart-bar"
                  style={{ animationDelay: `${i * 70}ms` }}
                />
                <text x={bx + barW / 2} y={by - 9} textAnchor="middle" className={`chart-value ${isPeak ? 'is-peak' : ''}`}>
                  {shortPeso(m.amount)}
                </text>
                <text x={bx + barW / 2} y={H - 12} textAnchor="middle" className="chart-tick is-strong">
                  {m.month}
                </text>
              </g>
            )
          })}
        </svg>

        {hover !== null && (
          <div
            className={`chart-tooltip ${tooltipEdge((pad.left + hover * slot + slot / 2) / W)}`}
            style={{
              left: `${((pad.left + hover * slot + slot / 2) / W) * 100}%`,
              top: `${((H - pad.bottom - (monthly[hover].amount / max) * (H - pad.top - pad.bottom)) / H) * 100}%`,
            }}
          >
            <small>{monthly[hover].month} · Season {season}</small>
            <strong>{peso(monthly[hover].amount)}</strong>
            <span>{((monthly[hover].amount / total) * 100).toFixed(1)}% of season premium</span>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Segment donut ---------- */

function SegmentDonut() {
  const [hover, setHover] = useState<number | null>(null)
  const total = segments.reduce((sum, s) => sum + s.clients, 0)
  // Largest slice first, starting at 12 o'clock
  const ordered = [...segments].sort((a, b) => b.clients - a.clients)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const gap = 3

  const arcs = ordered.map((s, i) => ({
    ...s,
    length: (s.clients / total) * circumference,
    offset: ordered.slice(0, i).reduce((sum, prev) => sum + (prev.clients / total) * circumference, 0),
  }))

  const focus = hover !== null ? arcs[hover] : null

  return (
    <section className="bento-card bento-donut">
      <header className="bento-head">
        <div>
          <h2>Client segments</h2>
          <p>Share of corporate clients</p>
        </div>
      </header>

      <div className="donut-wrap" onMouseLeave={() => setHover(null)}>
        <svg viewBox="0 0 140 140" className="donut-svg" role="img" aria-label="Donut chart of client segments">
          <circle cx="70" cy="70" r={radius} className="donut-track" />
          {arcs.map((arc, i) => (
            <circle
              key={arc.name}
              cx="70"
              cy="70"
              r={radius}
              className={`donut-arc ${hover !== null && hover !== i ? 'is-dim' : ''}`}
              stroke={arc.color}
              strokeDasharray={`${Math.max(arc.length - gap, 0)} ${circumference}`}
              strokeDashoffset={-arc.offset}
              transform="rotate(-90 70 70)"
              style={{ animationDelay: `${i * 120}ms` }}
              onMouseEnter={() => setHover(i)}
            >
              <title>{`${arc.name}: ${arc.clients} clients`}</title>
            </circle>
          ))}
        </svg>
        <div className="donut-center">
          <strong>{focus ? focus.clients : total}</strong>
          <span>{focus ? `${focus.name} · ${peso(focus.avgPremium)} avg` : 'corporate clients'}</span>
        </div>
      </div>

      <ul className="donut-legend">
        {arcs.map((arc, i) => (
          <li
            key={arc.name}
            className={hover === i ? 'is-active' : ''}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <i style={{ background: arc.color }} />
            <span>{arc.name}</span>
            <b>{Math.round((arc.clients / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Agent leaderboard ---------- */

function AgentLeaderboard() {
  const ranked = [...agents]
    .map((a) => ({ ...a, rate: Math.round((a.completed / a.assigned) * 100) }))
    .sort((a, b) => b.rate - a.rate)

  return (
    <section className="bento-card bento-full">
      <header className="bento-head">
        <div>
          <h2>Agent leaderboard</h2>
          <p>Task completion this season</p>
        </div>
        <Link to="/manage/tasks" className="btn btn-secondary btn-sm">
          View all tasks <Icon name="arrowRight" size={14} />
        </Link>
      </header>

      <ol className="leaderboard">
        {ranked.map((agent, index) => (
          <li key={agent.name} className={`leader leader-${index + 1}`}>
            <span className="leader-rank">{index + 1}</span>
            <span className="person-avatar" aria-hidden="true">
              {initials(agent.name)}
            </span>
            <span className="leader-name">
              <strong>{agent.name}</strong>
              <small>
                {agent.completed} of {agent.assigned} tasks done
              </small>
            </span>
            <span className="leader-meter">
              <span className="meter-track">
                <span
                  className={`meter-fill ${agent.rate >= 75 ? 'meter-fill-success' : ''}`}
                  style={{ width: `${agent.rate}%`, display: 'block', animationDelay: `${300 + index * 120}ms` }}
                />
              </span>
            </span>
            <span className="leader-rate">{agent.rate}%</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------- Page ---------- */

function Dashboard({ userName }: { userName?: string }) {
  const [season, setSeason] = useState('2026')
  const current = seasonData[season]

  const renewalRate =
    current.clientsDue > 0
      ? Math.round((current.clientsRenewed / current.clientsDue) * 100)
      : 0

  const monthlyTotal = current.monthly.reduce((sum, m) => sum + m.amount, 0)
  const peakMonth = current.monthly.reduce((best, m) => (m.amount > best.amount ? m : best), current.monthly[0])
  // First name for real people; full name for the generic demo accounts
  const firstWord = userName?.split(' ')[0]
  const firstName = !userName ? 'there' : firstWord === 'Demo' ? userName : firstWord

  // Sparkline of premium per season up to the selected one
  const trend = premiumPerSeason.filter((s) => s.year <= season)
  const trendMin = Math.min(...trend.map((s) => s.amount)) * 0.9
  const trendMax = Math.max(...trend.map((s) => s.amount))
  const trendPoints = trend.map((s, i) => {
    const px = trend.length > 1 ? (i / (trend.length - 1)) * 120 : 60
    const py = 34 - ((s.amount - trendMin) / (trendMax - trendMin || 1)) * 30
    return `${px.toFixed(1)},${py.toFixed(1)}`
  })
  const lastX = trendPoints[trendPoints.length - 1]?.split(',')[0] ?? '0'

  return (
    <div className="dashboard-page">
      {/* Hero band */}
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <small className="dash-hero-eyebrow">
            Sales Optimization &amp; Prescriptive Tasking
          </small>
          <h1>
            <SplitText
              tag="span"
              text={`${greeting()},`}
              splitType="chars"
              effect="rise"
              delay={30}
              duration={0.9}
              trigger="load"
              textAlign="left"
            />{' '}
            <em className="dash-hero-name">{firstName}.</em>
          </h1>
          <p className="dash-hero-insight">
            <Icon name="sparkle" size={15} />
            <span>
              <b>{renewalRate}%</b> of due clients have renewed in Season {season}.{' '}
              <b>{peakMonth.month}</b> carries{' '}
              <b>{Math.round((peakMonth.amount / monthlyTotal) * 100)}%</b> of the season's premium, and{' '}
              <b>{current.tasksOpen}</b> campaign task{current.tasksOpen === 1 ? ' is' : 's are'} still open.
            </span>
          </p>
          <div className="dash-hero-actions">
            <Magnet padding={50} magnetStrength={5} maxOffset={8}>
              <Link to="/manage/tasks" className="btn btn-gold">
                <Icon name="tasks" size={16} /> Review open tasks
              </Link>
            </Magnet>
            <Magnet padding={50} magnetStrength={5} maxOffset={8}>
              <Link to="/manage/forecast" className="btn btn-hero-ghost">
                Renewal forecast <Icon name="arrowRight" size={15} />
              </Link>
            </Magnet>
          </div>
        </div>

        <div className="dash-hero-side">
          <label htmlFor="season-select" className="dash-hero-label">
            Reporting season
          </label>
          <select
            id="season-select"
            className="control dash-hero-select"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            {Object.entries(seasonData).map(([year, info]) => (
              <option key={year} value={year}>
                {info.label}
              </option>
            ))}
          </select>
          <div className="dash-hero-mini">
            <span>
              <small>Closed today</small>
              <strong>{peso(current.closedToday)}</strong>
            </span>
            <span>
              <small>Tasks done</small>
              <strong>
                {current.tasksDone}/{current.tasksDone + current.tasksOpen}
              </strong>
            </span>
          </div>
        </div>
      </section>

      <p className="sample-banner">
        Figures shown are sample data for demonstration only.
      </p>

      {/* KPI Cards */}
      <section className="dashboard-kpis dashboard-kpis-grid">
        <GlareHover
          className="kpi-glare"
          width="100%"
          height="100%"
          borderRadius="var(--radius-lg)"
          glareColor="#f0cf6e"
          glareOpacity={0.3}
          glareSize={40}
          transitionDuration={900}
        >
        <div className="kpi-card kpi-card-featured">
          <BorderBeam size={90} duration={8} borderWidth={1.5} />
          <div className="kpi-card-top">
            <p>Season Premium</p>
            <span className="kpi-icon kpi-icon-gold">
              <Icon name="banknote" />
            </span>
          </div>
          <h2>
            <CountUp value={current.premium} format={peso} duration={1100} />
          </h2>
          <span
            className={`kpi-sub ${
              current.vsLastSeason.startsWith('+') ? 'kpi-sub-positive' : ''
            }`}
          >
            {current.vsLastSeason}
          </span>

          <svg
            className="kpi-sparkline"
            viewBox="-4 -4 128 44"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#e0b23a" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#e0b23a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,40 ${trendPoints.join(' ')} ${lastX},40`}
              fill="url(#spark-fill)"
            />
            <polyline
              key={season}
              className="kpi-sparkline-line"
              points={trendPoints.join(' ')}
              pathLength={1}
            />
          </svg>
        </div>
        </GlareHover>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Clients Renewed / Due</p>
            <span className="kpi-icon kpi-icon-success">
              <Icon name="refresh" />
            </span>
          </div>
          <h2>
            <CountUp value={current.clientsRenewed} />
            <span className="kpi-of"> / {current.clientsDue.toLocaleString('en-PH')}</span>
          </h2>
          <span className="kpi-sub">{renewalRate}% renewal rate</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Active Clients</p>
            <span className="kpi-icon">
              <Icon name="building" />
            </span>
          </div>
          <h2>
            <CountUp value={current.activeClients} />
          </h2>
          <span className="kpi-sub">Corporate accounts this season</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Tasks Done / Open</p>
            <span className="kpi-icon kpi-icon-neutral">
              <Icon name="clipboardCheck" />
            </span>
          </div>
          <h2>
            <CountUp value={current.tasksDone} />
            <span className="kpi-of"> / {current.tasksOpen}</span>
          </h2>
          <span className="kpi-sub">
            {current.tasksDone + current.tasksOpen} total campaign tasks
          </span>
        </div>
      </section>

      {/* Bento grid */}
      <div className="bento-grid">
        <RenewalRing renewed={current.clientsRenewed} due={current.clientsDue} />
        <PremiumTrend season={season} onSelect={setSeason} />
        {/* Below the fold: revealed as they scroll into view */}
        <AnimatedContent className="bento-slot bento-wide" distance={48} duration={0.9} threshold={0.15}>
          <MonthlyBars season={season} monthly={current.monthly} />
        </AnimatedContent>
        <AnimatedContent className="bento-slot" distance={48} duration={0.9} delay={0.08} threshold={0.15}>
          <SegmentDonut />
        </AnimatedContent>
        <AnimatedContent className="bento-slot bento-full" distance={48} duration={0.9} threshold={0.1}>
          <AgentLeaderboard />
        </AnimatedContent>
      </div>
    </div>
  )
}

export default Dashboard
