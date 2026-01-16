import { type ReactNode } from 'react'
import { useAutoHide } from '../hooks/useAutoHide'
import type { PetState } from '../../shared/types'
import './StatusBubble.css'

interface StatusBubbleProps {
  action: string
  status: PetState
}

const HIDE_DELAY = 10000 // Hide bubble after 10 seconds of idle

export function StatusBubble({ action, status }: StatusBubbleProps): ReactNode {
  const visible = useAutoHide(status === 'idle', HIDE_DELAY, [action, status])

  if (!visible) {
    return null
  }

  return (
    <div className={`status-bubble status-${status}`}>
      <div className="bubble-content">
        {action}
      </div>
      <div className="bubble-tail" />
    </div>
  )
}
