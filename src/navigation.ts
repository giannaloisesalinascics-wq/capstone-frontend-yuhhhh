import type { IconName } from './components/Icon'

export type NavItem = {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

const encoderLinks: NavItem[] = [
  { to: '/encode', label: 'Transaction Entry', icon: 'filePlus', end: true },
  { to: '/encode/entries', label: 'My Entries', icon: 'fileText' },
  { to: '/encode/clients', label: 'Client Search', icon: 'search' },
]

const analyticsLinks: NavItem[] = [
  { to: '/manage', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/manage/tasks', label: 'All Tasks', icon: 'tasks' },
  { to: '/manage/segments', label: 'Client Segments', icon: 'pie' },
  { to: '/manage/forecast', label: 'Renewal Forecast', icon: 'trending' },
  { to: '/manage/clients', label: 'Clients', icon: 'building' },
]

const adminLinks: NavItem[] = [
  { to: '/admin/users', label: 'Users & Roles', icon: 'shield' },
  { to: '/admin/agents', label: 'Agents', icon: 'userCheck' },
  { to: '/admin/models', label: 'Model Runs', icon: 'cpu' },
  { to: '/admin/backups', label: 'Backup Status', icon: 'database' },
]

type Role = 'ADMIN' | 'MANAGER' | 'ENCODER' | 'AGENT'

export type NavGroupDef = { label: string; links: NavItem[] }

// Menu groups each role can see (shared by the sidebar and the command palette)
export function getNavGroups(role: Role): NavGroupDef[] {
  if (role === 'ENCODER') return [{ label: 'Data Entry', links: encoderLinks }]
  if (role === 'AGENT') return [{ label: 'My Work', links: [{ to: '/agent', label: "Today's Tasks", icon: 'tasks', end: true }] }]

  const groups = [{ label: 'Analytics', links: analyticsLinks }]
  if (role === 'ADMIN') groups.push({ label: 'Administration', links: adminLinks })
  return groups
}
