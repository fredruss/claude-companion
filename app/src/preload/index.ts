import { contextBridge, ipcRenderer } from 'electron'
import type { Status, StatusCallback } from '../shared/types'

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
