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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("createdAt", "docsReceived", "id", "location", "name", "notes", "updatedAt") SELECT "createdAt", "docsReceived", "id", "location", "name", "notes", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
