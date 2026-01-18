export type PetState = 'idle' | 'thinking' | 'working' | 'reading' | 'waiting' | 'done' | 'error'

export interface TokenUsage {
  input: number
  output: number
  cacheRead?: number // Legacy field, now folded into input
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
