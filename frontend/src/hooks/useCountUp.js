import { useEffect, useState } from 'react'

export default function useCountUp(target, duration = 1400, inView = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const isFloat = String(target).includes('.')
    const decimals = isFloat ? (String(target).split('.')[1] || '').length : 0

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target
      setValue(isFloat ? parseFloat(current.toFixed(decimals)) : Math.floor(current))
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return value
}
