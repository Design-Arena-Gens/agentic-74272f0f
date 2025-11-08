import { NextResponse } from 'next/server'
import { getActiveCall } from '@/lib/database'

export async function GET() {
  try {
    const activeCall = await getActiveCall()
    return NextResponse.json({ activeCall })
  } catch (error) {
    console.error('Error fetching active call:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active call' },
      { status: 500 }
    )
  }
}
