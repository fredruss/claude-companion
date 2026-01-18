export type PetState = 'idle' | 'thinking' | 'working' | 'reading' | 'waiting' | 'done' | 'error'

export interface TokenUsage {
  context: number // Total context tokens (input + cache_creation + cache_read)
  output: number
}

export interface Status {
  status: PetState
  action: string
  timestamp: number
  usage?: TokenUsage
}

export type StatusCallback = (status: Status) => void

export interface ElectronAPI {
  getStatus: () => Promise<Status>
  onStatusUpdate: (callback: StatusCallback) => () => void
  startDrag: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
