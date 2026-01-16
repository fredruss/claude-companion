export type PetState = 'idle' | 'thinking' | 'working' | 'reading' | 'waiting' | 'done' | 'error'

export interface Status {
  status: PetState
  action: string
  timestamp: number
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
