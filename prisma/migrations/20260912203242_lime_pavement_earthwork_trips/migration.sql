-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "docsReceived" TEXT NOT NULL DEFAULT '',
    "buildingAreaSf" REAL,
    "moistureConditionedSubgrade" BOOLEAN NOT NULL DEFAULT false,
    "flexibleBaseCap" BOOLEAN NOT NULL DEFAULT false,
    "earthworkSfPerTrip" REAL NOT NULL DEFAULT 2850,
    "moistureDepthNote" TEXT NOT NULL DEFAULT '',
    "flexibleBaseThicknessNote" TEXT NOT NULL DEFAULT '',
    "pavementAreaSf" REAL,
    "limeTreatedPavementSubgrade" BOOLEAN NOT NULL DEFAULT false,
    "pavementSfPerTrip" REAL NOT NULL DEFAULT 27500,
    "pavementNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("buildingAreaSf", "createdAt", "docsReceived", "earthworkSfPerTrip", "flexibleBaseCap", "flexibleBaseThicknessNote", "id", "location", "moistureConditionedSubgrade", "moistureDepthNote", "name", "notes", "updatedAt") SELECT "buildingAreaSf", "createdAt", "docsReceived", "earthworkSfPerTrip", "flexibleBaseCap", "flexibleBaseThicknessNote", "id", "location", "moistureConditionedSubgrade", "moistureDepthNote", "name", "notes", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
