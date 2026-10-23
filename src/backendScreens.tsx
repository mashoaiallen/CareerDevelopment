import { useState } from 'react'
import type { FormEvent } from 'react'

type AuthResult = { error?: string; message?: string }

export function BackendSetupScreen() {
  return <main className="backend-screen"><section className="backend-card">
    <span className="backend-mark">A<span>·</span></span>
    <p className="eyebrow">WORKSPACE NOT CONFIGURED</p>
    <h1>Connect the workspace</h1>
    <p>This workspace is currently unavailable. Please contact the site administrator.</p>
    <p className="backend-note">Your workspace data is stored securely and is available after the connection has been restored.</p>
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
    <p className="backend-note">Check your connection and try again. If the issue continues, contact support.</p>
  </section></main>
}

export function AuthScreen({ onSignIn, onSignUp }: { onSignIn: (email: string, password: string) => Promise<AuthResult>; onSignUp: (email: string, password: string) => Promise<AuthResult> }) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      const result = mode === 'sign-in' ? await onSignIn(email.trim(), password) : await onSignUp(email.trim(), password)
      if (result.error) setError(result.error)
      if (result.message) setMessage(result.message)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not connect. Try again.')
    } finally { setBusy(false) }
  }
  const switchMode = () => { setMode(value => value === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); setMessage('') }
  return <main className="backend-screen"><section className="backend-card auth-card">
    <span className="backend-mark">A<span>·</span></span>
    <p className="eyebrow">WITS · ELECTRICAL ENGINEERING</p>
    <h1>{mode === 'sign-in' ? 'Sign in to your workspace' : 'Create your workspace account'}</h1>
    <p className="backend-intro">Your tasks, portfolio records and evidence are stored securely in your private workspace.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>Password<input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} /></label>
      {error && <p role="alert" className="form-error">{error}</p>}{message && <p role="status" className="auth-message">{message}</p>}
      <button className="button button-dark" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
    </form>
    <p className="auth-switch">{mode === 'sign-in' ? 'New here?' : 'Already have an account?'} <button type="button" onClick={switchMode}>{mode === 'sign-in' ? 'Create an account' : 'Sign in'}</button></p>
    <p className="backend-note">Each account can access only its own workspace and private evidence files.</p>
  </section></main>
}
