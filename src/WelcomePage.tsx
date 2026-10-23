import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AdminSignInDialog, Icon } from './components'
import { useWorkspace } from './store'

export default function WelcomePage() {
  const { isAdmin, canSignIn } = useWorkspace()
  const [signInOpen, setSignInOpen] = useState(false)

  return <main className="welcome-page">
    <div className="welcome-container">
      <header className="welcome-header">
        <Link to="/" className="brand"><span className="brand-mark">A<span>·</span></span><span><strong>Allen</strong><small>ENGINEERING PORTFOLIO</small></span></Link>
        <span className="welcome-header-note">Electrical Engineering · Johannesburg, South Africa</span>
      </header>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <p className="eyebrow">WITS · ELECTRICAL ENGINEERING</p>
          <h1>Welcome to my engineering portfolio.</h1>
          <p className="welcome-intro">Explore my development in Electrical Engineering, with a growing focus on Control Engineering, instrumentation and practical project work.</p>
          <Link to="/home" className="button button-dark welcome-enter">Enter the portfolio <Icon name="arrow" size={17}/></Link>
          {isAdmin && <Link to="/home" className="welcome-admin-workspace">Open administrator workspace</Link>}
        </div>
        <div className="welcome-mark" aria-hidden="true"><div className="welcome-mark-ring"><span>A<span>·</span></span></div><small>ENGINEERING<br/>IN PROGRESS</small></div>
      </section>
      <section className="welcome-highlights" aria-label="Inside the portfolio">
        <p className="eyebrow">INSIDE THE PORTFOLIO</p>
        <div className="welcome-highlight-grid">
          <article><span className="welcome-highlight-icon"><Icon name="roadmap" size={19}/></span><h2>Career direction</h2><p>A staged roadmap toward Control Engineering and broader Electrical &amp; Instrumentation work.</p></article>
          <article><span className="welcome-highlight-icon"><Icon name="projects" size={19}/></span><h2>Projects &amp; technical work</h2><p>Case studies, engineering tasks and reports that show how ideas develop into evidence.</p></article>
          <article><span className="welcome-highlight-icon"><Icon name="skills" size={19}/></span><h2>Skills, learning &amp; leadership</h2><p>Technical capability, progress, structured study and leadership development over time.</p></article>
        </div>
      </section>
      <footer className="welcome-footer">
        <span>© 2026 Allen Mashoai. All rights reserved.</span>
        <div className="welcome-admin-area">
          {!isAdmin && canSignIn && <button className="welcome-admin-button" onClick={() => setSignInOpen(true)}>Administrator sign in</button>}
          {isAdmin && <span className="welcome-signed-in">Administrator signed in</span>}
        </div>
      </footer>
      {signInOpen && <AdminSignInDialog onClose={() => setSignInOpen(false)} />}
    </div>
  </main>
}
