import { useState, useEffect, type ReactNode } from 'react'
import './Pet.css'

type PetState = 'idle' | 'working' | 'reading' | 'done' | 'error'

interface PetProps {
  state: PetState
}

// Simple SVG-based pet faces for MVP (can be replaced with image packs later)
const petFaces: Record<PetState, ReactNode> = {
  idle: (
    <svg viewBox="0 0 100 100" className="pet-svg">
      <circle cx="50" cy="50" r="45" fill="#FFB347" />
      <circle cx="35" cy="40" r="5" fill="#333" />
      <circle cx="65" cy="40" r="5" fill="#333" />
      <path d="M 35 60 Q 50 70 65 60" stroke="#333" strokeWidth="3" fill="none" />
    </svg>
  ),
  working: (
    <svg viewBox="0 0 100 100" className="pet-svg">
      <circle cx="50" cy="50" r="45" fill="#87CEEB" />
      <circle cx="35" cy="40" r="5" fill="#333" />
      <circle cx="65" cy="40" r="5" fill="#333" />
      <path d="M 35 62 Q 50 75 65 62" stroke="#333" strokeWidth="3" fill="none" />
      <text x="50" y="85" textAnchor="middle" fontSize="12" fill="#333">...</text>
    </svg>
  ),
  reading: (
    <svg viewBox="0 0 100 100" className="pet-svg">
      <circle cx="50" cy="50" r="45" fill="#DDA0DD" />
      <ellipse cx="35" cy="40" rx="8" ry="5" fill="#333" />
      <ellipse cx="65" cy="40" rx="8" ry="5" fill="#333" />
      <circle cx="37" cy="39" r="2" fill="#fff" />
      <circle cx="67" cy="39" r="2" fill="#fff" />
      <path d="M 40 60 L 60 60" stroke="#333" strokeWidth="2" />
    </svg>
  ),
  done: (
    <svg viewBox="0 0 100 100" className="pet-svg">
      <circle cx="50" cy="50" r="45" fill="#90EE90" />
      <path d="M 30 40 Q 35 35 40 40" stroke="#333" strokeWidth="2" fill="none" />
      <path d="M 60 40 Q 65 35 70 40" stroke="#333" strokeWidth="2" fill="none" />
      <path d="M 30 60 Q 50 80 70 60" stroke="#333" strokeWidth="3" fill="none" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 100 100" className="pet-svg">
      <circle cx="50" cy="50" r="45" fill="#FFB6C1" />
      <line x1="30" y1="35" x2="40" y2="45" stroke="#333" strokeWidth="3" />
      <line x1="40" y1="35" x2="30" y2="45" stroke="#333" strokeWidth="3" />
      <line x1="60" y1="35" x2="70" y2="45" stroke="#333" strokeWidth="3" />
      <line x1="70" y1="35" x2="60" y2="45" stroke="#333" strokeWidth="3" />
      <path d="M 35 70 Q 50 60 65 70" stroke="#333" strokeWidth="3" fill="none" />
    </svg>
  )
}

export function Pet({ state }: PetProps): ReactNode {
  const [currentState, setCurrentState] = useState<PetState>(state)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (state !== currentState) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setCurrentState(state)
        setIsTransitioning(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [state, currentState])

  return (
    <div className={`pet-container ${isTransitioning ? 'transitioning' : ''} pet-${currentState}`}>
      {petFaces[currentState]}
    </div>
  )
}
