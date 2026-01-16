import { useState, useEffect } from 'react'
import type { Status } from '../../shared/types'

export type { Status }

const defaultStatus: Status = {
  status: 'idle',
  action: 'Waiting for Claude Code...',
  timestamp: Date.now()
}

export function useStatus(): Status {
  const [status, setStatus] = useState<Status>(defaultStatus)

  useEffect(() => {
    // Get initial status
    window.electronAPI?.getStatus().then(setStatus).catch(() => {
      // Keep default status on error
    })

    // Subscribe to updates
    const unsubscribe = window.electronAPI?.onStatusUpdate((newStatus) => {
      setStatus(newStatus)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  return status
}
