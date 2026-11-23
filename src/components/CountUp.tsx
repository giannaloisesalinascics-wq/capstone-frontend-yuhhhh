import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  value: number
  format?: (value: number) => string
  duration?: number
}

const defaultFormat = (value: number) => value.toLocaleString('en-PH')

// Animates a number from its previous value to the new one
function CountUp({ value, format = defaultFormat, duration = 900 }: CountUpProps) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [display, setDisplay] = useState(reduceMotion ? value : 0)
  const shownRef = useRef(display)

  useEffect(() => {
    const from = shownRef.current
    if (reduceMotion || from === value) {
      shownRef.current = value
      setDisplay(value)
      return
    }

    let frame = 0
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (value - from) * eased)
      shownRef.current = next
      setDisplay(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reduceMotion])

  return <>{format(display)}</>
}

export default CountUp
