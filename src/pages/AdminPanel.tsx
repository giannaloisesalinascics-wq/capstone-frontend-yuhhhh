import { useState, type FormEvent } from 'react'
import Icon from '../components/Icon'
import './Dashboard.css'

export type AdminSection = 'users' | 'agents' | 'models' | 'backups'

type UserAccount = {
  id: number
  username: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'ENCODER'
  isActive: boolean
}

type AgentRecord = {
  id: number
  displayName: string
  openTasks: number
  isActive: boolean
}

type ModelRun = {
  runId: string
  version: string
  trainedAt: string
  auc: string
  lapseRecall: string
  silhouette: string
  isLive: boolean
}

type BackupRecord = {
  id: number
  timestamp: string
  file: string
  size: string
  status: 'Verified' | 'Completed'
}

const initialUsers: UserAccount[] = [
  { id: 1, username: 'admin', name: 'Demo Administrator', role: 'ADMIN', isActive: true },
  { id: 2, username: 'manager', name: 'Demo Manager', role: 'MANAGER', isActive: true },
  { id: 3, username: 'encoder', name: 'Demo Encoder', role: 'ENCODER', isActive: true },
  { id: 4, username: 'agent', name: 'Demo Agent', role: 'AGENT', isActive: true },
]

const initialAgents: AgentRecord[] = [
  { id: 1, displayName: 'Maria Santos', openTasks: 8, isActive: true },
  { id: 2, displayName: 'Carlo Reyes', openTasks: 5, isActive: true },
  { id: 3, displayName: 'Angela Cruz', openTasks: 7, isActive: true },
]

const initialRuns: ModelRun[] = [
  {
    runId: 'RUN-2026-0118',
    version: 'v1.2 (LRFM + Sector)',
    trainedAt: '2026-11-18 08:02',
    auc: '0.74',
    lapseRecall: '0.66',
    silhouette: '0.41',
    isLive: true,
  },
  {
    runId: 'RUN-2026-0115',
    version: 'v1.1 (LRFM Baseline)',
    trainedAt: '2026-11-15 09:14',
    auc: '0.71',
    lapseRecall: '0.61',
    silhouette: '0.38',
    isLive: false,
  },
]

const initialBackups: BackupRecord[] = [
  {
    id: 1,
    timestamp: '2026-11-22 08:00',
    file: 'ria_backup_20261122.dump',
    size: '14.2 MB',
    status: 'Verified',
  },
  {
    id: 2,
    timestamp: '2026-11-21 08:00',
    file: 'ria_backup_20261121.dump',
    size: '14.0 MB',
    status: 'Completed',
  },
]

function AdminPanel({ section }: { section: AdminSection }) {
  // Users state
  const [users, setUsers] = useState<UserAccount[]>(initialUsers)
  const [newUsername, setNewUsername] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newRole, setNewRole] = useState<UserAccount['role']>('AGENT')

  // Agents state
  const [agents, setAgents] = useState<AgentRecord[]>(initialAgents)
  const [newAgentName, setNewAgentName] = useState('')

  // Model runs state
  const [runs, setRuns] = useState<ModelRun[]>(initialRuns)

  // Backups state
  const [backups, setBackups] = useState<BackupRecord[]>(initialBackups)

  // Shared status notice
  const [notice, setNotice] = useState('')

  function handleAddUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newUsername.trim() || !newFullName.trim()) return

    setUsers((prev) => [
      ...prev,
      {
        id: Date.now(),
        username: newUsername.trim().toLowerCase(),
        name: newFullName.trim(),
        role: newRole,
        isActive: true,
      },
    ])
    setNewUsername('')
    setNewFullName('')
    setNotice('User account added to local sample data.')
  }

  function toggleUser(id: number) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    )
  }

  function handleAddAgent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newAgentName.trim()) return

    setAgents((prev) => [
      ...prev,
      {
        id: Date.now(),
        displayName: newAgentName.trim(),
        openTasks: 0,
        isActive: true,
      },
    ])
    setNewAgentName('')
    setNotice('Agent added to local sample data.')
  }

  function toggleAgent(id: number) {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const nextActive = !a.isActive
        setNotice(
          nextActive
            ? `${a.displayName} reactivated.`
            : `${a.displayName} deactivated — open tasks returned to the pool.`
        )
        return {
          ...a,
          isActive: nextActive,
          openTasks: nextActive ? a.openTasks : 0,
        }
      })
    )
  }

  function handleRetrain() {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const newRun: ModelRun = {
      runId: `RUN-${Date.now().toString().slice(-6)}`,
      version: 'v1.3 (Manual Retrain)',
      trainedAt: now,
      auc: '0.75',
      lapseRecall: '0.68',
      silhouette: '0.42',
      isLive: true,
    }
    setRuns((prev) => [
      newRun,
      ...prev.map((r) => ({ ...r, isLive: false })),
    ])
    setNotice('Sample scoring run completed and set as live.')
  }

  function handleBackupNow() {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
    setBackups((prev) => [
      {
        id: Date.now(),
        timestamp: now,
        file: `ria_backup_${stamp}_manual.dump`,
        size: '14.3 MB',
        status: 'Completed',
      },
      ...prev,
    ])
    setNotice('Manual local backup recorded (demo mode).')
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <small>Administration · Richgold Insurance Agency</small>
          <h1>
            {section === 'users' && 'Users & Roles'}
            {section === 'agents' && 'Agents Management'}
            {section === 'models' && 'Model Runs'}
            {section === 'backups' && 'Backup Status'}
          </h1>
          <p>
            {section === 'users' && 'Create and manage system accounts and role access.'}
            {section === 'agents' &&
              'Add or deactivate freelance agents. Deactivating returns open tasks to the pool.'}
            {section === 'models' &&
              'Compare K-Means, Logistic Regression, and Decision Tree scoring runs.'}
            {section === 'backups' &&
              'Monitor local PostgreSQL pg_dump backups (14-day retention).'}
          </p>
        </div>

        {section === 'models' && (
          <div className="dashboard-header-actions">
            <button type="button" className="btn btn-primary" onClick={handleRetrain}>
              <Icon name="play" size={16} />
              Run Scoring Job
            </button>
          </div>
        )}

        {section === 'backups' && (
          <div className="dashboard-header-actions">
            <button type="button" className="btn btn-primary" onClick={handleBackupNow}>
              <Icon name="database" size={16} />
              Run Backup Now
            </button>
          </div>
        )}
      </header>

      <p className="sample-banner">
        Admin actions run in local demo state until backend integration.
      </p>

      {notice && (
        <p role="status" className="alert alert-success">
          <Icon name="checkCircle" size={16} />
          {notice}
        </p>
      )}

      {/* USERS & ROLES */}
      {section === 'users' && (
        <>
          <section className="dashboard-panel">
            <h2>Add User Account</h2>
            <p>New accounts are active immediately and can sign in with their assigned role.</p>
            <form onSubmit={handleAddUser} className="inline-form">
              <input
                type="text"
                className="control"
                placeholder="Username"
                aria-label="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
              <input
                type="text"
                className="control control-grow"
                placeholder="Full Name"
                aria-label="Full name"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                required
              />
              <select
                className="control"
                aria-label="Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserAccount['role'])}
              >
                <option value="AGENT">AGENT</option>
                <option value="ENCODER">ENCODER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button type="submit" className="btn btn-primary">
                <Icon name="plus" size={16} />
                Add User
              </button>
            </form>
          </section>

          <section className="dashboard-panel">
            <h2>System Accounts</h2>
            <p>{users.length} accounts</p>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="cell-mono"><strong>{u.username}</strong></td>
                    <td>{u.name}</td>
                    <td>
                      <span className="badge badge-neutral">{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge badge-dot ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleUser(u.id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* AGENTS */}
      {section === 'agents' && (
        <>
          <section className="dashboard-panel">
            <h2>Add Freelance Agent</h2>
            <p>Agents become available for task assignment right away.</p>
            <form onSubmit={handleAddAgent} className="inline-form">
              <input
                type="text"
                className="control control-grow"
                placeholder="Agent Display Name"
                aria-label="Agent display name"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                <Icon name="plus" size={16} />
                Add Agent
              </button>
            </form>
          </section>

          <section className="dashboard-panel">
            <h2>Registered Agents</h2>
            <p>{agents.length} agents</p>
            <table>
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th className="cell-num">Open Tasks</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.displayName}</strong></td>
                    <td className="cell-num">{a.openTasks}</td>
                    <td>
                      <span className={`badge badge-dot ${a.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {a.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${a.isActive ? 'btn-danger-soft' : 'btn-success-soft'}`}
                        onClick={() => toggleAgent(a.id)}
                      >
                        {a.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* MODEL RUNS */}
      {section === 'models' && (
        <section className="dashboard-panel">
          <h2>Scoring & Training History</h2>
          <p>Target metrics: AUC ≥ 0.70 · Lapse Recall ≥ 0.60 · Silhouette ≥ 0.35</p>

          <table>
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Version</th>
                <th>Trained At</th>
                <th className="cell-num">AUC</th>
                <th className="cell-num">Lapse Recall</th>
                <th className="cell-num">Silhouette</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.runId}>
                  <td className="cell-mono"><strong>{run.runId}</strong></td>
                  <td>{run.version}</td>
                  <td>{run.trainedAt}</td>
                  <td className="cell-num">{run.auc}</td>
                  <td className="cell-num">{run.lapseRecall}</td>
                  <td className="cell-num">{run.silhouette}</td>
                  <td>
                    <span className={`badge badge-dot ${run.isLive ? 'badge-success' : 'badge-neutral'}`}>
                      {run.isLive ? 'Live' : 'Archived'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* BACKUP STATUS */}
      {section === 'backups' && (
        <section className="dashboard-panel">
          <h2>Local Database Backups</h2>
          <p>Catch-up pg_dump runs automatically if the last backup is older than 24 hours.</p>

          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Backup File</th>
                <th className="cell-num">Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id}>
                  <td>{b.timestamp}</td>
                  <td className="cell-mono"><strong>{b.file}</strong></td>
                  <td className="cell-num">{b.size}</td>
                  <td>
                    <span className="badge badge-dot badge-success">{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

export default AdminPanel