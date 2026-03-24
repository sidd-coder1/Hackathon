import { useEffect, useRef } from 'react'

/**
 * TricolorAurora
 * ──────────────
 * Three soft glowing orbs (saffron, white, green) that lazily drift
 * toward the user's cursor/finger.  Rendered on a fixed canvas that sits
 * behind ALL page content (z-index: -1) so nothing is disturbed.
 *
 * Pure CSS + requestAnimationFrame — zero external dependencies.
 */
export default function TricolorAurora() {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // ── Orb state ──────────────────────────────────────────────────────────
    const orbs = [
      // saffron
      { el: el.children[0], tx: window.innerWidth * 0.7,  ty: window.innerHeight * 0.25, x: window.innerWidth * 0.7,  y: window.innerHeight * 0.25, speed: 0.055 },
      // white
      { el: el.children[1], tx: window.innerWidth * 0.5,  ty: window.innerHeight * 0.5,  x: window.innerWidth * 0.5,  y: window.innerHeight * 0.5,  speed: 0.040 },
      // green
      { el: el.children[2], tx: window.innerWidth * 0.3,  ty: window.innerHeight * 0.75, x: window.innerWidth * 0.3,  y: window.innerHeight * 0.75, speed: 0.065 },
    ]

    // Offsets so orbs fan out around the cursor instead of piling up
    const offsets = [
      { dx: -120, dy: -80  },
      { dx:  60,  dy:  40  },
      { dx:  80,  dy: -120 },
    ]

    let mouseX = window.innerWidth  / 2
    let mouseY = window.innerHeight / 2
    let rafId  = null

    // ── Track pointer (mouse + touch) ──────────────────────────────────────
    const onMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY }
    const onTouchMove = (e) => {
      if (e.touches.length) {
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove',  onTouchMove, { passive: true })

    // ── Animation loop ─────────────────────────────────────────────────────
    const tick = () => {
      orbs.forEach((orb, i) => {
        const { dx, dy } = offsets[i]
        orb.tx = mouseX + dx
        orb.ty = mouseY + dy

        // Lerp toward target
        orb.x += (orb.tx - orb.x) * orb.speed
        orb.y += (orb.ty - orb.y) * orb.speed

        // Centre the orb on the interpolated position (orb is 600 px wide)
        orb.el.style.transform = `translate(${orb.x - 300}px, ${orb.y - 300}px)`
      })
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove',  onTouchMove)
    }
  }, [])

  return (
    /*
     * Fixed container — sits behind everything with z-index -1.
     * pointer-events:none so it never blocks clicks.
     */
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:          0,
        zIndex:        -1,
        overflow:      'hidden',
        pointerEvents: 'none',
        willChange:    'transform',
      }}
    >
      {/* Saffron orb */}
      <div style={orbStyle('#FF9933', 0.20)} />
      {/* White orb — very subtle, just a soft brightness lift */}
      <div style={orbStyle('#FFFFFF', 0.18)} />
      {/* Green orb */}
      <div style={orbStyle('#138808', 0.18)} />
    </div>
  )
}

/** Returns inline styles for a single aurora orb */
function orbStyle(color, opacity) {
  return {
    position:        'absolute',
    top:              0,
    left:             0,
    width:           '600px',
    height:          '600px',
    borderRadius:    '50%',
    background:      `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    opacity,
    filter:          'blur(80px)',
    willChange:      'transform',
    /* GPU-accelerated — no layout thrash */
    transform:       'translate(-9999px, -9999px)',
  }
}
