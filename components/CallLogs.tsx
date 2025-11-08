'use client'

import { Phone, Clock, User, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface CallLog {
  id: string
  phoneNumber: string
  callerName?: string
  timestamp: string
  duration: number
  topic: string
  category: 'important' | 'casual' | 'spam'
  notificationSent: boolean
  transcript?: string
}

interface CallLogsProps {
  logs: CallLog[]
  isLoading: boolean
  onRefresh: () => void
}

export default function CallLogs({ logs, isLoading, onRefresh }: CallLogsProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'important':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'casual':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'spam':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Call History</h2>
            <p className="text-gray-600 mt-1">Recent calls handled by Iqra</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {isLoading && logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            <p className="text-gray-600 mt-4">Loading call logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls yet</h3>
            <p className="text-gray-600">Call logs will appear here once Iqra handles incoming calls.</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {log.callerName || 'Unknown Caller'}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(log.category)}`}>
                        {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                      </span>
                      {log.notificationSent && (
                        <span className="flex items-center space-x-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Notified</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{log.phoneNumber}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(log.timestamp), 'MMM d, yyyy • h:mm a')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Duration: {formatDuration(log.duration)}</span>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Topic:</span> {log.topic}
                      </p>
                      {log.transcript && (
                        <details className="mt-2">
                          <summary className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-700">
                            View transcript
                          </summary>
                          <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-gray-300">
                            {log.transcript}
                          </p>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
