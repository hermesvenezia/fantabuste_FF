import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FantaBuste',
  description: 'MVP per asta a buste chiuse: scrittura busta + apertura',
  google-adsense-account: 'ca-pub-1508113124146946',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="container">{children}</div>
        <Analytics />
      </body>
    </html>
  )
}
