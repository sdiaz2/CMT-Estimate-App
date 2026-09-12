-- AlterTable
ALTER TABLE "Project" ADD COLUMN "groutBaseplatesInSpecialInspection" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "buildingPadSf" REAL;
ALTER TABLE "Project" ADD COLUMN "ft2PerTripGroutBaseplates" REAL NOT NULL DEFAULT 17000;
