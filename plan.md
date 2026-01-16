# Claude Companion - Implementation Plan

## Overview
A cute desktop pet companion that shows Claude Code's real-time status in an always-visible floating window.

**Choices:**
- Visual style: Cute mascot/character with animations
- Tech stack: Electron + React
- UI: Always-visible floating window (desktop pet style)

## Architecture

```
┌─────────────────┐      JSON file       ┌──────────────────┐
│   Claude Code   │  ───────────────────▶│  Desktop Pet     │
│   (Terminal)    │  ~/.claude-companion │  (Floating)      │
│                 │       /status.json   │                  │
│  [Hooks fire    │                      │  [Watches file,  │
│   on events]    │                      │   animates pet]  │
└─────────────────┘                      └──────────────────┘
```

### Part 1: Claude Code Hooks
Configure hooks to write status updates to a JSON file on key events:

- **PreToolUse** → "Working: Reading file X" / "Editing Y" / "Running command"
- **PostToolUse** → Tool completed (update progress)
- **UserPromptSubmit** → "Received new task"
- **Stop** → "Done! Waiting for next task"
- **SessionStart/End** → "Session started" / "Session ended"

Status file format (`~/.claude-companion/status.json`):
```json
{
  "status": "working",           // idle | working | thinking | done
  "action": "Editing",           // Current action
  "detail": "src/index.ts",      // File/command being worked on
  "tool": "Edit",                // Tool name
  "timestamp": 1705412345000,
  "session_id": "abc123"
}
```

### Part 2: Desktop Pet App (macOS)

**Tech: Electron + React**

Features:
1. **Always-on-top floating window** - Small, draggable, transparent background
   - Can be positioned anywhere on screen
   - Stays visible while you work in other apps
   - Click-through option so it doesn't interfere

2. **Animated mascot** with states:
   - **Idle**: Relaxed pose, maybe gentle breathing animation
   - **Working**: Typing/coding animation, focused expression
   - **Reading**: Looking at something, thinking pose
   - **Done**: Happy celebration, thumbs up
   - **Error**: Worried/confused expression

3. **Status bubble** - Small speech/thought bubble showing:
   - Current action ("Reading src/index.ts...")
   - Progress indicator for longer tasks

4. **File watcher** - Uses `chokidar` to watch status.json, triggers animations

### Project Structure
```
claude-companion/
├── hooks/
│   └── status-reporter.js      # Hook script (Node.js for easy JSON handling)
├── app/
│   ├── package.json
│   ├── electron/
│   │   ├── main.ts             # Electron main process
│   │   └── preload.ts
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── Pet.tsx         # Animated mascot component
│       │   ├── StatusBubble.tsx
│       │   └── Window.tsx      # Draggable window controls
│       ├── hooks/
│       │   └── useStatus.ts    # File watcher hook
│       └── assets/
│           └── pet/            # Character sprites/animations
│               ├── idle.gif (or CSS/Lottie animations)
│               ├── working.gif
│               ├── reading.gif
│               ├── done.gif
│               └── error.gif
├── scripts/
│   └── install-hooks.sh        # Sets up Claude Code hooks
└── README.md
```

## Implementation Steps

### Step 1: Project setup
- Initialize project with `npm init`
- Set up Electron + React (using electron-vite for fast builds)
- Configure TypeScript

### Step 2: Create hook script (`hooks/status-reporter.js`)
A Node.js script that:
- Reads JSON from stdin (hook input from Claude Code)
- Determines status based on event type and tool
- Writes to `~/.claude-companion/status.json`

```js
// Example: Map tool names to friendly actions
const toolActions = {
  Read: 'reading',
  Edit: 'editing',
  Write: 'writing',
  Bash: 'running command',
  Grep: 'searching',
  Glob: 'finding files'
};
```

### Step 3: Configure hooks
Create installer script that adds to `~/.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "*", "hooks": [{ "type": "command", "command": "node /path/to/status-reporter.js pre" }] }],
    "PostToolUse": [{ "matcher": "*", "hooks": [{ "type": "command", "command": "node /path/to/status-reporter.js post" }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "node /path/to/status-reporter.js stop" }] }],
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "node /path/to/status-reporter.js start" }] }],
    "SessionEnd": [{ "hooks": [{ "type": "command", "command": "node /path/to/status-reporter.js end" }] }]
  }
}
```

### Step 4: Build Electron desktop pet window
- Create frameless, transparent, always-on-top BrowserWindow
- Make window draggable
- Set up IPC for file watching (main process watches, sends to renderer)

```ts
// Electron main.ts key settings
const win = new BrowserWindow({
  width: 200,
  height: 250,
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  skipTaskbar: true,
  resizable: false,
});
```

### Step 5: Build React UI
- `Pet.tsx`: Animated character component (CSS animations or GIFs)
- `StatusBubble.tsx`: Speech bubble with current action
- `useStatus.ts`: Hook that receives status updates via IPC

### Step 6: Create/source mascot assets
Options:
- Simple CSS-animated character (bouncing blob, geometric pet)
- GIF sprites for each state
- Lottie animations (more polished)
- Could start simple and iterate!

### Step 7: Polish & package
- Add tray icon for quick access/quit
- Package as .dmg with electron-builder
- Optional: auto-launch on login

## Verification
1. Install hooks, run Claude Code, give it a task
2. Check `~/.claude-companion/status.json` updates in real-time
3. Verify pet window shows correct status and animates
4. Test all states: idle → working (various tools) → done
5. Test window dragging, always-on-top behavior

## Nice-to-Have (Future)
- Click pet to open detailed activity log
- Sound effects (optional, toggleable)
- Multiple pet skins/themes
- Pet "moods" based on task success/failure rate

## Resources
- [Claude Code Hooks Docs](https://code.claude.com/docs/en/hooks)
- [Electron + React setup](https://electron-vite.org/)
- [chokidar file watcher](https://github.com/paulmillr/chokidar)
