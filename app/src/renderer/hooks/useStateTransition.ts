import { useState, useEffect } from 'react'

const TRANSITION_DURATION = 150

interface StateTransitionResult<T> {
  currentState: T
  isTransitioning: boolean
}

export function useStateTransition<T>(targetState: T): StateTransitionResult<T> {
  const [currentState, setCurrentState] = useState<T>(targetState)

  useEffect(() => {
    if (targetState !== currentState) {
      const timer = setTimeout(() => {
        setCurrentState(targetState)
      }, TRANSITION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [targetState, currentState])

  const isTransitioning = targetState !== currentState

  return { currentState, isTransitioning }
}
