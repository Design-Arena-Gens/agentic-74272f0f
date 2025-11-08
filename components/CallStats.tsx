'use client'

import { Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface CallStatsProps {
  logs: any[]
}

export default function CallStats({ logs }: CallStatsProps) {
  const totalCalls = logs.length
  const importantCalls = logs.filter(log => log.category === 'important').length
  const casualCalls = logs.filter(log => log.category === 'casual').length
  const spamCalls = logs.filter(log => log.category === 'spam').length
  const avgDuration = logs.length > 0
    ? Math.round(logs.reduce((acc, log) => acc + log.duration, 0) / logs.length)
    : 0

  const stats = [
    {
      label: 'Total Calls',
      value: totalCalls,
      icon: Phone,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Important',
      value: importantCalls,
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      label: 'Casual',
      value: casualCalls,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Avg Duration',
      value: `${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, '0')}`,
      icon: Clock,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.bgColor} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
          <p className="text-gray-600 text-sm">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
