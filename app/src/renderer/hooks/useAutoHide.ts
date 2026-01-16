import { useState, useEffect } from 'react'

export function useAutoHide(shouldHide: boolean, delay: number, dependencies: unknown[]): boolean {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)

    if (shouldHide) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, delay)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldHide, delay, ...dependencies])

  return visible
}
