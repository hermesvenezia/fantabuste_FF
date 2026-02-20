import Link from 'next/link'
import { prisma } from '@/lib/db'
import { revealSession } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: { code: string }
  searchParams?: { key?: string; error?: string }
}) {
  const code = params.code.trim().toUpperCase()
  const key = searchParams?.key ?? ''

  const session = await prisma.session.findUnique({
    where: { code },
  })

  if (!session) {
    return (
      <main className="stack">
        <h1>Admin</h1>
        <div className="notice danger">Sessione non trovata.</div>
        <Link href="/">Torna alla Home</Link>
      </main>
    )
  }

  const authorized = key && session.adminKey === key
  if (!authorized) {
    return (
      <main className="stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1>Admin</h1>
          <Link href="/">Home</Link>
        </div>

        <section className="card stack">
          <div className="notice danger">
            Non autorizzato. Serve il link admin con <span className="kbd">key</span>.
          </div>
          {searchParams?.error ? (
            <div className="notice danger">Errore: {searchParams.error}</div>
          ) : null}
          <p className="muted">
            Se hai perso il link admin, ricrea la sessione (in questo MVP non c’è recupero).
          </p>
        </section>
      </main>
    )
  }

  const participants = await prisma.participant.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    select: { displayName: true, submittedAt: true, envelopeText: true },
  })

  const submittedCount = participants.filter((p) => Boolean(p.submittedAt)).length
  const joinUrl = `/session/${code}/join`

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="stack" style={{ gap: 4 }}>
          <h1>Admin sessione</h1>
          <div className="row">
            <span className="badge">
              Codice: <span className="kbd">{code}</span>
            </span>
            <span className="badge">
              Stato: <span className="kbd">{session.status}</span>
            </span>
            <span className="badge">
              Consegnate: {submittedCount}/{participants.length}
            </span>
          </div>
        </div>
        <div className="row">
          <Link href="/">Home</Link>
          <Link href={joinUrl}>Link partecipanti</Link>
        </div>
      </div>

      <section className="card stack">
        <h2>Condividi questo codice</h2>
        <p className="muted">
          I partecipanti entrano da Home inserendo il codice <span className="kbd">{code}</span> oppure
          aprendo direttamente: <span className="kbd">{joinUrl}</span>
        </p>
      </section>

      {session.status !== 'REVEALED' ? (
        <section className="card stack">
          <h2>Apertura buste</h2>
          <p className="muted">
            Quando premi “Apri buste”, tutti vedranno tutte le buste. (Operazione irreversibile in
            questo MVP.)
          </p>
          <form action={revealSession.bind(null, code)}>
            <input type="hidden" name="key" value={key} />
            <button className="danger" type="submit">
              Apri buste
            </button>
          </form>
        </section>
      ) : (
        <section className="card stack">
          <h2>Buste già aperte</h2>
          <p className="muted">Puoi leggere tutto qui sotto oppure dalla lobby dei partecipanti.</p>
          <Link href={`/session/${code}/lobby`}>Apri lobby</Link>
        </section>
      )}

      <section className="card stack">
        <h2>Partecipanti</h2>
        <div className="stack" style={{ gap: 10 }}>
          {participants.length === 0 ? (
            <div className="muted">Nessuno è entrato ancora.</div>
          ) : (
            participants.map((p, idx) => (
              <div key={`${p.displayName}-${idx}`} className="stack" style={{ gap: 6 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{p.displayName}</strong>
                  <span className="badge">{p.submittedAt ? '✅ consegnata' : '⏳ in scrittura'}</span>
                </div>
                {session.status === 'REVEALED' ? (
                  <div className="card" style={{ padding: 12 }}>
                    <pre>{p.envelopeText || '—'}</pre>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="muted">
        <small>
          Importante: conserva il link admin (contiene la chiave segreta). Chi lo possiede può aprire
          la sessione.
        </small>
      </footer>
    </main>
  )
}
