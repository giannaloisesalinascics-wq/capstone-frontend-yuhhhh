import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { getNavGroups, type NavItem } from '../navigation'
import './Sidebar.css'

type SidebarProps = {
  role: 'ADMIN' | 'MANAGER' | 'ENCODER' | 'AGENT'
}

function NavGroup({ label, links }: { label: string; links: NavItem[] }) {
  return (
    <div className="sidebar-group">
      <p className="sidebar-label">{label}</p>
      <nav aria-label={label}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className="sidebar-link"
          >
            <Icon name={link.icon} size={18} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-logo" aria-hidden="true">
        R
      </span>
      <span className="brand-text">
        <strong>Richgold</strong>
        <small>Insurance Agency</small>
      </span>
    </div>
  )
}

function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="ria-sidebar">
      <div className="sidebar-brand">
        <BrandMark />
      </div>

      <div className="sidebar-menu">
        {getNavGroups(role).map((group) => (
          <NavGroup key={group.label} label={group.label} links={group.links} />
        ))}
      </div>

      <div className="sidebar-footer">
        <span className="sidebar-status-dot" aria-hidden="true" />
        <div>
          <strong>RIA On-Premise</strong>
          <small>Local server · Online</small>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
