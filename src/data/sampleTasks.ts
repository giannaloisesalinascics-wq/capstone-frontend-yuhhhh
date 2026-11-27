import type { TaskType } from '../constants/taskTypes'

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'DONE'

export type Task = {
  id: number
  client: string
  taskType: TaskType
  priority: number
  status: TaskStatus
  agent: string | null
  windowEnd: string
}

// Sample campaign tasks (temporary until backend integration)
export const sampleTasks: Task[] = [
  { id: 1, client: 'ABC Properties Inc.', taskType: 'AT_RISK', priority: 1, status: 'ASSIGNED', agent: 'Maria Santos', windowEnd: '2027-01-31' },
  { id: 2, client: 'Golden Harvest Foods', taskType: 'RENEWAL_CALL', priority: 2, status: 'OPEN', agent: null, windowEnd: '2027-01-31' },
  { id: 3, client: 'Metro Realty Corp.', taskType: 'RENEWAL_CALL', priority: 3, status: 'DONE', agent: 'Carlo Reyes', windowEnd: '2027-01-31' },
  { id: 4, client: 'Summit Trading Inc.', taskType: 'AT_RISK', priority: 1, status: 'ASSIGNED', agent: 'Angela Cruz', windowEnd: '2027-01-31' },
  { id: 5, client: 'Greenfield Services', taskType: 'MONITOR', priority: 3, status: 'OPEN', agent: null, windowEnd: '2027-01-31' },
  { id: 6, client: 'Blue Ocean Retail', taskType: 'RENEWAL_CALL', priority: 2, status: 'DONE', agent: 'Maria Santos', windowEnd: '2027-01-31' },
]

export function openTaskCount(agentName: string) {
  return sampleTasks.filter((t) => t.agent === agentName && t.status === 'ASSIGNED').length
}
