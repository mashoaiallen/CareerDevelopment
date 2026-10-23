import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

const publicNav = [
  { to: '/public', label: 'Overview', end: true },
  { to: '/public/roadmap', label: 'Career roadmap' },
  { to: '/public/projects', label: 'Projects' },
  { to: '/public/skills', label: 'Skills' },
  { to: '/public/work', label: 'Progress' },
  { to: '/public/leadership', label: 'Leadership' },
  { to: '/public/about', label: 'About' },
]

const stages = [
  ['01', 'Electrical Engineering foundations', 'Circuit analysis, mathematics, signals, electronics and programming.'],
  ['02', 'Control Engineering', 'Transfer functions, modelling, time response, stability, frequency response and feedback.'],
  ['03', 'Practical control systems', 'MATLAB and Simulink modelling, controller design, testing and technical reports.'],
  ['04', 'Embedded control and automation', 'Sensors, actuators, microcontrollers, data acquisition and motor control.'],
  ['05', 'Instrumentation and industrial systems', 'Measurement, transducers, calibration, signal conditioning and industrial control.'],
  ['06', 'Electromechanical systems', 'Electrical machines, drives and the interaction between electrical and mechanical systems.'],
  ['07', 'Electrical power and high voltage', 'Power systems, protection, distribution, high-voltage principles and safety.'],
  ['08', 'Engineering project delivery', 'Requirements, verification, testing, risk management and technical documentation.'],
  ['09', 'Technical and cross-disciplinary leadership', 'Reliable task ownership, small-team coordination and integrated project delivery.'],
  ['10', 'Electrical & Instrumentation Management', 'Long-term goal: technical judgement, safety, planning, reliability and team leadership.'],
]

const projects = [
  { title: 'Sound-tracking vehicle', type: 'Existing hardware project', status: 'Existing', description: 'An embedded system using an ATmega328P, microphone input processing, frequency detection and PWM motor control.', tags: ['ATmega328P', 'Signal processing', 'PWM control'], detail: 'The project explored frequency-based sound detection and steering a vehicle using embedded signal processing. Detailed measurements, circuit documentation and the final report can be added as they are curated for publication.' },
  { title: 'DC motor modelling and PID control', type: 'Planned Control Engineering project', status: 'Planned', description: 'Develop a motor model, derive its transfer function, analyse open-loop behaviour and design a PID controller in MATLAB and Simulink.', tags: ['Transfer functions', 'MATLAB', 'Simulink', 'PID'], detail: 'Planned deliverables include hand calculations, model assumptions, simulation plots, controller comparisons and a technical report. No results or parameters are claimed before the work is completed.' },
  { title: 'Inverted pendulum control', type: 'Planned Control Engineering project', status: 'Planned', description: 'Explore dynamic modelling, instability, feedback control and simulation.', tags: ['System modelling', 'Stability', 'Feedback'], detail: 'This project will be started after the relevant modelling and control foundations have been strengthened.' },
  { title: 'Embedded motor controller', type: 'Planned embedded project', status: 'Planned', description: 'Connect control theory with sensors, microcontrollers, actuators and measured hardware behaviour.', tags: ['Embedded C/C++', 'Sensors', 'Actuators'], detail: 'The project will document the controller architecture, test setup, measured performance and limitations.' },
  { title: 'Water-tank level control', type: 'Planned process-control project', status: 'Planned', description: 'Study process dynamics, level measurement, actuators and feedback control.', tags: ['Process control', 'Instrumentation', 'Simulation'], detail: 'The planned case study will connect process modelling with instrumentation choices and control objectives.' },
]

function Arrow() { return <span aria-hidden="true">↗</span> }

export function PublicEntry() {
  return <PublicLayout><PublicOverview /></PublicLayout>
}

export function PublicLayout({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/public'
  return <div className="public-site">
    <header className="public-header">
      <Link className="public-brand" to="/public" aria-label="Allen's engineering portfolio home"><span className="public-brand-mark">A<span>·</span></span><span><strong>Allen Mashoai</strong><small>ELECTRICAL ENGINEERING</small></span></Link>
      <nav className="public-nav" aria-label="Public portfolio navigation">
        {publicNav.map(item => <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>)}
      </nav>
      <Link className="public-admin-link" to="/admin">Administrator <span aria-hidden="true">↗</span></Link>
    </header>
    <main className="public-main">
      {children ?? <Outlet />}
    </main>
    <footer className="public-footer"><span>© {new Date().getFullYear()} Allen Mashoai</span><span>Electrical Engineering · Control · Instrumentation · Leadership</span>{!isHome && <Link to="/public">Back to overview ↑</Link>}</footer>
  </div>
}

export function PublicOverview() {
  return <>
    <section className="public-hero">
      <div className="public-hero-copy">
        <p className="public-eyebrow">WITS UNIVERSITY · ELECTRICAL ENGINEERING</p>
        <h1>Engineering today.<br /><em>Building towards tomorrow.</em></h1>
        <p className="public-lead">Welcome to my engineering development portfolio. I am building a strong technical foundation in Control Engineering while progressively broadening into instrumentation, automation, electrical power and engineering leadership.</p>
        <p className="public-goal"><span className="public-goal-dot" /> Long-term goal <strong>Electrical &amp; Instrumentation Manager</strong></p>
        <div className="public-hero-actions"><Link to="/public/projects" className="public-button public-button-primary">Explore engineering projects <Arrow /></Link><Link to="/public/roadmap" className="public-button public-button-light">View my career roadmap</Link></div>
        <p className="public-disclaimer">A documented development direction—not a claim of qualifications or a guaranteed career timeline.</p>
      </div>
      <div className="public-pathway" aria-label="Career progression illustration">
        <div className="public-pathway-label">THE DIRECTION</div>
        {stages.filter((_, i) => [0, 1, 4, 6, 8, 9].includes(i)).map((stage, i) => <div className={`public-path-node ${i === 1 ? 'public-path-active' : ''} ${i === 5 ? 'public-path-goal' : ''}`} key={stage[0]}><span>{stage[0]}</span><div><strong>{stage[1]}</strong><small>{i === 1 ? 'Initial technical focus' : i === 5 ? 'Long-term aspiration' : 'Progressive development'}</small></div></div>)}
      </div>
    </section>

    <section className="public-section">
      <div className="public-section-heading"><div><p className="public-eyebrow">EXPLORE THE PORTFOLIO</p><h2>More than a list of skills.</h2></div><p>Follow the plan, inspect the technical work and see how each activity connects to the wider career objective.</p></div>
      <div className="public-feature-grid">
        <Feature icon="↗" title="Career roadmap" description="Explore the staged plan from engineering foundations to control, instrumentation, power and management." to="/public/roadmap" />
        <Feature icon="⌘" title="Engineering projects" description="Review existing hardware work and planned technical case studies, with clear status and expected evidence." to="/public/projects" />
        <Feature icon="▤" title="Technical skills" description="See the capabilities being developed and the kinds of evidence that will support proficiency claims." to="/public/skills" />
        <Feature icon="✓" title="Progress & work" description="Distinguish documented existing work from active development priorities and future goals." to="/public/work" />
        <Feature icon="⌁" title="Learning & research" description="Understand the learning areas, practical exercises and engineering documentation planned along the way." to="/public/learning" />
        <Feature icon="◎" title="Leadership" description="Follow the progression from personal technical ownership to project and cross-disciplinary leadership." to="/public/leadership" />
      </div>
    </section>

    <section className="public-work-preview">
      <div><p className="public-eyebrow">TRANSPARENT PROGRESS</p><h2>Ambition, supported by evidence.</h2><p>Completed activities, current priorities and future plans are deliberately distinguished. A task being completed does not, by itself, mean a skill has been mastered.</p><Link className="public-text-link" to="/public/work">Explore progress and priorities <Arrow /></Link></div>
      <div className="public-work-columns"><div><span className="public-status-dot public-status-existing" /><strong>Existing work</strong><p>Projects and experience already undertaken, with details expanded as evidence is curated.</p></div><div><span className="public-status-dot public-status-planned" /><strong>Planned development</strong><p>Future tasks and case studies, clearly labelled so plans are never presented as achievements.</p></div></div>
    </section>

    <section className="public-cta"><div><p className="public-eyebrow">THE LONG-TERM DIRECTION</p><h2>Build technical depth. Broaden capability. Grow into leadership.</h2><p>My approach is to establish control engineering competence first, then grow through real project opportunities across related electrical and instrumentation disciplines.</p></div><Link className="public-button public-button-primary" to="/public/roadmap">Follow the roadmap <Arrow /></Link></section>
  </>
}

function Feature({ icon, title, description, to }: { icon: string; title: string; description: string; to: string }) {
  return <Link className="public-feature-card" to={to}><span className="public-feature-icon">{icon}</span><strong>{title}</strong><p>{description}</p><span className="public-card-link">Explore section <Arrow /></span></Link>
}

function PublicPageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="public-page-heading"><p className="public-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
}

export function PublicRoadmap() {
  return <><PublicPageHeading eyebrow="CAREER ROADMAP" title="A deliberate path toward engineering leadership." description="The roadmap shows the direction of development, not a rigid timetable. Stages can overlap as coursework, projects and workplace opportunities arise."/><div className="public-roadmap-list">{stages.map((stage, i) => <article className="public-roadmap-item" key={stage[0]}><span className="public-road-number">{stage[0]}</span><div><h2>{stage[1]}</h2><p>{stage[2]}</p><small>{i === 1 ? 'Initial technical focus' : i === 9 ? 'Long-term career objective' : 'Development stage'}</small></div></article>)}</div><div className="public-note"><strong>Planned final-year electives</strong><p>Control II, Electromechanical Conversion and High Voltage. These are planned electives, not completed qualifications.</p></div></>
}

export function PublicProjects() {
  return <><PublicPageHeading eyebrow="ENGINEERING PROJECTS" title="Technical work, documented honestly." description="Projects will grow into full case studies with calculations, simulation graphs, measurements, design decisions and technical reports as evidence becomes available."/><div className="public-project-grid">{projects.map(project => <article className="public-project-card" key={project.title}><div className="public-project-top"><span className="public-project-symbol">EE</span><span className={`public-status-pill ${project.status === 'Existing' ? 'is-existing' : 'is-planned'}`}>{project.status}</span></div><p className="public-eyebrow">{project.type}</p><h2>{project.title}</h2><p>{project.description}</p><div className="public-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><details><summary>Project details</summary><p>{project.detail}</p></details></article>)}</div></>
}

export function PublicSkills() {
  const groups = [
    ['Control Engineering', 'Mathematical modelling', 'Transfer functions', 'Time-domain response', 'Stability and frequency response', 'Feedback control', 'MATLAB and Simulink'],
    ['Electrical & instrumentation', 'Circuit analysis', 'Electronic circuit design', 'Sensors and measurement', 'Signal conditioning', 'Electrical machines', 'Power and high-voltage foundations'],
    ['Embedded systems', 'Arduino, ESP32 and ATmega', 'C/C++', 'Data acquisition', 'PWM and motor control', 'Hardware prototyping and testing'],
    ['Engineering delivery & leadership', 'Technical documentation', 'Verification and testing', 'System integration', 'Task coordination', 'Project planning', 'Cross-disciplinary communication'],
  ]
  return <><PublicPageHeading eyebrow="TECHNICAL SKILLS" title="Capabilities under development." description="Skills are not presented as endorsements or unsupported proficiency scores. The private workspace tracks self-assessments and links them to evidence; only curated claims belong in the public portfolio."/><div className="public-skill-grid">{groups.map(([title, ...items]) => <section className="public-skill-card" key={title}><h2>{title}</h2><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div></>
}

export function PublicWork() {
  return <><PublicPageHeading eyebrow="PROGRESS & PRIORITIES" title="A visible distinction between work and ambition." description="The public portfolio contains only curated information. Private task notes, workspace records and uploaded drafts are not exposed automatically."/><div className="public-progress-grid"><section className="public-progress-card"><p className="public-eyebrow">EXISTING PROJECT</p><h2>Sound-tracking vehicle</h2><p>Embedded hardware work involving microphone input, frequency detection and PWM motor control using an ATmega328P.</p><span className="public-status-pill is-existing">Existing project</span></section><section className="public-progress-card"><p className="public-eyebrow">NEXT CASE STUDY</p><h2>DC motor modelling and PID control</h2><p>Planned deliverables: hand-derived transfer function, MATLAB/Simulink model, response analysis, controller comparison and a technical report.</p><span className="public-status-pill is-planned">Planned</span></section><section className="public-progress-card"><p className="public-eyebrow">BROADENING CAPABILITY</p><h2>Instrumentation, machines and power</h2><p>Build foundational knowledge and identify practical projects or workplace opportunities after developing the initial control engineering foundation.</p><span className="public-status-pill is-planned">Development priority</span></section></div><div className="public-note"><strong>Why the public list may differ from the private workspace</strong><p>Private tasks and uploaded evidence do not automatically appear here. Work is made public only after it has been deliberately reviewed and included in the portfolio.</p></div></>
}

export function PublicLearning() {
  return <><PublicPageHeading eyebrow="LEARNING & RESEARCH" title="Learning that leads to applied engineering." description="The learning plan connects theory to problem-solving, simulation, measurement and clear technical communication."/><div className="public-learning-list">{[['Control theory & modelling','Transfer functions, time response, stability, frequency response and feedback.'],['MATLAB & Simulink','Structured modelling, simulation, visualisation and comparing theoretical predictions with model behaviour.'],['Instrumentation & automation','Sensors, measurement systems, calibration, signal conditioning, PLC concepts and industrial control architectures.'],['Electromechanical & power systems','Machines, drives, electrical power, protection, distribution and high-voltage safety foundations.'],['Engineering delivery','Requirements, verification, test planning, technical reports, risk awareness and engineering decisions.']].map(([title, text]) => <article key={title}><span>↗</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div></>
}

export function PublicLeadership() {
  const levels = [['01','Personal technical ownership','Complete defined work, maintain records, manage time and explain technical findings.'],['02','Task coordination','Plan small deliverables, manage dependencies and communicate progress clearly.'],['03','Small-project leadership','Define scope, coordinate contributors, review quality and report outcomes.'],['04','Cross-disciplinary integration','Understand interfaces between control, instrumentation, electrical power, mechanical systems and operations.'],['05','Electrical & Instrumentation Management','Build the judgement, safety awareness, planning and people leadership needed for broader responsibility.']]
  return <><PublicPageHeading eyebrow="LEADERSHIP DEVELOPMENT" title="Grow from technical ownership to integrated delivery." description="Leadership is a capability to build through repeated technical responsibility, collaboration and evidence—not a title to claim prematurely."/><div className="public-roadmap-list">{levels.map(([number,title,text]) => <article className="public-roadmap-item" key={number}><span className="public-road-number">{number}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div><div className="public-note"><strong>Leadership evidence</strong><p>Future reflections will document the situation, responsibility, actions, decisions, supported outcomes and lessons learned.</p></div></>
}

export function PublicAbout() {
  return <><PublicPageHeading eyebrow="ABOUT" title="Electrical Engineering, with a long-term systems view." description="I am a Wits Electrical Engineering student developing technical depth in Control Engineering while keeping a deliberate path open into instrumentation, electromechanical systems, electrical power and engineering leadership."/><div className="public-about-grid"><section><p className="public-eyebrow">CURRENT FOCUS</p><h2>Control Engineering</h2><p>Strengthen system modelling, analysis, simulation and feedback-control foundations using mathematical reasoning and MATLAB/Simulink.</p></section><section><p className="public-eyebrow">PLANNED BREADTH</p><h2>Electrical & instrumentation systems</h2><p>Progressively broaden through electromechanical conversion, high voltage, instrumentation and industrial automation.</p></section><section><p className="public-eyebrow">LONG-TERM GOAL</p><h2>Electrical & Instrumentation Manager</h2><p>Develop the technical judgement, safety awareness, project-delivery capability and leadership required for this long-term objective.</p></section></div></>
}
