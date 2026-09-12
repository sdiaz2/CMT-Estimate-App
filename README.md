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
| /projects/new | Create (name, location, notes, docs received, **takeoff facts**) |
| /projects/[id] | Edit setup + takeoff facts |
| /projects/[id]/scope | Parent tasks + miss-check |
| /projects/[id]/field | Takeoff panel + drivers + field lines (OT, vehicle) |
| /projects/[id]/lab | Lab samples/tests |
| /projects/[id]/worksheet | Pricing Tool re-key (CSV / copy / print) |

## Worksheet → Pricing Tool

Columns: **Parent | Description | Quantity | Units | Trips**

Re-key into Pricing Tool and enter rates there. Admin support note (8%) is a reminder only — never locked fees.

## Guiding rules

### Earthwork Testing & Observations — moisture-conditioned subgrade + flexible base cap

When estimating earthwork for a building with **moisture-conditioned subgrade** and a **flexible base cap**:

| Input | Notes |
|-------|--------|
| Building area (SF) | Takeoff / project facts |
| Moisture depth / base thickness | Optional notes on the project |
| SF per trip (divisor) | Editable; **typical 2,700–3,000**; **default 2,850** (middle) |

**Formula:** `suggestedTrips = ceil(buildingAreaSf / earthworkSfPerTrip)`

**Example:** 100,000 SF → ~34–37 trips across the range; at 2,850 → **36 trips**.

On the Field step, the rule is shown near Earthwork drivers. **Apply suggestions** (for that parent or all) uses the rule when `buildingAreaSf > 0`, sets Trips, and cascades hours (~4 hr/trip), OT (~15%), gauge days, and vehicle trips. Quantities stay fully editable afterward.

Flags `moistureConditionedSubgrade` and `flexibleBaseCap` document that the job matches this condition; the rule banner notes when they apply.

## Assumptions

- Heuristic suggestions never lock numbers
- Apply suggestions replaces lines for that parent
- Lab suggest can add Laboratory Testing if missing
- Out of scope: OCR, client fee PDF, Pricing Tool API, risk/forecast
