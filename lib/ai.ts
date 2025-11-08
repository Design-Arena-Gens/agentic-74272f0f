interface CallAnalysis {
  category: 'important' | 'casual' | 'spam'
  topic: string
  callerName?: string
  summary: string
  needsMoreInfo: boolean
}

const IMPORTANT_KEYWORDS = [
  'urgent', 'emergency', 'business', 'meeting', 'interview', 'job', 'project',
  'client', 'deadline', 'important', 'contract', 'proposal', 'deal',
  'payment', 'invoice', 'delivery', 'order', 'appointment'
]

const SPAM_KEYWORDS = [
  'lottery', 'prize', 'winner', 'congratulations', 'free', 'offer',
  'promotion', 'discount', 'sale', 'limited time', 'act now',
  'credit card', 'loan', 'debt', 'insurance', 'warranty'
]

export async function analyzeCallIntent(transcript: string): Promise<CallAnalysis> {
  const lowerTranscript = transcript.toLowerCase()

  // Check for spam indicators
  const isSpam = SPAM_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))
  if (isSpam) {
    return {
      category: 'spam',
      topic: 'Promotional/Spam call',
      summary: transcript.substring(0, 100),
      needsMoreInfo: false
    }
  }

  // Check for important indicators
  const isImportant = IMPORTANT_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))

  // Extract caller name if mentioned
  const nameMatch = transcript.match(/(?:my name is|I am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
  const callerName = nameMatch ? nameMatch[1] : undefined

  // Determine if needs more info
  const needsMoreInfo = transcript.split(' ').length < 10

  return {
    category: isImportant ? 'important' : 'casual',
    topic: extractTopic(transcript),
    callerName,
    summary: transcript.substring(0, 150),
    needsMoreInfo
  }
}

function extractTopic(transcript: string): string {
  const lowerTranscript = transcript.toLowerCase()

  // Common topics
  const topics = [
    { keywords: ['meeting', 'appointment', 'schedule'], topic: 'Meeting/Appointment Request' },
    { keywords: ['job', 'interview', 'position', 'hiring'], topic: 'Job/Interview Related' },
    { keywords: ['project', 'work', 'collaboration'], topic: 'Project Discussion' },
    { keywords: ['business', 'client', 'deal'], topic: 'Business Inquiry' },
    { keywords: ['payment', 'invoice', 'bill'], topic: 'Payment/Financial Matter' },
    { keywords: ['delivery', 'order', 'shipping'], topic: 'Delivery/Order Status' },
    { keywords: ['question', 'inquiry', 'ask'], topic: 'General Inquiry' },
    { keywords: ['help', 'support', 'assistance'], topic: 'Support Request' }
  ]

  for (const { keywords, topic } of topics) {
    if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
      return topic
    }
  }

  return 'General Call'
}

export async function generateResponse(
  userInput: string,
  analysis: Partial<CallAnalysis>
): Promise<string> {
  const { category, needsMoreInfo } = analysis

  if (category === 'spam') {
    return "Thank you for your call, but I'm afraid we are not interested at this time. Have a good day."
  }

  if (needsMoreInfo) {
    return "I understand. Could you please provide more details about the purpose of your call? This will help me assist you better."
  }

  if (category === 'important') {
    return "Thank you for sharing this information. I have noted all the details and will immediately notify Mr. Shah. He will review your message and get back to you as soon as possible. Is there anything else you would like me to relay?"
  }

  if (category === 'casual') {
    return "Thank you for calling. I have noted your message. If this matter becomes urgent, please feel free to call again, and I will ensure Mr. Shah is notified immediately."
  }

  return "Thank you for the additional information. I have recorded everything. Mr. Shah will be in touch with you soon."
}

// Mock OpenAI integration (can be replaced with actual API calls)
export async function generateAIResponse(prompt: string): Promise<string> {
  // In production, this would call OpenAI API
  // For now, return intelligent responses based on analysis
  return generateResponse(prompt, await analyzeCallIntent(prompt))
}
