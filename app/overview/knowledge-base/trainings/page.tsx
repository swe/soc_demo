'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewAlert,
  OverviewFilterMenu,
  OverviewKpiRow,
  OverviewModal,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewPagination,
  OverviewProgressBar,
  OverviewRowsPerPageMenu,
  OverviewSection,
  OverviewToggle,
} from '@/components/overview/unified-ui'

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
  const [query, setQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    'category:security-awareness',
    'category:technical',
    'category:incident-response',
    'category:compliance',
    'level:beginner',
    'level:intermediate',
    'level:advanced',
  ])
  const [certificateOnly, setCertificateOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [enrollTraining, setEnrollTraining] = useState<Training | null>(null)
  const [notifyManager, setNotifyManager] = useState(true)
  const [enforceDeadline, setEnforceDeadline] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

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

  const filterOptions = [
    { id: 'category:security-awareness', label: 'Security Awareness', section: 'Category' },
    { id: 'category:technical', label: 'Technical', section: 'Category' },
    { id: 'category:incident-response', label: 'Incident Response', section: 'Category' },
    { id: 'category:compliance', label: 'Compliance', section: 'Category' },
    { id: 'level:beginner', label: 'Beginner', section: 'Level' },
    { id: 'level:intermediate', label: 'Intermediate', section: 'Level' },
    { id: 'level:advanced', label: 'Advanced', section: 'Level' },
  ]

  const visible = useMemo(() => {
    const categories = new Set(selectedFilters.filter((id) => id.startsWith('category:')).map((id) => id.replace('category:', '')))
    const levels = new Set(selectedFilters.filter((id) => id.startsWith('level:')).map((id) => id.replace('level:', '')))
    const q = query.trim().toLowerCase()
    return trainings
      .filter((training) => categories.has(training.category))
      .filter((training) => levels.has(training.level))
      .filter((training) => !certificateOnly || training.certificate)
      .filter((training) => {
        if (!q) return true
        return (
          training.id.toLowerCase().includes(q) ||
          training.title.toLowerCase().includes(q) ||
          training.instructor.toLowerCase().includes(q)
        )
      })
  }, [certificateOnly, query, selectedFilters, trainings])

  const totalPages = Math.max(1, Math.ceil(visible.length / rowsPerPage))
  const pagedRows = visible.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const stats = {
    total: trainings.length,
    totalEnrolled: trainings.reduce((sum, t) => sum + t.enrolled, 0),
    avgCompletion: Math.round(trainings.reduce((sum, t) => sum + t.completionRate, 0) / trainings.length),
    avgScore: Math.round(trainings.reduce((sum, t) => sum + t.avgScore, 0) / trainings.length),
  }

  return (
    <OverviewPageShell>
      {toast ? (
        <div className="mb-4">
          <OverviewAlert tone="success" title={toast} />
        </div>
      ) : null}

      <OverviewPageHeader
        section="KNOWLEDGE BASE"
        title="Security Training"
        description="Access training courses and learning resources for security professionals."
      />

      <OverviewKpiRow
        items={[
          { label: 'COURSES', value: stats.total, sub: 'Available' },
          { label: 'TOTAL ENROLLED', value: stats.totalEnrolled, sub: 'Across all courses', tone: 'accent' },
          { label: 'AVG COMPLETION', value: `${stats.avgCompletion}%`, sub: 'Completion rate', tone: 'accent' },
          { label: 'AVG SCORE', value: `${stats.avgScore}%`, sub: 'Test average' },
        ]}
      />

      <div className="mb-4 flex items-center gap-2 flex-nowrap">
        <input
          className="soc-input h-9 min-h-9 w-72 shrink-0 text-sm"
          placeholder="Search id, title, instructor..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
        <div className="ml-auto flex items-center gap-2">
          <OverviewFilterMenu
            options={filterOptions}
            selected={selectedFilters}
            onApply={(next) => {
              setSelectedFilters(next)
              setPage(1)
            }}
          />
          <OverviewToggle
            label="Certificate only"
            checked={certificateOnly}
            onChange={(next) => {
              setCertificateOnly(next)
              setPage(1)
            }}
          />
        </div>
      </div>

      <OverviewSection
        title="COURSES"
        flush
        right={(
          <OverviewRowsPerPageMenu
            value={rowsPerPage}
            options={[5, 10]}
            onChange={(next) => {
              setRowsPerPage(next)
              setPage(1)
            }}
          />
        )}
      >
        <div className="overflow-x-auto">
          <table className="soc-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Course</th>
                <th>Category</th>
                <th>Level</th>
                <th>Enrolled</th>
                <th>Completed</th>
                <th>Avg Score</th>
                <th>Completion</th>
                <th>Due Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((training) => (
                <tr key={training.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--soc-text-muted)' }}>{training.id}</td>
                  <td>
                    <button type="button" className="text-left" onClick={() => setSelectedTraining(training)}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{training.title}</p>
                      <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{training.duration} · {training.modules} modules</p>
                    </button>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getCategoryBg(training.category), color: getCategoryColor(training.category) }}>
                      {training.category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td>
                    <span className="soc-badge" style={{ backgroundColor: getLevelBg(training.level), color: getLevelColor(training.level) }}>
                      {training.level.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{training.enrolled}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{training.completed}</td>
                  <td style={{ color: 'var(--soc-text-secondary)' }}>{training.avgScore}%</td>
                  <td>
                    <OverviewProgressBar value={training.completionRate} color="var(--soc-accent)" />
                  </td>
                  <td style={{ color: 'var(--soc-text-muted)' }}>{training.dueDate}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="soc-link text-xs" onClick={() => setSelectedTraining(training)}>View</button>
                      <button
                        type="button"
                        className="soc-link text-xs"
                        onClick={() => {
                          setEnrollTraining(training)
                          setNotifyManager(true)
                          setEnforceDeadline(false)
                        }}
                      >
                        Start
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <OverviewPagination page={page} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
      </OverviewSection>

      <OverviewModal
        open={!!selectedTraining}
        title={selectedTraining?.title || ''}
        subtitle={selectedTraining?.id}
        onClose={() => setSelectedTraining(null)}
        maxWidth="max-w-2xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setSelectedTraining(null)}>
              Close
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                if (!selectedTraining) return
                setEnrollTraining(selectedTraining)
                setSelectedTraining(null)
              }}
            >
              Start Training
            </button>
          </div>
        )}
      >
        {selectedTraining ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="soc-badge" style={{ backgroundColor: getCategoryBg(selectedTraining.category), color: getCategoryColor(selectedTraining.category) }}>
                {selectedTraining.category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
              <span className="soc-badge" style={{ backgroundColor: getLevelBg(selectedTraining.level), color: getLevelColor(selectedTraining.level) }}>
                {selectedTraining.level.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Duration', value: selectedTraining.duration },
                { label: 'Modules', value: String(selectedTraining.modules) },
                { label: 'Enrolled', value: String(selectedTraining.enrolled) },
                { label: 'Instructor', value: selectedTraining.instructor },
              ].map((item) => (
                <div key={item.label} className="soc-card-raised p-3">
                  <p className="soc-label mb-1">{item.label.toUpperCase()}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="soc-label mb-2">COMPLETION RATE</p>
              <OverviewProgressBar value={selectedTraining.completionRate} color="var(--soc-accent)" />
            </div>
            {selectedTraining.certificate ? (
              <OverviewAlert tone="info" title="Certificate available for this course." />
            ) : null}
          </div>
        ) : null}
      </OverviewModal>

      <OverviewModal
        open={!!enrollTraining}
        title={enrollTraining ? `Start ${enrollTraining.title}` : ''}
        subtitle={enrollTraining?.id}
        onClose={() => setEnrollTraining(null)}
        maxWidth="max-w-xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="soc-btn soc-btn-secondary" onClick={() => setEnrollTraining(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="soc-btn soc-btn-primary"
              onClick={() => {
                if (!enrollTraining) return
                setToast(`${enrollTraining.id} enrollment started.`)
                setEnrollTraining(null)
              }}
            >
              Confirm Start
            </button>
          </div>
        )}
      >
        <div className="space-y-3">
          <OverviewToggle label="Notify manager" checked={notifyManager} onChange={setNotifyManager} />
          <OverviewToggle label="Enforce due-date reminders" checked={enforceDeadline} onChange={setEnforceDeadline} />
        </div>
      </OverviewModal>
    </OverviewPageShell>
  )
}
