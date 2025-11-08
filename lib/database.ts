import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const LOGS_FILE = path.join(DATA_DIR, 'call-logs.json')

interface CallLog {
  id: string
  phoneNumber: string
  callerName?: string
  callSid: string
  timestamp: string
  duration: number
  topic: string
  category: 'important' | 'casual' | 'spam'
  notificationSent: boolean
  transcript?: string
  additionalInfo?: string
}

interface ActiveCall {
  callSid: string
  phoneNumber: string
  callerName?: string
  startTime: string
  duration?: string
}

let activeCalls: Map<string, ActiveCall> = new Map()

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Ensure logs file exists
async function ensureLogsFile() {
  try {
    await fs.access(LOGS_FILE)
  } catch {
    await fs.writeFile(LOGS_FILE, JSON.stringify([]))
  }
}

export async function getCallLogs(): Promise<CallLog[]> {
  try {
    await ensureDataDir()
    await ensureLogsFile()
    const data = await fs.readFile(LOGS_FILE, 'utf-8')
    const logs = JSON.parse(data)
    // Return sorted by timestamp descending
    return logs.sort((a: CallLog, b: CallLog) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    console.error('Error reading call logs:', error)
    return []
  }
}

export async function saveCallLog(log: Omit<CallLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    await ensureDataDir()
    await ensureLogsFile()

    const logs = await getCallLogs()
    const newLog: CallLog = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...log
    }

    logs.push(newLog)
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2))

    // Add to active calls
    activeCalls.set(log.callSid, {
      callSid: log.callSid,
      phoneNumber: log.phoneNumber,
      callerName: log.callerName,
      startTime: newLog.timestamp
    })
  } catch (error) {
    console.error('Error saving call log:', error)
    throw error
  }
}

export async function updateCallLog(callSid: string, updates: Partial<CallLog>): Promise<void> {
  try {
    const logs = await getCallLogs()
    const index = logs.findIndex(log => log.callSid === callSid)

    if (index !== -1) {
      logs[index] = { ...logs[index], ...updates }
      await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2))
    }

    // Remove from active calls if call ended
    if (updates.duration !== undefined) {
      activeCalls.delete(callSid)
    }
  } catch (error) {
    console.error('Error updating call log:', error)
    throw error
  }
}

export async function getActiveCall(): Promise<ActiveCall | null> {
  // Return the most recent active call
  if (activeCalls.size === 0) return null

  const calls = Array.from(activeCalls.values())
  const mostRecent = calls.sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )[0]

  // Calculate duration
  const duration = Math.floor(
    (Date.now() - new Date(mostRecent.startTime).getTime()) / 1000
  )
  const mins = Math.floor(duration / 60)
  const secs = duration % 60

  return {
    ...mostRecent,
    duration: `${mins}:${secs.toString().padStart(2, '0')}`
  }
}

// Clean up old active calls (older than 10 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [callSid, call] of activeCalls.entries()) {
    const age = now - new Date(call.startTime).getTime()
    if (age > 10 * 60 * 1000) {
      activeCalls.delete(callSid)
    }
  }
}, 60000) // Run every minute
