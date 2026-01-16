import { useState, useEffect } from 'react'

const TRANSITION_DURATION = 150

interface StateTransitionResult<T> {
  currentState: T
  isTransitioning: boolean
}

export function useStateTransition<T>(targetState: T): StateTransitionResult<T> {
  const [currentState, setCurrentState] = useState<T>(targetState)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (targetState !== currentState) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setCurrentState(targetState)
        setIsTransitioning(false)
      }, TRANSITION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [targetState, currentState])

  return { currentState, isTransitioning }
}
