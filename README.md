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

### Earthwork Testing & Observations — trip suggestions

Suggested earthwork trips are the **sum** of applicable parts:

**`total = buildingTrips + pavementTrips + sidewalkTrips`**

UI shows each part of the formula (building / pavement / sidewalk) plus the combined total. If only some takeoffs are filled, only those parts contribute. Apply suggestions uses **total** trips, then cascades hours (~4 hr/trip), OT (~15%), gauge days, and vehicle trips. Numbers stay fully editable afterward.

#### 1. Building — moisture-conditioned subgrade + flexible base cap

| Input | Notes |
|-------|--------|
| Building area (SF) | Takeoff / project facts |
| Moisture depth / base thickness | Optional notes |
| SF per trip (divisor) | Editable; **typical 2,700–3,000**; **default 2,850** |

**Formula:** `buildingTrips = ceil(buildingAreaSf / earthworkSfPerTrip)`

**Example:** 100,000 SF @ 2,850 → **36 trips**.

Flags `moistureConditionedSubgrade` and `flexibleBaseCap` document that the job matches this condition.

#### 2. Pavement subgrade — lime-treated **or** not (never both)

**Lime-treated (`limeTreatedPavementSubgrade` = true):** use **SF** only (do not also apply LF).

| Input | Notes |
|-------|--------|
| Pavement area (SF) | Takeoff |
| SF per trip | Editable; **typical 25,000–30,000**; **default 27,500** |

**Formula:** `pavementTrips = ceil(pavementAreaSf / pavementSfPerTrip)`

**Example:** 150,000 SF @ 27,500 → **6 trips**. Combined with 36 building → **42 trips**.

**Not lime-treated (`limeTreatedPavementSubgrade` = false):** use **LF** only (do not also apply SF).

| Input | Notes |
|-------|--------|
| Pavement subgrade (LF) | `pavementSubgradeLf` |
| LF per trip | Editable; **typical 200–400**; **default 300** |

**Formula:** `pavementTrips = ceil(pavementSubgradeLf / pavementLfPerTrip)`

#### 3. Sitework sidewalks

| Input | Notes |
|-------|--------|
| Sidewalk length (LF) | `sidewalkLf` |
| Bunched together? | `sidewalksBunchedTogether` (default off = spread out) |
| Spread divisor | Editable; **default 125** LF/trip |
| Bunched divisor | Editable; **default 150** LF/trip |

- **Spread out (default):** `sidewalkTrips = ceil(sidewalkLf / sidewalkSpreadLfPerTrip)` (default 125)
- **Bunched together:** `sidewalkTrips = ceil(sidewalkLf / sidewalkBunchedLfPerTrip)` (default 150)

Sidewalk trips are **added** into the Earthwork Testing total with building + pavement.

## Assumptions

- Heuristic suggestions never lock numbers
- Apply suggestions replaces lines for that parent
- Lab suggest can add Laboratory Testing if missing
- Out of scope: OCR, client fee PDF, Pricing Tool API, risk/forecast
