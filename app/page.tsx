import { createSession, goToJoin } from './actions'

export default function Home({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  return (
    <main className="stack">
      <header className="stack">
        <h1>FantaBuste</h1>
        <p className="muted">
          MVP per <strong>buste chiuse</strong>: ogni partecipante scrive un elenco libero di nomi, poi
          l’admin fa “Apri buste” e si vedono tutte.
        </p>
        {searchParams?.error ? (
          <div className="notice danger">
            Errore: <span className="kbd">{searchParams.error}</span>
          </div>
        ) : null}
      </header>

      <section className="card stack">
        <h2>Admin</h2>
        <p className="muted">Crea una nuova sessione e ottieni il link admin segreto.</p>
        <form action={createSession}>
          <button className="primary" type="submit">Crea sessione</button>
        </form>
      </section>

      <section className="card stack">
        <h2>Partecipante</h2>
        <p className="muted">Inserisci il codice sessione e entra.</p>
        <form className="stack" action={goToJoin}>
          <div className="row">
            <input
              name="code"
              placeholder="Codice (es. X7K2Q)"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            <button type="submit">Entra</button>
          </div>
          <small className="muted">Suggerimento: meglio incollare il codice in maiuscolo.</small>
        </form>
      </section>

      <footer className="muted">
        <small>
          Nota: questo è un MVP senza login. La “busta chiusa” è rispettata perché prima dell’apertura
          i testi delle buste non vengono mostrati.
        </small>
      </footer>
    </main>
  )
}
