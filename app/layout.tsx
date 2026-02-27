import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FantaBuste',
  description: 'MVP per asta a buste chiuse: scrittura busta + apertura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1508113124146946" crossOrigin="anonymous"></script>
      </head>
      <body>
        <div className="container">{children}</div>
        <Analytics />
      </body>
    </html>
  )
}
