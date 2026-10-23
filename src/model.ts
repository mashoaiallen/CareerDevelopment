export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed'
export type Priority = 'Low' | 'Medium' | 'High'
export type ProjectStatus = 'Planned' | 'In Progress' | 'Existing' | 'Completed'
export type PublicationStatus = 'Draft / Local' | 'Ready for Review' | 'Published in Portfolio'
export type OwnerType = 'task' | 'project' | 'learning' | 'report' | 'skill' | 'leadership'

export interface Task {
  id: string
  title: string
  description: string
  why: string
  doneDefinition: string
  discipline: string
  stageId: string
  projectId: string
  priority: Priority
  status: TaskStatus
  plannedStart: string
  plannedStartTime: string
  targetDate: string
  targetTime: string
  actualStart: string
  actualStartTime: string
  actualCompletion: string
  actualCompletionTime: string
  notes: string
  skillIds: string[]
  dependencies: string[]
  evidenceIds: string[]
  createdAt: string
  updatedAt: string
  statusHistory: { status: TaskStatus; date: string; time: string }[]
}

export interface Project {
  id: string
  title: string
  summary: string
  discipline: string
  tags: string[]
  type: string
  status: ProjectStatus
  publication: PublicationStatus
  problem: string
  objectives: string
  requirements: string
  theory: string
  approach: string
  calculations: string
  methods: string
  results: string
  challenges: string
  lessons: string
  nextSteps: string
  startDate: string
  targetDate: string
  completionDate: string
  contribution: string
  contributors: string
  repository: string
  evidenceIds: string[]
  reportIds: string[]
}

export interface Skill {
  id: string
  name: string
  category: string
  description: string
  level: number
  target: number
  evidenceIds: string[]
  projectIds: string[]
  taskIds: string[]
  lastReviewed: string
  nextAction: string
}

export interface LearningRecord {
  id: string
  topic: string
  objective: string
  source: string
  notes: string
  keyConcepts: string
  equations: string
  exercises: string
  projectId: string
  status: TaskStatus
  activityType: string
  startDate: string
  completionDate: string
  evidenceIds: string[]
}

export interface LeadershipRecord {
  id: string
  title: string
  level: number
  situation: string
  responsibility: string
  actions: string
  decisions: string
  outcome: string
  learning: string
  improvement: string
  evidenceIds: string[]
}

export interface Report {
  id: string
  title: string
  summary: string
  problem: string
  objectives: string
  theory: string
  methodology: string
  calculations: string
  simulation: string
  experiment: string
  results: string
  analysis: string
  limitations: string
  conclusions: string
  references: string
  projectId: string
  status: 'Draft' | 'In Progress' | 'Ready for Review' | 'Published'
  publicationDate: string
  evidenceIds: string[]
}

export interface Evidence {
  id: string
  visibility: 'private' | 'public'
  title: string
  description: string
  date: string
  category: string
  ownerType: OwnerType
  ownerId: string
  filename: string
  mimeType: string
  size: number
  storageKey: string
}

export interface StagePlan {
  startDate: string
  targetDate: string
  completionDate: string
}

export interface ProfessionalProfile {
  name: string
  title: string
  institution: string
  degree: string
  currentStage: string
  longTermGoal: string
  introduction: string
  technicalInterests: string
  priorities: string
  email: string
  github: string
  linkedin: string
  cv: string
}

export interface WorkspaceData {
  tasks: Task[]
  projects: Project[]
  skills: Skill[]
  learning: LearningRecord[]
  leadership: LeadershipRecord[]
  reports: Report[]
  evidence: Evidence[]
  stagePlans: Record<string, StagePlan>
  profile: ProfessionalProfile
}

export const blankProject = (id = crypto.randomUUID()): Project => ({
  id, title: '', summary: '', discipline: 'Control Engineering', tags: [], type: 'Personal', status: 'Planned',
  publication: 'Draft / Local', problem: '', objectives: '', requirements: '', theory: '', approach: '', calculations: '',
  methods: '', results: '', challenges: '', lessons: '', nextSteps: '', startDate: '', targetDate: '', completionDate: '',
  contribution: '', contributors: '', repository: '', evidenceIds: [], reportIds: [],
})

export const blankTask = (id = crypto.randomUUID()): Task => ({
  id, title: '', description: '', why: '', doneDefinition: '', discipline: 'Control Engineering', stageId: 'control-foundations',
  projectId: '', priority: 'Medium', status: 'Not Started', plannedStart: '', plannedStartTime: '', targetDate: '', targetTime: '',
  actualStart: '', actualStartTime: '', actualCompletion: '', actualCompletionTime: '', notes: '', skillIds: [], dependencies: [],
  evidenceIds: [], createdAt: localToday(), updatedAt: localToday(), statusHistory: [],
})

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

