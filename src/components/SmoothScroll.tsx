import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ReactLenis, type LenisRef } from 'lenis/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

// Panels with their own scrollbars keep native scrolling
const NESTED_SCROLLERS = '.palette-list, .outcome-panel, .new-client-panel, .sidebar-menu'

// Lenis smooth scrolling for the whole page, driven by GSAP's ticker so
// ScrollTrigger-based reveals (React Bits AnimatedContent) stay in sync.
function SmoothScroll() {
  const lenisRef = useRef<LenisRef>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    lenis?.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [])

  // New page: start at the top
  useEffect(() => {
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true })
    ScrollTrigger.refresh()
  }, [pathname])

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.12,
        anchors: true,
        prevent: (node: HTMLElement) => node.matches?.(NESTED_SCROLLERS) ?? false,
      }}
    />
  )
}

export default SmoothScroll
