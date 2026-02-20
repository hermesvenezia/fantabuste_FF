import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FantaBuste',
  description: 'MVP per asta a buste chiuse: scrittura busta + apertura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
