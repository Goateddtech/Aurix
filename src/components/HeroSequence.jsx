import React, { Suspense, useEffect, useRef, useState } from 'react'
import { heroScroll, clamp01, band } from '../lib/scrollState'
import { usePrefersReducedMotion } from '../lib/useReveal'

// three.js + the scene load as their own chunk; the blurred still frame
// covers the stage until the first rendered frame.
const HeroScene = React.lazy(() => import('../three/HeroScene'))

class CanvasBoundary extends React.Component {
  state = { err: false }
  static getDerivedStateFromError() {
    return { err: true }
  }
  componentDidCatch() {
    this.props.onError && this.props.onError()
  }
  render() {
    return this.state.err ? null : this.props.children
  }
}

function ScrollCue() {
  return (
    <div className="scroll-cue" aria-hidden="true">
      <span>Scroll</span>
      <i />
    </div>
  )
}

export default function HeroSequence() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <StaticHero />
  return <HeroInteractive />
}

function StaticHero() {
  return (
    <header className="hero-static" id="top">
      <img src="/aurix-can.jpg" alt="AURIX matte-black can on a dark marble pedestal" />
      <div className="hero-static-copy">
        <p className="kicker">Elderflower · Jalapeño · Citrus</p>
        <h1>Considered Indulgence.</h1>
        <p className="sub">
          Marine collagen and vitamin C, in a can built to be looked at twice.
        </p>
      </div>
    </header>
  )
}

function HeroInteractive() {
  const trackRef = useRef(null)
  const pa = useRef(null)
  const pb = useRef(null)
  const pc = useRef(null)
  const pd = useRef(null)
  const cue = useRef(null)
  const [ready, setReady] = useState(false)
  const [glFailed, setGlFailed] = useState(false)

  useEffect(() => {
    const apply = (el, o, y = 22) => {
      if (!el) return
      el.style.opacity = o.toFixed(3)
      el.style.transform = `translateY(${((1 - o) * y).toFixed(1)}px)`
      el.style.visibility = o <= 0.001 ? 'hidden' : 'visible'
    }
    const update = (p) => {
      heroScroll.p = p
      apply(pa.current, band(p, -2, -1, 0.03, 0.11))
      apply(pb.current, band(p, 0.27, 0.35, 0.46, 0.54))
      apply(pc.current, band(p, 0.5, 0.57, 0.67, 0.74))
      const dO = band(p, 0.9, 0.965, 9, 10)
      apply(pd.current, dO)
      if (pd.current) pd.current.style.pointerEvents = dO > 0.5 ? 'auto' : 'none'
      if (cue.current) cue.current.style.opacity = band(p, -2, -1, 0.01, 0.06).toFixed(3)
    }

    // debug/preview: /?p=0.5 pins the sequence at that progress value
    const q = new URLSearchParams(window.location.search).get('p')
    const forced = q !== null ? clamp01(parseFloat(q) || 0) : null
    heroScroll.forced = forced !== null

    const onScroll = () => {
      if (forced !== null) return update(forced)
      const track = trackRef.current
      if (!track) return
      const vh = window.innerHeight
      const total = Math.max(track.offsetHeight - vh, 1)
      update(clamp01(-track.getBoundingClientRect().top / total))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <header className="hero-track" ref={trackRef} id="top">
      <div className="hero-stage">
        <div
          className={`hero-backdrop${ready && !glFailed ? ' is-hidden' : ''}${
            glFailed ? ' is-fallback' : ''
          }`}
          style={{ backgroundImage: 'url(/aurix-can.jpg)' }}
        />
        {!glFailed && (
          <div className="hero-canvas">
            <CanvasBoundary onError={() => setGlFailed(true)}>
              <Suspense fallback={null}>
                <HeroScene onReady={() => setReady(true)} />
              </Suspense>
            </CanvasBoundary>
          </div>
        )}
        <div className="hero-vignette" />

        {/* Stage A — idle hero (title sits above the product, never over it) */}
        <div className="hero-panel hero-panel-a" ref={pa}>
          <p className="kicker">Elderflower · Jalapeño · Citrus</p>
          <h1>Considered Indulgence.</h1>
          <p className="sub">
            Marine collagen and vitamin C, in a can built to be looked at twice.
          </p>
        </div>
        <div className="hero-cue" ref={cue}>
          <ScrollCue />
        </div>

        {/* Stage B — after tumble #1 */}
        <div className="hero-panel hero-panel-side hero-panel-b" ref={pb}>
          <span className="panel-num">01</span>
          <h3>Botanicals, not flavor science.</h3>
          <p>
            Elderflower and citrus, cold-steeped — finished with a whisper of
            jalapeño heat. Nothing synthetic, nothing shouted.
          </p>
        </div>

        {/* Stage C — after tumble #2 */}
        <div className="hero-panel hero-panel-side hero-panel-c" ref={pc}>
          <span className="panel-num">02</span>
          <h3>Function, without the noise.</h3>
          <p>
            1,000&nbsp;mg marine collagen and 80&nbsp;mg vitamin&nbsp;C in every
            pour<sup>†</sup> — dosed for benefit, not for the front of the label.
          </p>
        </div>

        {/* Stage D — the finished drink */}
        <div className="hero-panel hero-panel-side hero-panel-d" ref={pd}>
          <span className="panel-num">03</span>
          <h3>Poured, not popped.</h3>
          <p>
            Aurix is built for the glass — a chilled coupe, a sugared rim, a
            minute you keep for yourself.
          </p>
          <a className="btn" href="#ritual">
            See the ritual
          </a>
        </div>
      </div>
    </header>
  )
}
