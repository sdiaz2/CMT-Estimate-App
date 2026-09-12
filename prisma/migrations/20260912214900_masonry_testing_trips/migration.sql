-- AlterTable
ALTER TABLE "Project" ADD COLUMN "masonryLoadBearingCmuSf" REAL;
ALTER TABLE "Project" ADD COLUMN "masonrySfPerTripLoadBearingCmu" REAL NOT NULL DEFAULT 5000;
ALTER TABLE "Project" ADD COLUMN "masonryElevatorBuildingCount" INTEGER;
ALTER TABLE "Project" ADD COLUMN "masonryElevatorShaftHeightFt" REAL;
ALTER TABLE "Project" ADD COLUMN "masonryFtPerTripElevatorShaft" REAL NOT NULL DEFAULT 16;
ALTER TABLE "Project" ADD COLUMN "masonryCmuEnclosureCount" INTEGER;
