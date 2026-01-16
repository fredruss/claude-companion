#!/bin/bash

# Claude Companion Hook Installation Script
# This script configures Claude Code to send events to the companion app

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
HOOK_SCRIPT="$PROJECT_DIR/hooks/status-reporter.js"

CLAUDE_DIR="$HOME/.claude"
CLAUDE_SETTINGS="$CLAUDE_DIR/settings.json"
COMPANION_DIR="$HOME/.claude-companion"

echo "Claude Companion Hook Installer"
echo "================================"
echo ""

# Create companion directory
echo "Creating companion directory..."
mkdir -p "$COMPANION_DIR"

# Create Claude directory if needed
mkdir -p "$CLAUDE_DIR"

# Check if settings file exists
if [ -f "$CLAUDE_SETTINGS" ]; then
    echo "Backing up existing settings to settings.json.backup..."
    cp "$CLAUDE_SETTINGS" "$CLAUDE_SETTINGS.backup"
fi

# Create new settings with hooks using node
HOOK_SCRIPT="$HOOK_SCRIPT" node << 'NODESCRIPT'
const fs = require('fs');
const path = require('path');
const os = require('os');

const claudeSettings = path.join(os.homedir(), '.claude', 'settings.json');
const hookScript = process.env.HOOK_SCRIPT;

let existing = {};
try {
    existing = JSON.parse(fs.readFileSync(claudeSettings, 'utf-8'));
} catch {
    // No existing settings
}

// Initialize hooks array if not exists
if (!existing.hooks) {
    existing.hooks = [];
}

// Remove any existing claude-companion hooks
existing.hooks = existing.hooks.filter(h => {
    // Check if any of the hooks in this entry reference our script
    if (h.hooks && Array.isArray(h.hooks)) {
        return !h.hooks.some(hook =>
            hook.command?.includes('status-reporter.js') ||
            hook.command?.includes('claude-companion')
        );
    }
    return true;
});

// Add our hooks for each event type
const events = ['PreToolUse', 'PostToolUse', 'Stop'];
events.forEach(event => {
    existing.hooks.push({
        matcher: event,
        hooks: [{
            type: 'command',
            command: `node "${hookScript}"`
        }]
    });
});

fs.writeFileSync(claudeSettings, JSON.stringify(existing, null, 2));
console.log('Settings updated successfully!');
NODESCRIPT

echo ""
echo "Hook configuration:"
echo "  Script: $HOOK_SCRIPT"
echo "  Settings: $CLAUDE_SETTINGS"
echo "  Status file: $COMPANION_DIR/status.json"
echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' in the app/ directory to start the companion"
echo "  2. Start a Claude Code session to see the companion react to events"
