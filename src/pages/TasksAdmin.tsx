
import { useState } from 'react'
import Icon from '../components/Icon'
import './Dashboard.css'
import { TASK_TYPE_META } from '../constants/taskTypes'
import { sampleTasks, type TaskStatus } from '../data/sampleTasks'
import { useAgents } from '../accounts'

const statusBadges: Record<TaskStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'badge-neutral' },
  ASSIGNED: { label: 'Assigned', className: 'badge-brand' },
  DONE: { label: 'Done', className: 'badge-success' },
}

function getLocalDate() {
  const today = new Date()
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
  return localDate.toISOString().slice(0, 10)
}

function TasksAdmin() {
  const agents = useAgents().filter((a) => a.isActive)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState(getLocalDate)

  const [availability, setAvailability] = useState<
    Record<string, boolean>
  >({})

  const filteredTasks = sampleTasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'ALL' || task.status === statusFilter

    const matchesType =
      typeFilter === 'ALL' || task.taskType === typeFilter

    return matchesStatus && matchesType
  })

  const openCount = sampleTasks.filter(
    (task) => task.status === 'OPEN'
  ).length

  const assignedCount = sampleTasks.filter(
    (task) => task.status === 'ASSIGNED'
  ).length

  const doneCount = sampleTasks.filter(
    (task) => task.status === 'DONE'
  ).length

  function toggleAvailability(agentId: number) {
    const key = `${selectedDate}-${agentId}`

    setAvailability((previous) => ({
      ...previous,
      [key]: !(previous[key] ?? true),
    }))
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <small>Sales Optimization & Prescriptive Tasking</small>

          <h1>Tasks Administration</h1>

          <p>
            Monitor client tasks and manage agent availability.
          </p>
        </div>
      </header>

      <p className="sample-banner">
        Task records are sample data for demonstration only. Agents come
        from active agent accounts.
      </p>

      {/* TASK SUMMARY */}
      <section className="dashboard-kpis">
        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Open Tasks</p>
            <span className="kpi-icon kpi-icon-neutral">
              <Icon name="clock" />
            </span>
          </div>
          <h2>{openCount}</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Assigned Tasks</p>
            <span className="kpi-icon">
              <Icon name="userCheck" />
            </span>
          </div>
          <h2>{assignedCount}</h2>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-top">
            <p>Completed Tasks</p>
            <span className="kpi-icon kpi-icon-success">
              <Icon name="checkCircle" />
            </span>
          </div>
          <h2>{doneCount}</h2>
        </div>
      </section>

      {/* ALL TASKS */}
      <section className="dashboard-panel">
        <h2>All Tasks</h2>
        <p>View and filter client tasks across all agents.</p>

        <div className="toolbar">
          <select
            aria-label="Filter by task status"
            className="control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DONE">Completed</option>
          </select>

          <select
            aria-label="Filter by task type"
            className="control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Task Types</option>
            <option value="RENEWAL_CALL">Immediate Renewal Call</option>
            <option value="AT_RISK">At-Risk Retention</option>
            <option value="CROSS_SELL">Cross-Sell</option>
            <option value="MONITOR">Standard Monitoring</option>
          </select>

          <span className="toolbar-count">
            {filteredTasks.length} tasks displayed
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Client</th>
              <th>Task Type</th>
              <th>Assigned Agent</th>
              <th>Status</th>
              <th>Window Ends</th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <span className={`priority-tag priority-tag-${task.priority}`}>
                    P{task.priority}
                  </span>
                </td>

                <td>
                  <strong>{task.client}</strong>
                </td>

                <td>
                  <span
                    className="badge"
                    style={{
                      background: TASK_TYPE_META[task.taskType].bg,
                      color: TASK_TYPE_META[task.taskType].color,
                      borderColor: TASK_TYPE_META[task.taskType].border,
                    }}
                  >
                    {TASK_TYPE_META[task.taskType].label}
                  </span>
                </td>

                <td>
                  {task.agent ?? (
                    <span className="cell-sub">Unassigned</span>
                  )}
                </td>

                <td>
                  <span
                    className={`badge badge-dot ${statusBadges[task.status].className}`}
                  >
                    {statusBadges[task.status].label}
                  </span>
                </td>

                <td>{task.windowEnd}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <Icon name="search" size={28} />
            No tasks match the selected filters.
          </div>
        )}
      </section>

      {/* AGENT AVAILABILITY */}
      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Agent Availability</h2>
            <p>Mark agents available or unavailable for a selected date.</p>
          </div>

          <div>
            <label htmlFor="availability-date" className="field-label">
              Availability Date
            </label>
            <input
              id="availability-date"
              type="date"
              className="control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Agent Name</th>
              <th>Availability Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {agents.map((agent) => {
              const key = `${selectedDate}-${agent.id}`
              const isAvailable = availability[key] ?? true

              return (
                <tr key={agent.id}>
                  <td>
                    <strong>{agent.name}</strong>
                  </td>

                  <td>
                    <span
                      className={`badge badge-dot ${
                        isAvailable ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => toggleAvailability(agent.id)}
                      className={`btn btn-sm ${
                        isAvailable ? 'btn-danger-soft' : 'btn-success-soft'
                      }`}
                    >
                      {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default TasksAdmin
