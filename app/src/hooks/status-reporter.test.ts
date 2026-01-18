// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { HookEvent } from '../../../src/shared/types'

// Mock fs and fs/promises before any imports that might use them
const mockExistsSync = vi.fn()
const mockWriteFile = vi.fn()
const mockMkdir = vi.fn()
const mockReadFile = vi.fn()

vi.mock('fs', () => ({
  default: { existsSync: mockExistsSync },
  existsSync: mockExistsSync
}))

vi.mock('fs/promises', () => ({
  default: {
    writeFile: mockWriteFile,
    mkdir: mockMkdir,
    readFile: mockReadFile
  },
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
  readFile: mockReadFile
}))

// Now import the module under test
const { handleEvent, parseTranscriptUsage } = await import('../../../src/hooks/status-reporter')

describe('handleEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExistsSync.mockReturnValue(true)
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns thinking state for UserPromptSubmit event', async () => {
    const event: HookEvent = {
      hook_event_name: 'UserPromptSubmit',
      user_prompt: 'Hello world'
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "thinking"')
    )
  })

  it('returns reading state for Read tool', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Read',
      tool_input: { file_path: '/path/to/file.ts' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "reading"')
    )
  })

  it('returns reading state for Glob tool', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Glob'
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "reading"')
    )
  })

  it('returns reading state for Grep tool', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Grep',
      tool_input: { pattern: 'searchPattern' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "reading"')
    )
  })

  it('returns working state for Edit tool', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Edit',
      tool_input: { file_path: '/path/to/file.ts' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "working"')
    )
  })

  it('returns working state for Write tool', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Write',
      tool_input: { file_path: '/path/to/file.ts' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "working"')
    )
  })

  it('returns working state for Bash tool', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command: 'npm test' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "working"')
    )
  })

  it('returns done state for Stop event', async () => {
    const event: HookEvent = {
      hook_event_name: 'Stop'
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "done"')
    )
  })

  it('extracts filename from file_path in tool_input for Read', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Read',
      tool_input: { file_path: '/path/to/myfile.ts' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('Reading myfile.ts')
    )
  })

  it('extracts filename from file_path for Write', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Write',
      tool_input: { file_path: '/some/path/newfile.js' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('Writing newfile.js')
    )
  })

  it('extracts filename from file_path for Edit', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Edit',
      tool_input: { file_path: '/deep/nested/path/component.tsx' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('Editing component.tsx')
    )
  })

  it('truncates long patterns in Grep tool', async () => {
    const longPattern = 'a'.repeat(30)
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Grep',
      tool_input: { pattern: longPattern }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining(`\\"${longPattern.slice(0, 20)}...\\"`)
    )
  })

  it('extracts command name from Bash tool', async () => {
    const event: HookEvent = {
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command: 'npm run build --production' }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('Running npm')
    )
  })

  it('returns waiting state for permission_prompt Notification', async () => {
    const event: HookEvent = {
      hook_event_name: 'Notification',
      notification_type: 'permission_prompt'
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "waiting"')
    )
  })

  it('returns waiting state for elicitation_dialog Notification', async () => {
    const event: HookEvent = {
      hook_event_name: 'Notification',
      notification_type: 'elicitation_dialog'
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "waiting"')
    )
  })

  it('returns error state for failed PostToolUse', async () => {
    const event: HookEvent = {
      hook_event_name: 'PostToolUse',
      tool_response: { success: false }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "error"')
    )
  })

  it('returns thinking state for successful PostToolUse', async () => {
    const event: HookEvent = {
      hook_event_name: 'PostToolUse',
      tool_response: { success: true }
    }

    await handleEvent(event)

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('status.json'),
      expect.stringContaining('"status": "thinking"')
    )
  })
})

describe('parseTranscriptUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for missing file', async () => {
    mockExistsSync.mockReturnValue(false)

    const result = await parseTranscriptUsage('/nonexistent/path.jsonl')

    expect(result).toBeNull()
  })

  it('returns null for undefined path', async () => {
    const result = await parseTranscriptUsage(undefined)

    expect(result).toBeNull()
  })

  it('sums tokens across multiple JSONL entries, including cache_read in input', async () => {
    mockExistsSync.mockReturnValue(true)
    const jsonlContent = [
      JSON.stringify({ message: { usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 20 } } }),
      JSON.stringify({ message: { usage: { input_tokens: 200, output_tokens: 100, cache_read_input_tokens: 30 } } }),
      JSON.stringify({ message: { usage: { input_tokens: 150, output_tokens: 75, cache_read_input_tokens: 10 } } })
    ].join('\n')

    mockReadFile.mockResolvedValue(jsonlContent)

    const result = await parseTranscriptUsage('/path/to/transcript.jsonl')

    // input includes both input_tokens and cache_read_input_tokens
    // (100+20) + (200+30) + (150+10) = 510
    expect(result).toEqual({
      input: 510,
      output: 225
    })
  })

  it('handles malformed JSON lines gracefully', async () => {
    mockExistsSync.mockReturnValue(true)
    const jsonlContent = [
      JSON.stringify({ message: { usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 20 } } }),
      'invalid json line',
      JSON.stringify({ message: { usage: { input_tokens: 200, output_tokens: 100, cache_read_input_tokens: 30 } } })
    ].join('\n')

    mockReadFile.mockResolvedValue(jsonlContent)

    const result = await parseTranscriptUsage('/path/to/transcript.jsonl')

    // input includes cache_read: (100+20) + (200+30) = 350
    expect(result).toEqual({
      input: 350,
      output: 150
    })
  })

  it('returns null when no token data present', async () => {
    mockExistsSync.mockReturnValue(true)
    const jsonlContent = [
      JSON.stringify({ message: { content: 'hello' } }),
      JSON.stringify({ message: { content: 'world' } })
    ].join('\n')

    mockReadFile.mockResolvedValue(jsonlContent)

    const result = await parseTranscriptUsage('/path/to/transcript.jsonl')

    expect(result).toBeNull()
  })

  it('handles empty lines in JSONL', async () => {
    mockExistsSync.mockReturnValue(true)
    const jsonlContent = [
      JSON.stringify({ message: { usage: { input_tokens: 100, output_tokens: 50 } } }),
      '',
      '  ',
      JSON.stringify({ message: { usage: { input_tokens: 200, output_tokens: 100 } } })
    ].join('\n')

    mockReadFile.mockResolvedValue(jsonlContent)

    const result = await parseTranscriptUsage('/path/to/transcript.jsonl')

    expect(result).toEqual({
      input: 300,
      output: 150
    })
  })

  it('handles missing optional fields', async () => {
    mockExistsSync.mockReturnValue(true)
    const jsonlContent = JSON.stringify({
      message: { usage: { input_tokens: 100, output_tokens: 50 } }
    })

    mockReadFile.mockResolvedValue(jsonlContent)

    const result = await parseTranscriptUsage('/path/to/transcript.jsonl')

    expect(result).toEqual({
      input: 100,
      output: 50
    })
  })

  it('deduplicates entries by requestId to avoid counting streaming chunks multiple times', async () => {
    mockExistsSync.mockReturnValue(true)
    // Simulate streaming: same requestId appears multiple times with same usage
    const jsonlContent = [
      JSON.stringify({ requestId: 'req-1', message: { usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 1000 } } }),
      JSON.stringify({ requestId: 'req-1', message: { usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 1000 } } }),
      JSON.stringify({ requestId: 'req-1', message: { usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 1000 } } }),
      JSON.stringify({ requestId: 'req-2', message: { usage: { input_tokens: 200, output_tokens: 100, cache_read_input_tokens: 2000 } } })
    ].join('\n')

    mockReadFile.mockResolvedValue(jsonlContent)

    const result = await parseTranscriptUsage('/path/to/transcript.jsonl')

    // Should only count each requestId once: (100+1000) + (200+2000) = 3300 input, 50+100 = 150 output
    expect(result).toEqual({
      input: 3300,
      output: 150
    })
  })
})
