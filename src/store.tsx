import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { User } from '@supabase/supabase-js'
import { initialData } from './seeds'
import { BackendErrorScreen, BackendLoadingScreen } from './backendScreens'
import { supabase, supabaseConfigured } from './supabase'
import type { Evidence, Project, Report, Skill, Task, WorkspaceData, LearningRecord, LeadershipRecord, OwnerType, ProfessionalProfile, StagePlan } from './model'

type SyncStatus = 'loading' | 'saving' | 'saved' | 'error'
type AuthResult = { error?: string; message?: string }
type WorkspaceUpdate = (updater: (current: WorkspaceData) => WorkspaceData) => void
const ADMIN_EMAIL = 'mashoaiallen@gmail.com'

type StoreApi = {
  data: WorkspaceData
  user: User | null
  isAdmin: boolean
  canSignIn: boolean
  syncStatus: SyncStatus
  syncError: string
  retrySync: () => void
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
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

function isAdministrator(user: User | null) {
  return user?.email?.trim().toLowerCase() === ADMIN_EMAIL
}

function mergeWorkspace(value: unknown): WorkspaceData {
  const saved = value && typeof value === 'object' ? value as Partial<WorkspaceData> : {}
  return {
    ...initialData,
    ...saved,
    tasks: Array.isArray(saved.tasks) ? saved.tasks : initialData.tasks,
    projects: Array.isArray(saved.projects) ? saved.projects : initialData.projects,
    skills: Array.isArray(saved.skills) ? saved.skills : initialData.skills,
    learning: Array.isArray(saved.learning) ? saved.learning : initialData.learning,
    leadership: Array.isArray(saved.leadership) ? saved.leadership : initialData.leadership,
    reports: Array.isArray(saved.reports) ? saved.reports : initialData.reports,
    evidence: Array.isArray(saved.evidence) ? saved.evidence.map(item => ({ ...item, visibility: item.visibility === 'public' ? 'public' : 'private' })) : initialData.evidence,
    stagePlans: { ...initialData.stagePlans, ...saved.stagePlans },
    profile: { ...initialData.profile, ...saved.profile },
  }
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const [connectionAttempt, setConnectionAttempt] = useState(0)
  const [workspaceLoadError, setWorkspaceLoadError] = useState('')
  const [workspaceAttempt, setWorkspaceAttempt] = useState(0)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [data, setData] = useState<WorkspaceData>(initialData)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')
  const [syncError, setSyncError] = useState('')
  const [retryVersion, setRetryVersion] = useState(0)
  const lastSyncedData = useRef('')
  const saveQueue = useRef<Promise<void>>(Promise.resolve())
  const isAdmin = isAdministrator(user)
  const identity = isAdmin ? `admin:${user!.id}` : 'public'

  useEffect(() => {
    const client = supabase
    if (!client) { setAuthReady(true); return }
    let active = true
    setAuthReady(false)
    setConnectionError('')
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const nextUser = session?.user ?? null
      if (nextUser && !isAdministrator(nextUser)) {
        setUser(null)
        window.setTimeout(() => { if (active) void client.auth.signOut() }, 0)
      } else setUser(nextUser)
    })
    client.auth.getSession().then(async ({ data: result, error }) => {
      if (!active) return
      if (error) setConnectionError('Could not connect to the portfolio. Please try again.')
      const nextUser = result.session?.user ?? null
      if (nextUser && !isAdministrator(nextUser)) {
        await client.auth.signOut()
        if (!active) return
        setUser(null)
      } else setUser(nextUser)
      setAuthReady(true)
    }).catch(() => {
      if (!active) return
      setConnectionError('Could not connect to the portfolio. Please try again.')
      setAuthReady(true)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [connectionAttempt])

  useEffect(() => {
    if (!authReady) return
    const client = supabase
    let active = true
    setLoadedFor(null)
    setWorkspaceLoadError('')
    setSyncStatus('loading')
    const load = async () => {
      if (!client) {
        setData(initialData)
        lastSyncedData.current = JSON.stringify(initialData)
        setLoadedFor(identity)
        setSyncStatus('saved')
        return
      }
      if (isAdmin && user) {
        const { data: row, error } = await client.from('workspaces').select('data').eq('user_id', user.id).maybeSingle()
        if (error) throw error
        let workspaceData: WorkspaceData
        if (row) {
          workspaceData = mergeWorkspace(row.data)
        } else {
          workspaceData = initialData
          const { error: insertError } = await client.from('workspaces').insert({ user_id: user.id, data: workspaceData })
          if (insertError?.code === '23505') {
            const { data: racedRow, error: reloadError } = await client.from('workspaces').select('data').eq('user_id', user.id).single()
            if (reloadError) throw reloadError
            workspaceData = mergeWorkspace(racedRow.data)
          } else if (insertError) throw insertError
        }
        if (!active) return
        setData(workspaceData)
        lastSyncedData.current = JSON.stringify(workspaceData)
        setLoadedFor(identity)
        setSyncStatus('saved')
        return
      }
      const { data: row, error } = await client.from('portfolio_public').select('data').eq('id', true).maybeSingle()
      if (error) throw error
      const workspaceData = row ? mergeWorkspace(row.data) : initialData
      if (!active) return
      setData(workspaceData)
      lastSyncedData.current = JSON.stringify(workspaceData)
      setLoadedFor(identity)
      setSyncStatus('saved')
    }
    load().catch(() => {
      if (!active) return
      setWorkspaceLoadError('The portfolio data could not be loaded. Please try again in a moment.')
    })
    return () => { active = false }
  }, [authReady, identity, isAdmin, user?.id, workspaceAttempt])

  useEffect(() => {
    const client = supabase
    if (!client || !isAdmin || !user || loadedFor !== identity) return
    const snapshot = JSON.stringify(data)
    if (snapshot === lastSyncedData.current) { setSyncStatus('saved'); return }
    let active = true
    setSyncStatus('saving')
    setSyncError('')
    const timer = window.setTimeout(() => {
      const persist = async () => {
        const { error } = await client.from('workspaces').upsert({ user_id: user.id, data: JSON.parse(snapshot), updated_at: new Date().toISOString() })
        if (error) throw error
        lastSyncedData.current = snapshot
      }
      saveQueue.current = saveQueue.current.then(persist, persist)
      saveQueue.current.then(() => {
        if (active) { setSyncStatus('saved'); setSyncError('') }
      }).catch(() => {
        if (active) { setSyncStatus('error'); setSyncError('Could not save the latest changes. Please try again.') }
      })
    }, 400)
    return () => { active = false; window.clearTimeout(timer) }
  }, [data, identity, isAdmin, user?.id, loadedFor, retryVersion])

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabaseConfigured || !supabase) return { error: 'Administrator sign-in is unavailable right now.' }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) return { error: 'Invalid email or password.' }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return error ? { error: error.message } : {}
  }, [])
  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut() }, [])
  const mutate = useCallback<WorkspaceUpdate>((updater) => { if (isAdmin) setData(updater) }, [isAdmin])

  const updateCollection = useCallback<StoreApi['updateCollection']>((key, rows) => {
    mutate(current => ({ ...current, [key]: rows }))
  }, [mutate])
  const saveTask = useCallback((task: Task) => mutate(current => ({ ...current, tasks: current.tasks.some(row => row.id === task.id) ? current.tasks.map(row => row.id === task.id ? task : row) : [task, ...current.tasks] })), [mutate])
  const setTasks = useCallback<StoreApi['setTasks']>((next) => mutate(current => ({ ...current, tasks: typeof next === 'function' ? next(current.tasks) : next })), [mutate])
  const changeTaskStatus = useCallback((id: string, status: Task['status']) => {
    const stamp = localStamp()
    mutate(current => ({ ...current, tasks: current.tasks.map(task => {
      if (task.id !== id || task.status === status) return task
      const history = [...(task.statusHistory ?? []), { status, date: stamp.date, time: stamp.time }]
      const next: Task = { ...task, status, updatedAt: stamp.date, statusHistory: history }
      if (status === 'In Progress' && !task.actualStart) { next.actualStart = stamp.date; next.actualStartTime = stamp.time }
      if (status === 'Completed') { next.actualCompletion = stamp.date; next.actualCompletionTime = stamp.time }
      return next
    }) }))
  }, [mutate])
  const removeTask = useCallback((id: string) => mutate(current => ({ ...current, tasks: current.tasks.filter(row => row.id !== id) })), [mutate])
  const saveProject = useCallback((row: Project) => mutate(current => ({ ...current, projects: current.projects.some(x => x.id === row.id) ? current.projects.map(x => x.id === row.id ? { ...row, reportIds: current.reports.filter(report => report.projectId === row.id).map(report => report.id) } : x) : [{ ...row, reportIds: current.reports.filter(report => report.projectId === row.id).map(report => report.id) }, ...current.projects] })), [mutate])
  const removeProject = useCallback((id: string) => mutate(current => ({ ...current, projects: current.projects.filter(row => row.id !== id), tasks: current.tasks.map(row => row.projectId === id ? { ...row, projectId: '' } : row), learning: current.learning.map(row => row.projectId === id ? { ...row, projectId: '' } : row), reports: current.reports.map(row => row.projectId === id ? { ...row, projectId: '' } : row) })), [mutate])
  const saveSkill = useCallback((row: Skill) => mutate(current => ({ ...current, skills: current.skills.some(x => x.id === row.id) ? current.skills.map(x => x.id === row.id ? row : x) : [row, ...current.skills] })), [mutate])
  const saveLearning = useCallback((row: LearningRecord) => mutate(current => ({ ...current, learning: current.learning.some(x => x.id === row.id) ? current.learning.map(x => x.id === row.id ? row : x) : [row, ...current.learning] })), [mutate])
  const saveLeadership = useCallback((row: LeadershipRecord) => mutate(current => ({ ...current, leadership: current.leadership.map(x => x.id === row.id ? row : x) })), [mutate])
  const saveReport = useCallback((row: Report) => mutate(current => {
    const reports = current.reports.some(x => x.id === row.id) ? current.reports.map(x => x.id === row.id ? row : x) : [row, ...current.reports]
    return { ...current, reports, projects: current.projects.map(project => ({ ...project, reportIds: reports.filter(report => report.projectId === project.id).map(report => report.id) })) }
  }), [mutate])
  const addEvidence = useCallback((row: Evidence) => mutate(current => ({ ...current, evidence: [row, ...current.evidence] })), [mutate])
  const removeEvidence = useCallback((id: string) => mutate(current => ({ ...current, evidence: current.evidence.filter(row => row.id !== id), skills: current.skills.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), tasks: current.tasks.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), projects: current.projects.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), learning: current.learning.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), reports: current.reports.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })), leadership: current.leadership.map(row => ({ ...row, evidenceIds: row.evidenceIds.filter(x => x !== id) })) })), [mutate])
  const attachEvidence = useCallback((type: OwnerType, ownerId: string, evidenceId: string) => mutate(current => {
    if (type === 'task') return { ...current, tasks: current.tasks.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'project') return { ...current, projects: current.projects.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'learning') return { ...current, learning: current.learning.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'skill') return { ...current, skills: current.skills.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    if (type === 'leadership') return { ...current, leadership: current.leadership.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
    return { ...current, reports: current.reports.map(row => row.id === ownerId ? { ...row, evidenceIds: [...new Set([...row.evidenceIds, evidenceId])] } : row) }
  }), [mutate])
  const updateStagePlan = useCallback((id: string, plan: StagePlan) => mutate(current => ({ ...current, stagePlans: { ...current.stagePlans, [id]: plan } })), [mutate])
  const saveProfile = useCallback((profile: ProfessionalProfile) => mutate(current => ({ ...current, profile })), [mutate])
  const retrySync = useCallback(() => setRetryVersion(value => value + 1), [])

  if (!authReady) return <BackendLoadingScreen />
  if (connectionError) return <BackendErrorScreen title="Could not connect to the portfolio" message={connectionError} onRetry={() => setConnectionAttempt(value => value + 1)} />
  if (workspaceLoadError) return <BackendErrorScreen title="Could not load the portfolio" message={workspaceLoadError} onRetry={() => setWorkspaceAttempt(value => value + 1)} onSignOut={isAdmin ? signOut : undefined} />
  if (loadedFor !== identity) return <BackendLoadingScreen message="Loading the portfolio…" />

  const value: StoreApi = { data, user, isAdmin, canSignIn: supabaseConfigured, syncStatus, syncError, retrySync, signInWithPassword, signOut, setTasks, saveTask, changeTaskStatus, removeTask, saveProject, removeProject, saveSkill, saveLearning, saveLeadership, saveReport, addEvidence, removeEvidence, attachEvidence, updateStagePlan, saveProfile, updateCollection }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useWorkspace() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useWorkspace must be used inside a loaded WorkspaceProvider')
  return value
}

export function localStamp() {
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return { date, time }
}
