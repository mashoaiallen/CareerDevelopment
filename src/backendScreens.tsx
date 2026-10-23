import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type AuthResult = { error?: string; message?: string }

export function BackendSetupScreen() {
  return <main className="backend-screen"><section className="backend-card">
    <span className="backend-mark">A<span>·</span></span>
    <p className="eyebrow">WORKSPACE NOT CONFIGURED</p>
    <h1>Workspace unavailable</h1>
    <p>This administrator workspace is currently unavailable. Please try again later.</p>
    <p className="backend-note">The public engineering portfolio remains available without signing in.</p>
    <Link className="button button-outline" to="/public">Explore the public portfolio</Link>
  </section></main>
}

export function BackendLoadingScreen({ message = 'Connecting to your workspace…' }: { message?: string }) {
  return <main className="backend-screen"><section className="backend-card backend-loading" role="status"><span className="backend-mark">A<span>·</span></span><p className="eyebrow">ENGINEERING PORTFOLIO</p><h1>{message}</h1><span className="backend-spinner" /></section></main>
}

export function BackendErrorScreen({ title, message, onRetry, onSignOut }: { title: string; message: string; onRetry: () => void; onSignOut?: () => void }) {
  return <main className="backend-screen"><section className="backend-card">
    <span className="backend-mark">A<span>·</span></span><p className="eyebrow">WORKSPACE CONNECTION</p>
    <h1>{title}</h1><p>{message}</p>
    <div className="backend-actions"><button className="button button-dark" onClick={onRetry}>Try again</button>{onSignOut && <button className="button button-outline" onClick={onSignOut}>Sign out</button>}</div>
    <p className="backend-note">The public portfolio remains available without signing in.</p>
    <Link className="text-link" to="/public">Return to public portfolio ↗</Link>
  </section></main>
}

export function AuthScreen({ onGoogleSignIn }: { onGoogleSignIn: () => Promise<AuthResult> }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await onGoogleSignIn()
      if (result.error) setError(result.error)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not connect. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return <main className="backend-screen"><section className="backend-card auth-card">
    <span className="backend-mark">A<span>·</span></span>
    <p className="eyebrow">WITS · ELECTRICAL ENGINEERING</p>
    <h1>Administrator access</h1>
    <p className="backend-intro">Sign in to manage my career roadmap, tasks, project records and private technical evidence. The public portfolio can be explored without an account.</p>
    <form className="auth-form" onSubmit={submit}>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="button button-dark google-signin-button" disabled={busy} type="submit">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.01 13.22l7.98 6.19C11.9 13.72 17.46 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.92 46.98 31.8 46.98 24.55Z"/><path fill="#FBBC05" d="M9.99 28.59A14.4 14.4 0 0 1 9.2 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.57 10.78l7.42-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.54 0-12.1-4.22-14.01-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>
        {busy ? 'Redirecting to Google…' : 'Continue with Google'}
      </button>
    </form>
    <p className="auth-switch"><Link to="/public">← Return to the public portfolio</Link></p>
    <p className="backend-note">Administrator access is restricted to the authorised account. Visitors can read published portfolio content without signing in.</p>
  </section></main>
}
