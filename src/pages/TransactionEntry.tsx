import { useState, type FormEvent } from 'react'
import NewClientForm from '../components/NewClientForm'
import { toast } from '../toast'
import { peso } from '../format'
import Icon from '../components/Icon'
import { useAgents } from '../accounts'
import {
  addClient,
  addTransaction,
  clientLabel,
  findClientByLabel,
  useClients,
  type InsuranceType,
  type PaymentStatus,
} from '../data/records'
import './Dashboard.css'
import './TransactionEntry.css'

const today = () => new Date().toLocaleDateString('en-CA')

// Expiration is one year after the effective date (clamped for Feb 29 etc.)
function oneYearAfter(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const lastDay = new Date(year + 1, month, 0).getDate()
  return `${year + 1}-${String(month).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`
}

const emptyForm = {
  clientName: '',
  policyNumber: '',
  insuranceType: '' as InsuranceType,
  effectiveDate: '',
  expirationDate: '',
  premium: '',
  txnDate: '',
  paymentStatus: 'UNKNOWN' as PaymentStatus,
  paidDate: '',
  primaryAgent: '',
  assistAgent: '',
  logbookPage: '',
}

function TransactionEntry({ currentUsername }: { currentUsername?: string }) {
  const clients = useClients()
  // Active agent accounts are the selectable agents
  const agents = useAgents().filter((a) => a.isActive)

  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [showNewClientForm, setShowNewClientForm] = useState(false)

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setMessage('')
  }

  const matchedClient = findClientByLabel(form.clientName)
  const isAgent = (name: string) => agents.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())

  function handleEffectiveDateChange(value: string) {
    setForm((prev) => ({ ...prev, effectiveDate: value, expirationDate: value ? oneYearAfter(value) : '' }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')

    if (!matchedClient) return setMessage('Please select an existing client from the suggestions.')
    if (!isAgent(form.primaryAgent)) return setMessage('Please select an existing primary agent.')
    if (form.assistAgent.trim()) {
      if (!isAgent(form.assistAgent)) return setMessage('Please select an existing assist agent or leave it blank.')
      if (form.assistAgent.trim().toLowerCase() === form.primaryAgent.trim().toLowerCase()) {
        return setMessage('Assist agent cannot be the same as the primary agent.')
      }
    }

    const premium = Number(form.premium)
    if (premium > 50000 && !window.confirm('The premium exceeds ₱50,000. Do you want to continue?')) return

    const primary = agents.find((a) => a.name.toLowerCase() === form.primaryAgent.trim().toLowerCase())!
    const assist = agents.find((a) => a.name.toLowerCase() === form.assistAgent.trim().toLowerCase())

    addTransaction({
      clientId: matchedClient.id,
      txnDate: form.txnDate,
      premium,
      paymentStatus: form.paymentStatus,
      paidDate: form.paidDate || undefined,
      primaryAgent: primary.name,
      assistAgent: assist?.name,
      policyNumber: form.policyNumber.trim() || undefined,
      insuranceType: form.insuranceType,
      effectiveDate: form.effectiveDate || undefined,
      expirationDate: form.expirationDate || undefined,
      logbookPage: form.logbookPage.trim() || undefined,
      encodedBy: currentUsername ?? 'unknown',
    })

    toast('Transaction saved', {
      description: `${matchedClient.name} · ${peso(premium)} · now in My Entries and the client's history`,
    })
    setForm(emptyForm)
  }

  return (
    <div className="transaction-page">

      {/* Page Header */}
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>
          <h1>Transaction Entry</h1>
          <p>Enter and save insurance policy transaction records.</p>
        </div>
      </header>

      <p className="sample-banner">
        Transactions are saved in this browser until the backend is connected.
      </p>

      <form onSubmit={handleSubmit} className="transaction-form">

        {/* SECTION 1: CLIENT AND POLICY */}
        <section className="transaction-section">
          <h2>
            <span className="section-step">01</span>
            Client and Policy Information
          </h2>

          <label htmlFor="client">Corporate Client *</label>
          <input
            id="client"
            type="text"
            list="client-suggestions"
            placeholder="Search existing client..."
            value={form.clientName}
            onChange={(e) => set('clientName', e.target.value)}
            required
          />
          <datalist id="client-suggestions">
            {clients.map((client) => (
              <option key={client.id} value={clientLabel(client)} />
            ))}
          </datalist>

          <button
            type="button"
            className="new-client-trigger"
            onClick={() => setShowNewClientForm(true)}
          >
            <Icon name="plus" size={14} />
            Register New Client
          </button>

          <label htmlFor="client-sector">Industry Sector</label>
          <input
            id="client-sector"
            type="text"
            value={matchedClient?.sector || 'Not specified'}
            readOnly
          />

          <label htmlFor="policy-number">Policy Number (Optional)</label>
          <input
            id="policy-number"
            type="text"
            placeholder="Enter policy number if available"
            value={form.policyNumber}
            onChange={(e) => set('policyNumber', e.target.value)}
          />

          <label htmlFor="insurance-type">Insurance Type (Optional)</label>
          <select
            id="insurance-type"
            value={form.insuranceType}
            onChange={(e) => set('insuranceType', e.target.value as InsuranceType)}
          >
            <option value="">Not specified</option>
            <option value="BUILDING">Building Insurance</option>
            <option value="CGL">Comprehensive General Liability</option>
          </select>

          <label htmlFor="effective-date">Effective Date (Optional)</label>
          <input
            id="effective-date"
            type="date"
            value={form.effectiveDate}
            onChange={(e) => handleEffectiveDateChange(e.target.value)}
          />

          <label htmlFor="expiration-date">Expiration Date (Optional)</label>
          <input
            id="expiration-date"
            type="date"
            value={form.expirationDate}
            onChange={(e) => set('expirationDate', e.target.value)}
          />
        </section>

        {/* SECTION 2: TRANSACTION INFORMATION */}
        <section className="transaction-section">
          <h2>
            <span className="section-step">02</span>
            Transaction Information
          </h2>

          <label htmlFor="premium">Premium Amount (₱) *</label>
          <input
            id="premium"
            type="number"
            min="0.01"
            max="999999.99"
            step="0.01"
            placeholder="0.00"
            value={form.premium}
            onChange={(e) => set('premium', e.target.value)}
            required
          />

          <div className="premium-quick-buttons">
            {[1122, 1683, 2244, 2805, 3198].map((amount) => (
              <button key={amount} type="button" onClick={() => set('premium', String(amount))}>
                {peso(amount)}
              </button>
            ))}
          </div>

          {Number(form.premium) > 50000 && (
            <p role="alert" className="alert alert-warning">
              <Icon name="alert" size={16} />
              Warning: Premium exceeds ₱50,000. Confirmation will be required before saving.
            </p>
          )}

          <label htmlFor="transaction-date">Transaction Date *</label>
          <input
            id="transaction-date"
            type="date"
            min="2015-01-01"
            max={today()}
            value={form.txnDate}
            onChange={(e) => set('txnDate', e.target.value)}
            required
          />

          <label htmlFor="payment-status">Payment Status *</label>
          <select
            id="payment-status"
            value={form.paymentStatus}
            onChange={(e) => set('paymentStatus', e.target.value as PaymentStatus)}
            required
          >
            <option value="UNKNOWN">Unknown</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <label htmlFor="paid-date">Paid Date (Optional)</label>
          <input
            id="paid-date"
            type="date"
            max={today()}
            value={form.paidDate}
            onChange={(e) => set('paidDate', e.target.value)}
          />

          <label htmlFor="primary-agent">Primary Agent *</label>
          <input
            id="primary-agent"
            type="text"
            list="agent-suggestions"
            placeholder="Search existing agent..."
            value={form.primaryAgent}
            onChange={(e) => set('primaryAgent', e.target.value)}
            required
          />

          <label htmlFor="assist-agent">Assist Agent (Optional)</label>
          <input
            id="assist-agent"
            type="text"
            list="agent-suggestions"
            placeholder="Search assist agent (optional)..."
            value={form.assistAgent}
            onChange={(e) => set('assistAgent', e.target.value)}
          />

          <datalist id="agent-suggestions">
            {agents.map((agent) => (
              <option key={agent.id} value={agent.name} />
            ))}
          </datalist>

          <label htmlFor="logbook-page">Logbook Page (Optional)</label>
          <input
            id="logbook-page"
            type="text"
            placeholder="Enter logbook page"
            value={form.logbookPage}
            onChange={(e) => set('logbookPage', e.target.value)}
          />
        </section>

        {/* Save Button */}
        <div className="transaction-actions">
          {message && (
            <p role="alert" className="alert alert-danger">
              <Icon name="alert" size={16} />
              {message}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-lg">
            <Icon name="check" size={18} />
            Save Transaction
          </button>
        </div>
      </form>

      {/* REGISTER NEW CLIENT POPUP */}
      {showNewClientForm && (
        <NewClientForm
          onSave={(input) => {
            const result = addClient({ name: input.name, branch: input.branch, sector: input.industrySector })
            if (!result.ok) {
              window.alert(result.error)
              return
            }
            set('clientName', clientLabel(result.value))
            setShowNewClientForm(false)
            toast('Client registered', {
              description: `${result.value.name} was added to Clients and selected.`,
            })
          }}
          onCancel={() => setShowNewClientForm(false)}
        />
      )}
    </div>
  )
}

export default TransactionEntry
