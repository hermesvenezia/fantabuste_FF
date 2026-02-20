import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireParticipant } from '@/lib/viewer'

export const dynamic = 'force-dynamic'

export default async function LobbyPage({
  params,
  searchParams,
}: {
  params: { code: string }
  searchParams?: { submitted?: string; info?: string }
}) {
  const code = params.code.trim().toUpperCase()
  const viewer = await requireParticipant(code)

  const session = await prisma.session.findUnique({
    where: { code },
  })

  if (!session) {
    return (
      <main className="stack">
        <h1>Sessione non trovata</h1>
        <Link href="/">Torna alla Home</Link>
      </main>
    )
  }

  const participants = await prisma.participant.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      displayName: true,
      submittedAt: true,
      envelopeText: session.status === 'REVEALED',
    },
  })

  const submittedCount = participants.filter((p) => Boolean(p.submittedAt)).length

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="stack" style={{ gap: 4 }}>
          <h1>Lobby</h1>
          <div className="row">
            <span className="badge">
              Sessione <span className="kbd">{code}</span>
            </span>
            <span className="badge">Tu: {viewer.displayName}</span>
            <span className="badge">
              Consegnate: {submittedCount}/{participants.length}
            </span>
            <span className="badge">
              Stato: <span className="kbd">{session.status}</span>
            </span>
          </div>
        </div>
        <div className="row">
          <Link href={`/session/${code}/envelope`}>La mia busta</Link>
          <Link href={`/session/${code}/lobby`}>Aggiorna</Link>
        </div>
      </div>

      {searchParams?.submitted === '1' ? (
        <div className="notice">Busta consegnata ✅</div>
      ) : null}
      {searchParams?.info ? <div className="notice">{searchParams.info}</div> : null}

      <section className="card stack">
        <h2>Partecipanti</h2>
        <div className="stack" style={{ gap: 10 }}>
          {participants.map((p) => {
            const isMe = p.id === viewer.id
            const submitted = Boolean(p.submittedAt)
            return (
              <div key={p.id} className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row">
                  <strong>{p.displayName}</strong>
                  {isMe ? <span className="badge">tu</span> : null}
                </div>
                <span className="badge">{submitted ? '✅ consegnata' : '⏳ in scrittura'}</span>
              </div>
            )
          })}
        </div>

        {session.status !== 'REVEALED' ? (
          <small className="muted">
            Prima dell’apertura, qui vedi solo chi ha consegnato. Il contenuto delle buste resta
            nascosto.
          </small>
        ) : null}
      </section>

      {session.status === 'REVEALED' ? (
        <section className="card stack">
          <h2>Buste aperte</h2>
          <p className="muted">Ora sono visibili tutte le buste (testo libero).</p>

          <div className="stack" style={{ gap: 12 }}>
            {participants.map((p) => (
              <div key={p.id} className="card" style={{ padding: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{p.displayName}</strong>
                  <span className="badge">{p.submittedAt ? '✅ consegnata' : '⚠️ non consegnata'}</span>
                </div>
                <div className="hr" />
                <pre>{(p as any).envelopeText || '—'}</pre>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="card stack">
          <h2>In attesa dell’apertura…</h2>
          <p className="muted">
            Quando l’admin apre le buste, questa pagina mostrerà automaticamente tutti gli elenchi.
            Per ora puoi usare “Aggiorna”.
          </p>
        </section>
      )}

      <footer className="muted">
        <small>
          Se sei l’admin, usa il tuo link segreto admin per aprire le buste.
        </small>
      </footer>
    </main>
  )
}
