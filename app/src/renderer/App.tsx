import { type ReactNode } from 'react'
import { Pet, StatusBubble } from './components'
import { useStatus } from './hooks'
import './App.css'

function App(): ReactNode {
  const status = useStatus()

  return (
    <div className="app-container">
      <StatusBubble action={status.action} status={status.status} />
      <Pet state={status.status} />
    </div>
  )
}

export default App
