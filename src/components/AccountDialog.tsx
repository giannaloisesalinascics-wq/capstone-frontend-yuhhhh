import { useEffect, useState, type FormEvent } from 'react'
import Icon from './Icon'
import {
  createAccount,
  generatePassword,
  MIN_PASSWORD_LENGTH,
  passwordStrength,
  resetPassword,
  ROLE_INFO,
  suggestUsername,
  updateAccount,
  validateEmail,
  validatePassword,
  validateUsername,
  type PublicAccount,
  type UserRole,
} from '../accounts'
import { toast } from '../toast'
import './NewClientForm.css'
import './AccountDialog.css'

export type AccountDialogMode =
  | { kind: 'create'; role?: UserRole }
  | { kind: 'edit'; account: PublicAccount }
  | { kind: 'reset'; account: PublicAccount }

type Props = {
  mode: AccountDialogMode
  actingUsername?: string
  onClose: () => void
}

const ROLES: UserRole[] = ['AGENT', 'MANAGER', 'ADMIN']
const STRENGTH_LABELS = ['', 'Fair', 'Good', 'Strong']

type Created = { username: string; password: string; name: string; role: UserRole }

function AccountDialog({ mode, actingUsername, onClose }: Props) {
  const editing = mode.kind !== 'create' ? mode.account : null
  const showProfile = mode.kind !== 'reset'
  const showPassword = mode.kind !== 'edit'

  const [name, setName] = useState(editing?.name ?? '')
  const [username, setUsername] = useState(editing?.username ?? '')
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [email, setEmail] = useState(editing?.email ?? '')
  const [role, setRole] = useState<UserRole>(
    editing?.role ?? (mode.kind === 'create' ? mode.role : undefined) ?? 'AGENT',
  )
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [reveal, setReveal] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<Created | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const errors = {
    name: showProfile && !name.trim() ? 'Full name is required.' : null,
    username: mode.kind === 'create' ? validateUsername(username) : null,
    email: showProfile ? validateEmail(email) : null,
    password: showPassword ? validatePassword(password) : null,
    confirm: showPassword && confirm !== password ? 'Passwords don’t match.' : null,
  }
  const hasErrors = Object.values(errors).some(Boolean)
  const show = (field: keyof typeof errors, dirty: boolean) => (submitted || dirty ? errors[field] : null)

  function handleNameChange(value: string) {
    setName(value)
    if (mode.kind === 'create' && !usernameTouched) setUsername(suggestUsername(value))
  }

  function handleGenerate() {
    const next = generatePassword()
    setPassword(next)
    setConfirm(next)
    setReveal(true)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    setFormError('')
    if (hasErrors || saving) return

    setSaving(true)
    try {
      if (mode.kind === 'create') {
        const result = await createAccount({ username, name, email, role, password })
        if (!result.ok) return setFormError(result.error)
        toast('Account created', { description: `${name.trim()} can now sign in as ${ROLE_INFO[role].label}.` })
        setCreated({ username: result.account!.username, password, name: name.trim(), role })
      } else if (mode.kind === 'edit') {
        const result = updateAccount(mode.account.id, { name, email, role }, actingUsername)
        if (!result.ok) return setFormError(result.error)
        toast('Account updated', { description: `${name.trim()}’s details were saved.` })
        onClose()
      } else {
        const result = await resetPassword(mode.account.id, password)
        if (!result.ok) return setFormError(result.error)
        toast('Password reset', { description: `Share the new password with ${mode.account.name}.` })
        setCreated({ username: mode.account.username, password, name: mode.account.name, role: mode.account.role })
      }
    } finally {
      setSaving(false)
    }
  }

  async function copyCredentials() {
    if (!created) return
    const text = `Richgold RIA sign-in\nUsername: ${created.username}\nPassword: ${created.password}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      toast('Couldn’t copy automatically', { description: 'Select the credentials and copy them manually.', variant: 'warning' })
    }
  }

  const title =
    mode.kind === 'create' ? 'Create Account' : mode.kind === 'edit' ? 'Edit Account' : 'Reset Password'
  const subtitle =
    mode.kind === 'create'
      ? 'Set up sign-in access for a new agent, manager or administrator.'
      : mode.kind === 'edit'
        ? `Update details and role for @${mode.account.username}.`
        : `Set a new password for ${mode.account.name} (@${mode.account.username}).`

  const strength = passwordStrength(password)

  return (
    <div className="new-client-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="new-client-panel account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
        {created ? (
          <div className="account-done">
            <span className="account-done-icon" aria-hidden="true">
              <Icon name="checkCircle" size={28} />
            </span>
            <h2 id="account-dialog-title">
              {mode.kind === 'create' ? 'Account ready' : 'Password updated'}
            </h2>
            <p>
              Share these credentials with <strong>{created.name}</strong>. The password won’t be shown again.
            </p>

            <dl className="account-credentials">
              <div>
                <dt>Username</dt>
                <dd className="cell-mono">{created.username}</dd>
              </div>
              <div>
                <dt>Password</dt>
                <dd className="cell-mono">{created.password}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{ROLE_INFO[created.role].label}</dd>
              </div>
            </dl>

            <div className="new-client-actions">
              <button type="button" className="btn btn-secondary" onClick={copyCredentials}>
                <Icon name={copied ? 'check' : 'clipboardCheck'} size={16} />
                {copied ? 'Copied' : 'Copy credentials'}
              </button>
              <button type="button" className="btn btn-primary" onClick={onClose} autoFocus>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="account-dialog-title">{title}</h2>
            <p>{subtitle}</p>

            <form onSubmit={handleSubmit} noValidate>
              {showProfile && (
                <>
                  <label htmlFor="acct-name">Full name *</label>
                  <input
                    id="acct-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    aria-invalid={Boolean(show('name', false))}
                    autoComplete="off"
                    autoFocus
                  />
                  {show('name', false) && <p className="account-error">{errors.name}</p>}

                  <label htmlFor="acct-username">Username *</label>
                  <input
                    id="acct-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase())
                      setUsernameTouched(true)
                    }}
                    disabled={mode.kind !== 'create'}
                    aria-invalid={Boolean(show('username', usernameTouched))}
                    aria-describedby="acct-username-hint"
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {show('username', usernameTouched) ? (
                    <p className="account-error">{errors.username}</p>
                  ) : (
                    <p id="acct-username-hint" className="account-hint">
                      {mode.kind === 'create'
                        ? 'Suggested from the name. 3–20 lowercase letters, numbers, dots or underscores.'
                        : 'Usernames can’t be changed.'}
                    </p>
                  )}

                  <label htmlFor="acct-email">Email (optional)</label>
                  <input
                    id="acct-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(show('email', false))}
                    autoComplete="off"
                  />
                  {show('email', false) && <p className="account-error">{errors.email}</p>}

                  <fieldset className="account-roles">
                    <legend>Role *</legend>
                    {ROLES.map((r) => (
                      <label key={r} className={`account-role ${role === r ? 'is-selected' : ''}`}>
                        <input
                          type="radio"
                          name="acct-role"
                          value={r}
                          checked={role === r}
                          onChange={() => setRole(r)}
                        />
                        <span>
                          <strong>{ROLE_INFO[r].label}</strong>
                          <small>{ROLE_INFO[r].access}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                </>
              )}

              {showPassword && (
                <>
                  <div className="account-label-row">
                    <label htmlFor="acct-password">{mode.kind === 'reset' ? 'New password *' : 'Password *'}</label>
                    <button type="button" className="account-link" onClick={handleGenerate}>
                      <Icon name="refresh" size={14} />
                      Generate
                    </button>
                  </div>
                  <div className="account-password">
                    <input
                      id="acct-password"
                      type={reveal ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={Boolean(show('password', false))}
                      autoComplete="new-password"
                      autoFocus={mode.kind === 'reset'}
                    />
                    <button
                      type="button"
                      className="account-reveal"
                      onClick={() => setReveal((v) => !v)}
                      aria-label={reveal ? 'Hide password' : 'Show password'}
                    >
                      {reveal ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="account-strength" data-level={strength} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <em>{STRENGTH_LABELS[strength]}</em>
                  </div>
                  {show('password', false) ? (
                    <p className="account-error">{errors.password}</p>
                  ) : (
                    <p className="account-hint">
                      At least {MIN_PASSWORD_LENGTH} characters with a letter and a number.
                    </p>
                  )}

                  <label htmlFor="acct-confirm">Confirm password *</label>
                  <input
                    id="acct-confirm"
                    type={reveal ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={Boolean(show('confirm', confirm.length > 0))}
                    autoComplete="new-password"
                  />
                  {show('confirm', confirm.length > 0) && <p className="account-error">{errors.confirm}</p>}
                </>
              )}

              {formError && (
                <p role="alert" className="alert alert-danger account-form-error">
                  <Icon name="alert" size={16} />
                  {formError}
                </p>
              )}

              <div className="new-client-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {mode.kind === 'create' && <Icon name="plus" size={16} />}
                  {mode.kind === 'create' ? 'Create Account' : mode.kind === 'edit' ? 'Save Changes' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default AccountDialog
