import { useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'

import Login, {
  type DemoUser,
  type UserRole,
} from './pages/Login'

import Dashboard from './pages/Dashboard'
import AgentTasks from './pages/AgentTasks'
import TransactionEntry from './pages/TransactionEntry'
import ClientSegments from './pages/ClientSegments'
import RenewalForecast from './pages/RenewalForecast'
import TasksAdmin from './pages/TasksAdmin'
import Clients from './pages/Clients'
import MyEntries from './pages/MyEntries'
import AdminPanel from './pages/AdminPanel'
import Sidebar, { BrandMark } from './components/Sidebar'
import Icon from './components/Icon'
import CommandPalette from './components/CommandPalette'
import SmoothScroll from './components/SmoothScroll'
import ClickSpark from './components/reactbits/ClickSpark'
import { openCommandPalette } from './commandPaletteEvents'
import { toast } from './toast'
import { toggleTheme, useTheme } from './theme'
import { getInitials } from './format'
import './App.css'

// Default page for each role
const homeRoutes: Record<UserRole, string> = {
  ADMIN: '/manage',
  MANAGER: '/manage',
  AGENT: '/agent',
}

// Protect routes based on the user's role
function ProtectedRoute({
  user,
  allowedRoles,
}: {
  user: DemoUser | null
  allowedRoles: UserRole[]
}) {
  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homeRoutes[user.role]} replace />
  }

  return <Outlet />
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  AGENT: 'Agent',
}

function ThemeToggle() {
  const theme = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className={`theme-toggle-icon ${isDark ? 'is-hidden' : ''}`}>
        <Icon name="moon" size={17} />
      </span>
      <span className={`theme-toggle-icon ${isDark ? '' : 'is-hidden'}`}>
        <Icon name="sun" size={17} />
      </span>
    </button>
  )
}

// Shared logged-in header
function WorkspaceHeader({
  user,
  onLogout,
  showBrand = false,
}: {
  user: DemoUser
  onLogout: () => void
  showBrand?: boolean
}) {
  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className={`topbar ${showBrand ? 'topbar-branded' : ''}`}>
      <div className="topbar-left">
        {showBrand ? (
          <BrandMark compact />
        ) : (
          <span className="topbar-date">
            <Icon name="calendar" size={16} />
            {today}
          </span>
        )}
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="topbar-search"
          onClick={openCommandPalette}
          aria-label="Search pages and actions"
        >
          <Icon name="search" size={16} />
          <span>Search or jump to…</span>
          <kbd>⌘K</kbd>
        </button>

        <ThemeToggle />

        <span className="topbar-divider" aria-hidden="true" />

        <div className="topbar-user">
          <span className="topbar-avatar" aria-hidden="true">
            {getInitials(user.name)}
          </span>
          <span className="topbar-user-text">
            <strong>{user.name}</strong>
            <small>{roleLabels[user.role]}</small>
          </span>
        </div>

        <span className="topbar-divider" aria-hidden="true" />

        <button
          type="button"
          onClick={onLogout}
          className="btn btn-ghost btn-sm"
        >
          <Icon name="logOut" size={16} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  )
}

// Sidebar workspace (Manager and Admin)
function SidebarLayout({
  user,
  onLogout,
}: {
  user: DemoUser
  onLogout: () => void
}) {
  return (
    <>
      <Sidebar role={user.role} />
      <CommandPalette role={user.role} onLogout={onLogout} />

      <div className="manager-main">
        <WorkspaceHeader
          user={user}
          onLogout={onLogout}
        />

        <Outlet />
      </div>
    </>
  )
}

// Simplified Agent workspace (no sidebar)
function SimpleLayout({
  user,
  onLogout,
}: {
  user: DemoUser
  onLogout: () => void
}) {
  return (
    <div className="simple-main">
      <CommandPalette role={user.role} onLogout={onLogout} />
      <WorkspaceHeader
        user={user}
        onLogout={onLogout}
        showBrand
      />

      <Outlet />
    </div>
  )
}

function App() {
  const [user, setUser] = useState<DemoUser | null>(null)

  function handleLogin(nextUser: DemoUser) {
    setUser(nextUser)
    toast(`Welcome back, ${nextUser.name}`, {
      description: `Signed in as ${roleLabels[nextUser.role]}.`,
      variant: 'info',
    })
  }

  function handleLogout() {
    setUser(null)
  }

  return (
    <BrowserRouter>
      <SmoothScroll />
      <ClickSpark
        sparkColor={['#f0cf6e', '#e0b23a', '#c9971c']}
        sparkSize={9}
        sparkRadius={22}
        sparkCount={8}
        duration={420}
        shape="line"
        glow={0.5}
      >
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={homeRoutes[user.role]}
                replace
              />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Manager and Admin Shared Routes */}
        <Route
          element={
            <ProtectedRoute
              user={user}
              allowedRoles={['MANAGER', 'ADMIN']}
            />
          }
        >
          <Route
            element={
              user ? (
                <SidebarLayout
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route path="/manage" element={<Dashboard userName={user?.name} />} />
            <Route path="/manage/tasks" element={<TasksAdmin />} />
            <Route path="/manage/segments" element={<ClientSegments />} />
            <Route path="/manage/forecast" element={<RenewalForecast />} />
            <Route
              path="/manage/clients"
              element={<Clients />}
            />
            <Route path="/manage/entry" element={<TransactionEntry currentUsername={user?.username} />} />
            <Route path="/manage/entries" element={<MyEntries currentUsername={user?.username} />} />
          </Route>
        </Route>

        {/* Admin-Only Routes */}
        <Route
          element={
            <ProtectedRoute
              user={user}
              allowedRoles={['ADMIN']}
            />
          }
        >
          <Route
            element={
              user ? (
                <SidebarLayout
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route path="/admin" element={<Navigate to="/manage" replace />} />
            <Route
              path="/admin/users"
              element={<AdminPanel section="users" currentUsername={user?.username} />}
            />
            <Route
              path="/admin/agents"
              element={<AdminPanel section="agents" />}
            />
            <Route
              path="/admin/models"
              element={<AdminPanel section="models" />}
            />
            <Route
              path="/admin/backups"
              element={<AdminPanel section="backups" />}
            />
          </Route>
        </Route>

        {/* Agent Routes */}
        <Route
          element={
            <ProtectedRoute
              user={user}
              allowedRoles={['AGENT']}
            />
          }
        >
          <Route
            element={
              user ? (
                <SimpleLayout
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route
              path="/agent"
              element={<AgentTasks agentName={user?.name} />}
            />
          </Route>
        </Route>

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
      </ClickSpark>
    </BrowserRouter>
  )
}

export default App