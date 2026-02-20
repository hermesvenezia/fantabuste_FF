import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

export default function SessionEntry({ params }: { params: { code: string } }) {
  const code = normalizeCode(params.code)
  const jar = cookies()
  const pid = jar.get('pid')?.value
  const scode = jar.get('scode')?.value

  if (pid && scode === code) redirect(`/session/${code}/lobby`)
  redirect(`/session/${code}/join`)
}
