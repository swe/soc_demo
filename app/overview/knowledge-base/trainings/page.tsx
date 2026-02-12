'use client'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

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

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'security-awareness': '#4f46e5',
      'technical': '#4f46e5',
      'incident-response': '#e11d48',
      'compliance': '#059669'
    }
    return colors[category] || '#6b7280'
  }

  const getLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      beginner: '#059669',
      intermediate: '#d97706',
      advanced: '#e11d48'
    }
    return colors[level] || '#6b7280'
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
    <div className="py-4 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Security Training</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Access training courses and learning resources for security professionals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 px-4">
        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Available Courses</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Enrolled</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>
            {stats.totalEnrolled}
          </div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Avg Completion</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#059669', WebkitTextFillColor: '#059669' }}>
            {stats.avgCompletion}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 px-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'security-awareness', 'technical', 'incident-response', 'compliance'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`hig-button ${
                selectedCategory === category
                  ? 'hig-button-primary'
                  : 'hig-button-secondary'
              }`}
            >
              {category === 'all' ? 'All Categories' : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-12 gap-4 px-4">
        {filteredTrainings.map((training) => (
          <div key={training.id} className="col-span-12 lg:col-span-6 xl:col-span-4">
            <div className="hig-card">
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${getLevelColor(training.level)}20`,
                          color: getLevelColor(training.level)
                        }}
                      >
                        {training.level.toUpperCase()}
                      </span>
                      {training.certificate && (
                        <span className="text-lg">🏆</span>
                      )}
                    </div>
                    <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={training.title}>
                      {training.title}
                    </h3>
                    <div className="hig-caption text-gray-600 dark:text-gray-400">{training.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                    <div className="hig-metric-value text-2xl text-gray-900 dark:text-gray-100">{training.duration.split(' ')[0]}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400">Hours</div>
                  </div>
                  <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                    <div className="hig-metric-value text-2xl text-gray-900 dark:text-gray-100">{training.modules}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400">Modules</div>
                  </div>
                  <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
                    <div className="hig-metric-value text-2xl text-gray-900 dark:text-gray-100">{training.enrolled}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400">Students</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="hig-caption text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{training.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${training.completionRate}%`,
                        backgroundColor: '#4f46e5'
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between hig-caption text-gray-600 dark:text-gray-400 mb-4">
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
                    className="flex-1 hig-button hig-button-primary"
                  >
                    Start Course
                  </button>
                  <button className="hig-button hig-button-secondary">
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
            className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTraining(null)}
          >
            <div 
              className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div 
                className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="hig-headline text-gray-900 dark:text-gray-100">Training Details</h2>
                  <button
                    onClick={() => setSelectedTraining(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                </div>
                {/* Level Indicator Bar */}
                <div 
                  className="h-1 rounded-full mt-3" 
                  style={{ backgroundColor: getLevelColor(selectedTraining.level) }}
                />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  <div>
                    <div className="hig-headline text-gray-900 dark:text-gray-100 mb-2">{selectedTraining.title}</div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 font-mono">{selectedTraining.id}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Category</div>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${getCategoryColor(selectedTraining.category)}20`,
                          color: getCategoryColor(selectedTraining.category)
                        }}
                      >
                        {selectedTraining.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Level</div>
                      <span 
                        className="hig-badge"
                        style={{
                          backgroundColor: `${getLevelColor(selectedTraining.level)}20`,
                          color: getLevelColor(selectedTraining.level)
                        }}
                      >
                        {selectedTraining.level.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Duration</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedTraining.duration}</div>
                    </div>
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Modules</div>
                      <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">{selectedTraining.modules}</div>
                    </div>
                    <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Enrolled</div>
                      <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">{selectedTraining.enrolled}</div>
                    </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Instructor</div>
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedTraining.instructor}</div>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
                    <div className="hig-headline mb-4">Completion Rate</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full" 
                            style={{ 
                              width: `${selectedTraining.completionRate}%`,
                              backgroundColor: '#4f46e5'
                            }}
                          />
                        </div>
                      </div>
                      <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{selectedTraining.completionRate}%</span>
                    </div>
                  </div>

                  {selectedTraining.certificate && (
                    <div className="hig-card bg-[#d97706]/10 dark:bg-[#d97706]/20 border border-[#d97706]/30 p-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-[#d97706] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div>
                          <div className="hig-body font-semibold text-[#d97706] mb-1">Certificate Available</div>
                          <div className="hig-caption text-gray-600 dark:text-gray-400">Certificate awarded upon completion</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Footer */}
              <div 
                className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
                style={{
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <div className="space-y-3">
                  <button className="hig-button hig-button-primary w-full">
                    Start Training
                  </button>
                  <button className="hig-button hig-button-secondary w-full">
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
