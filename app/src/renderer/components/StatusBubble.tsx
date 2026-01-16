import { useState, useEffect, type ReactNode } from 'react'
import './StatusBubble.css'

interface StatusBubbleProps {
  action: string
  status: 'idle' | 'working' | 'reading' | 'done' | 'error'
}

const HIDE_DELAY = 10000 // Hide bubble after 10 seconds of idle

export function StatusBubble({ action, status }: StatusBubbleProps): ReactNode {
  const [visible, setVisible] = useState(true)
  const [displayText, setDisplayText] = useState(action)

  useEffect(() => {
    setVisible(true)
    setDisplayText(action)

    // Auto-hide after delay when idle
    if (status === 'idle') {
      const timer = setTimeout(() => {
        setVisible(false)
      }, HIDE_DELAY)
      return () => clearTimeout(timer)
    }
  }, [action, status])

  if (!visible) {
    return null
  }

  return (
    <div className={`status-bubble status-${status}`}>
      <div className="bubble-content">
        {displayText}
      </div>
      <div className="bubble-tail" />
    </div>
  )
}
