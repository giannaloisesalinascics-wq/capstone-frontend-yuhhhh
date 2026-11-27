import { useSyncExternalStore } from 'react'

// Local account store. Until the backend exists, accounts live in
// localStorage so admin-created users can actually sign in on this browser.
// Real authentication must move server-side; this is demo-grade only.

export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT'

export type Account = {
  id: number
  username: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  salt: string
  passwordHash: string
  createdAt: string
  lastLoginAt: string | null
}

export type PublicAccount = Omit<Account, 'salt' | 'passwordHash'>

export type SessionUser = {
  username: string
  name: string
  role: UserRole
}

export const ROLE_INFO: Record<UserRole, { label: string; access: string }> = {
  AGENT: {
    label: 'Agent',
    access: "Sees only their own daily task list and logs call outcomes.",
  },
  MANAGER: {
    label: 'Manager',
    access: 'Analytics, forecasts, all clients and tasks, plus transaction entry.',
  },
  ADMIN: {
    label: 'Administrator',
    access: 'Everything a manager can do, plus accounts, agents, models and backups.',
  },
}

export const DEMO_PASSWORD = 'demo123'
export const MIN_PASSWORD_LENGTH = 8
const USERNAME_PATTERN = /^[a-z0-9._]{3,20}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STORAGE_KEY = 'ria-accounts'
// SHA-256 of "seed:demo123"
const SEED_HASH = '21ca2b94b355a8648c861703c56deb583294d82d8fa3b57be70f4be7b7fd41a8'
const SEED_DATE = '2026-11-01T08:00:00.000Z'

const seedAccounts: Account[] = [
  { id: 1, username: 'admin', name: 'Demo Administrator', role: 'ADMIN' },
  { id: 2, username: 'manager', name: 'Demo Manager', role: 'MANAGER' },
  { id: 3, username: 'agent', name: 'Demo Agent', role: 'AGENT' },
  // Field agents referenced by the sample tasks, clients and entries
  { id: 4, username: 'msantos', name: 'Maria Santos', role: 'AGENT' },
  { id: 5, username: 'creyes', name: 'Carlo Reyes', role: 'AGENT' },
  { id: 6, username: 'acruz', name: 'Angela Cruz', role: 'AGENT' },
].map((a) => ({
  ...a,
  role: a.role as UserRole,
  email: '',
  isActive: true,
  salt: 'seed',
  passwordHash: SEED_HASH,
  createdAt: SEED_DATE,
  lastLoginAt: null,
}))

// Shown as quick-fill chips on the login screen
export const DEMO_USERNAMES = ['admin', 'manager', 'agent']

const listeners = new Set<() => void>()

function load(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Add any seed accounts introduced after this browser first saved
        const saved = parsed as Account[]
        let nextId = Math.max(0, ...saved.map((a) => a.id)) + 1
        const missing = seedAccounts
          .filter((seed) => !saved.some((a) => a.username === seed.username))
          .map((seed) => ({ ...seed, id: nextId++ }))
        return [...saved, ...missing]
      }
    }
  } catch {
    // Corrupt or unavailable storage falls back to the seed accounts
  }
  return seedAccounts
}

let accounts: Account[] = load()
let publicView: PublicAccount[] = toPublic(accounts)
let agentView: PublicAccount[] = publicView.filter((a) => a.role === 'AGENT')

function toPublic(list: Account[]): PublicAccount[] {
  return list.map((a) => ({
    id: a.id,
    username: a.username,
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive,
    createdAt: a.createdAt,
    lastLoginAt: a.lastLoginAt,
  }))
}

function commit(next: Account[]) {
  accounts = next
  publicView = toPublic(next)
  agentView = publicView.filter((a) => a.role === 'AGENT')
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable (private mode); changes last for this session
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAccounts() {
  return useSyncExternalStore(subscribe, () => publicView, () => publicView)
}

// Every agent account (active and inactive): the single agent roster used
// by Agents admin, task availability and transaction entry
export function useAgents() {
  return useSyncExternalStore(subscribe, () => agentView, () => agentView)
}

// Keep tabs in sync when another tab changes the accounts
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    accounts = load()
    publicView = toPublic(accounts)
    agentView = publicView.filter((a) => a.role === 'AGENT')
    listeners.forEach((listener) => listener())
  }
})

async function hashPassword(salt: string, password: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function newSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ---------- Validation ----------

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function validateUsername(value: string, ignoreId?: number): string | null {
  const username = normalizeUsername(value)
  if (!username) return 'Username is required.'
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use 3–20 lowercase letters, numbers, dots or underscores.'
  }
  if (accounts.some((a) => a.username === username && a.id !== ignoreId)) {
    return `“${username}” is already taken.`
  }
  return null
}

export function validateEmail(value: string): string | null {
  const email = value.trim()
  if (!email) return null
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  return null
}

export function validatePassword(value: string): string | null {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Include at least one letter and one number.'
  }
  return null
}

export function passwordStrength(value: string): 0 | 1 | 2 | 3 {
  if (!value) return 0
  let score = 0
  if (value.length >= MIN_PASSWORD_LENGTH) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value)) score++
  return Math.min(score, 3) as 0 | 1 | 2 | 3
}

// Suggest a username like "msantos" from "Maria Santos"
export function suggestUsername(fullName: string) {
  const parts = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return ''
  const base = (parts.length === 1 ? parts[0] : parts[0][0] + parts[parts.length - 1]).slice(0, 18)
  let candidate = base
  let n = 2
  while (accounts.some((a) => a.username === candidate)) candidate = `${base}${n++}`
  return candidate
}

export function generatePassword() {
  // No look-alike characters (0/O, 1/l/I)
  const sets = ['abcdefghjkmnpqrstuvwxyz', 'ABCDEFGHJKMNPQRSTUVWXYZ', '23456789', '!@#$%&*?']
  const all = sets.join('')
  const pick = (chars: string) => chars[crypto.getRandomValues(new Uint32Array(1))[0] % chars.length]
  const chars = [...sets.map(pick), ...Array.from({ length: 8 }, () => pick(all))]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

function activeAdminCount(excludeId?: number) {
  return accounts.filter((a) => a.role === 'ADMIN' && a.isActive && a.id !== excludeId).length
}

// ---------- Mutations ----------

type Result = { ok: true } | { ok: false; error: string }

export async function createAccount(input: {
  username: string
  name: string
  email: string
  role: UserRole
  password: string
}): Promise<Result & { account?: PublicAccount }> {
  const error =
    (input.name.trim() ? null : 'Full name is required.') ??
    validateUsername(input.username) ??
    validateEmail(input.email) ??
    validatePassword(input.password)
  if (error) return { ok: false, error }

  const salt = newSalt()
  const account: Account = {
    id: Math.max(0, ...accounts.map((a) => a.id)) + 1,
    username: normalizeUsername(input.username),
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    isActive: true,
    salt,
    passwordHash: await hashPassword(salt, input.password),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  }
  commit([...accounts, account])
  return { ok: true, account: toPublic([account])[0] }
}

export function updateAccount(
  id: number,
  changes: { name: string; email: string; role: UserRole },
  actingUsername?: string,
): Result {
  const target = accounts.find((a) => a.id === id)
  if (!target) return { ok: false, error: 'Account not found.' }
  if (!changes.name.trim()) return { ok: false, error: 'Full name is required.' }
  const emailError = validateEmail(changes.email)
  if (emailError) return { ok: false, error: emailError }

  if (target.role === 'ADMIN' && changes.role !== 'ADMIN') {
    if (target.username === actingUsername) {
      return { ok: false, error: 'You can’t remove your own administrator role.' }
    }
    if (target.isActive && activeAdminCount(id) === 0) {
      return { ok: false, error: 'At least one active administrator is required.' }
    }
  }

  commit(
    accounts.map((a) =>
      a.id === id ? { ...a, name: changes.name.trim(), email: changes.email.trim(), role: changes.role } : a,
    ),
  )
  return { ok: true }
}

export function setAccountActive(id: number, isActive: boolean, actingUsername?: string): Result {
  const target = accounts.find((a) => a.id === id)
  if (!target) return { ok: false, error: 'Account not found.' }
  if (!isActive) {
    if (target.username === actingUsername) {
      return { ok: false, error: 'You can’t deactivate your own account.' }
    }
    if (target.role === 'ADMIN' && activeAdminCount(id) === 0) {
      return { ok: false, error: 'At least one active administrator is required.' }
    }
  }
  commit(accounts.map((a) => (a.id === id ? { ...a, isActive } : a)))
  return { ok: true }
}

export async function resetPassword(id: number, password: string): Promise<Result> {
  const error = validatePassword(password)
  if (error) return { ok: false, error }
  const salt = newSalt()
  const passwordHash = await hashPassword(salt, password)
  commit(accounts.map((a) => (a.id === id ? { ...a, salt, passwordHash } : a)))
  return { ok: true }
}

// ---------- Sign in ----------

export async function authenticate(
  usernameInput: string,
  password: string,
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const username = normalizeUsername(usernameInput)
  const account = accounts.find((a) => a.username === username)
  const invalid = { ok: false as const, error: 'Invalid username or password.' }
  if (!account) return invalid

  const hash = await hashPassword(account.salt, password)
  if (hash !== account.passwordHash) return invalid
  if (!account.isActive) {
    return { ok: false, error: 'This account is deactivated. Contact an administrator.' }
  }

  commit(accounts.map((a) => (a.id === account.id ? { ...a, lastLoginAt: new Date().toISOString() } : a)))
  return { ok: true, user: { username: account.username, name: account.name, role: account.role } }
}
