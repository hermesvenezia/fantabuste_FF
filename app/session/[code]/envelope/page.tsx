import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireParticipant } from '@/lib/viewer'
import { upsertEnvelope } from '@/app/actions'

export const dynamic = 'force-dynamic'

const ERROR_MAP: Record<string, string> = {
  GIA_CONSEGNATA: 'Hai già consegnato la busta. Non puoi modificarla.',
}

export default async function EnvelopePage({
  params,
  searchParams,
}: {
  params: { code: string }
  searchParams?: { error?: string; saved?: string }
}) {
  const code = params.code.trim().toUpperCase()
  const participant = await requireParticipant(code)
  const session = participant.session

  const err = searchParams?.error
  const saved = searchParams?.saved === '1'

  // Fresh read (in case of edits)
  const freshParticipant = await prisma.participant.findUnique({
    where: { id: participant.id },
  })

  const isRevealed = session.status === 'REVEALED'
  const isSubmitted = Boolean(freshParticipant?.submittedAt)

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="stack" style={{ gap: 4 }}>
          <h1>La tua busta</h1>
          <div className="row">
            <span className="badge">
              Sessione <span className="kbd">{code}</span>
            </span>
            <span className="badge">Tu: {participant.displayName}</span>
          </div>
        </div>
        <div className="row">
          <Link href={`/session/${code}/lobby`}>Lobby</Link>
        </div>
      </div>

      {isRevealed ? (
        <div className="notice danger">
          Le buste sono già state aperte. Non puoi più modificare.
        </div>
      ) : isSubmitted ? (
        <div className="notice">
          Busta consegnata ✅ Ora puoi aspettare in lobby.
        </div>
      ) : saved ? (
        <div className="notice">Bozza salvata ✅</div>
      ) : null}

      {err ? <div className="notice danger">{ERROR_MAP[err] ?? `Errore: ${err}`}</div> : null}

      <section className="card stack">
        <h2>Inserisci i nomi (testo libero)</h2>
        <p className="muted">
          Puoi mettere un nome per riga, oppure un elenco separato da virgole. Nessun controllo: è
          una busta “semplice”.
        </p>

        <form className="stack" action={upsertEnvelope.bind(null, code)}>
          <textarea
            name="text"
            defaultValue={freshParticipant?.envelopeText ?? ''}
            placeholder={`Esempio:\nLautaro Martinez\nDybala\nOsimhen\n...`}
            disabled={isRevealed || isSubmitted}
          />

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <small className="muted">
              {isSubmitted
                ? 'Consegna già effettuata.'
                : 'Consiglio: salva bozza mentre scrivi, poi consegna quando sei pronto.'}
            </small>
            <div className="row">
              <button type="submit" name="intent" value="save" disabled={isRevealed || isSubmitted}>
                Salva bozza
              </button>
              <button
                className="primary"
                type="submit"
                name="intent"
                value="submit"
                disabled={isRevealed || isSubmitted}
              >
                Consegna busta
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="card stack">
        <h3>Che succede dopo?</h3>
        <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
          <li>Vai in lobby e aspetta che l’admin apra le buste.</li>
          <li>Quando le buste sono aperte, vedrai l’elenco completo di tutte le squadre.</li>
        </ul>
      </section>
    </main>
  )
}
