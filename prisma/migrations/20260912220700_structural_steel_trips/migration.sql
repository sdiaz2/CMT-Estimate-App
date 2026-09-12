-- AlterTable
ALTER TABLE "Project" ADD COLUMN "structuralSteelBuildingSf" REAL;
ALTER TABLE "Project" ADD COLUMN "structuralSteelSfPerTrip" REAL NOT NULL DEFAULT 20000;
ALTER TABLE "Project" ADD COLUMN "structuralSteelFinalInspectionTrips" REAL NOT NULL DEFAULT 1;
