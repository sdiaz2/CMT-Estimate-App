-- AlterTable
ALTER TABLE "Project" ADD COLUMN "concreteYd3PrivatePavement" REAL;
ALTER TABLE "Project" ADD COLUMN "yd3PerTripPrivatePavement" REAL NOT NULL DEFAULT 500;
ALTER TABLE "Project" ADD COLUMN "concreteYd3PublicPavement" REAL;
ALTER TABLE "Project" ADD COLUMN "yd3PerTripPublicPavement" REAL NOT NULL DEFAULT 900;
