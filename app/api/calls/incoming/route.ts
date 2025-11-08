import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const callSid = formData.get('CallSid') as string

    console.log('Incoming call from:', from, 'CallSid:', callSid)

    const twiml = new VoiceResponse()

    // Greeting message in Urdu and English
    twiml.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US'
      },
      'Assalamualaikum. This is Iqra, Syed Eman Ali Shah\'s virtual assistant. How may I help you today?'
    )

    // Gather speech input
    const gather = twiml.gather({
      input: ['speech'],
      action: '/api/calls/process',
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US',
      enhanced: true
    })

    gather.say(
      {
        voice: 'Polly.Joanna'
      },
      'Please tell me the reason for your call.'
    )

    // If no input, repeat
    twiml.say(
      {
        voice: 'Polly.Joanna'
      },
      'I did not receive any input. Please call back. Goodbye.'
    )

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml'
      }
    })
  } catch (error) {
    console.error('Error handling incoming call:', error)
    return NextResponse.json(
      { error: 'Failed to handle incoming call' },
      { status: 500 }
    )
  }
}
