'use client'

import { formatDate } from '@/lib/utils'
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
  completed: number
  avgScore: number
  dueDate: string
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
    { id: 'TRN-001', title: 'Security Awareness Fundamentals', category: 'security-awareness', level: 'beginner', duration: '2 hours', instructor: 'Security Team', completionRate: 87, enrolled: 234, completed: 204, avgScore: 88, dueDate: '2024-04-30', lastUpdated: '2024-03-01', modules: 8, certificate: true },
    { id: 'TRN-002', title: 'Advanced Threat Hunting', category: 'technical', level: 'advanced', duration: '8 hours', instructor: 'Threat Intel Team', completionRate: 45, enrolled: 67, completed: 30, avgScore: 79, dueDate: '2024-05-15', lastUpdated: '2024-02-15', modules: 12, certificate: true },
    { id: 'TRN-003', title: 'Incident Response Essentials', category: 'incident-response', level: 'intermediate', duration: '6 hours', instructor: 'IR Team Lead', completionRate: 72, enrolled: 156, completed: 112, avgScore: 84, dueDate: '2024-04-15', lastUpdated: '2024-02-20', modules: 10, certificate: true },
    { id: 'TRN-004', title: 'SIEM Analytics & Investigation', category: 'technical', level: 'intermediate', duration: '5 hours', instructor: 'SOC Analyst', completionRate: 61, enrolled: 98, completed: 60, avgScore: 81, dueDate: '2024-05-01', lastUpdated: '2024-03-05', modules: 9, certificate: true },
    { id: 'TRN-005', title: 'GDPR Compliance Training', category: 'compliance', level: 'beginner', duration: '3 hours', instructor: 'Compliance Officer', completionRate: 93, enrolled: 312, completed: 290, avgScore: 91, dueDate: '2024-03-31', lastUpdated: '2024-01-10', modules: 6, certificate: true },
    { id: 'TRN-006', title: 'Malware Analysis Basics', category: 'technical', level: 'intermediate', duration: '7 hours', instructor: 'Malware Analyst', completionRate: 38, enrolled: 45, completed: 17, avgScore: 76, dueDate: '2024-06-01', lastUpdated: '2024-02-28', modules: 11, certificate: true },
    { id: 'TRN-007', title: 'Phishing Detection & Prevention', category: 'security-awareness', level: 'beginner', duration: '1.5 hours', instructor: 'Security Team', completionRate: 89, enrolled: 267, completed: 238, avgScore: 90, dueDate: '2024-04-01', lastUpdated: '2024-03-10', modules: 5, certificate: false },
    { id: 'TRN-008', title: 'Cloud Security Fundamentals', category: 'technical', level: 'beginner', duration: '4 hours', instructor: 'Cloud Security Team', completionRate: 78, enrolled: 189, completed: 147, avgScore: 85, dueDate: '2024-05-30', lastUpdated: '2024-02-25', modules: 8, certificate: true },
  ]

  const getCategoryColor = (category: string) => {
    const map: Record<string, string> = { 'security-awareness': 'var(--soc-accent)', 'technical': 'var(--soc-accent)', 'incident-response': 'var(--soc-critical)', 'compliance': 'var(--soc-low)' }
    return map[category] || 'var(--soc-text-muted)'
  }
  const getCategoryBg = (category: string) => {
    const map: Record<string, string> = { 'security-awareness': 'var(--soc-accent-bg)', 'technical': 'var(--soc-accent-bg)', 'incident-response': 'var(--soc-critical-bg)', 'compliance': 'var(--soc-low-bg)' }
    return map[category] || 'var(--soc-border)'
  }
  const getLevelColor = (level: string) => {
    const map: Record<string, string> = { beginner: 'var(--soc-low)', intermediate: 'var(--soc-medium)', advanced: 'var(--soc-critical)' }
    return map[level] || 'var(--soc-text-muted)'
  }
  const getLevelBg = (level: string) => {
    const map: Record<string, string> = { beginner: 'var(--soc-low-bg)', intermediate: 'var(--soc-medium-bg)', advanced: 'var(--soc-critical-bg)' }
    return map[level] || 'var(--soc-border)'
  }

  const filteredTrainings = selectedCategory === 'all' ? trainings : trainings.filter(t => t.category === selectedCategory)

  const stats = {
    total: trainings.length,
    totalEnrolled: trainings.reduce((sum, t) => sum + t.enrolled, 0),
    avgCompletion: Math.round(trainings.reduce((sum, t) => sum + t.completionRate, 0) / trainings.length),
    avgScore: Math.round(trainings.reduce((sum, t) => sum + t.avgScore, 0) / trainings.length),
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 soc-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="soc-label mb-1">KNOWLEDGE BASE</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>Security Training</h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>Access training courses and learning resources for security professionals</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'COURSES', value: String(stats.total), sub: 'Available' },
          { label: 'TOTAL ENROLLED', value: String(stats.totalEnrolled), sub: 'Across all courses', accent: true },
          { label: 'AVG COMPLETION', value: `${stats.avgCompletion}%`, sub: 'Completion rate', accent: true },
          { label: 'AVG SCORE', value: `${stats.avgScore}%`, sub: 'Test average' },
        ].map((kpi, i) => (
          <div key={i} className="soc-card">
            <p className="soc-label mb-2">{kpi.label}</p>
            <p className="soc-metric-lg" style={kpi.accent ? { color: 'var(--soc-accent)' } : {}}>{kpi.value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {['all', 'security-awareness', 'technical', 'incident-response', 'compliance'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`soc-btn ${selectedCategory === category ? 'soc-btn-primary' : 'soc-btn-secondary'}`}
          >
            {category === 'all' ? 'All Categories' : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Courses Table */}
      <div className="soc-card" style={{ padding: 0 }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
          <p className="soc-label">COURSES</p>
          <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{filteredTrainings.length} shown</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Level</th>
                <th>Enrolled</th>
                <th>Completed</th>
                <th>Avg Score</th>
                <th>Completion</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainings.map((training) => (
                <tr key={training.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTraining(training)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--soc-text)', fontSize: '0.875rem' }}>{training.title}</div>
                    <div style={{ color: 'var(--soc-text-muted)', fontSize: '0.75rem' }}>{training.duration} · {training.modules} modules</div>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getCategoryBg(training.category), color: getCategoryColor(training.category) }}>
                      {training.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getLevelBg(training.level), color: getLevelColor(training.level) }}>
                      {training.level.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{training.enrolled}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{training.completed}</td>
                  <td style={{ color: 'var(--soc-text-secondary)', fontSize: '0.875rem' }}>{training.avgScore}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '80px' }}>
                      <div className="soc-progress-track" style={{ flex: 1 }}>
                        <div className="soc-progress-fill" style={{ width: `${training.completionRate}%`, backgroundColor: 'var(--soc-accent)' }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--soc-text-secondary)', fontWeight: 600, minWidth: '2.25rem' }}>{training.completionRate}%</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--soc-text-muted)', fontSize: '0.8125rem' }}>{training.dueDate}</td>
                  <td>
                    <button className="soc-link" style={{ fontSize: '0.8125rem' }} onClick={(e) => { e.stopPropagation(); setSelectedTraining(training) }}>Start →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Training Detail Modal */}
      {selectedTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedTraining(null)}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-start justify-between flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selectedTraining.id}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selectedTraining.title}</h2>
              </div>
              <button onClick={() => setSelectedTraining(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded flex-shrink-0" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <span className="soc-badge" style={{ backgroundColor: getCategoryBg(selectedTraining.category), color: getCategoryColor(selectedTraining.category) }}>
                  {selectedTraining.category.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className="soc-badge" style={{ backgroundColor: getLevelBg(selectedTraining.level), color: getLevelColor(selectedTraining.level) }}>
                  {selectedTraining.level.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'DURATION',   value: selectedTraining.duration },
                  { label: 'MODULES',    value: String(selectedTraining.modules) },
                  { label: 'ENROLLED',   value: String(selectedTraining.enrolled) },
                  { label: 'INSTRUCTOR', value: selectedTraining.instructor },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="soc-label mb-2">COMPLETION RATE</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 soc-progress-track">
                    <div className="soc-progress-fill" style={{ width: `${selectedTraining.completionRate}%`, backgroundColor: 'var(--soc-accent)' }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--soc-text)' }}>{selectedTraining.completionRate}%</span>
                </div>
              </div>
              {selectedTraining.certificate && (
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--soc-medium-bg)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-medium)' }}>Certificate Available</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-secondary)' }}>Certificate awarded upon completion</p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 flex gap-3 border-t flex-shrink-0" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Start Training</button>
              <button onClick={() => setSelectedTraining(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
