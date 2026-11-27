import { useState } from 'react'
import TaskOutcomePanel, {
  type TaskOutcome,
} from '../components/TaskOutcomePanel'
import { TASK_TYPE_META, type TaskType } from '../constants/taskTypes'
import Icon from '../components/Icon'
import BorderBeam from '../components/ui/BorderBeam'
import { toast } from '../toast'
import SplitText from '../components/reactbits/SplitText'
import AnimatedContent from '../components/reactbits/AnimatedContent'
import { getGreeting } from '../format'
import './AgentTasks.css'

type AgentTask = {
  id: number
  client: string
  branch?: string
  taskType: TaskType
  priority: number
  reason: string
  phone: string | null
  expectedRenewal: string
  isNewAccount?: boolean
}

type SavedOutcome = {
  outcome: TaskOutcome
  note: string
  callbackDate?: string
}

type AgentTasksProps = {
  agentName?: string
}

const sampleTasks: AgentTask[] = [
  {
    id: 1,
    client: 'ABC Properties Inc.',
    branch: 'Greenbelt 5 BR',
    taskType: 'AT_RISK',
    priority: 1,
    reason: 'Renewed 3 of 4 seasons · ₱8,500 · window closes in 9 days',
    phone: '0917-555-0142',
    expectedRenewal: '2027-01-20',
  },
  {
    id: 2,
    client: 'Golden Harvest Foods',
    branch: 'Makati Main',
    taskType: 'RENEWAL_CALL',
    priority: 2,
    reason: 'Consistent January renewer · ₱3,198 · window closes in 14 days',
    phone: '0918-555-0198',
    expectedRenewal: '2027-01-25',
  },
  {
    id: 3,
    client: 'Blue Ocean Retail',
    taskType: 'MONITOR',
    priority: 3,
    reason: 'First renewal cycle · ₱1,122 · segment baseline',
    phone: null,
    expectedRenewal: '2027-01-31',
    isNewAccount: true,
  },
]

function AgentTasks({ agentName = 'Carlo' }: AgentTasksProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [savedOutcomes, setSavedOutcomes] = useState<
    Record<number, SavedOutcome>
  >({})
  const [activeTab, setActiveTab] = useState<'TODAY' | 'CALLBACKS'>('TODAY')
  const [showCompleted, setShowCompleted] = useState(false)

  const selectedTask = sampleTasks.find((task) => task.id === selectedTaskId)

  const openTasks = sampleTasks.filter((task) => !savedOutcomes[task.id])
  const callbackTasks = sampleTasks.filter(
    (task) => savedOutcomes[task.id]?.outcome === 'CALLBACK'
  )
  const completedTasks = sampleTasks.filter(
    (task) =>
      savedOutcomes[task.id] && savedOutcomes[task.id].outcome !== 'CALLBACK'
  )

  const visibleTasks = activeTab === 'TODAY' ? openTasks : callbackTasks

  function handleSave(
    outcome: TaskOutcome,
    note: string,
    callbackDate?: string
  ) {
    if (selectedTaskId === null) return

    setSavedOutcomes((previous) => ({
      ...previous,
      [selectedTaskId]: { outcome, note, callbackDate },
    }))

    const label = outcome.replaceAll('_', ' ').toLowerCase()
    toast(
      outcome === 'CALLBACK' ? 'Callback scheduled' : 'Outcome logged',
      {
        description: outcome === 'CALLBACK'
          ? `${selectedTask?.client ?? 'Client'} · ${callbackDate ?? 'date set'}`
          : `${selectedTask?.client ?? 'Client'} marked as ${label}.`,
      }
    )

    setSelectedTaskId(null)
  }

  return (
    <div className="agent-tasks-page">
      <header className="agent-header">
        <div>
          <p className="agent-date">
            {new Date().toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <SplitText
            tag="h1"
            text={`${getGreeting()}, ${agentName}`}
            splitType="chars"
            effect="rise"
            delay={25}
            duration={0.9}
            trigger="load"
            textAlign="left"
          />
          <p>
            You have <strong>{openTasks.length} tasks</strong> today. Tap a
            card to log an outcome.
          </p>
        </div>
        <span className="agent-sample-tag">Sample data</span>
      </header>

      <div className="agent-summary">
        <div>
          <span>Open</span>
          <strong>{openTasks.length}</strong>
        </div>
        <div>
          <span>Callbacks</span>
          <strong>{callbackTasks.length}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{completedTasks.length}</strong>
        </div>
        <BorderBeam size={110} duration={10} borderWidth={1.5} />
      </div>

      {/* Today / Callbacks Toggle */}
      <div className="agent-tabs" role="tablist" aria-label="Task views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'TODAY'}
          className={`agent-tab ${activeTab === 'TODAY' ? 'active' : ''}`}
          onClick={() => setActiveTab('TODAY')}
        >
          Today
          <span className="agent-tab-count">{openTasks.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'CALLBACKS'}
          className={`agent-tab ${activeTab === 'CALLBACKS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CALLBACKS')}
        >
          Callbacks
          <span className="agent-tab-count">{callbackTasks.length}</span>
        </button>
      </div>

      {/* Active Task List */}
      <section>
        {visibleTasks.length === 0 ? (
          <div className="agent-empty">
            <Icon
              name={activeTab === 'TODAY' ? 'checkCircle' : 'calendar'}
              size={32}
            />
            <p>
              {activeTab === 'TODAY'
                ? 'All tasks for today are done.'
                : 'No callbacks scheduled yet.'}
            </p>
          </div>
        ) : (
          <AnimatedContent
            key={activeTab}
            trigger="mount"
            distance={28}
            duration={0.6}
            stagger={0.07}
            className="agent-task-list"
          >
          {visibleTasks.map((task) => {
            const typeMeta = TASK_TYPE_META[task.taskType]
            const saved = savedOutcomes[task.id]

            return (
              <article
                className={`agent-task-card priority-${task.priority}`}
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedTaskId(task.id)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Log outcome for ${task.client}`}
              >
                <div className="task-badges">
                  <span className={`priority-badge p${task.priority}`}>
                    Priority {task.priority}
                  </span>

                  <span
                    className="type-badge"
                    style={{
                      background: typeMeta.bg,
                      color: typeMeta.color,
                      borderColor: typeMeta.border,
                    }}
                  >
                    {typeMeta.label}
                  </span>

                  {task.isNewAccount && (
                    <span className="new-account-badge">New account</span>
                  )}
                </div>

                <div className="task-title-row">
                  <div>
                    <h3>{task.client}</h3>
                    {task.branch && (
                      <p className="task-branch">{task.branch}</p>
                    )}
                  </div>
                  <span className="task-cta" aria-hidden="true">
                    Log outcome
                  </span>
                </div>

                <p className="task-reason">{task.reason}</p>

                <div className="task-meta">
                  <span>
                    <Icon name="phone" size={14} />
                    {task.phone ? (
                      <a
                        href={`tel:${task.phone.replace(/[^0-9+]/g, '')}`}
                        className="phone-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.phone}
                      </a>
                    ) : (
                      <span className="contact-missing">Contact missing</span>
                    )}
                  </span>

                  <span>
                    <Icon name="calendar" size={14} />
                    Expected renewal (est.): {task.expectedRenewal}
                  </span>
                </div>

                {saved?.callbackDate && (
                  <p className="callback-note">
                    <Icon name="clock" size={14} />
                    Callback scheduled: {saved.callbackDate}
                    {saved.note ? ` · "${saved.note}"` : ''}
                  </p>
                )}
              </article>
            )
          })}
          </AnimatedContent>
        )}
      </section>

      {/* Completed Today Collapsible Section */}
      {completedTasks.length > 0 && (
        <section className="completed-section">
          <button
            type="button"
            className="completed-toggle"
            onClick={() => setShowCompleted((prev) => !prev)}
            aria-expanded={showCompleted}
          >
            <span>Completed today ({completedTasks.length})</span>
            <Icon
              name="chevronDown"
              size={18}
              className={showCompleted ? 'chevron-open' : ''}
            />
          </button>

          {showCompleted && (
            <div className="completed-list">
              {completedTasks.map((task) => {
                const saved = savedOutcomes[task.id]
                return (
                  <article
                    key={task.id}
                    className="agent-task-card completed-card"
                    onClick={() => setSelectedTaskId(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedTaskId(task.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Edit outcome for ${task.client}`}
                  >
                    <div className="completed-row">
                      <div>
                        <strong>{task.client}</strong>
                        {task.branch && (
                          <span className="task-branch-inline">
                            {' '}· {task.branch}
                          </span>
                        )}
                      </div>
                      <span className="outcome-pill">
                        {saved.outcome.replaceAll('_', ' ')}
                      </span>
                    </div>
                    {saved.note && (
                      <p className="task-reason">Note: {saved.note}</p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {selectedTask && (
        <TaskOutcomePanel
          clientName={selectedTask.client}
          onClose={() => setSelectedTaskId(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default AgentTasks