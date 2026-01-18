import { type ReactNode } from 'react'
import { useAutoHide } from '../hooks/useAutoHide'
import type { TokenUsage, PetState } from '../../shared/types'
import './TokenBadge.css'

interface TokenBadgeProps {
  usage: TokenUsage | undefined
  status: PetState
}

const HIDE_DELAY = 10000 // Hide badge after 10 seconds of idle

/**
 * Format token count in compact form: 1234 → "1.2k", 1234567 → "1.2M"
 */
function formatTokens(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`
  }
  return count.toString()
}

export function TokenBadge({ usage, status }: TokenBadgeProps): ReactNode {
  const visible = useAutoHide(status === 'idle', HIDE_DELAY, [usage, status])

  // Don't show if no usage data or not visible
  if (!usage || !visible) {
    return null
  }

  // Show context size (input includes cache_read_input_tokens)
  const totalTokens = usage.input

  return (
    <div className="token-badge">
      {formatTokens(totalTokens)}
    </div>
  )
}
