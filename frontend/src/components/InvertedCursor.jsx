import { useEffect, useRef } from 'react'

export default function InvertedCursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = -200, my = -200
    let rx = -200, ry = -200
    let raf
    let hovering = false

    const onMove = (e) => { mx = e.clientX; my = e.clientY }

    const onOver = (e) => {
      const t = e.target.closest('a, button, [role="button"], input, textarea, select, label')
      hovering = !!t
    }

    const animate = () => {
      raf = requestAnimationFrame(animate)
      dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`
      rx += (mx - rx) * 0.14
      ry += (my - ry) * 0.14
      const size = hovering ? 56 : 36
      ring.style.transform = `translate(${rx - size / 2}px, ${ry - size / 2}px)`
      ring.style.width  = `${size}px`
      ring.style.height = `${size}px`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver)
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }
      `}</style>

      {/* Centre dot: snaps exactly to pointer */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />

      {/* Ring: grey-inversion backdrop, lags behind */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 36, height: 36,
          borderRadius: '50%',
          backdropFilter: 'invert(1) grayscale(1)',
          WebkitBackdropFilter: 'invert(1) grayscale(1)',
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform, width, height',
          transition: 'width 0.18s ease, height 0.18s ease',
          overflow: 'hidden',
        }}
      />
    </>
  )
}
