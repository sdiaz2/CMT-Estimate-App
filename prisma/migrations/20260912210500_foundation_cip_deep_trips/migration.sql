-- AlterTable
ALTER TABLE "Project" ADD COLUMN "foundationScheduleTrips" INTEGER;
ALTER TABLE "Project" ADD COLUMN "pierCount" INTEGER;
ALTER TABLE "Project" ADD COLUMN "pierType" TEXT NOT NULL DEFAULT 'straight_shaft';
ALTER TABLE "Project" ADD COLUMN "piersPerTripStraight" REAL NOT NULL DEFAULT 10.5;
ALTER TABLE "Project" ADD COLUMN "piersPerTripCased" REAL NOT NULL DEFAULT 5;
ALTER TABLE "Project" ADD COLUMN "piersPerTripBelled" REAL NOT NULL DEFAULT 7;
