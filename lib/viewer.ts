import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

/**
 * Richiede che l'utente abbia un cookie valido (pid + scode) per la sessione.
 * Se non c'è, rimanda alla pagina di join.
 */
export async function requireParticipant(code: string) {
  const jar = cookies()
  const pid = jar.get('pid')?.value
  const scode = jar.get('scode')?.value

  if (!pid || scode !== code) {
    redirect(`/session/${code}/join`)
  }

  const participant = await prisma.participant.findUnique({
    where: { id: pid },
    include: { session: true },
  })

  if (!participant || participant.session.code !== code) {
    // In un Server Component non possiamo cancellare i cookie, quindi facciamo solo redirect.
    redirect(`/session/${code}/join?error=PARTECIPANTE_NON_VALIDO`)
  }

  return participant
}
