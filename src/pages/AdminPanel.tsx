import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import AccountDialog, { type AccountDialogMode } from '../components/AccountDialog'
import {
  ROLE_INFO,
  setAccountActive,
  useAccounts,
  useAgents,
  type PublicAccount,
  type UserRole,
} from '../accounts'
import { toast } from '../toast'
import { openTaskCount } from '../data/sampleTasks'
import './Dashboard.css'

export type AdminSection = 'users' | 'agents' | 'models' | 'backups'

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

const roleBadge: Record<UserRole, string> = {
  ADMIN: 'badge-gold',
  MANAGER: 'badge-brand',
  AGENT: 'badge-neutral',
}

function formatDate(iso: string | null) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

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

function AdminPanel({
  section,
  currentUsername,
}: {
  section: AdminSection
  currentUsername?: string
}) {
  // Users state (shared account store, persisted locally)
  const users = useAccounts()
  const [dialog, setDialog] = useState<AccountDialogMode | null>(null)
  const [userQuery, setUserQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase()
    return users.filter(
      (u) =>
        (roleFilter === 'ALL' || u.role === roleFilter) &&
        (statusFilter === 'ALL' || (statusFilter === 'ACTIVE') === u.isActive) &&
        (!q || `${u.name} ${u.username} ${u.email}`.toLowerCase().includes(q)),
    )
  }, [users, userQuery, roleFilter, statusFilter])

  const roleCounts = useMemo(() => {
    const counts: Record<UserRole, number> = { ADMIN: 0, MANAGER: 0, AGENT: 0 }
    users.forEach((u) => u.isActive && counts[u.role]++)
    return counts
  }, [users])

  // Agents are the AGENT-role accounts
  const agents = useAgents()

  // Model runs state
  const [runs, setRuns] = useState<ModelRun[]>(initialRuns)

  // Backups state
  const [backups, setBackups] = useState<BackupRecord[]>(initialBackups)

  // Shared status notice
  const [notice, setNotice] = useState('')

  function toggleUser(u: PublicAccount) {
    const result = setAccountActive(u.id, !u.isActive, currentUsername)
    if (!result.ok) {
      toast('Can’t change this account', { description: result.error, variant: 'warning' })
      return
    }
    toast(u.isActive ? 'Account deactivated' : 'Account reactivated', {
      description: u.isActive
        ? u.role === 'AGENT' && openTaskCount(u.name) > 0
          ? `${u.name} can no longer sign in. Their open tasks return to the pool.`
          : `${u.name} can no longer sign in.`
        : `${u.name} can sign in again.`,
      variant: u.isActive ? 'info' : 'success',
    })
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
              'Freelance agent accounts and their workload. Deactivating returns open tasks to the pool.'}
            {section === 'models' &&
              'Compare K-Means, Logistic Regression, and Decision Tree scoring runs.'}
            {section === 'backups' &&
              'Monitor local PostgreSQL pg_dump backups (14-day retention).'}
          </p>
        </div>

        {(section === 'users' || section === 'agents') && (
          <div className="dashboard-header-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setDialog(section === 'agents' ? { kind: 'create', role: 'AGENT' } : { kind: 'create' })}
            >
              <Icon name="plus" size={16} />
              {section === 'agents' ? 'New Agent' : 'New Account'}
            </button>
          </div>
        )}

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
        {section === 'users' || section === 'agents'
          ? 'Accounts are saved in this browser and used by the login screen until backend integration.'
          : 'Admin actions run in local demo state until backend integration.'}
      </p>

      {notice && (
        <p role="status" className="alert alert-success">
          <Icon name="checkCircle" size={16} />
          {notice}
        </p>
      )}

      {/* USERS & ROLES */}
      {section === 'users' && (
        <section className="dashboard-panel">
          <div className="panel-header">
            <h2>System Accounts</h2>
            <p>
              {roleCounts.ADMIN} active admin{roleCounts.ADMIN === 1 ? '' : 's'} · {roleCounts.MANAGER} manager
              {roleCounts.MANAGER === 1 ? '' : 's'} · {roleCounts.AGENT} agent{roleCounts.AGENT === 1 ? '' : 's'}
            </p>
          </div>

          <div className="toolbar">
            <label className="search-field">
              <Icon name="search" size={16} />
              <input
                type="search"
                className="control"
                placeholder="Search name, username or email"
                aria-label="Search accounts"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </label>
            <select
              className="control"
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="MANAGER">Managers</option>
              <option value="AGENT">Agents</option>
            </select>
            <select
              className="control"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="ALL">Any status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <span className="toolbar-count">
              {filteredUsers.length} of {users.length} accounts
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.username === currentUsername
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      {isSelf && <span className="badge badge-success" style={{ marginLeft: 8 }}>You</span>}
                      {u.email && <span className="cell-sub">{u.email}</span>}
                    </td>
                    <td className="cell-mono">{u.username}</td>
                    <td>
                      <span className={`badge ${roleBadge[u.role]}`}>{ROLE_INFO[u.role].label}</span>
                    </td>
                    <td>
                      <span className={`badge badge-dot ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(u.lastLoginAt)}</td>
                    <td>
                      <div className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDialog({ kind: 'edit', account: u })}
                          aria-label={`Edit ${u.name}`}
                        >
                          <Icon name="pencil" size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDialog({ kind: 'reset', account: u })}
                          aria-label={`Reset password for ${u.name}`}
                        >
                          <Icon name="lock" size={14} />
                          Reset
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            className={`btn btn-sm ${u.isActive ? 'btn-danger-soft' : 'btn-success-soft'}`}
                            onClick={() => toggleUser(u)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <Icon name="search" size={28} />
              No accounts match these filters.
            </div>
          )}
        </section>
      )}

      {dialog && (
        <AccountDialog
          key={dialog.kind + ('account' in dialog ? dialog.account.id : '')}
          mode={dialog}
          actingUsername={currentUsername}
          onClose={() => setDialog(null)}
        />
      )}

      {/* AGENTS */}
      {section === 'agents' && (
        <section className="dashboard-panel">
          <div className="panel-header">
            <h2>Registered Agents</h2>
            <p>
              {agents.filter((a) => a.isActive).length} active of {agents.length} · agents sign in with these accounts
              and appear in task assignment and transaction entry.
            </p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Username</th>
                <th className="cell-num">Open Tasks</th>
                <th>Status</th>
                <th>Last sign-in</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => {
                const open = a.isActive ? openTaskCount(a.name) : 0
                return (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name}</strong>
                      {a.email && <span className="cell-sub">{a.email}</span>}
                    </td>
                    <td className="cell-mono">{a.username}</td>
                    <td className="cell-num">{open}</td>
                    <td>
                      <span className={`badge badge-dot ${a.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {a.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>{formatDate(a.lastLoginAt)}</td>
                    <td>
                      <div className="cell-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDialog({ kind: 'edit', account: a })}
                          aria-label={`Edit ${a.name}`}
                        >
                          <Icon name="pencil" size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${a.isActive ? 'btn-danger-soft' : 'btn-success-soft'}`}
                          onClick={() => toggleUser(a)}
                        >
                          {a.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {agents.length === 0 && (
            <div className="empty-state">
              <Icon name="users" size={28} />
              No agent accounts yet. Use “New Agent” to create one.
            </div>
          )}
        </section>
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