export function BackendLoadingScreen({ message = 'Loading the portfolio…' }: { message?: string }) {
  return <main className="backend-screen"><section className="backend-card backend-loading" role="status"><span className="backend-mark">A<span>·</span></span><p className="eyebrow">ENGINEERING PORTFOLIO</p><h1>{message}</h1><span className="backend-spinner" /></section></main>
}

export function BackendErrorScreen({ title, message, onRetry, onSignOut }: { title: string; message: string; onRetry: () => void; onSignOut?: () => void }) {
  return <main className="backend-screen"><section className="backend-card">
    <span className="backend-mark">A<span>·</span></span><p className="eyebrow">PORTFOLIO CONNECTION</p>
    <h1>{title}</h1><p>{message}</p>
    <div className="backend-actions"><button className="button button-dark" onClick={onRetry}>Try again</button>{onSignOut && <button className="button button-outline" onClick={onSignOut}>Sign out</button>}</div>
  </section></main>
}
