import { type ReactNode } from 'react'
import { Pet } from './components/Pet'
import { StatusBubble } from './components/StatusBubble'
import { useStatus } from './hooks/useStatus'
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
