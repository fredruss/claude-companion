import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { watch } from 'chokidar'
import { readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'

const STATUS_DIR = join(homedir(), '.claude-companion')
const STATUS_FILE = join(STATUS_DIR, 'status.json')

let mainWindow: BrowserWindow | null = null

interface Status {
  status: 'idle' | 'working' | 'reading' | 'done' | 'error'
  action: string
  timestamp: number
}

async function ensureStatusDir(): Promise<void> {
  if (!existsSync(STATUS_DIR)) {
    await mkdir(STATUS_DIR, { recursive: true })
  }
}

async function readStatus(): Promise<Status> {
  try {
    const content = await readFile(STATUS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return { status: 'idle', action: 'Waiting for Claude Code...', timestamp: Date.now() }
  }
}

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: 200,
    height: 280,
    x: width - 220,
    y: height - 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Allow clicking through transparent areas
  mainWindow.setIgnoreMouseEvents(false)

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupStatusWatcher(): void {
  const watcher = watch(STATUS_FILE, {
    persistent: true,
    ignoreInitial: false
  })

  watcher.on('add', sendStatus)
  watcher.on('change', sendStatus)
}

async function sendStatus(): Promise<void> {
  if (!mainWindow) return
  const status = await readStatus()
  mainWindow.webContents.send('status-update', status)
}

// IPC handlers
ipcMain.handle('get-status', async () => {
  return await readStatus()
})

ipcMain.on('start-drag', () => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(false)
  }
})

app.whenReady().then(async () => {
  await ensureStatusDir()
  createWindow()
  setupStatusWatcher()

  // Send initial status
  setTimeout(sendStatus, 1000)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
