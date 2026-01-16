# Claude Companion

A desktop pet that shows Claude Code's real-time status. Watch your little companion read, write, and work alongside you!

## Installation

```bash
npm install -g claude-companion
```

This will:
1. Install the desktop pet application
2. Configure Claude Code hooks automatically
3. Add the `claude-companion` command to your PATH

## Usage

Launch the desktop pet:

```bash
claude-companion
```

The pet window will appear and float on top of other windows. It automatically updates based on what Claude Code is doing:

- **Reading** - Claude is reading files or searching code
- **Working** - Claude is writing, editing, or running commands
- **Idle** - Claude is waiting for input
- **Done** - Claude finished a task
- **Error** - Something went wrong

### Controls

- **Drag** - Click and drag the pet to move it around your screen
- **Close** - The pet runs as a detached process; close it from your system tray or task manager

## How It Works

Claude Companion uses Claude Code's hook system to receive real-time events:

```
Claude Code (Terminal) --[hooks]--> status.json <--[watching]-- Desktop Pet (Electron)
```

1. When you use Claude Code, hooks send events to a status reporter script
2. The script writes status updates to `~/.claude-companion/status.json`
3. The Electron app watches this file and updates the pet's expression

## Uninstallation

```bash
npm uninstall -g claude-companion
```

This removes the hooks from your Claude Code settings and cleans up installed files.

## Requirements

- Node.js 18 or later
- Claude Code CLI

## Troubleshooting

### Pet doesn't update when using Claude Code

Check that the hooks are configured in `~/.claude/settings.json`:

```bash
cat ~/.claude/settings.json | grep claude-companion
```

If hooks are missing, try reinstalling:

```bash
npm uninstall -g claude-companion
npm install -g claude-companion
```

### Pet window doesn't appear

Make sure Electron can run on your system. On macOS, you may need to allow the app in System Preferences > Security & Privacy.

## Development

For local development:

```bash
# Clone the repository
git clone https://github.com/your-username/claude-companion
cd claude-companion

# Install app dependencies
cd app
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Copy built output to root
cd ..
cp -r app/out .
```

## License

MIT
