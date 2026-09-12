# CMT Estimate App

CMET / materials testing fee estimating MVP (Next.js App Router + TypeScript + Tailwind + SQLite/Prisma).

## How to run

```
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000

SQLite file: prisma/dev.db via DATABASE_URL in .env

## Scripts (package.json)

- npm run dev / build / start
- npm run db:migrate / db:seed / db:push / db:reset

## Key routes

| Route | Purpose |
|-------|--------|
| / | Project list |
| /projects/new | Create (name, location, notes, docs received) |
| /projects/[id] | Edit setup |
| /projects/[id]/scope | Parent tasks + miss-check |
| /projects/[id]/field | Drivers + field lines (OT, vehicle) |
| /projects/[id]/lab | Lab samples/tests |
| /projects/[id]/worksheet | Pricing Tool re-key (CSV / copy / print) |

## Worksheet → Pricing Tool

Columns: **Parent | Description | Quantity | Units | Trips**

Re-key into Pricing Tool and enter rates there. Admin support note (8%) is a reminder only — never locked fees.

## Assumptions

- Heuristic suggestions never lock numbers
- Apply suggestions replaces lines for that parent
- Lab suggest can add Laboratory Testing if missing
- Out of scope: OCR, client fee PDF, Pricing Tool API, risk/forecast
