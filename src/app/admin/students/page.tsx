'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, Clock, Search, Shield, User as UserIcon } from 'lucide-react'

interface Student {
  _id: string
  name: string
  email: string
  image: string
  role: string
  provider: string
  createdAt: string
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students')
      if (!res.ok) throw new Error('Failed to fetch students data')
      const data = await res.json()
      setStudents(data.students)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const studentCount = students.filter(s => s.role === 'student').length
  const adminCount = students.filter(s => s.role === 'admin').length

  return (
    <div className="min-h-screen bg-[#050B14] text-white p-6 sm:p-10 pt-24 md:pt-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-2"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <Users size={24} className="text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  Registered Seekers
                </h1>
                <p className="text-gray-400 text-sm mt-1">Manage and view all students on the platform</p>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-4">
            <div className="glass p-4 rounded-xl border border-white/5 bg-white/5 min-w-[140px]">
              <div className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <UserIcon size={14} className="text-cyan-400" /> Total Students
              </div>
              <div className="text-3xl font-bold text-white">{isLoading ? '-' : studentCount}</div>
            </div>
            <div className="glass p-4 rounded-xl border border-white/5 bg-white/5 min-w-[140px]">
              <div className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Shield size={14} className="text-orange-400" /> Admins
              </div>
              <div className="text-3xl font-bold text-white">{isLoading ? '-' : adminCount}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B1224] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
          />
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            {error}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-white/5">
            <Users size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-300">No seekers found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass p-6 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors bg-[#0B1224]/80 group relative overflow-hidden"
              >
                {/* Role Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full border ${student.role === 'admin' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
                  {student.role.toUpperCase()}
                </div>

                <div className="flex items-start gap-4 mb-6">
                  {student.image ? (
                    <img src={student.image} alt={student.name} className="w-14 h-14 rounded-full border-2 border-white/10 object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border-2 border-white/10">
                      <UserIcon size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="pt-1 overflow-hidden pr-12">
                    <h3 className="font-bold text-lg text-white truncate">{student.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Provider: {student.provider}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                    <Mail size={16} className="text-gray-500 flex-shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-400 px-1">
                    <Clock size={16} className="text-gray-500 flex-shrink-0" />
                    <span>Joined on {new Date(student.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
