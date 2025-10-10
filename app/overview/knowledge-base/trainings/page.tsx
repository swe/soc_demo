'use client'
import { formatDate, formatDateTime } from '@/lib/utils'


import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

interface Training {
  id: string
  title: string
  category: 'security-awareness' | 'technical' | 'incident-response' | 'compliance'
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  instructor: string
  completionRate: number
  enrolled: number
  lastUpdated: string
  modules: number
  certificate: boolean
}

export default function TrainingsPage() {
  const { setPageTitle } = usePageTitle()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)

  useEffect(() => {
    setPageTitle('Trainings')
  }, [setPageTitle])

  const trainings: Training[] = [
    {
      id: 'TRN-001',
      title: 'Security Awareness Fundamentals',
      category: 'security-awareness',
      level: 'beginner',
      duration: '2 hours',
      instructor: 'Security Team',
      completionRate: 87,
      enrolled: 234,
      lastUpdated: '2024-03-01',
      modules: 8,
      certificate: true
    },
    {
      id: 'TRN-002',
      title: 'Advanced Threat Hunting',
      category: 'technical',
      level: 'advanced',
      duration: '8 hours',
      instructor: 'Threat Intel Team',
      completionRate: 45,
      enrolled: 67,
      lastUpdated: '2024-02-15',
      modules: 12,
      certificate: true
    },
    {
      id: 'TRN-003',
      title: 'Incident Response Essentials',
      category: 'incident-response',
      level: 'intermediate',
      duration: '6 hours',
      instructor: 'IR Team Lead',
      completionRate: 72,
      enrolled: 156,
      lastUpdated: '2024-02-20',
      modules: 10,
      certificate: true
    },
    {
      id: 'TRN-004',
      title: 'SIEM Analytics & Investigation',
      category: 'technical',
      level: 'intermediate',
      duration: '5 hours',
      instructor: 'SOC Analyst',
      completionRate: 61,
      enrolled: 98,
      lastUpdated: '2024-03-05',
      modules: 9,
      certificate: true
    },
    {
      id: 'TRN-005',
      title: 'GDPR Compliance Training',
      category: 'compliance',
      level: 'beginner',
      duration: '3 hours',
      instructor: 'Compliance Officer',
      completionRate: 93,
      enrolled: 312,
      lastUpdated: '2024-01-10',
      modules: 6,
      certificate: true
    },
    {
      id: 'TRN-006',
      title: 'Malware Analysis Basics',
      category: 'technical',
      level: 'intermediate',
      duration: '7 hours',
      instructor: 'Malware Analyst',
      completionRate: 38,
      enrolled: 45,
      lastUpdated: '2024-02-28',
      modules: 11,
      certificate: true
    },
    {
      id: 'TRN-007',
      title: 'Phishing Detection & Prevention',
      category: 'security-awareness',
      level: 'beginner',
      duration: '1.5 hours',
      instructor: 'Security Team',
      completionRate: 89,
      enrolled: 267,
      lastUpdated: '2024-03-10',
      modules: 5,
      certificate: false
    },
    {
      id: 'TRN-008',
      title: 'Cloud Security Fundamentals',
      category: 'technical',
      level: 'beginner',
      duration: '4 hours',
      instructor: 'Cloud Security Team',
      completionRate: 78,
      enrolled: 189,
      lastUpdated: '2024-02-25',
      modules: 8,
      certificate: true
    }
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      'security-awareness': 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400',
      'technical': 'bg-indigo-500/20 text-purple-700 dark:text-purple-400',
      'incident-response': 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      'compliance': 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400'
    }
    return colors[category as keyof typeof colors]
  }

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-emerald-600 dark:bg-emerald-700/20 text-green-700 dark:text-green-400',
      intermediate: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      advanced: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400'
    }
    return colors[level as keyof typeof colors]
  }

  const filteredTrainings = selectedCategory === 'all' 
    ? trainings 
    : trainings.filter(t => t.category === selectedCategory)

  const stats = {
    total: trainings.length,
    totalEnrolled: trainings.reduce((sum, t) => sum + t.enrolled, 0),
    avgCompletion: Math.round(trainings.reduce((sum, t) => sum + t.completionRate, 0) / trainings.length)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Security Training" 
        description="Access training courses and learning resources for security professionals" 
      />

      {/* Stats */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Available Courses</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.487 2.494zM18 14a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Enrolled</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-700 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.totalEnrolled}</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</div>
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.avgCompletion}%</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'security-awareness', 'technical', 'incident-response', 'compliance'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {category === 'all' ? 'All Categories' : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-12 gap-4">
        {filteredTrainings.map((training) => (
          <div key={training.id} className="col-span-12 lg:col-span-6 xl:col-span-4">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all group border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-600 dark:hover:border-indigo-600">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(training.level)}`}>
                        {training.level.toUpperCase()}
                      </span>
                      {training.certificate && (
                        <span className="text-lg">🏆</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-500 transition-all duration-200">
                      {training.title}
                    </h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{training.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{training.duration.split(' ')[0]}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Hours</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{training.modules}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Modules</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{training.enrolled}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Students</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{training.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-600 to-purple-600" 
                      style={{ width: `${training.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>{training.instructor}</span>
                  <span>{formatDate(training.lastUpdated)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTraining(training)
                    }}
                    className="flex-1 btn-sm bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white"
                  >
                    Start Course
                  </button>
                  <button className="btn-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Training Detail Panel */}
      {selectedTraining && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedTraining(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Training Details</h2>
                <button
                  onClick={() => setSelectedTraining(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{selectedTraining.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedTraining.id}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Category</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedTraining.category)}`}>
                      {selectedTraining.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Level</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedTraining.level)}`}>
                      {selectedTraining.level.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedTraining.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Modules</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedTraining.modules}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Instructor</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedTraining.instructor}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Enrolled Students</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{selectedTraining.enrolled}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Completion Rate</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full" style={{ width: `${selectedTraining.completionRate}%` }}></div>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedTraining.completionRate}%</span>
                  </div>
                </div>

                {selectedTraining.certificate && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium">Certificate awarded upon completion</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white w-full mb-3">
                    Start Training
                  </button>
                  <button className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 w-full">
                    View Curriculum
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
