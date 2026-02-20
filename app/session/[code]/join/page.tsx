import Link from 'next/link'
import { joinSession } from '@/app/actions'

export const dynamic = 'force-dynamic'

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

const ERROR_MAP: Record<string, string> = {
  NOME_OBBLIGATORIO: 'Inserisci un nome squadra/partecipante.',
  SESSIONE_NON_TROVATA: 'Sessione non trovata. Controlla il codice.',
  RIPARTI_DA_JOIN: 'Per favore rientra nella sessione.',
  PARTECIPANTE_NON_VALIDO: 'Sessione cambiata o cookie non valido. Rientra.',
}

export default function JoinPage({
  params,
  searchParams,
}: {
  params: { code: string }
  searchParams?: { error?: string }
}) {
  const code = normalizeCode(params.code)
  const err = searchParams?.error

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Entra nella sessione</h1>
        <Link href="/">Home</Link>
      </div>

      <section className="card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="stack" style={{ gap: 4 }}>
            <h2>Codice sessione</h2>
            <div className="row">
              <span className="kbd">{code}</span>
              <span className="badge">busta chiusa</span>
            </div>
          </div>
        </div>

        {err ? (
          <div className="notice danger">{ERROR_MAP[err] ?? `Errore: ${err}`}</div>
        ) : (
          <div className="notice">
            Inserisci un nome (es. <span className="kbd">FC Pippo</span>) per entrare e compilare la
            busta.
          </div>
        )}

        <form className="stack" action={joinSession.bind(null, code)}>
          <label className="stack" style={{ gap: 6 }}>
            <span className="muted">Nome squadra / partecipante</span>
            <input name="displayName" placeholder="Es. Real Tappi" required />
          </label>
          <button className="primary" type="submit">
            Entra
          </button>
        </form>

        <small className="muted">
          Nota: il sistema salva un cookie per riconoscerti. Se cambi dispositivo, dovrai rientrare.
        </small>
      </section>
    </main>
  )
}
