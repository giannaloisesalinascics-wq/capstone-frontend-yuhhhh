import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { type IconName } from './Icon'
import { getNavGroups } from '../navigation'
import { toggleTheme, useTheme } from '../theme'
import { OPEN_PALETTE_EVENT } from '../commandPaletteEvents'
import './CommandPalette.css'

type Role = 'ADMIN' | 'MANAGER' | 'AGENT'

type Command = {
  id: string
  label: string
  group: string
  icon: IconName
  hint?: string
  keywords?: string
  run: () => void
}

// Matches every typed word against the start of a word in the label/keywords
function matches(command: Command, query: string) {
  const haystack = `${command.label} ${command.keywords ?? ''} ${command.group}`.toLowerCase()
  const words = haystack.split(/[^a-z0-9]+/)
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((part) => words.some((word) => word.startsWith(part)) || haystack.includes(part))
}

function CommandPalette({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const theme = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands = useMemo<Command[]>(() => {
    const pages = getNavGroups(role).flatMap((group) =>
      group.links.map((link) => ({
        id: link.to,
        label: link.label,
        group: 'Go to',
        icon: link.icon,
        hint: group.label,
        run: () => navigate(link.to),
      }))
    )

    return [
      ...pages,
      {
        id: 'theme',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        group: 'Actions',
        icon: theme === 'dark' ? 'sun' : 'moon',
        keywords: 'theme appearance dark light night',
        run: toggleTheme,
      },
      {
        id: 'logout',
        label: 'Log out',
        group: 'Actions',
        icon: 'logOut',
        keywords: 'sign out exit',
        run: onLogout,
      },
    ]
  }, [role, navigate, onLogout, theme])

  const results = query.trim() ? commands.filter((c) => matches(c, query)) : commands
  const groups = [...new Set(results.map((r) => r.group))]

  function show() {
    setQuery('')
    setActive(0)
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  // ⌘K / Ctrl+K anywhere, plus the custom event from the top bar button
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) close()
        else show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_PALETTE_EVENT, show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_PALETTE_EVENT, show)
    }
  })

  // Focus the search box on open; give focus back to where it was on close
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    return () => previous?.focus?.()
  }, [open])

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  function runCommand(command: Command) {
    close()
    command.run()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) runCommand(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      // Keep focus inside the dialog
      e.preventDefault()
    }
  }

  return (
    <div className="palette-overlay" onMouseDown={close}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-search">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="Search pages and actions…"
            aria-label="Search pages and actions"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
          />
          <kbd>esc</kbd>
        </div>

        <div className="palette-list" id="palette-list" role="listbox" ref={listRef}>
          {results.length === 0 ? (
            <div className="palette-empty">
              <Icon name="search" size={22} />
              <p>
                No matches for “{query}”.
                <br />
                Try a page name like <b>Clients</b> or <b>Forecast</b>.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group} className="palette-group" role="group" aria-label={group}>
                <p className="palette-group-label">{group}</p>
                {results
                  .map((command, index) => ({ command, index }))
                  .filter(({ command }) => command.group === group)
                  .map(({ command, index }) => (
                    <div
                      key={command.id}
                      id={`palette-${command.id}`}
                      data-index={index}
                      role="option"
                      aria-selected={index === active}
                      className={`palette-item ${index === active ? 'is-active' : ''}`}
                      onMouseMove={() => setActive(index)}
                      onClick={() => runCommand(command)}
                    >
                      <span className="palette-item-icon">
                        <Icon name={command.icon} size={16} />
                      </span>
                      <span className="palette-item-label">{command.label}</span>
                      {command.hint && <span className="palette-item-hint">{command.hint}</span>}
                      <Icon name="cornerDownLeft" size={14} className="palette-item-enter" />
                    </div>
                  ))}
              </div>
            ))
          )}
        </div>

        <div className="palette-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>⌘</kbd>
            <kbd>K</kbd> toggle
          </span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
