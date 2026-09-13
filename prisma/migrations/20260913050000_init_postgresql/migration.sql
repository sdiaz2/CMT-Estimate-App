-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ParentTaskCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'field',
    "relatedHints" TEXT NOT NULL DEFAULT '[]',
    "defaultDrivers" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "ParentTaskCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineTemplate" (
    "id" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "units" TEXT NOT NULL,
    "isLab" BOOLEAN NOT NULL DEFAULT false,
    "includesOT" BOOLEAN NOT NULL DEFAULT false,
    "includesVehicle" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "qtyHint" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "LineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "docsReceived" TEXT NOT NULL DEFAULT '',
    "buildingAreaSf" DOUBLE PRECISION,
    "moistureConditionedSubgrade" BOOLEAN NOT NULL DEFAULT false,
    "flexibleBaseCap" BOOLEAN NOT NULL DEFAULT false,
    "earthworkSfPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 2850,
    "moistureDepthNote" TEXT NOT NULL DEFAULT '',
    "flexibleBaseThicknessNote" TEXT NOT NULL DEFAULT '',
    "pavementAreaSf" DOUBLE PRECISION,
    "limeTreatedPavementSubgrade" BOOLEAN NOT NULL DEFAULT false,
    "pavementSfPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 27500,
    "pavementSubgradeLf" DOUBLE PRECISION,
    "pavementLfPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "pavementNotes" TEXT NOT NULL DEFAULT '',
    "sidewalkLf" DOUBLE PRECISION,
    "sidewalksBunchedTogether" BOOLEAN NOT NULL DEFAULT false,
    "sidewalkSpreadLfPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 125,
    "sidewalkBunchedLfPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "utilityTrenchLf" DOUBLE PRECISION,
    "utilityTrenchLfPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 162.5,
    "foundationScheduleTrips" INTEGER,
    "pierCount" INTEGER,
    "pierType" TEXT NOT NULL DEFAULT 'straight_shaft',
    "piersPerTripStraight" DOUBLE PRECISION NOT NULL DEFAULT 10.5,
    "piersPerTripCased" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "piersPerTripBelled" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "concreteYd3GradeBeamsPierCaps" DOUBLE PRECISION,
    "yd3PerTripGradeBeams" DOUBLE PRECISION NOT NULL DEFAULT 137.5,
    "concreteYd3BuildingSlab" DOUBLE PRECISION,
    "yd3PerTripBuildingSlab" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "concreteYd3PrivatePavement" DOUBLE PRECISION,
    "yd3PerTripPrivatePavement" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "concreteYd3PublicPavement" DOUBLE PRECISION,
    "yd3PerTripPublicPavement" DOUBLE PRECISION NOT NULL DEFAULT 900,
    "masonryLoadBearingCmuSf" DOUBLE PRECISION,
    "masonrySfPerTripLoadBearingCmu" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "masonryElevatorBuildingCount" INTEGER,
    "masonryElevatorShaftHeightFt" DOUBLE PRECISION,
    "masonryFtPerTripElevatorShaft" DOUBLE PRECISION NOT NULL DEFAULT 16,
    "masonryCmuEnclosureCount" INTEGER,
    "groutBaseplatesInSpecialInspection" BOOLEAN NOT NULL DEFAULT false,
    "buildingPadSf" DOUBLE PRECISION,
    "ft2PerTripGroutBaseplates" DOUBLE PRECISION NOT NULL DEFAULT 17000,
    "structuralSteelBuildingSf" DOUBLE PRECISION,
    "structuralSteelSfPerTrip" DOUBLE PRECISION NOT NULL DEFAULT 20000,
    "structuralSteelFinalInspectionTrips" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "structureLevelCount" INTEGER NOT NULL DEFAULT 1,
    "slabOnGradePourCount" INTEGER,
    "floorFlatnessSf" DOUBLE PRECISION,
    "ft2PerTripFloorFlatness" DOUBLE PRECISION NOT NULL DEFAULT 30000,
    "postTensionSlabPourCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectParent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "drivers" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "ProjectParent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "projectParentId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "units" TEXT NOT NULL,
    "trips" DOUBLE PRECISION,
    "isLab" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "rateDisplay" DOUBLE PRECISION,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentTaskCatalog_name_key" ON "ParentTaskCatalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectParent_projectId_catalogId_key" ON "ProjectParent"("projectId", "catalogId");

-- AddForeignKey
ALTER TABLE "LineTemplate" ADD CONSTRAINT "LineTemplate_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "ParentTaskCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectParent" ADD CONSTRAINT "ProjectParent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectParent" ADD CONSTRAINT "ProjectParent_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "ParentTaskCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_projectParentId_fkey" FOREIGN KEY ("projectParentId") REFERENCES "ProjectParent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

