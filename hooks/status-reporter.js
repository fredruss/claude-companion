#!/usr/bin/env node

/**
 * Claude Companion Status Reporter Hook
 *
 * This script receives events from Claude Code hooks and writes
 * status updates to ~/.claude-companion/status.json
 *
 * Hook events received via stdin as JSON:
 * - UserPromptSubmit: When the user submits a prompt
 * - PreToolUse: Before a tool is used
 * - PostToolUse: After a tool completes
 * - Stop: When Claude stops responding
 * - SessionStart: When a session starts
 * - SessionEnd: When a session ends
 */

const { writeFile, mkdir } = require('fs/promises')
const { existsSync } = require('fs')
const { join } = require('path')
const { homedir } = require('os')

const STATUS_DIR = join(homedir(), '.claude-companion')
const STATUS_FILE = join(STATUS_DIR, 'status.json')

// Tool name to human-readable action mapping
const TOOL_ACTIONS = {
  Read: 'Reading file...',
  Write: 'Writing file...',
  Edit: 'Editing code...',
  Bash: 'Running command...',
  Glob: 'Searching files...',
  Grep: 'Searching code...',
  WebFetch: 'Fetching web page...',
  WebSearch: 'Searching the web...',
  Task: 'Working on subtask...',
  TodoWrite: 'Planning tasks...',
  AskUserQuestion: 'Asking a question...',
  mcp__ide__getDiagnostics: 'Checking diagnostics...',
  mcp__ide__executeCode: 'Executing code...'
}

// Map tool names to pet states
const TOOL_STATES = {
  Read: 'reading',
  Glob: 'reading',
  Grep: 'reading',
  WebFetch: 'reading',
  WebSearch: 'reading',
  Write: 'working',
  Edit: 'working',
  Bash: 'working',
  Task: 'working',
  TodoWrite: 'working',
  AskUserQuestion: 'idle',
  mcp__ide__getDiagnostics: 'reading',
  mcp__ide__executeCode: 'working'
}

async function ensureStatusDir() {
  if (!existsSync(STATUS_DIR)) {
    await mkdir(STATUS_DIR, { recursive: true })
  }
}

async function writeStatus(status, action) {
  await ensureStatusDir()
  const data = {
    status,
    action,
    timestamp: Date.now()
  }
  await writeFile(STATUS_FILE, JSON.stringify(data, null, 2))
}

async function handleEvent(event) {
  const { hook_event_name, tool_name, tool_input, tool_response, user_prompt } = event

  switch (hook_event_name) {
    case 'UserPromptSubmit': {
      let action = 'Thinking...'
      // Optionally show truncated prompt
      if (user_prompt && user_prompt.length > 0) {
        const truncated = user_prompt.slice(0, 30)
        action = `Thinking about: "${truncated}${user_prompt.length > 30 ? '...' : ''}"`
      }
      await writeStatus('thinking', action)
      break
    }

    case 'PreToolUse': {
      const state = TOOL_STATES[tool_name] || 'working'
      let action = TOOL_ACTIONS[tool_name] || `Using ${tool_name}...`

      // Add more context for specific tools
      if (tool_name === 'Read' && tool_input?.file_path) {
        const filename = tool_input.file_path.split('/').pop()
        action = `Reading ${filename}...`
      } else if (tool_name === 'Write' && tool_input?.file_path) {
        const filename = tool_input.file_path.split('/').pop()
        action = `Writing ${filename}...`
      } else if (tool_name === 'Edit' && tool_input?.file_path) {
        const filename = tool_input.file_path.split('/').pop()
        action = `Editing ${filename}...`
      } else if (tool_name === 'Bash' && tool_input?.command) {
        const cmd = tool_input.command.split(' ')[0]
        action = `Running ${cmd}...`
      } else if (tool_name === 'Grep' && tool_input?.pattern) {
        action = `Searching for "${tool_input.pattern.slice(0, 20)}${tool_input.pattern.length > 20 ? '...' : ''}"...`
      }

      await writeStatus(state, action)
      break
    }

    case 'PostToolUse': {
      if (tool_response && tool_response.success === false) {
        await writeStatus('error', 'Something went wrong...')
      }
      // Don't change status on successful completion - wait for next action
      break
    }

    case 'Stop': {
      // Stop event just indicates Claude finished - show "done" state
      await writeStatus('done', 'All done!')
      break
    }

    case 'SessionStart': {
      await writeStatus('idle', 'Session started!')
      break
    }

    case 'SessionEnd': {
      await writeStatus('idle', 'Session ended')
      break
    }

    default:
      // Unknown event, ignore
      break
  }
}

// Read JSON from stdin
async function main() {
  let input = ''

  process.stdin.setEncoding('utf8')

  for await (const chunk of process.stdin) {
    input += chunk
  }

  if (!input.trim()) {
    process.exit(0)
  }

  try {
    const event = JSON.parse(input)
    await handleEvent(event)
  } catch (err) {
    console.error('Failed to parse event:', err.message)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Hook error:', err)
  process.exit(1)
})
