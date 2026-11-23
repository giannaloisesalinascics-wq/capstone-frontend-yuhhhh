// Adapted from "Border Beam" by Magic UI (dillionverma) on 21st.dev
// https://21st.dev/@dillionverma/components/border-beam
import type { CSSProperties } from 'react'
import './BorderBeam.css'

type BorderBeamProps = {
  className?: string
  size?: number
  duration?: number
  borderWidth?: number
  anchor?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
}

// A beam of light that travels around the border of its (position: relative) parent
function BorderBeam({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = '#f0cf6e',
  colorTo = '#c9971c',
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={className ? `border-beam ${className}` : 'border-beam'}
      style={
        {
          '--size': size,
          '--duration': duration,
          '--anchor': anchor,
          '--border-width': borderWidth,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay}s`,
        } as CSSProperties
      }
    />
  )
}

export default BorderBeam
