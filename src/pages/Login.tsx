import { useEffect, useRef, useState, type FormEvent } from 'react'
import Icon from '../components/Icon'
import GoldUniverse, {
  type UniversePhase,
} from '../components/ui/GoldUniverse'
import Magnet from '../components/reactbits/Magnet'
import {
  authenticate,
  DEMO_PASSWORD,
  DEMO_USERNAMES,
  type SessionUser,
  type UserRole as AccountRole,
} from '../accounts'
import './Login.css'

export type UserRole = AccountRole
export type DemoUser = SessionUser

type LoginProps = {
  onLogin: (user: DemoUser) => void
}

const WORDMARK = 'Richgold'
const LAUNCH_MS = 1450

function Login({ onLogin }: LoginProps) {
  const [phase, setPhase] = useState<UniversePhase>('idle')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [errorCount, setErrorCount] = useState(0)
  const [checking, setChecking] = useState(false)

  const openButtonRef = useRef<HTMLButtonElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const hasOpenedRef = useRef(false)
  const launchTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(launchTimerRef.current), [])

  // Move focus with the scene, and let Escape back out of the form
  useEffect(() => {
    if (phase === 'form') {
      hasOpenedRef.current = true
      usernameRef.current?.focus({ preventScroll: true })

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setPhase('idle')
      }
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    }
    if (phase === 'idle' && hasOpenedRef.current) {
      openButtonRef.current?.focus({ preventScroll: true })
    }
  }, [phase])

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (phase !== 'form' || checking) return

    setChecking(true)
    const result = await authenticate(username, password)
    setChecking(false)

    if (!result.ok) {
      setMessage(result.error)
      setErrorCount((count) => count + 1)
      return
    }

    const user = result.user

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onLogin(user)
      return
    }

    setPhase('launch')
    launchTimerRef.current = window.setTimeout(() => onLogin(user), LAUNCH_MS)
  }

  return (
    <main className="login-page" data-phase={phase}>
      <div className="login-glow" aria-hidden="true" />
      <GoldUniverse phase={phase} errorCount={errorCount} />

      <section className="login-intro" inert={phase !== 'idle'}>
        <p className="login-agency">Insurance Agency</p>
        <h1 className="login-wordmark" aria-label={WORDMARK}>
          {[...WORDMARK].map((letter, index) => (
            <span
              key={index}
              aria-hidden="true"
              style={{ animationDelay: `${700 + index * 75}ms` }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <p className="login-tagline">RIA Management System</p>

        <div className="login-enter">
          <Magnet padding={60} magnetStrength={5} maxOffset={14}>
            <button
              ref={openButtonRef}
              type="button"
              className="login-gold-btn"
              onClick={() => setPhase('form')}
            >
              <span>Login</span>
              <Icon name="arrowRight" size={18} />
            </button>
          </Magnet>
        </div>
      </section>

      <section
        className="login-portal"
        aria-labelledby="login-title"
        inert={phase !== 'form'}
      >
        <div
          className="login-panel"
          data-shake={errorCount ? (errorCount % 2 ? 'a' : 'b') : undefined}
        >
          <button
            type="button"
            className="login-back"
            onClick={() => setPhase('idle')}
            aria-label="Close login form"
          >
            <Icon name="x" size={18} />
          </button>

          <h2 id="login-title" className="login-title">
            Welcome back
          </h2>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input">
                <Icon name="user" size={18} />
                <input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setMessage('')
                  }}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={Boolean(message)}
                  aria-describedby={message ? 'login-error' : undefined}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input">
                <Icon name="lock" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setMessage('')
                  }}
                  autoComplete="current-password"
                  aria-invalid={Boolean(message)}
                  aria-describedby={message ? 'login-error' : undefined}
                  required
                />
                <button
                  type="button"
                  className="login-reveal"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {message && (
              <p id="login-error" role="alert" className="login-error">
                <Icon name="alert" size={16} />
                {message}
              </p>
            )}

            <button type="submit" className="login-gold-btn login-submit">
              <span>{phase === 'launch' || checking ? 'Logging in…' : 'Login'}</span>
              <Icon name="arrowRight" size={18} />
            </button>
          </form>

          <div className="login-demo">
            <p>
              Demo accounts, password <code>{DEMO_PASSWORD}</code>
            </p>
            <div className="login-demo-chips">
              {DEMO_USERNAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setUsername(name)
                    setPassword(DEMO_PASSWORD)
                    setMessage('')
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <p className="login-legal">
        © {new Date().getFullYear()} Richgold Insurance Agency
      </p>
      <div className="login-flash" aria-hidden="true" />
    </main>
  )
}

export default Login
