export const OPEN_PALETTE_EVENT = 'ria:open-command-palette'

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))
}
