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

**`total = buildingTrips + pavementTrips + sidewalkTrips + utilityTrenchTrips`**

UI shows each part of the formula (building / pavement / sidewalk / utility trench) plus the combined total. If only some takeoffs are filled, only those parts contribute. Apply suggestions uses **total** trips, then cascades hours (~4 hr/trip), OT (~15%), gauge days, and vehicle trips. Numbers stay fully editable afterward.

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

#### 4. Utility trench backfill (storm / sewer / water)

| Input | Notes |
|-------|--------|
| Utility trench length (LF) | `utilityTrenchLf` |
| LF per trip | Editable; **typical 150–175**; **default mid 162.5** |

**Formula:** `utilityTrenchTrips = ceil(utilityTrenchLf / utilityTrenchLfPerTrip)` when LF > 0

**Example:** 800 LF @ 162.5 → **5 trips**.

Utility trench trips are **added** into the Earthwork Testing total with building + pavement + sidewalk.


### CIP Deep Foundations (Drilled Straight Shaft Piers) — trip suggestions

Parent: **CIP Deep Foundations (Drilled Straight Shaft Piers)**. Apply suggestions sets **Trips** and cascades Foundation Inspection hours (~4 hr/trip), OT (~15%), and Vehicle — same pattern as other field parents.

#### Priority

1. **Construction schedule provided** (`foundationScheduleTrips` > 0): use that trip count. Do **not** also apply pier-count rules.
2. **No schedule trips** (null/0): `trips = ceil(pierCount / piersPerTrip)` for the selected pier type.

#### Pier types & divisors (editable)

| Pier type (`pierType`) | Default piers/trip | Typical range |
|------------------------|--------------------|---------------|
| `straight_shaft` | **10.5** (`piersPerTripStraight`) | 9–12 |
| `cased` | **5** (`piersPerTripCased`) | 4–6 |
| `belled` (underreamed) | **7** (`piersPerTripBelled`) | 5–9 |

#### Examples

- 36 straight-shaft piers @ 10.5 → **4 trips**
- Schedule **6** trips entered → **6 trips** (overrides pier count even if pier count is filled)

Takeoff fields live on Project facts (New / Setup / Field). Amber rule copy appears on the Field takeoff panel and near the CIP Deep Foundations parent.


### Concrete Testing & Reinforcing Steel Observations — trip suggestions

Parent: **Concrete Testing & Reinforcing Steel Observations**. Apply suggestions sets **Trips** and cascades Concrete Testing hours (~4 hr/trip), OT (~15%), and Vehicle — same pattern as other field parents. Rules A (grade beams/pier caps), B (building slab), and C (private/public pavement) are implemented; structure ready for more pour types (walls, etc.) without a rewrite.

**`total = gradeBeamsPierCapsTrips + buildingSlabTrips + privatePavementTrips + publicPavementTrips`**

#### Rule A — Grade beams and pier caps

| Input | Notes |
|-------|--------|
| Grade beams / pier caps (yd³) | `concreteYd3GradeBeamsPierCaps` |
| yd³ per trip | Editable; **typical 100–175**; **default mid 137.5** (`yd3PerTripGradeBeams`) |

**Formula (when yd³ > 0):**

1. `raw = ceil(concreteYd3GradeBeamsPierCaps / yd3PerTripGradeBeams)`
2. `gradeBeamsPierCapsTrips = max(2, raw)` — **minimum 2 trips**

**Examples:**

- 50 yd³ @ 137.5 → ceil(0.36) = 1 → min 2 → **2 trips**
- 400 yd³ @ 137.5 → ceil(2.91) = **3 trips**

#### Rule B — Building slab

| Input | Notes |
|-------|--------|
| Building slab (yd³) | `concreteYd3BuildingSlab` |
| yd³ per trip | Editable; **default 300** (`yd3PerTripBuildingSlab`) — one trip for every 300 yd³ or more |

**Formula (when yd³ > 0):**

1. `raw = ceil(concreteYd3BuildingSlab / yd3PerTripBuildingSlab)`
2. `buildingSlabTrips = max(2, raw)` — if volume &gt; 0 but ceil &lt; 2, **minimum 2 trips**

**Examples:**

- 200 yd³ @ 300 → ceil(0.67) = 1 → min 2 → **2 trips**
- 900 yd³ @ 300 → ceil(3) = **3 trips**
- Rule A 50 yd³ (2) + Rule B 200 yd³ (2) → **4 trips** total

#### Rule C — Pavement concrete

Separate takeoff fields for private vs public pavement. **No minimum-2** — only `ceil(yd³ / divisor)`.

| Input | Notes |
|-------|--------|
| Private pavement (yd³) | `concreteYd3PrivatePavement` |
| yd³ per trip (private) | Editable; **default 500** (`yd3PerTripPrivatePavement`) — one trip for every 500 yd³ or less |
| Public pavement (yd³) | `concreteYd3PublicPavement` |
| yd³ per trip (public) | Editable; **default 900** (`yd3PerTripPublicPavement`) — one trip for every 900 yd³ or less |

**Formulas (when yd³ > 0):**

- `privatePavementTrips = ceil(concreteYd3PrivatePavement / yd3PerTripPrivatePavement)`
- `publicPavementTrips = ceil(concreteYd3PublicPavement / yd3PerTripPublicPavement)`

**Examples:**

- 400 yd³ private @ 500 → **1 trip**
- 1,200 yd³ private @ 500 → **3 trips**
- 800 yd³ public @ 900 → **1 trip**
- 2,000 yd³ public @ 900 → **3 trips**

Takeoff fields live on Project facts (New / Setup / Field). Amber rule copy appears on the Field takeoff panel and near the Concrete Testing parent.


### Masonry Testing & Observations — trip suggestions

Parent: **Masonry Testing & Observations**. Apply suggestions sets **Trips** and cascades Masonry Testing hours (~4 hr/trip) and Vehicle — same pattern as other field parents.

**`total = loadBearingCmuTrips + elevatorShaftTrips + enclosureTrips`**

#### Rule A — Load-bearing CMU wall

| Input | Notes |
|-------|--------|
| Load-bearing CMU wall (SF) | `masonryLoadBearingCmuSf` |
| SF per trip | Editable; **default 5,000** (`masonrySfPerTripLoadBearingCmu`) — one trip for every 5,000 SF or less |

**Formula:** `loadBearingCmuTrips = ceil(masonryLoadBearingCmuSf / masonrySfPerTripLoadBearingCmu)`

**Example:** 12,000 SF @ 5,000 → **3 trips**

#### Rule B — Multifamily elevator shaft CMU

One trip for every 16 feet of elevator shaft CMU wall height, **for each building with an elevator**. Height is per building (not a project-wide total).

| Input | Notes |
|-------|--------|
| Buildings with elevator | `masonryElevatorBuildingCount` |
| Elevator shaft CMU height (ft per building) | `masonryElevatorShaftHeightFt` |
| ft per trip | Editable; **default 16** (`masonryFtPerTripElevatorShaft`) |

**Formula (when building count > 0 and height > 0):**

`elevatorShaftTrips = masonryElevatorBuildingCount × ceil(masonryElevatorShaftHeightFt / masonryFtPerTripElevatorShaft)`

**Example:** 2 buildings × 48 ft @ 16 → 2 × 3 = **6 trips**

#### Rule C — Dumpster and/or equipment CMU enclosures

| Input | Notes |
|-------|--------|
| CMU enclosure count | `masonryCmuEnclosureCount` |

**Formula:** `enclosureTrips = masonryCmuEnclosureCount` (1 trip each)

**Example:** 3 enclosures → **3 trips**

#### Combined example

12,000 SF LB CMU (3) + 2 buildings × 48 ft shaft (6) + 3 enclosures (3) → **12 trips** total.

Takeoff fields live on Project facts (New / Setup / Field). Amber rule copy appears on the Field takeoff panel and near the Masonry Testing parent.

### High-Strength Grout Testing & Observations — trip suggestions

Parent: **High-Strength Grout Testing & Observations**. Apply suggestions sets **Trips** and cascades High-Strength Grout Testing hours (~4 hr/trip) and Vehicle — same pattern as other field parents.

**Rule — Grout baseplates in special inspection**

One (1) trip for every 17,000 ft² of building pad, **only if** grout baseplates are present in special inspection requirements.

| Input | Notes |
|-------|--------|
| Grout baseplates in special inspection | `groutBaseplatesInSpecialInspection` (boolean) — must be true for the rule to fire |
| Building pad (SF) | `buildingPadSf` — often equals building area; if null/blank, falls back to `buildingAreaSf` |
| ft² per trip | Editable; **default 17,000** (`ft2PerTripGroutBaseplates`) |

**Formula:**

```
padSf = buildingPadSf > 0 ? buildingPadSf : buildingAreaSf
trips = groutBaseplatesInSpecialInspection && padSf > 0
  ? ceil(padSf / ft2PerTripGroutBaseplates)
  : 0
```

**Example:** 100,000 SF pad + baseplates flag → ceil(100000 / 17000) = **6 trips**

**Miss-check:** If the special-inspection baseplates flag is on but this parent is not in scope, a hint suggests adding it.

Takeoff fields live on Project facts (New / Setup / Field). Amber rule copy appears on the Field takeoff panel and near the High-Strength Grout parent.

### Structural Steel Inspections — trip suggestions

Parent: **Structural Steel Inspections** (primary). Apply suggestions sets **Trips** and cascades Structural Steel Inspections hours (~4 hr/trip) and Vehicle — same pattern as other field parents.

Optional catalog breakouts **Structural Steel (Bolting)**, **Structural Steel (Welding)**, and **Structural Steel (NDT)** remain available for manual scope only — they do **not** receive this trip rule, and relatedHints no longer push all three subtypes by default.

**Rule — Per level (area + final), × structure levels**

For each structure level: one (1) trip for every 20,000 ft² plus final inspection trip(s) (default 1). Total = levels × per-level trips.

| Input | Notes |
|-------|--------|
| Structural steel building (SF) | `structuralSteelBuildingSf` — typically floor plate / building SF; if null/blank, falls back to `buildingAreaSf` |
| Structure levels | `structureLevelCount` — Int, **default 1**, min 1 |
| SF per trip | Editable; **default 20,000** (`structuralSteelSfPerTrip`) |
| Final inspection trips | Editable; **default 1** (`structuralSteelFinalInspectionTrips`) per level — added only when area &gt; 0 |

**Formula:**

```
sf = structuralSteelBuildingSf > 0 ? structuralSteelBuildingSf : buildingAreaSf
perLevelTrips = sf > 0 ? ceil(sf / structuralSteelSfPerTrip) + structuralSteelFinalInspectionTrips : 0
trips = structureLevelCount * perLevelTrips
```

When `sf` is 0: `trips = 0` (no final alone).

**Examples:**
- 100,000 SF, 1 level → ceil(5) + 1 = **6 trips**
- 100,000 SF, 3 levels → 3 × 6 = **18 trips**

Amber UI shows: `{levels} levels × (ceil(SF/20000)+1 final)`.

Takeoff fields live on Project facts (New / Setup / Field). Amber rule copy appears on the Field takeoff panel and near the Structural Steel Inspections parent.

## Assumptions

- Heuristic suggestions never lock numbers
- Apply suggestions replaces lines for that parent
- Lab suggest can add Laboratory Testing if missing
- Out of scope: OCR, client fee PDF, Pricing Tool API, risk/forecast
