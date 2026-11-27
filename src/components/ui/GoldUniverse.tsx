import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'

export type UniversePhase = 'idle' | 'form' | 'launch'

type GoldUniverseProps = {
  phase: UniversePhase
  /** Increment to make the particles shudder red. */
  errorCount: number
}

type SceneState = {
  intro: number
  morph: number
  warp: number
  burst: number
  error: number
}

const PLANET_POINTS = 26000
const RING_POINTS = 22000
const STARS = 900

const particleVertex = `
attribute vec3 aPlanet;
attribute vec3 aHalo;
attribute vec4 aSeed;
attribute float aKind;
uniform float uTime, uIntro, uMorph, uBurst, uError, uAspect, uScale, uDpr, uHeight;
uniform vec2 uPointer;
varying vec3 vColor;
varying float vAlpha;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  // Planet with a tilted ring
  vec3 p = aPlanet;
  float spin = aKind < 0.5 ? uTime * 0.12 : uTime * (0.34 - length(aPlanet.xz) * 0.11);
  p.xz = rot(spin) * p.xz;
  p.yz = rot(aKind < 0.5 ? -0.25 : -0.30) * p.yz;
  p.xy = rot(0.36) * p.xy;

  vec3 n = normalize(p);
  float rim = pow(1.0 - abs(n.z), 2.2);
  float light = smoothstep(-0.55, 0.9, dot(n, normalize(vec3(-0.55, 0.8, 0.15))));
  float planetAlpha = aKind < 0.5
    ? (0.02 + rim * (0.1 + light * 1.1)) * step(-0.15, p.z)
    : 0.2 + aSeed.y * 0.55;
  // The planet hides the far half of its ring
  if (aKind > 0.5 && p.z < 0.0 && length(p.xy) < 1.03) planetAlpha = 0.0;
  p *= uScale;

  // Halo surrounding the form
  vec3 h = aHalo;
  float dir = aKind < 0.5 ? 1.0 : -1.0;
  h.xy = rot(dir * uTime * (0.08 + aSeed.x * 0.06)) * h.xy;
  h *= 1.0 + sin(uTime * 0.9 + aSeed.y * 6.283) * 0.012;
  if (aKind > 0.5) {
    h.yz = rot(1.12 + sin(uTime * 0.25) * 0.08) * h.yz;
    h.xy = rot(-0.5) * h.xy;
  }
  float haloAlpha = aKind < 0.5 ? 0.2 + aSeed.y * 0.6 : 0.14 + aSeed.y * 0.4;

  // Staggered morph with a vortex in the middle
  float t = smoothstep(aSeed.x * 0.4, aSeed.x * 0.4 + 0.6, uMorph);
  float flight = sin(t * 3.14159);
  vec3 q = mix(p, h, t);
  q.xy = rot(flight * (1.1 + aSeed.y * 1.6)) * q.xy;
  q *= 1.0 + flight * (0.35 + aSeed.z * 1.1);
  q.z += flight * (aSeed.w - 0.35) * 2.2;

  // First load: condense out of scattered dust
  float a = 1.0 - smoothstep(aSeed.w * 0.4, aSeed.w * 0.4 + 0.6, uIntro);
  q.xy = rot(a * 2.2) * q.xy;
  q *= 1.0 + a * (1.5 + aSeed.z * 3.0);

  // Launch: inhale, then detonate past the camera
  float inhale = smoothstep(0.0, 0.42, uBurst);
  float blast = smoothstep(0.36, 1.0, uBurst);
  q.xy = rot(inhale * 2.4) * q.xy;
  q *= 1.0 - inhale * 0.88;
  q += normalize(q + 0.0001) * blast * (1.5 + aSeed.z * 5.0);
  q.z += blast * aSeed.w * 4.0;

  q.x += sin(uTime * 55.0 + aSeed.y * 5.0) * uError * 0.07;

  // Particles part around the pointer
  vec2 d = q.xy - uPointer;
  q.xy += normalize(d + 0.0001) * 0.13 * exp(-dot(d, d) * 9.0);

  float w = 4.0 - q.z;
  if (w < 0.15) {
    gl_Position = vec4(9.0, 9.0, 0.0, 1.0);
    gl_PointSize = 1.0;
    vAlpha = 0.0;
    vColor = vec3(0.0);
    return;
  }
  gl_Position = vec4(q.x * 2.0 / uAspect, q.y * 2.0, 0.0, w);
  float size = (1.9 + aSeed.z * aSeed.z * 2.9) * clamp(uHeight / 820.0, 0.8, 1.6);
  gl_PointSize = clamp(size * uDpr * 4.0 / w, 1.0, 14.0 * uDpr);

  float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + aSeed.x * 2.5) + aSeed.y * 40.0);
  vAlpha = mix(planetAlpha, haloAlpha, t) * twinkle * (1.0 - a * 0.7);
  vAlpha = min(1.0, vAlpha + flight * 0.12) * (1.0 - smoothstep(0.7, 1.0, uBurst));
  vec3 gold = mix(vec3(0.72, 0.45, 0.08), vec3(1.0, 0.88, 0.55), aSeed.y);
  vec3 blue = vec3(0.38, 0.57, 1.0);
  vColor = mix(gold, blue, step(0.88, aSeed.w) * 0.75);
  vColor = mix(vColor, vec3(1.0, 0.25, 0.24), min(1.0, uError));
}`

const particleFragment = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  // Hot core plus a faint tail; overlapping tails add up to bloom
  float a = (smoothstep(0.26, 0.06, d) + 0.16 * smoothstep(0.5, 0.0, d)) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}`

const starVertex = `
attribute vec3 aStar;
attribute float aEnd;
uniform float uTravel, uAspect, uPixel;
// Precision must match the fragment shader's declaration
uniform mediump float uWarp;
uniform vec2 uPointer;
varying float vAlpha;
varying float vEnd;
void main() {
  float depth = 1.0 - fract(aStar.z + uTravel);
  float z = 0.06 + depth * 2.0 + aEnd * uWarp * 0.28;
  vec2 pos = (aStar.xy - uPointer * 0.015) / z;
  pos.x /= max(uAspect, 0.6);
  // At rest each streak shrinks to a dot rather than vanishing
  pos.x += aEnd * uPixel * (1.0 - min(1.0, uWarp * 4.0));
  gl_Position = vec4(pos, 0.0, 1.0);
  vAlpha = smoothstep(1.0, 0.55, depth) * (0.25 + fract(aStar.z * 91.7) * 0.6) * smoothstep(0.0, 0.08, depth);
  vEnd = aEnd * min(1.0, uWarp * 4.0);
}`

const starFragment = `
precision mediump float;
uniform float uWarp;
varying float vAlpha;
varying float vEnd;
void main() {
  vec3 color = mix(vec3(0.75, 0.83, 1.0), vec3(1.0, 0.85, 0.5), min(1.0, uWarp));
  float a = vAlpha * (1.0 - vEnd);
  gl_FragColor = vec4(color * a, a);
}`

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertexSource],
    [gl.FRAGMENT_SHADER, fragmentSource],
  ] as const) {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
    gl.deleteShader(shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return null
  }
  return program
}

// Interleaved: planet xyz, halo xyz, seed xyzw, kind
function buildParticles() {
  const total = PLANET_POINTS + RING_POINTS
  const data = new Float32Array(total * 11)
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < total; i++) {
    const isRing = i >= PLANET_POINTS
    const angle = Math.random() * Math.PI * 2
    let planet: number[]
    if (isRing) {
      const band = Math.random()
      // Leave a gap between two ring bands
      const radius = band < 0.62 ? 1.38 + band * 0.5 : 1.79 + (band - 0.62) * 0.75
      planet = [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 0.02,
        Math.sin(angle) * radius,
      ]
    } else {
      const y = 1 - (i / PLANET_POINTS) * 2
      const r = Math.sqrt(1 - y * y)
      planet = [Math.cos(golden * i) * r, y, Math.sin(golden * i) * r]
    }

    const spread = (Math.random() + Math.random() + Math.random()) / 3 - 0.5
    const haloRadius = isRing ? 2.15 + spread * 0.5 : 1.68 + spread * 0.34
    data.set(
      [
        ...planet,
        Math.cos(angle) * haloRadius,
        Math.sin(angle) * haloRadius,
        (Math.random() - 0.5) * 0.12,
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        isRing ? 1 : 0,
      ],
      i * 11,
    )
  }
  return data
}

function buildStars() {
  const data = new Float32Array(STARS * 8)
  for (let i = 0; i < STARS; i++) {
    const x = (Math.random() - 0.5) * 4
    const y = (Math.random() - 0.5) * 3
    const z = Math.random()
    data.set([x, y, z, 0, x, y, z, 1], i * 8)
  }
  return data
}

function startScene(
  canvas: HTMLCanvasElement,
  stateRef: RefObject<SceneState>,
  still: boolean,
) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
  })
  if (!gl) return undefined

  const particles = createProgram(gl, particleVertex, particleFragment)
  const stars = createProgram(gl, starVertex, starFragment)
  if (!particles || !stars) return undefined

  const particleBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, buildParticles(), gl.STATIC_DRAW)
  const starBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, buildStars(), gl.STATIC_DRAW)

  const uniforms = new Map<WebGLProgram, Map<string, WebGLUniformLocation | null>>()
  function uniform(program: WebGLProgram, name: string) {
    let cache = uniforms.get(program)
    if (!cache) uniforms.set(program, (cache = new Map()))
    if (!cache.has(name)) cache.set(name, gl!.getUniformLocation(program, name))
    return cache.get(name) ?? null
  }

  function bind(
    program: WebGLProgram,
    buffer: WebGLBuffer,
    layout: [string, number][],
  ) {
    gl!.useProgram(program)
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer)
    const stride = layout.reduce((sum, [, size]) => sum + size, 0) * 4
    let offset = 0
    for (const [name, size] of layout) {
      const location = gl!.getAttribLocation(program, name)
      gl!.enableVertexAttribArray(location)
      gl!.vertexAttribPointer(location, size, gl!.FLOAT, false, stride, offset)
      offset += size * 4
    }
  }

  let dpr = 1
  let aspect = 1
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
    canvas.width = width
    canvas.height = height
    aspect = width / height
    gl!.viewport(0, 0, width, height)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  const target = { x: 9, y: 9 }
  const pointer = { x: 9, y: 9 }
  function onMove(event: PointerEvent) {
    const box = canvas.getBoundingClientRect()
    target.x = (((event.clientX - box.left) / box.width) * 2 - 1) * 2 * aspect
    target.y = (1 - ((event.clientY - box.top) / box.height) * 2) * 2
    if (pointer.x > 8) Object.assign(pointer, target)
  }
  if (!still) window.addEventListener('pointermove', onMove, { passive: true })

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE)

  let frame = 0
  let last = performance.now()
  let time = 8
  let travel = 0
  function draw(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const state = stateRef.current
    if (!still) {
      time += dt
      travel += dt * (0.006 + state.warp * 0.75)
    }
    pointer.x += (target.x - pointer.x) * 0.09
    pointer.y += (target.y - pointer.y) * 0.09

    gl!.clearColor(0, 0, 0, 0)
    gl!.clear(gl!.COLOR_BUFFER_BIT)

    bind(stars!, starBuffer, [['aStar', 3], ['aEnd', 1]])
    gl!.uniform1f(uniform(stars!, 'uTravel'), travel)
    gl!.uniform1f(uniform(stars!, 'uWarp'), state.warp)
    gl!.uniform1f(uniform(stars!, 'uAspect'), aspect)
    gl!.uniform1f(uniform(stars!, 'uPixel'), (3.2 * dpr) / canvas.width)
    gl!.uniform2f(
      uniform(stars!, 'uPointer'),
      pointer.x > 8 ? 0 : pointer.x,
      pointer.x > 8 ? 0 : pointer.y,
    )
    gl!.drawArrays(gl!.LINES, 0, STARS * 2)

    bind(particles!, particleBuffer, [
      ['aPlanet', 3],
      ['aHalo', 3],
      ['aSeed', 4],
      ['aKind', 1],
    ])
    gl!.uniform1f(uniform(particles!, 'uTime'), time)
    gl!.uniform1f(uniform(particles!, 'uIntro'), state.intro)
    gl!.uniform1f(uniform(particles!, 'uMorph'), state.morph)
    gl!.uniform1f(uniform(particles!, 'uBurst'), state.burst)
    gl!.uniform1f(uniform(particles!, 'uError'), state.error)
    gl!.uniform1f(uniform(particles!, 'uAspect'), aspect)
    gl!.uniform1f(uniform(particles!, 'uScale'), Math.min(1.16, aspect * 1.75))
    gl!.uniform1f(uniform(particles!, 'uDpr'), dpr)
    gl!.uniform1f(uniform(particles!, 'uHeight'), canvas.height / dpr)
    gl!.uniform2f(uniform(particles!, 'uPointer'), pointer.x, pointer.y)
    gl!.drawArrays(gl!.POINTS, 0, PLANET_POINTS + RING_POINTS)

    frame = requestAnimationFrame(draw)
  }
  frame = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('pointermove', onMove)
    gl.deleteBuffer(particleBuffer)
    gl.deleteBuffer(starBuffer)
    gl.deleteProgram(particles)
    gl.deleteProgram(stars)
  }
}

/** Full-bleed WebGL scene of gold dust: a ringed planet that becomes a halo. */
function GoldUniverse({ phase, errorCount }: GoldUniverseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<SceneState>({
    intro: 0,
    morph: 0,
    warp: 0,
    burst: 0,
    error: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const state = stateRef.current
    const stop = startScene(canvas, stateRef, still)
    const intro = gsap.to(state, {
      intro: 1,
      duration: still ? 0 : 2.6,
      ease: 'power2.out',
    })
    return () => {
      intro.kill()
      stop?.()
    }
  }, [])

  useEffect(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const state = stateRef.current
    const timeline = gsap.timeline()
    if (still) {
      timeline.set(state, { morph: phase === 'idle' ? 0 : 1 })
    } else if (phase === 'launch') {
      timeline
        .to(state, { burst: 1, duration: 1.45, ease: 'power1.inOut' }, 0)
        .to(state, { warp: 1.4, duration: 1.1, ease: 'power3.in' }, 0.2)
    } else {
      const opening = phase === 'form'
      timeline.to(
        state,
        {
          morph: opening ? 1 : 0,
          duration: opening ? 1.9 : 1.3,
          ease: 'power2.inOut',
        },
        0,
      )
      if (opening) {
        timeline.to(state, { warp: 1, duration: 0.55, ease: 'power2.in' }, 0)
      }
      timeline.to(
        state,
        { warp: 0, duration: 1.1, ease: 'power3.out' },
        opening ? 0.6 : 0,
      )
    }
    return () => {
      timeline.kill()
    }
  }, [phase])

  useEffect(() => {
    if (!errorCount) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.fromTo(
      stateRef.current,
      { error: 1 },
      { error: 0, duration: 0.9, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [errorCount])

  return <canvas ref={canvasRef} className="login-universe" aria-hidden="true" />
}

export default GoldUniverse
