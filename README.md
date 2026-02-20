# FantaBuste (Next.js App Router)

MVP per asta a buste chiuse (solo scrittura busta + apertura).

## Requisiti
- Node.js 18+ (consigliato 20+)

## Setup
```bash
npm install
cp .env.example .env
npm run prisma:migrate -- --name init
npm run prisma:generate
npm run dev
```

Apri: http://localhost:3000

## Come funziona
- Home: l'admin crea una sessione (ottiene un codice + un link admin segreto)
- I partecipanti entrano con il codice, scelgono nome squadra e scrivono la busta (testo libero)
- L'admin clicca "Apri buste" e da quel momento tutti possono vedere tutte le buste

## Note sicurezza (MVP)
- Non c'è login.
- La "busta chiusa" è garantita a livello UI/API: prima del reveal le API non restituiscono i testi delle buste.
- Il link admin include una chiave segreta (adminKey) lunga e random.
