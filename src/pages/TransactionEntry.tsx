
import { useState, type FormEvent } from 'react'
import NewClientForm from '../components/NewClientForm'
import { toast } from '../toast'
import Icon from '../components/Icon'
import './Dashboard.css'
import './TransactionEntry.css'

// Client display name, including branch when available
function getClientLabel(client: { name: string; branch?: string }) {
  return client.branch
    ? `${client.name} — ${client.branch}`
    : client.name
}

// Sample clients (temporary until backend integration)
const initialClients = [
  { id: 1, name: 'ABC Properties Inc.' },
  { id: 2, name: 'Golden Harvest Foods' },
]

// Sample agents (temporary until backend integration)
const sampleAgents = [
  { id: 1, name: 'Maria Santos' },
  { id: 2, name: 'Carlo Reyes' },
  { id: 3, name: 'Angela Cruz' },
]

type Client = {
  id: number
  name: string
  branch?: string
  industrySector?: string
}

function TransactionEntry() {
  // Client records
  const [sampleClients, setSampleClients] = useState<Client[]>(initialClients)

  // Form states
  const [message, setMessage] = useState('')
  const [clientName, setClientName] = useState('')
  const [primaryAgent, setPrimaryAgent] = useState('')
  const [assistAgent, setAssistAgent] = useState('')
  const [premium, setPremium] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')

  // New Client popup state
  const [showNewClientForm, setShowNewClientForm] = useState(false)

  // Find selected client
  const matchedClient = sampleClients.find(
    (client) =>
      getClientLabel(client).toLowerCase() ===
      clientName.trim().toLowerCase()
  )

  // Automatically calculate expiration date
  function handleEffectiveDateChange(value: string) {
    setEffectiveDate(value)

    if (!value) {
      setExpirationDate('')
      return
    }

    const [year, month, day] = value.split('-').map(Number)

    const nextYear = year + 1
    const lastDay = new Date(nextYear, month, 0).getDate()
    const adjustedDay = Math.min(day, lastDay)

    const calculatedExpiration =
      `${nextYear}-${String(month).padStart(2, '0')}-${String(adjustedDay).padStart(2, '0')}`

    setExpirationDate(calculatedExpiration)
  }

  // Submit transaction
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setMessage('')

    // Validate existing client
    const selectedClient = sampleClients.find(
      (client) =>
        getClientLabel(client).toLowerCase() ===
        clientName.trim().toLowerCase()
    )

    if (!selectedClient) {
      setMessage(
        'Please select an existing client from the suggestions.'
      )
      return
    }

    // Validate primary agent
    const validAgent = sampleAgents.some(
      (agent) =>
        agent.name.toLowerCase() ===
        primaryAgent.trim().toLowerCase()
    )

    if (!validAgent) {
      setMessage('Please select an existing primary agent.')
      return
    }
// Validate assist agent (optional, but must exist and differ from primary)
    if (assistAgent.trim()) {
      const validAssistAgent = sampleAgents.some(
        (agent) =>
          agent.name.toLowerCase() ===
          assistAgent.trim().toLowerCase()
      )

      if (!validAssistAgent) {
        setMessage('Please select an existing assist agent or leave it blank.')
        return
      }

      if (
        assistAgent.trim().toLowerCase() ===
        primaryAgent.trim().toLowerCase()
      ) {
        setMessage('Assist agent cannot be the same as the primary agent.')
        return
      }
    }
    // Premium confirmation
    if (Number(premium) > 50000) {
      const confirmed = window.confirm(
        'The premium exceeds ₱50,000. Do you want to continue?'
      )

      if (!confirmed) {
        return
      }
    }

    // Temporary submission message
    setMessage(
      'Sample transaction validated. Backend saving is not connected yet.'
    )
    toast('Transaction validated', {
      description: `${selectedClient.name} · ₱${Number(premium).toLocaleString('en-PH')}`,
    })
  }

  const isSuccessMessage =
    message.startsWith('Sample transaction validated') ||
    message.startsWith('New client added')

  return (
    <div className="transaction-page">

      {/* Page Header */}
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>

          <h1>Transaction Entry</h1>

          <p>
            Enter and save insurance policy transaction records.
          </p>
        </div>
      </header>

      <p className="sample-banner">
        Sample data — transactions are validated locally until the backend is connected.
      </p>

      <form onSubmit={handleSubmit} className="transaction-form">

        {/* SECTION 1: CLIENT AND POLICY */}
        <section className="transaction-section">

          <h2>
            <span className="section-step">01</span>
            Client and Policy Information
          </h2>

          {/* Corporate Client */}
          <label htmlFor="client">
            Corporate Client *
          </label>

          <input
            id="client"
            type="text"
            list="client-suggestions"
            placeholder="Search existing client..."
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value)
              setMessage('')
            }}
            required
          />

          <datalist id="client-suggestions">
            {sampleClients.map((client) => (
              <option
                key={client.id}
                value={getClientLabel(client)}
              />
            ))}
          </datalist>

          {/* Register New Client */}
          <button
            type="button"
            className="new-client-trigger"
            onClick={() => setShowNewClientForm(true)}
          >
            <Icon name="plus" size={14} />
            Register New Client
          </button>

          {/* Industry Sector */}
          <label htmlFor="client-sector">
            Industry Sector
          </label>

          <input
            id="client-sector"
            type="text"
            value={
              matchedClient?.industrySector || 'Not specified'
            }
            readOnly
          />

          {/* Policy Number */}
          <label htmlFor="policy-number">
            Policy Number (Optional)
          </label>

          <input
            id="policy-number"
            type="text"
            placeholder="Enter policy number if available"
          />

          {/* Insurance Type */}
          <label htmlFor="insurance-type">
            Insurance Type (Optional)
          </label>

          <select
            id="insurance-type"
            defaultValue=""
          >
            <option value="">
              Not specified
            </option>

            <option value="BUILDING">
              Building Insurance
            </option>

            <option value="CGL">
              Comprehensive General Liability
            </option>
          </select>

          {/* Effective Date */}
          <label htmlFor="effective-date">
            Effective Date (Optional)
          </label>

          <input
            id="effective-date"
            type="date"
            value={effectiveDate}
            onChange={(e) =>
              handleEffectiveDateChange(e.target.value)
            }
          />

          {/* Expiration Date */}
          <label htmlFor="expiration-date">
            Expiration Date (Optional)
          </label>

          <input
            id="expiration-date"
            type="date"
            value={expirationDate}
            onChange={(e) =>
              setExpirationDate(e.target.value)
            }
          />

        </section>

        {/* SECTION 2: TRANSACTION INFORMATION */}
        <section className="transaction-section">

          <h2>
            <span className="section-step">02</span>
            Transaction Information
          </h2>

          {/* Premium Amount */}
          <label htmlFor="premium">
            Premium Amount (₱) *
          </label>

          <input
            id="premium"
            type="number"
            min="0.01"
            max="999999.99"
            step="0.01"
            placeholder="0.00"
            value={premium}
            onChange={(e) =>
              setPremium(e.target.value)
            }
            required
          />

          {/* Premium Quick-Select */}
          <div className="premium-quick-buttons">
            {[1122, 1683, 2244, 2805, 3198].map(
              (amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() =>
                    setPremium(String(amount))
                  }
                >
                  ₱{amount.toLocaleString('en-PH')}
                </button>
              )
            )}
          </div>

          {/* High Premium Warning */}
          {Number(premium) > 50000 && (
            <p role="alert" className="alert alert-warning">
              <Icon name="alert" size={16} />
              Warning: Premium exceeds ₱50,000.
              Confirmation will be required before saving.
            </p>
          )}

          {/* Transaction Date */}
          <label htmlFor="transaction-date">
            Transaction Date *
          </label>

          <input
            id="transaction-date"
            type="date"
            min="2015-01-01"
            max={
              new Date().toLocaleDateString('en-CA')
            }
            required
          />

          {/* Payment Status */}
          <label htmlFor="payment-status">
            Payment Status *
          </label>

          <select
            id="payment-status"
            defaultValue="UNKNOWN"
            required
          >
            <option value="UNKNOWN">Unknown</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Paid Date */}
          <label htmlFor="paid-date">
            Paid Date (Optional)
          </label>

          <input
            id="paid-date"
            type="date"
          />

          {/* Primary Agent */}
          <label htmlFor="primary-agent">
            Primary Agent *
          </label>

          <input
            id="primary-agent"
            type="text"
            list="primary-agent-suggestions"
            placeholder="Search existing agent..."
            value={primaryAgent}
            onChange={(e) =>
              setPrimaryAgent(e.target.value)
            }
            required
          />

          <datalist id="primary-agent-suggestions">
            {sampleAgents.map((agent) => (
              <option
                key={agent.id}
                value={agent.name}
              />
            ))}
          </datalist>

          {/* Assist Agent */}
          <label htmlFor="assist-agent">
            Assist Agent (Optional)
          </label>

        
<input
            id="assist-agent"
            type="text"
            list="assist-agent-suggestions"
            placeholder="Search assist agent (optional)..."
            value={assistAgent}
            onChange={(e) => {
              setAssistAgent(e.target.value)
              setMessage('')
            }}
          />

<datalist id="assist-agent-suggestions">
  {sampleAgents.map((agent) => (
    <option
      key={agent.id}
      value={agent.name}
    />
  ))}
</datalist>


          {/* Logbook Page */}
          <label htmlFor="logbook-page">
            Logbook Page (Optional)
          </label>

          <input
            id="logbook-page"
            type="text"
            placeholder="Enter logbook page"
          />

        </section>

        {/* Save Button */}
        <div className="transaction-actions">
          {message && (
            <p
              role="status"
              className={`alert ${isSuccessMessage ? 'alert-success' : 'alert-danger'}`}
            >
              <Icon name={isSuccessMessage ? 'checkCircle' : 'alert'} size={16} />
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
          onSave={(client) => {

            // Normalize client names
            const normalize = (value: string) =>
              value
                .trim()
                .replace(/\s+/g, ' ')
                .toLowerCase()

            // Check for duplicate clients
            const duplicate = sampleClients.some(
              (existing) =>
                normalize(existing.name) ===
                  normalize(client.name) &&
                normalize(existing.branch ?? '') ===
                  normalize(client.branch)
            )

            if (duplicate) {
              window.alert(
                'This client and branch already exist. Please select the existing client.'
              )
              return
            }

            // Add the new client to temporary state
            setSampleClients((previous) => [
              ...previous,
              {
                id: Date.now(),
                name: client.name,
                branch: client.branch,
                industrySector: client.industrySector,
              },
            ])

            // Select the newly registered client
            setClientName(getClientLabel(client))

            // Close popup
            setShowNewClientForm(false)

            // Display confirmation
            setMessage(
              'New client added to the sample list.'
            )
            toast('Client registered', {
              description: `${client.name} was added and selected.`,
            })
          }}

          onCancel={() =>
            setShowNewClientForm(false)
          }
        />
      )}

    </div>
  )
}

export default TransactionEntry
