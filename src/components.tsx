import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import type { PropsWithChildren, ReactNode } from 'react'
import type { Evidence, OwnerType, Project, Task } from './model'
import { blankTask } from './model'
import { localStamp, useWorkspace } from './store'
import { deleteFile, getFileUrl, storeFile } from './fileStore'

export const navItems = [
  { to: '/', label: 'Home', icon: 'overview', end: true },
  { to: '/roadmap', label: 'Career roadmap', icon: 'roadmap' },
  { to: '/skills', label: 'Technical skills', icon: 'skills' },
  { to: '/projects', label: 'Projects', icon: 'projects' },
  { to: '/learning', label: 'Learning & research', icon: 'learning' },
  { to: '/leadership', label: 'Leadership', icon: 'leadership' },
  { to: '/about', label: 'About', icon: 'about' },
]

const glyphs: Record<string, string> = {
  overview: 'M3 3h7v7H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 14h7v7H3z',
  roadmap: 'M4 18V6m0 12h5m-5-6h10m-10-6h15 M16 3l3 3-3 3m-5 3 3 3-3 3m-3 0 3 3-3 3',
  skills: 'M12 3 3.5 7.5 12 12l8.5-4.5L12 3Zm-8.5 9L12 16.5l8.5-4.5M3.5 16 12 20.5l8.5-4.5',
  projects: 'M4 5h16v15H4z M8 5V3h8v2m-12 5h16m-11 4h6',
  learning: 'M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22V5.5Zm18 0A2.5 2.5 0 0 0 18.5 3H12v17h6.5A2.5 2.5 0 0 1 21 22V5.5Z',
  leadership: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75M10 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  about: 'M20 21a8 8 0 0 0-16 0m8-10a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  if (name === 'arrow') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (name === 'plus') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'check') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (name === 'clock') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  if (name === 'upload') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (name === 'search') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7"/><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  if (name === 'close') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  if (name === 'menu') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={glyphs[name] ?? glyphs.overview} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export function StatusBadge({ status }: { status: string }) {
  const className = status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return <span className={`badge badge-${className}`}>{status}</span>
}

export function formatDate(value: string) {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function dateTime(date: string, time: string) {
  if (!date) return 'Not recorded'
  return `${formatDate(date)}${time ? ` · ${time}` : ''}`
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow ?? 'CAREER DEVELOPMENT'}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>
}

export function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <div className="section-title"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>
}

export function Panel({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`panel ${className}`}>{children}</section>
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data, user, syncStatus, syncError, retrySync, signOut } = useWorkspace()
  const unfinished = data.tasks.filter(task => task.status !== 'Completed').length
  return <div className="app-frame">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand" onClick={() => setMobileOpen(false)}><span className="brand-mark">A<span>·</span></span><span><strong>Allen</strong><small>ENGINEERING PORTFOLIO</small></span></Link>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="primary-nav" aria-label="Main navigation">
        {navItems.map(item => <NavLink key={item.to} to={item.to} end={'end' in item && item.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}
      </nav>
      <div className="sidebar-spacer" />
      <Link to="/work" className="work-shortcut" onClick={() => setMobileOpen(false)}><span className="shortcut-icon"><Icon name="check" /></span><span><strong>My work</strong><small>{unfinished} outstanding</small></span><Icon name="arrow" size={15} /></Link>
      <div className="sidebar-profile"><span className="avatar">A</span><span><strong>{data.profile.name}</strong><small>{user.email || 'Supabase account'}</small></span><span className="profile-dot" title="Supabase workspace" /></div>
    </aside>
    {mobileOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <div className="main-shell">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(value => !value)}><Icon name="menu" /></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-sep">/</span><span className="crumb-current">Engineering development</span></div><div className="topbar-right"><span className={`save-indicator sync-${syncStatus}`}><i />{syncStatus === 'saving' ? 'Saving to Supabase…' : syncStatus === 'error' ? 'Sync error' : 'Synced to Supabase'}</span>{syncStatus === 'error' && <button className="sync-retry" onClick={retrySync}>Retry</button>}<button className="signout-button" onClick={() => void signOut()}>Sign out</button></div></header>
      {syncError && <div className="storage-warning" role="alert">Could not sync your latest changes: {syncError}. <button onClick={retrySync}>Retry sync</button></div>}
      <main className="page-content"><Outlet /></main>
      <footer className="app-footer"><span>Allen · Electrical Engineering · Wits University</span><span>Supabase workspace · <Link to="/about">Storage & privacy</Link></span></footer>
    </div>
  </div>
}

export function Dialog({ title, children, onClose, wide = false }: PropsWithChildren<{ title: string; onClose: () => void; wide?: boolean }>) {
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])
  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className={`dialog ${wide ? 'dialog-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><div className="dialog-header"><div><p className="eyebrow">WORKSPACE RECORD</p><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></div><div className="dialog-body">{children}</div></section></div>
}

function Field({ label, children, hint }: PropsWithChildren<{ label: string; hint?: string }>) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
const inputClass = 'form-input'

export function TaskList({ tasks, stageId, projectId, compact = false, defaultCreate = false, emptyMessage, initialStatus = 'All work' }: { tasks: Task[]; stageId?: string; projectId?: string; compact?: boolean; defaultCreate?: boolean; emptyMessage?: string; initialStatus?: string }) {
  const { data } = useWorkspace()
  const [status, setStatus] = useState(initialStatus)
  const [discipline, setDiscipline] = useState('All disciplines')
  const [project, setProject] = useState(() => projectId ?? new URLSearchParams(window.location.search).get('project') ?? 'All projects')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sort, setSort] = useState('priority')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(() => new URLSearchParams(window.location.search).get('task') ?? '')
  const [createOpen, setCreateOpen] = useState(() => defaultCreate || new URLSearchParams(window.location.search).get('new') === '1')
  const projectMap = useMemo(() => new Map(data.projects.map(row => [row.id, row.title])), [data.projects])
  const filtered = useMemo(() => {
    let rows = [...tasks]
    if (status === 'Completed work') rows = rows.filter(row => row.status === 'Completed')
    if (status === 'Incomplete work') rows = rows.filter(row => row.status !== 'Completed')
    if (status === 'Not started') rows = rows.filter(row => row.status === 'Not Started')
    if (status === 'In progress') rows = rows.filter(row => row.status === 'In Progress')
    if (discipline !== 'All disciplines') rows = rows.filter(row => row.discipline === discipline)
    if (project !== 'All projects') rows = rows.filter(row => row.projectId === project)
    if (fromDate) rows = rows.filter(row => row.targetDate && row.targetDate >= fromDate)
    if (toDate) rows = rows.filter(row => row.targetDate && row.targetDate <= toDate)
    const q = query.trim().toLowerCase()
    if (q) rows = rows.filter(row => `${row.title} ${row.description} ${row.why}`.toLowerCase().includes(q))
    const priority = { High: 0, Medium: 1, Low: 2 }
    rows.sort((a, b) => sort === 'target' ? (a.targetDate || '9999').localeCompare(b.targetDate || '9999') : sort === 'updated' ? (b.updatedAt || '').localeCompare(a.updatedAt || '') : sort === 'created' ? (b.createdAt || '').localeCompare(a.createdAt || '') : priority[a.priority] - priority[b.priority] || a.title.localeCompare(b.title))
    return rows
  }, [tasks, status, discipline, project, fromDate, toDate, sort, query])
  const disciplines = [...new Set(tasks.map(task => task.discipline).filter(Boolean))].sort()
  const current = selectedId ? tasks.find(task => task.id === selectedId) : undefined
  const projectRow = projectId ? data.projects.find(row => row.id === projectId) : undefined
  const closeCreate = () => { setCreateOpen(false); const url = new URL(window.location.href); url.searchParams.delete('new'); window.history.replaceState({}, '', url) }
  const newTask = blankTask()
  if (stageId) newTask.stageId = stageId
  if (projectId) newTask.projectId = projectId
  return <div className={`task-list ${compact ? 'task-list-compact' : ''}`}>
    <div className="task-toolbar">
      {!compact && <div className="task-search"><Icon name="search" size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /></div>}
      <div className="task-filters">
        <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter by status"><option>All work</option><option>Completed work</option><option>Incomplete work</option><option>Not started</option><option>In progress</option></select>
        {!compact && <select value={discipline} onChange={event => setDiscipline(event.target.value)} aria-label="Filter by discipline"><option>All disciplines</option>{disciplines.map(value => <option key={value}>{value}</option>)}</select>}
        {!compact && !projectId && <select value={project} onChange={event => setProject(event.target.value)} aria-label="Filter by project"><option>All projects</option>{data.projects.map(row => <option key={row.id} value={row.id}>{row.title}</option>)}</select>}
        {!compact && <select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort tasks"><option value="priority">Sort: priority</option><option value="target">Sort: target date</option><option value="updated">Sort: recently updated</option><option value="created">Sort: created</option></select>}
      </div>
      {!compact && <div className="date-filter"><label>Target from<input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} aria-label="Target date from" /></label><label>to<input type="date" value={toDate} onChange={event => setToDate(event.target.value)} aria-label="Target date to" /></label></div>}
      <button className="button button-dark button-small" onClick={() => setCreateOpen(true)}><Icon name="plus" size={16} /> Add task</button>
    </div>
    <div className="task-results-note">{filtered.length} {filtered.length === 1 ? 'task' : 'tasks'} · {filtered.filter(task => task.targetDate && task.targetDate < localStamp().date && task.status !== 'Completed').length} overdue</div>
    {filtered.length ? <div className="task-cards">{filtered.map(task => <TaskCard key={task.id} task={task} projectId={task.projectId} projectName={projectMap.get(task.projectId) ?? ''} onOpen={() => setSelectedId(task.id)} />)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="check" size={21} /></span><strong>{emptyMessage ?? 'No tasks match these filters.'}</strong><p>{query || fromDate || toDate ? 'Try adjusting the search or filters.' : 'Add a task when you are ready to plan the next piece of work.'}</p></div>}
    {current && <TaskDialog task={current} projects={data.projects} onClose={() => { setSelectedId(''); const url = new URL(window.location.href); url.searchParams.delete('task'); window.history.replaceState({}, '', url) }} />}
    {createOpen && <TaskDialog task={newTask} projects={data.projects} onClose={closeCreate} creating />}
    {projectRow && projectRow.status === 'Planned' && !tasks.length && <p className="muted-note">Planned project · tasks are editable as work is defined.</p>}
  </div>
}

function TaskCard({ task, projectId, projectName, onOpen }: { task: Task; projectId: string; projectName: string; onOpen: () => void }) {
  const { changeTaskStatus } = useWorkspace()
  const overdue = task.status !== 'Completed' && task.targetDate && task.targetDate < localStamp().date
  return <article className="task-card">
    <div className="task-status-rail"><span className={`task-dot ${task.status.toLowerCase().replace(' ', '-')}`} /></div>
    <div className="task-card-main"><div className="task-card-heading"><button className="task-title-button" onClick={onOpen}>{task.title}</button><StatusBadge status={task.status} /></div>
      <p>{task.why || task.description}</p>
      <div className="task-meta"><span>{task.discipline}</span>{projectName && <><i /> <Link className="task-project-link" to={`/projects/${projectId}`}>{projectName}</Link></>}{task.targetDate && <><i /><span className={overdue ? 'text-overdue' : ''}>{overdue ? 'Overdue · ' : 'Target · '}{formatDate(task.targetDate)}{task.targetTime ? `, ${task.targetTime}` : ''}</span></>}{task.status === 'In Progress' && task.actualStart && <><i/><span>Started · {dateTime(task.actualStart, task.actualStartTime)}</span></>}{task.status === 'Completed' && task.actualCompletion && <><i/><span>Completed · {dateTime(task.actualCompletion, task.actualCompletionTime)}</span></>}</div>
    </div>
    <div className="task-card-actions"><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>{task.status === 'Not Started' && <button className="text-action" onClick={() => changeTaskStatus(task.id, 'In Progress')}>Start</button>}{task.status !== 'Completed' && <button className="text-action" onClick={() => changeTaskStatus(task.id, 'Completed')}>Complete</button>}{task.status === 'Completed' && <button className="text-action" onClick={() => changeTaskStatus(task.id, task.actualStart ? 'In Progress' : 'Not Started')}>Reopen</button>}</div>
  </article>
}

function TaskDialog({ task, projects, onClose, creating = false }: { task: Task; projects: Project[]; onClose: () => void; creating?: boolean }) {
  const { saveTask, removeTask, changeTaskStatus, data } = useWorkspace()
  const [draft, setDraft] = useState<Task>(task)
  const [editing, setEditing] = useState(creating)
  const [saved, setSaved] = useState(false)
  const set = <K extends keyof Task>(key: K, value: Task[K]) => setDraft(current => ({ ...current, [key]: value }))
  const submit = (event: React.FormEvent) => { event.preventDefault(); saveTask({ ...draft, updatedAt: localStamp().date }); setSaved(true); if (creating) onClose(); else setEditing(false) }
  const doDelete = () => { if (window.confirm(`Delete “${task.title}”? This cannot be undone.`)) { removeTask(task.id); onClose() } }
  const overdue = task.status !== 'Completed' && task.targetDate && task.targetDate < localStamp().date
  return <Dialog title={creating ? 'Create a task' : task.title || 'Task details'} onClose={onClose} wide>
    {!editing && <>
      <div className="record-banner"><StatusBadge status={task.status} /><span className="priority priority-in-banner">{task.priority} priority</span>{overdue && <span className="overdue-pill">Target date passed</span>}<div className="record-banner-actions"><button className="button button-outline button-small" onClick={() => { setDraft(task); setEditing(true) }}>Edit task</button>{task.status === 'Not Started' && <button className="button button-soft button-small" onClick={() => changeTaskStatus(task.id, 'In Progress')}>Start task</button>}{task.status !== 'Completed' && <button className="button button-dark button-small" onClick={() => changeTaskStatus(task.id, 'Completed')}>Mark complete</button>}{task.status === 'Completed' && <button className="button button-soft button-small" onClick={() => changeTaskStatus(task.id, task.actualStart ? 'In Progress' : 'Not Started')}>Reopen</button>}</div></div>
      <div className="detail-grid"><Detail label="Why this matters" value={task.why || 'Not added yet.'} wide /><Detail label="Description" value={task.description || 'Not added yet.'} /><Detail label="Definition of done" value={task.doneDefinition || 'Not added yet.'} /><Detail label="Discipline" value={task.discipline || 'Not set'} /><Detail label="Career stage" value={task.stageId || 'Not linked'} /><Detail label="Planned start" value={dateTime(task.plannedStart, task.plannedStartTime)} /><Detail label="Planned completion" value={dateTime(task.targetDate, task.targetTime)} /><Detail label="Actual start" value={dateTime(task.actualStart, task.actualStartTime)} /><Detail label="Actual completion" value={dateTime(task.actualCompletion, task.actualCompletionTime)} /><Detail label="Related technical skills" value={task.skillIds.map(id=>data.skills.find(skill=>skill.id===id)?.name).filter(Boolean).join(', ')||'No skills linked'} /><Detail label="Dependencies" value={task.dependencies.map(id=>data.tasks.find(item=>item.id===id)?.title).filter(Boolean).join(', ')||'No dependencies'} /><Detail label="Notes" value={task.notes || 'No notes recorded.'} wide /></div>
      {task.statusHistory.length > 0 && <div className="history-block"><h3>Status history</h3>{task.statusHistory.map((entry, index) => <div key={index}><StatusBadge status={entry.status} /><span>{dateTime(entry.date, entry.time)}</span></div>)}</div>}
      <EvidenceManager ownerType="task" ownerId={task.id} evidenceIds={task.evidenceIds} />
      <div className="dialog-footer spread"><span className="muted-note">Changes sync to your Supabase workspace.</span><button className="text-action danger-text" onClick={doDelete}>Delete task</button></div>
    </>}
    {editing && <form onSubmit={submit} className="record-form">
      <div className="form-grid"><Field label="Task title *"><input className={inputClass} required value={draft.title} onChange={event => set('title', event.target.value)} /></Field><Field label="Discipline"><input className={inputClass} value={draft.discipline} onChange={event => set('discipline', event.target.value)} list="disciplines"/><datalist id="disciplines"><option>Control Engineering</option><option>Electrical Engineering</option><option>Embedded Systems</option><option>Instrumentation</option><option>Engineering Delivery</option></datalist></Field>
        <Field label="Project"><select className={inputClass} value={draft.projectId} onChange={event => set('projectId', event.target.value)}><option value="">No project linked</option>{projects.map(row => <option key={row.id} value={row.id}>{row.title}</option>)}</select></Field><Field label="Career roadmap stage"><select className={inputClass} value={draft.stageId} onChange={event => set('stageId', event.target.value)}><option value="">No stage linked</option><option value="foundations">Electrical engineering foundations</option><option value="control-foundations">Control engineering foundations</option><option value="practical-control">Practical control engineering</option><option value="embedded-automation">Embedded control and automation</option><option value="instrumentation">Instrumentation and industrial systems</option><option value="electromechanical">Electromechanical systems</option><option value="power-high-voltage">Electrical power and high voltage</option><option value="project-delivery">Engineering project delivery</option><option value="technical-leadership">Technical leadership</option><option value="engineering-management">Electrical & Instrumentation Management</option></select></Field>
        <Field label="Priority"><select className={inputClass} value={draft.priority} onChange={event => set('priority', event.target.value as Task['priority'])}><option>Low</option><option>Medium</option><option>High</option></select></Field><Field label="Planned start date"><input type="date" className={inputClass} value={draft.plannedStart} onChange={event => set('plannedStart', event.target.value)} /></Field><Field label="Planned start time"><input type="time" className={inputClass} value={draft.plannedStartTime} onChange={event => set('plannedStartTime', event.target.value)} /></Field><Field label="Target completion date"><input type="date" className={inputClass} value={draft.targetDate} onChange={event => set('targetDate', event.target.value)} /></Field><Field label="Target completion time"><input type="time" className={inputClass} value={draft.targetTime} onChange={event => set('targetTime', event.target.value)} /></Field>
        <Field label="Related technical skills"><select className={inputClass} multiple size={4} value={draft.skillIds} onChange={event=>set('skillIds',Array.from(event.currentTarget.selectedOptions).map(option=>option.value))}>{data.skills.map(skill=><option key={skill.id} value={skill.id}>{skill.name}</option>)}</select><small>Use Ctrl or Command to select multiple skills.</small></Field><Field label="Task dependencies"><select className={inputClass} multiple size={4} value={draft.dependencies} onChange={event=>set('dependencies',Array.from(event.currentTarget.selectedOptions).map(option=>option.value))}>{data.tasks.filter(item=>item.id!==draft.id).map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select><small>Choose prerequisite tasks, if applicable.</small></Field>
        <Field label="Description"><textarea className={inputClass} rows={3} value={draft.description} onChange={event => set('description', event.target.value)} /></Field><Field label="Why this task matters"><textarea className={inputClass} rows={3} value={draft.why} onChange={event => set('why', event.target.value)} /></Field><Field label="Expected deliverable / definition of done"><textarea className={inputClass} rows={3} value={draft.doneDefinition} onChange={event => set('doneDefinition', event.target.value)} /></Field><Field label="Notes"><textarea className={inputClass} rows={3} value={draft.notes} onChange={event => set('notes', event.target.value)} /></Field>
      </div><p className="form-hint">Planned and actual dates are separate. Starting or completing a task records the local date and time; reopening preserves its history.</p>
      <div className="dialog-footer"><button type="button" className="button button-outline" onClick={() => creating ? onClose() : setEditing(false)}>Cancel</button><button className="button button-dark" type="submit">{creating ? 'Create task' : 'Save changes'}</button></div>
    </form>}
    {saved && <span className="sr-only" role="status">Task saved.</span>}
  </Dialog>
}

function Detail({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={`detail-item ${wide ? 'detail-wide' : ''}`}><span>{label}</span><p>{value}</p></div>
}

export function EvidenceManager({ ownerType, ownerId, evidenceIds }: { ownerType: OwnerType; ownerId: string; evidenceIds: string[] }) {
  const { data, user, addEvidence, attachEvidence, removeEvidence } = useWorkspace()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('Technical calculation')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const evidence = evidenceIds.map(id => data.evidence.find(item => item.id === id)).filter((item): item is Evidence => Boolean(item))
  const accept = '.png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.m,.mat,.slx,.c,.h,.cpp,.ino,.zip,.pptx'
  const upload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const input = event.currentTarget.elements.namedItem('evidence-file') as HTMLInputElement
    const file = input.files?.[0]
    if (!file) { setError('Choose a file to attach.'); return }
    if (file.size > 20 * 1024 * 1024) { setError('This file is larger than the 20 MB upload limit.'); return }
    const allowed = /\.(png|jpe?g|webp|gif|svg|pdf|docx?|xlsx?|csv|txt|md|m|mat|slx|c|h|cpp|ino|zip|pptx)$/i.test(file.name)
    if (!allowed) { setError('This file type is not supported. Choose an image, report, data file, or source file.'); return }
    setBusy(true)
    try {
      const id = crypto.randomUUID()
      const storageKey = `${user.id}/${id}`
      await storeFile(storageKey, file)
      const row: Evidence = { id, title: title.trim() || file.name, description: description.trim(), date, category, ownerType, ownerId, filename: file.name, mimeType: file.type || mimeGuess(file.name), size: file.size, storageKey }
      addEvidence(row); attachEvidence(ownerType, ownerId, id); setUploadOpen(false); setTitle(''); setDescription(''); setDate('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not upload this file to Supabase Storage.') }
    finally { setBusy(false) }
  }
  const remove = async (item: Evidence) => {
    if (!window.confirm(`Remove “${item.title}” and its Supabase Storage file?`)) return
    try { await deleteFile(item.storageKey); removeEvidence(item.id) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not remove this file from Supabase Storage.') }
  }
  return <section className="evidence-section"><div className="section-title"><div><h3>Technical evidence</h3><p>Attach real work and supporting files to this record.</p></div><button className="button button-outline button-small" onClick={() => setUploadOpen(value => !value)}><Icon name="upload" size={15} /> Add evidence</button></div>
    {evidence.length ? <div className="evidence-grid">{evidence.map(item => <EvidenceCard key={item.id} item={item} onRemove={() => remove(item)} />)}</div> : <div className="evidence-empty">No evidence attached yet.</div>}
    {uploadOpen && <form className="evidence-upload" onSubmit={upload}><div className="form-grid"><Field label="Choose file *"><input className={inputClass} name="evidence-file" type="file" accept={accept} required /></Field><Field label="Evidence title"><input className={inputClass} value={title} onChange={event => setTitle(event.target.value)} placeholder="Defaults to the filename" /></Field><Field label="Category"><select className={inputClass} value={category} onChange={event => setCategory(event.target.value)}><option>Technical calculation</option><option>MATLAB / Simulink</option><option>Hardware photograph</option><option>Test result</option><option>Circuit diagram</option><option>Technical report</option><option>Source code</option><option>Reference</option><option>Other</option></select></Field><Field label="Evidence date"><input type="date" className={inputClass} value={date} onChange={event => setDate(event.target.value)} /></Field><Field label="Description"><textarea className={inputClass} rows={2} value={description} onChange={event => setDescription(event.target.value)} placeholder="What does this file show?" /></Field></div><p className="form-hint">Files upload to your private Supabase Storage bucket, up to 20 MB each. Signed links expire after ten minutes.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-footer"><button type="button" className="button button-outline button-small" onClick={() => setUploadOpen(false)}>Cancel</button><button className="button button-dark button-small" disabled={busy}>{busy ? 'Uploading…' : 'Attach evidence'}</button></div></form>}
  </section>
}

function mimeGuess(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  return ({ png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif', svg:'image/svg+xml', pdf:'application/pdf', csv:'text/csv', txt:'text/plain', md:'text/markdown' } as Record<string,string>)[ext ?? ''] ?? 'application/octet-stream'
}

function EvidenceCard({ item, onRemove }: { item: Evidence; onRemove: () => void }) {
  const [url, setUrl] = useState('')
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    let active = true
    getFileUrl(item.storageKey).then(signedUrl => { if (!active) return; setUrl(signedUrl) }).catch(() => { if (active) setMissing(true) })
    return () => { active = false }
  }, [item.storageKey])
  const isImage = item.mimeType.startsWith('image/')
  const size = item.size > 1024 * 1024 ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(item.size / 1024))} KB`
  return <article className="evidence-card">{isImage && url ? <a href={url} target="_blank" rel="noreferrer" className="evidence-preview"><img src={url} alt={item.description || item.title} /></a> : <div className="file-icon">{item.filename.split('.').pop()?.toUpperCase().slice(0, 5) || 'FILE'}</div>}<div className="evidence-card-info"><strong>{item.title}</strong><span>{item.category}{item.date ? ` · ${formatDate(item.date)}` : ''} · {size}</span>{item.description && <p>{item.description}</p>}{missing ? <span className="form-error">File unavailable. Check your Supabase Storage setup.</span> : url ? <a className="text-link" href={url} download={item.filename}>Open / download <Icon name="arrow" size={13}/></a> : <span className="muted-note">Loading file from Supabase…</span>}</div><button className="icon-button tiny-icon danger-text" onClick={onRemove} aria-label={`Remove ${item.title}`}><Icon name="close" size={15}/></button></article>
}

export function SectionCallout({ children, tone = 'sage' }: PropsWithChildren<{ tone?: 'sage'|'amber'|'blue' }>) {
  return <div className={`callout callout-${tone}`}>{children}</div>
}

export function ProjectLink({ project }: { project: Project }) {
  return <Link className="text-link" to={`/projects/${project.id}`}>Open project <Icon name="arrow" size={13}/></Link>
}
