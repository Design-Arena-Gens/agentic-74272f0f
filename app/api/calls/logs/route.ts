import { NextResponse } from 'next/server'
import { getCallLogs } from '@/lib/database'

export async function GET() {
  try {
    const logs = await getCallLogs()
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching call logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call logs' },
      { status: 500 }
    )
  }
}
