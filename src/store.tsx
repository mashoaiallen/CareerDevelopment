import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { initialData } from './seeds'
import type { Evidence, Project, Report, Skill, Task, WorkspaceData, LearningRecord, LeadershipRecord, OwnerType, ProfessionalProfile, StagePlan } from './model'

const STORE_KEY = 'allen-engineering-workspace-v1'

function readInitial(): WorkspaceData {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return initialData
    const saved = JSON.parse(raw) as Partial<WorkspaceData>
    return { ...initialData, ...saved }
  } catch {
    return initialData
  }
}

type StoreApi = {
  data: WorkspaceData
  storageError: string
  setTasks: (next: Task[] | ((current: Task[]) => Task[])) => void
  saveTask: (task: Task) => void
  changeTaskStatus: (id: string, status: Task['status']) => void
  removeTask: (id: string) => void
  saveProject: (project: Project) => void
  removeProject: (id: string) => void
  saveSkill: (skill: Skill) => void
  saveLearning: (record: LearningRecord) => void
  saveLeadership: (record: LeadershipRecord) => void
  saveReport: (report: Report) => void
  addEvidence: (evidence: Evidence) => void
  removeEvidence: (id: string) => void
  attachEvidence: (type: OwnerType, ownerId: string, evidenceId: string) => void
  updateStagePlan: (id: string, plan: StagePlan) => void
  saveProfile: (profile: ProfessionalProfile) => void
  updateCollection: <K extends 'projects' | 'skills' | 'learning' | 'leadership' | 'reports'>(key: K, rows: WorkspaceData[K]) => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<WorkspaceData>(readInitial)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data))
      setStorageError('')
    } catch {
      setStorageError('Browser storage is unavailable or full. Export your metadata backup before continuing.')
    }
  }, [data])

  const updateCollection = useCallback<StoreApi['updateCollection']>((key, rows) => {
    setData(current => ({ ...current, [key]: rows }))
  }, [])
  const saveTask = useCallback((task: Task) => setData(current => ({ ...current, tasks: current.tasks.some(row => row.id === task.id) ? current.tasks.map(row => row.id === task.id ? task : row) : [task, ...current.tasks] })), [])
  const setTasks = useCallback<StoreApi['setTasks']>((next) => setData(current => ({ ...current, tasks: typeof next === 'function' ? next(current.tasks) : next })), [])
  const changeTaskStatus = useCallback((id: string, status: Task['status']) => {
    const stamp = localStamp()
    setData(current => ({ ...current, tasks: current.tasks.map(task => {
      if (task.id !== id || task.status === status) return task
      const history = [...(task.statusHistory ?? []), { status, date: stamp.date, time: stamp.time }]
      const next: Task = { ...task, status, updatedAt: stamp.date, statusHistory: history }
      if (status === 'In Progress' && !task.actualStart) { next.actualStart = stamp.date; next.actualStartTime = stamp.time }
      if (status === 'Completed') { next.actualCompletion = stamp.date; next.actualCompletionTime = stamp.time }
      return next
    }) }))
  }, [])
  const removeTask = useCallback((id: string) => setData(current => ({ ...current, tasks: current.tasks.filter(row => row.id !== id) })), [])
  const saveProject = useCallback((row: Project) => setData(current => ({ ...current, projects: current.projects.some(x => x.id === row.id) ? current.projects.map(x => x.id === row.id ? { ...row, reportIds: current.reports.filter(report => report.projectId === row.id).map(report => report.id) } : x) : [{ ...row, reportIds: current.reports.filter(report => report.projectId === row.id).map(report => report.id) }, ...current.projects] })), [])
  const removeProject = useCallback((id: string) => setData(current => ({ ...current, projects: current.projects.filter(row => row.id !== id), tasks: current.tasks.map(row => row.projectId === id ? { ...row, projectId: '' } : row), learning: current.learning.map(row => row.projectId === id ? { ...row, projectId: '' } : row), reports: current.reports.map(row => row.projectId === id ? { ...row, projectId: '' } : row) })), [])
  const saveSkill = useCallback((row: Skill) => setData(current => ({ ...current, skills: current.skills.some(x => x.id === row.id) ? current.skills.map(x => x.id === row.id ? row : x) : [row, ...current.skills] })), [])
  const saveLearning = useCallback((row: LearningRecord) => setData(current => ({ ...current, learning: current.learning.some(x => x.id === row.id) ? current.learning.map(x => x.id === row.id ? row : x) : [row, ...current.learning] })), [])
  const saveLeadership = useCallback((row: LeadershipRecord) => setData(current => ({ ...current, leadership: current.leadership.map(x => x.id === row.id ? row : x) })), [])
  const saveReport = useCallback((row: Report) => setData(current => {
    const reports = current.reports.some(x => x.id === row.id) ? current.reports.map(x => x.id === row.id ? row : x) : [row, ...current.reports]
    return { ...current, reports, projects: current.projects.map(project => ({ ...project, reportIds: reports.filter(report => report.projectId === project.id).map(report => report.id) })) }
  }), [])
  const addEvidence = useCallback((row: Evidence) => setData(current => ({ ...current, evidence: [row, ...current.evidence] })), [])
  const removeEvidence = useCallback((id: string) => setData(current => ({ ...current, evidence: current.evidence.filter(row => row.id !== id), skills: current.skills.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), tasks: current.tasks.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), projects: current.projects.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), learning: current.learning.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), reports: current.reports.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), leadership: current.leadership.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })) })), [])
  const attachEvidence = useCallback((type: OwnerType, ownerId: string, evidenceId: string) => setData(current => {
    if (type === 'task') return { ...current, tasks: current.tasks.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'project') return { ...current, projects: current.projects.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'learning') return { ...current, learning: current.learning.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'skill') return { ...current, skills: current.skills.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'leadership') return { ...current, leadership: current.leadership.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    return { ...current, reports: current.reports.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
  }), [])
  const updateStagePlan = useCallback((id: string, plan: StagePlan) => setData(current => ({ ...current, stagePlans: { ...current.stagePlans, [id]: plan } })), [])
  const saveProfile = useCallback((profile: ProfessionalProfile) => setData(current => ({ ...current, profile })), [])
  const value = useMemo(() => ({ data, storageError, setTasks, saveTask, changeTaskStatus, removeTask, saveProject, removeProject, saveSkill, saveLearning, saveLeadership, saveReport, addEvidence, removeEvidence, attachEvidence, updateStagePlan, saveProfile, updateCollection }), [data, storageError, setTasks, saveTask, changeTaskStatus, removeTask, saveProject, removeProject, saveSkill, saveLearning, saveLeadership, saveReport, addEvidence, removeEvidence, attachEvidence, updateStagePlan, saveProfile, updateCollection])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useWorkspace() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return value
}

export function localStamp() {
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return { date, time }
}
