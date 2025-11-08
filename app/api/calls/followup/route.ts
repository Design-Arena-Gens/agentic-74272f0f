import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { generateResponse } from '@/lib/ai'
import { updateCallLog } from '@/lib/database'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const callSid = formData.get('CallSid') as string
    const speechResult = formData.get('SpeechResult') as string

    console.log('Follow-up response:', { from, callSid, speechResult })

    if (!speechResult) {
      const twiml = new VoiceResponse()
      twiml.say(
        { voice: 'Polly.Joanna' },
        'Thank you for your time. Goodbye.'
      )
      twiml.hangup()
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Update call log with additional info
    await updateCallLog(callSid, {
      additionalInfo: speechResult
    })

    // Generate response - just use a default response for follow-up
    const aiResponse = "Thank you for the additional information. I have recorded everything. Mr. Shah will be in touch with you soon."

    const twiml = new VoiceResponse()
    twiml.say({ voice: 'Polly.Joanna' }, aiResponse)
    twiml.say(
      { voice: 'Polly.Joanna' },
      'Thank you for the information. Have a peaceful day ahead. Allah Hafiz.'
    )
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
  } catch (error) {
    console.error('Error in follow-up:', error)

    const twiml = new VoiceResponse()
    twiml.say({ voice: 'Polly.Joanna' }, 'Thank you. Goodbye.')
    twiml.hangup()

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}
