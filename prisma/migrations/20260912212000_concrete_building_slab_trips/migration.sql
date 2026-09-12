-- AlterTable
ALTER TABLE "Project" ADD COLUMN "concreteYd3BuildingSlab" REAL;
ALTER TABLE "Project" ADD COLUMN "yd3PerTripBuildingSlab" REAL NOT NULL DEFAULT 300;
