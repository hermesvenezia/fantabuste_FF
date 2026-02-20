'use server'

import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

function makeCode(length = 5): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return out
}

function makeAdminKey(): string {
  // 32 bytes -> ~43 chars base64url
  return randomBytes(32).toString('base64url')
}

export async function createSession() {
  // Try a few times to avoid rare collisions on code
  for (let i = 0; i < 10; i++) {
    const code = makeCode(5)
    const adminKey = makeAdminKey()

    try {
      await prisma.session.create({
        data: { code, adminKey },
      })

      redirect(`/admin/${code}?key=${adminKey}`)
    } catch (e: unknown) {
      // If code collision, retry. Otherwise rethrow.
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('constraint')) {
        continue
      }
      throw e
    }
  }

  throw new Error('Impossibile creare una sessione (troppe collisioni sul codice). Riprova.')
}

export async function goToJoin(formData: FormData) {
  const raw = String(formData.get('code') ?? '')
  const code = normalizeCode(raw)
  if (!code) redirect('/?error=CODICE_NON_VALIDO')
  redirect(`/session/${code}/join`)
}

export async function joinSession(codeParam: string, formData: FormData) {
  const code = normalizeCode(codeParam)
  const displayName = String(formData.get('displayName') ?? '').trim()

  if (!displayName) redirect(`/session/${code}/join?error=NOME_OBBLIGATORIO`)

  const session = await prisma.session.findUnique({ where: { code } })
  if (!session) redirect(`/session/${code}/join?error=SESSIONE_NON_TROVATA`)

  const participant = await prisma.participant.create({
    data: {
      sessionId: session.id,
      displayName,
    },
  })

  const jar = cookies()
  jar.set('pid', participant.id, { httpOnly: true, sameSite: 'lax', path: '/' })
  jar.set('scode', code, { httpOnly: true, sameSite: 'lax', path: '/' })

  redirect(`/session/${code}/envelope`)
}

export async function upsertEnvelope(codeParam: string, formData: FormData) {
  const code = normalizeCode(codeParam)
  const intent = String(formData.get('intent') ?? 'save')
  const text = String(formData.get('text') ?? '')

  const jar = cookies()
  const pid = jar.get('pid')?.value
  const scode = jar.get('scode')?.value
  if (!pid || scode !== code) redirect(`/session/${code}/join?error=RIPARTI_DA_JOIN`)

  const participant = await prisma.participant.findUnique({
    where: { id: pid },
    include: { session: true },
  })

  if (!participant || participant.session.code !== code) {
    jar.delete('pid')
    jar.delete('scode')
    redirect(`/session/${code}/join?error=PARTECIPANTE_NON_VALIDO`)
  }

  if (participant.session.status === 'REVEALED') {
    redirect(`/session/${code}/lobby?info=SESSIONE_GIA_APERTA`)
  }

  // Lock after submit (MVP)
  if (participant.submittedAt) {
    redirect(`/session/${code}/envelope?error=GIA_CONSEGNATA`)
  }

  if (intent === 'submit') {
    await prisma.participant.update({
      where: { id: participant.id },
      data: {
        envelopeText: text,
        submittedAt: new Date(),
      },
    })
    redirect(`/session/${code}/lobby?submitted=1`)
  }

  // Save draft
  await prisma.participant.update({
    where: { id: participant.id },
    data: {
      envelopeText: text,
    },
  })

  redirect(`/session/${code}/envelope?saved=1`)
}

export async function revealSession(codeParam: string, formData: FormData) {
  const code = normalizeCode(codeParam)
  const key = String(formData.get('key') ?? '')
  if (!key) redirect(`/admin/${code}?error=CHIAVE_MANCANTE`)

  const session = await prisma.session.findUnique({ where: { code } })
  if (!session) redirect(`/admin/${code}?error=SESSIONE_NON_TROVATA`)
  if (session.adminKey !== key) redirect(`/admin/${code}?error=CHIAVE_ERRATA`)

  if (session.status !== 'REVEALED') {
    await prisma.session.update({
      where: { id: session.id },
      data: { status: 'REVEALED' },
    })
  }

  redirect(`/admin/${code}?key=${encodeURIComponent(key)}`)
}
