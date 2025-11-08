'use client'

import { useState, useEffect } from 'react'
import { Phone, PhoneCall, PhoneOff, MessageSquare, Clock, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CallLogs from '@/components/CallLogs'
import CallStats from '@/components/CallStats'

export default function Home() {
  const [callLogs, setCallLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCall, setActiveCall] = useState<any>(null)

  useEffect(() => {
    fetchCallLogs()
    // Poll for active calls every 5 seconds
    const interval = setInterval(() => {
      fetchActiveCall()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchCallLogs = async () => {
    try {
      const response = await fetch('/api/calls/logs')
      const data = await response.json()
      setCallLogs(data.logs || [])
    } catch (error) {
      console.error('Error fetching call logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActiveCall = async () => {
    try {
      const response = await fetch('/api/calls/active')
      const data = await response.json()
      setActiveCall(data.activeCall)
    } catch (error) {
      console.error('Error fetching active call:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Iqra AI Assistant
                </h1>
                <p className="text-gray-600 mt-1">Virtual Call Handler for Syed Eman Ali Shah</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                activeCall ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${activeCall ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {activeCall ? 'Call Active' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Call Banner */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                  <div>
                    <p className="font-semibold">Active Call in Progress</p>
                    <p className="text-sm text-green-100">
                      {activeCall.callerName || activeCall.phoneNumber} • {activeCall.duration || '0:00'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Iqra is handling the call</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <CallStats logs={callLogs} />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Auto-Answer Calls</h3>
            <p className="text-gray-600 text-sm">
              Iqra automatically answers incoming calls with a warm, professional greeting in Urdu and English.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Notifications</h3>
            <p className="text-gray-600 text-sm">
              Important calls trigger instant WhatsApp and email notifications with caller details and summaries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="bg-pink-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Call Logging</h3>
            <p className="text-gray-600 text-sm">
              Every call is logged with details including date, time, caller info, topic, and duration.
            </p>
          </motion.div>
        </div>

        {/* Call Logs */}
        <CallLogs logs={callLogs} isLoading={isLoading} onRefresh={fetchCallLogs} />
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            Powered by AI • Twilio Voice • OpenAI • ElevenLabs
          </p>
        </div>
      </div>
    </main>
  )
}
