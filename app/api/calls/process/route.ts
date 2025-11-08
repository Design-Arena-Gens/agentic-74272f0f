import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { analyzeCallIntent, generateResponse } from '@/lib/ai'
import { saveCallLog } from '@/lib/database'
import { sendNotification } from '@/lib/notifications'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const callSid = formData.get('CallSid') as string
    const speechResult = formData.get('SpeechResult') as string

    console.log('Processing call:', { from, callSid, speechResult })

    if (!speechResult) {
      const twiml = new VoiceResponse()
      twiml.say(
        { voice: 'Polly.Joanna' },
        'I could not understand you. Please call back. Goodbye.'
      )
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Analyze the intent
    const analysis = await analyzeCallIntent(speechResult)

    // Generate appropriate response
    const aiResponse = await generateResponse(speechResult, analysis)

    // Save call log
    await saveCallLog({
      phoneNumber: from,
      callSid,
      transcript: speechResult,
      category: analysis.category,
      topic: analysis.topic,
      callerName: analysis.callerName,
      duration: 0, // Will be updated when call ends
      notificationSent: analysis.category === 'important'
    })

    // Send notification if important
    if (analysis.category === 'important') {
      await sendNotification({
        phoneNumber: from,
        callerName: analysis.callerName,
        topic: analysis.topic,
        summary: analysis.summary,
        timestamp: new Date().toISOString()
      })
    }

    // Create response TwiML
    const twiml = new VoiceResponse()

    if (analysis.needsMoreInfo) {
      twiml.say({ voice: 'Polly.Joanna' }, aiResponse)

      const gather = twiml.gather({
        input: ['speech'],
        action: '/api/calls/followup',
        method: 'POST',
        speechTimeout: 'auto',
        language: 'en-US'
      })

      gather.say(
        { voice: 'Polly.Joanna' },
        'Please provide more details.'
      )
    } else {
      twiml.say({ voice: 'Polly.Joanna' }, aiResponse)

      if (analysis.category !== 'important') {
        twiml.say(
          { voice: 'Polly.Joanna' },
          'Thank you for reaching out. Have a peaceful day ahead. Allah Hafiz.'
        )
      } else {
        twiml.say(
          { voice: 'Polly.Joanna' },
          'I have notified Mr. Shah about your call. He will get back to you shortly. Thank you for calling.'
        )
      }

      twiml.hangup()
    }

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
  } catch (error) {
    console.error('Error processing call:', error)

    const twiml = new VoiceResponse()
    twiml.say(
      { voice: 'Polly.Joanna' },
      'I apologize, but I am experiencing technical difficulties. Please try calling back later. Goodbye.'
    )

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}
