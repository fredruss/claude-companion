import { contextBridge, ipcRenderer } from 'electron'

export interface Status {
  status: 'idle' | 'working' | 'reading' | 'done' | 'error'
  action: string
  timestamp: number
}

export type StatusCallback = (status: Status) => void

contextBridge.exposeInMainWorld('electronAPI', {
  getStatus: (): Promise<Status> => ipcRenderer.invoke('get-status'),
  onStatusUpdate: (callback: StatusCallback): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: Status): void => {
      callback(status)
    }
    ipcRenderer.on('status-update', handler)
    return () => {
      ipcRenderer.removeListener('status-update', handler)
    }
  },
  startDrag: (): void => {
    ipcRenderer.send('start-drag')
  }
})
