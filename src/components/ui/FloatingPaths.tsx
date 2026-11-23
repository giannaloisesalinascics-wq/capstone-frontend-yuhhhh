// Adapted from "Floating paths" by bundui on 21st.dev
// https://21st.dev/@bundui/components/floating-paths
//
// The original redraws every path each frame (motion pathLength/pathOffset).
// On Retina Macs that per-frame SVG repaint made Chrome drop parts of the page,
// so the paths are drawn once and the whole layer moves with GPU-only
// transform/opacity animations instead.
import './FloatingPaths.css'

type FloatingPathsProps = {
  // 1 or -1 mirrors the direction the lines sweep in
  position: number
  className?: string
}

function FloatingPaths({ position, className }: FloatingPathsProps) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div
      className={className ? `floating-paths ${className}` : 'floating-paths'}
      aria-hidden="true"
    >
      <svg viewBox="0 0 696 316" fill="none" preserveAspectRatio="none">
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
          />
        ))}
      </svg>
    </div>
  )
}

export default FloatingPaths
