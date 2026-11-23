// Cursor-following glow on cards: one passive listener for the whole app.
// Only the hovered card repaints, and only while the pointer moves.
const SELECTOR = '.kpi-card, .dashboard-panel, .segment-card, .agent-task-card, .bento-card'

export function initSpotlight() {
  if (!window.matchMedia('(hover: hover)').matches) return

  let frame = 0
  let lastEvent: PointerEvent | null = null

  function update() {
    frame = 0
    const event = lastEvent
    if (!event) return
    const card = (event.target as Element | null)?.closest?.<HTMLElement>(SELECTOR)
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    card.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  document.addEventListener(
    'pointermove',
    (event) => {
      lastEvent = event
      if (!frame) frame = requestAnimationFrame(update)
    },
    { passive: true }
  )
}
