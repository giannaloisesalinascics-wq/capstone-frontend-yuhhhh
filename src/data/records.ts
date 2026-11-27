import { useSyncExternalStore } from 'react'

// Shared client and transaction records. Transaction Entry writes here,
// My Entries edits what the signed-in user encoded, and Clients reads both.
// Saved in localStorage until the PostgreSQL backend is connected.

export type PaymentStatus = 'PAID' | 'UNPAID' | 'CANCELLED' | 'UNKNOWN'
export type InsuranceType = '' | 'BUILDING' | 'CGL'

export type Client = {
  id: number
  name: string
  branch?: string
  sector: string
  contactPerson?: string
  phone?: string
  // Sample model output; null means the client has no score yet (cold start)
  pLapse: number | null
}

export type Transaction = {
  id: number
  clientId: number
  txnDate: string
  premium: number
  paymentStatus: PaymentStatus
  paidDate?: string
  primaryAgent: string
  assistAgent?: string
  policyNumber?: string
  insuranceType?: InsuranceType
  effectiveDate?: string
  expirationDate?: string
  logbookPage?: string
  encodedBy: string
  createdAt: string
}

export const SECTORS = [
  'Real estate / property',
  'Food & hospitality',
  'Health & wellness',
  'Finance & holdings',
  'Trading & retail',
  'Construction & industrial',
  'Services & professional',
  'Other',
]

// ---------- Tiny persisted store ----------

function createStore<T>(key: string, seed: T[]) {
  const listeners = new Set<() => void>()

  function load(): T[] {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed as T[]
      }
    } catch {
      // Corrupt or unavailable storage falls back to the seed data
    }
    return seed
  }

  let items = load()

  window.addEventListener('storage', (event) => {
    if (event.key === key) {
      items = load()
      listeners.forEach((l) => l())
    }
  })

  return {
    get: () => items,
    set(next: T[]) {
      items = next
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Storage unavailable (private mode); changes last for this session
      }
      listeners.forEach((l) => l())
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

// ---------- Seed data ----------

const seedClients: Client[] = [
  { id: 1, name: 'ABC Properties Inc.', branch: 'Greenbelt 5 BR', sector: 'Real estate / property', contactPerson: 'Elena Mendoza', phone: '0917-555-0142', pLapse: 0.85 },
  { id: 2, name: 'Golden Harvest Foods', branch: 'Makati Main', sector: 'Food & hospitality', contactPerson: 'Ramon Villanueva', phone: '0918-555-0198', pLapse: 0.76 },
  { id: 3, name: 'Summit Trading Inc.', sector: 'Trading & retail', pLapse: 0.62 },
  { id: 4, name: 'Blue Ocean Retail', branch: 'Salcedo Village', sector: 'Trading & retail', pLapse: 0.38 },
  { id: 5, name: 'Metro Realty Corp.', branch: 'Ayala Ave', sector: 'Real estate / property', contactPerson: 'Liza Tan', phone: '0917-555-0881', pLapse: 0.22 },
]

const SEED_CREATED = '2026-11-01T08:00:00.000Z'
const seedTransactions: Transaction[] = [
  // Current season, encoded by the demo manager (shows in their My Entries)
  { id: 1, clientId: 1, txnDate: '2026-01-14', premium: 8500, paymentStatus: 'PAID', primaryAgent: 'Maria Santos', logbookPage: 'p. 42', insuranceType: 'CGL', encodedBy: 'manager', createdAt: SEED_CREATED },
  { id: 2, clientId: 2, txnDate: '2026-01-18', premium: 3198, paymentStatus: 'UNPAID', primaryAgent: 'Carlo Reyes', logbookPage: 'p. 55', insuranceType: 'CGL', encodedBy: 'manager', createdAt: SEED_CREATED },
  { id: 3, clientId: 3, txnDate: '2026-01-09', premium: 2244, paymentStatus: 'UNPAID', primaryAgent: 'Angela Cruz', logbookPage: 'p. 27', insuranceType: 'BUILDING', encodedBy: 'manager', createdAt: SEED_CREATED },
  { id: 4, clientId: 4, txnDate: '2026-01-22', premium: 1122, paymentStatus: 'PAID', primaryAgent: 'Carlo Reyes', logbookPage: 'p. 63', insuranceType: 'CGL', encodedBy: 'manager', createdAt: SEED_CREATED },
  { id: 5, clientId: 5, txnDate: '2026-01-05', premium: 5600, paymentStatus: 'PAID', primaryAgent: 'Carlo Reyes', logbookPage: 'p. 11', insuranceType: 'BUILDING', encodedBy: 'manager', createdAt: SEED_CREATED },
  // Previous season, digitized by the administrator
  { id: 6, clientId: 1, txnDate: '2025-01-12', premium: 8500, paymentStatus: 'PAID', primaryAgent: 'Carlo Reyes', logbookPage: 'p. 19', insuranceType: 'CGL', encodedBy: 'admin', createdAt: SEED_CREATED },
  { id: 7, clientId: 2, txnDate: '2025-01-20', premium: 3198, paymentStatus: 'PAID', primaryAgent: 'Angela Cruz', logbookPage: 'p. 31', insuranceType: 'CGL', encodedBy: 'admin', createdAt: SEED_CREATED },
  { id: 8, clientId: 5, txnDate: '2025-01-07', premium: 5600, paymentStatus: 'PAID', primaryAgent: 'Carlo Reyes', logbookPage: 'p. 08', insuranceType: 'BUILDING', encodedBy: 'admin', createdAt: SEED_CREATED },
]

const clientStore = createStore<Client>('ria-clients', seedClients)
const txnStore = createStore<Transaction>('ria-transactions', seedTransactions)

export function useClients() {
  return useSyncExternalStore(clientStore.subscribe, clientStore.get, clientStore.get)
}

export function useTransactions() {
  return useSyncExternalStore(txnStore.subscribe, txnStore.get, txnStore.get)
}

// ---------- Helpers ----------

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()
const nextId = (list: { id: number }[]) => Math.max(0, ...list.map((x) => x.id)) + 1

export function clientLabel(client: { name: string; branch?: string }) {
  return client.branch ? `${client.name} — ${client.branch}` : client.name
}

export function findClientByLabel(label: string) {
  return clientStore.get().find((c) => normalize(clientLabel(c)) === normalize(label))
}

// Renewal seasons run Nov–Feb and are named after the year they end in
export function seasonOf(date: string) {
  const [year, month] = date.split('-').map(Number)
  return month >= 11 ? year + 1 : year
}

export function clientStats(clientId: number, txns: Transaction[]) {
  const own = txns
    .filter((t) => t.clientId === clientId && t.paymentStatus !== 'CANCELLED')
    .sort((a, b) => b.txnDate.localeCompare(a.txnDate))
  return {
    seasons: new Set(own.map((t) => seasonOf(t.txnDate))).size,
    lastPremium: own[0]?.premium ?? null,
    lastTxnDate: own[0]?.txnDate ?? null,
  }
}

// ---------- Mutations ----------

type Result<T> = { ok: true; value: T } | { ok: false; error: string }

export function addClient(input: { name: string; branch?: string; sector?: string }): Result<Client> {
  const name = input.name.trim().replace(/\s+/g, ' ')
  const branch = input.branch?.trim() || undefined
  if (!name) return { ok: false, error: 'Business name is required.' }

  const duplicate = clientStore
    .get()
    .some((c) => normalize(c.name) === normalize(name) && normalize(c.branch ?? '') === normalize(branch ?? ''))
  if (duplicate) {
    return { ok: false, error: 'This client and branch already exist. Please select the existing client.' }
  }

  const client: Client = {
    id: nextId(clientStore.get()),
    name,
    branch,
    sector: input.sector || 'Other',
    pLapse: null,
  }
  clientStore.set([...clientStore.get(), client])
  return { ok: true, value: client }
}

export function addTransaction(input: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const txn: Transaction = { ...input, id: nextId(txnStore.get()), createdAt: new Date().toISOString() }
  txnStore.set([...txnStore.get(), txn])
  return txn
}

export function updateTransaction(
  id: number,
  changes: Partial<Pick<Transaction, 'premium' | 'paymentStatus' | 'logbookPage'>>,
) {
  txnStore.set(txnStore.get().map((t) => (t.id === id ? { ...t, ...changes } : t)))
}
