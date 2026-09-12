-- AlterTable
ALTER TABLE "Project" ADD COLUMN "slabOnGradePourCount" INTEGER;
ALTER TABLE "Project" ADD COLUMN "floorFlatnessSf" REAL;
ALTER TABLE "Project" ADD COLUMN "ft2PerTripFloorFlatness" REAL NOT NULL DEFAULT 30000;
