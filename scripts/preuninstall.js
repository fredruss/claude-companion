#!/usr/bin/env node

/**
 * Claude Companion Pre-uninstall Script
 *
 * Removes Claude Code hooks configuration.
 * - Removes hook entries from ~/.claude/settings.json
 * - Deletes the copied hook script from ~/.claude-companion/hooks/
 * - Preserves ~/.claude-companion/status.json (user data)
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

const HOME = os.homedir()
const COMPANION_HOOKS_DIR = path.join(HOME, '.claude-companion', 'hooks')
const CLAUDE_DIR = path.join(HOME, '.claude')
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json')
const HOOK_SCRIPT = path.join(COMPANION_HOOKS_DIR, 'status-reporter.js')

function removeHookScript() {
  if (fs.existsSync(HOOK_SCRIPT)) {
    fs.unlinkSync(HOOK_SCRIPT)
    console.log(`Removed hook script: ${HOOK_SCRIPT}`)

    // Try to remove hooks directory if empty
    try {
      const files = fs.readdirSync(COMPANION_HOOKS_DIR)
      if (files.length === 0) {
        fs.rmdirSync(COMPANION_HOOKS_DIR)
        console.log(`Removed empty directory: ${COMPANION_HOOKS_DIR}`)
      }
    } catch {
      // Directory not empty or doesn't exist, that's fine
    }
  }
}

function removeHooksFromSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) {
    console.log('No settings.json found, nothing to clean up')
    return
  }

  let settings
  try {
    const content = fs.readFileSync(SETTINGS_FILE, 'utf8')
    settings = JSON.parse(content)
  } catch (err) {
    console.warn('Warning: Could not parse settings.json:', err.message)
    return
  }

  if (!settings.hooks) {
    console.log('No hooks configured, nothing to remove')
    return
  }

  let modified = false

  // Remove claude-companion hooks from each event type
  for (const eventName of ['PreToolUse', 'PostToolUse', 'Stop']) {
    if (!settings.hooks[eventName]) continue

    const originalLength = settings.hooks[eventName].length
    settings.hooks[eventName] = settings.hooks[eventName].filter((h) => {
      // Remove hooks that reference claude-companion
      const isCompanionHook = h.hooks?.some((hook) =>
        hook.command?.includes('claude-companion')
      )
      return !isCompanionHook
    })

    if (settings.hooks[eventName].length < originalLength) {
      modified = true
    }

    // Remove empty arrays
    if (settings.hooks[eventName].length === 0) {
      delete settings.hooks[eventName]
    }
  }

  // Remove empty hooks object
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks
  }

  if (modified) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    console.log(`Removed Claude Companion hooks from ${SETTINGS_FILE}`)
  } else {
    console.log('No Claude Companion hooks found in settings')
  }
}

function main() {
  console.log('\nRemoving Claude Companion hooks...\n')

  try {
    removeHooksFromSettings()
    removeHookScript()

    console.log('\nClaude Companion hooks removed.')
    console.log('Note: ~/.claude-companion/status.json was preserved.\n')
  } catch (err) {
    console.error('Error during uninstall:', err.message)
    // Don't exit with error - allow uninstall to continue
  }
}

main()
