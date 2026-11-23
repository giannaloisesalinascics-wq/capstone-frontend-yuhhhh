
import { useState, type FormEvent } from 'react'
import Icon from '../components/Icon'
import FloatingPaths from '../components/ui/FloatingPaths'
import BorderBeam from '../components/ui/BorderBeam'
import SplitText from '../components/reactbits/SplitText'
import Magnet from '../components/reactbits/Magnet'
import GlareHover from '../components/reactbits/GlareHover'
import './Login.css'

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'AGENT'
  | 'ENCODER'

export type DemoUser = {
  username: string
  name: string
  role: UserRole
}

type LoginProps = {
  onLogin: (user: DemoUser) => void
}

const demoAccounts: Record<
  string,
  { name: string; role: UserRole }
> = {
  admin: { name: 'Demo Administrator', role: 'ADMIN' },
  manager: { name: 'Demo Manager', role: 'MANAGER' },
  agent: { name: 'Demo Agent', role: 'AGENT' },
  encoder: { name: 'Demo Encoder', role: 'ENCODER' },
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const normalizedUsername = username.trim().toLowerCase()
    const account = demoAccounts[normalizedUsername]

    if (!account || password !== 'demo123') {
      setMessage('Invalid demo username or password.')
      return
    }

    onLogin({
      username: normalizedUsername,
      name: account.name,
      role: account.role,
    })
  }

  return (
    <main className="login-page">
      {/* Brand panel */}
      <section className="login-hero" aria-hidden="true">
        <span className="login-orb login-orb-gold" />
        <span className="login-orb login-orb-blue" />
        <FloatingPaths position={-1} className="login-paths" />

        <div className="login-hero-inner">
          <div className="login-hero-brand">
            <span className="brand-logo">R</span>
            <span>
              <strong>Richgold</strong>
              <small>Insurance Agency</small>
            </span>
          </div>

          <div className="login-hero-copy">
            <p className="login-eyebrow">
              <span className="login-eyebrow-dot" />
              RIA Management System
            </p>
            <h1>
              Renewals, clients and agents, <em>in one place.</em>
            </h1>
            <p>
              Sales optimization and prescriptive tasking for the
              corporate renewal season.
            </p>
          </div>

          {/* Product preview */}
          <div className="login-preview">
            <GlareHover
              className="login-preview-glare"
              width="100%"
              borderRadius="18px"
              glareColor="#f0cf6e"
              glareOpacity={0.35}
              glareSize={35}
              transitionDuration={900}
            >
            <div className="login-preview-card">
              <BorderBeam size={120} duration={9} borderWidth={1.5} />
              <div className="login-preview-head">
                <span>
                  <small>Season 2026</small>
                  <strong>Renewal progress</strong>
                </span>
                <span className="login-preview-ring">
                  <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" className="ring-track" />
                    <circle cx="18" cy="18" r="15.5" className="ring-fill" />
                  </svg>
                  <b>76%</b>
                </span>
              </div>

              <div className="login-preview-bars">
                {[34, 52, 44, 61, 78, 100].map((height, index) => (
                  <i
                    key={index}
                    style={{
                      height: `${height}%`,
                      animationDelay: `${300 + index * 70}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="login-preview-task">
                <span className="login-preview-task-tag">P1</span>
                <span>
                  <strong>ABC Properties Inc.</strong>
                  <small>At-risk retention · window closes in 9 days</small>
                </span>
              </div>
            </div>
            </GlareHover>

            <div className="login-preview-float">
              <Icon name="trending" size={16} />
              <span>
                <strong>+18.5%</strong>
                <small>vs last season</small>
              </span>
            </div>
          </div>

          <ul className="login-features">
            <li>
              <Icon name="trending" size={18} />
              Renewal forecasting & lapse-risk scoring
            </li>
            <li>
              <Icon name="tasks" size={18} />
              Prioritized daily tasks for every agent
            </li>
            <li>
              <Icon name="pie" size={18} />
              Client segmentation & season analytics
            </li>
          </ul>

          <p className="login-hero-footer">
            On-premise deployment · Data stays on the agency's server
          </p>
        </div>
      </section>

      {/* Sign-in form */}
      <section className="login-form-column">
        <div className="login-card">
          <div className="login-mobile-brand">
            <span className="brand-logo">R</span>
            <strong>Richgold Insurance Agency</strong>
          </div>

          <SplitText
            tag="h2"
            text="Welcome back"
            splitType="chars"
            effect="rise"
            delay={40}
            duration={0.9}
            trigger="load"
            textAlign="left"
          />
          <p className="login-subtitle">
            Sign in to access the RIA Management System.
          </p>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="username" className="field-label">
                Username
              </label>
              <div className="login-input">
                <Icon name="user" size={18} />
                <input
                  id="username"
                  type="text"
                  className="control"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setMessage('')
                  }}
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="login-input">
                <Icon name="lock" size={18} />
                <input
                  id="password"
                  type="password"
                  className="control"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setMessage('')
                  }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {message && (
              <p role="alert" className="alert alert-danger">
                <Icon name="alert" size={16} />
                {message}
              </p>
            )}

            <Magnet
              padding={40}
              magnetStrength={8}
              maxOffset={6}
              wrapperClassName="login-magnet"
              style={{ display: 'block' }}
            >
              <button type="submit" className="btn btn-primary btn-lg btn-block">
                Sign in
                <Icon name="arrowRight" size={16} className="login-submit-arrow" />
              </button>
            </Magnet>
          </form>

          <div className="login-demo">
            <div className="login-demo-header">
              <Icon name="info" size={16} />
              <strong>Demo mode</strong>
            </div>
            <dl>
              <div>
                <dt>Users</dt>
                <dd>
                  {Object.keys(demoAccounts).map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="login-demo-chip"
                      onClick={() => {
                        setUsername(name)
                        setPassword('demo123')
                        setMessage('')
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Password</dt>
                <dd>
                  <code>demo123</code>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="login-legal">
          © {new Date().getFullYear()} Richgold Insurance Agency
        </p>
      </section>
    </main>
  )
}

export default Login
