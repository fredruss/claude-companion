#!/usr/bin/env node

/**
 * Claude Companion CLI Launcher
 *
 * Launches the Electron desktop pet app as a detached process
 * so it continues running after the terminal is closed.
 */

const { spawn } = require('child_process')
const path = require('path')

// Get the electron binary path from the installed electron package
const electronPath = require('electron')

// Path to the built Electron app
const appPath = path.join(__dirname, '..', 'out', 'main', 'index.js')

// Spawn Electron as a detached process
const child = spawn(electronPath, [appPath], {
  detached: true,
  stdio: 'ignore'
})

// Unref to allow the parent process to exit independently
child.unref()

console.log('Claude Companion launched!')
