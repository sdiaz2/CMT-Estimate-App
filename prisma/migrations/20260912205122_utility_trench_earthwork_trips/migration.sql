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
    "pavementSubgradeLf" REAL,
    "pavementLfPerTrip" REAL NOT NULL DEFAULT 300,
    "pavementNotes" TEXT NOT NULL DEFAULT '',
    "sidewalkLf" REAL,
    "sidewalksBunchedTogether" BOOLEAN NOT NULL DEFAULT false,
    "sidewalkSpreadLfPerTrip" REAL NOT NULL DEFAULT 125,
    "sidewalkBunchedLfPerTrip" REAL NOT NULL DEFAULT 150,
    "utilityTrenchLf" REAL,
    "utilityTrenchLfPerTrip" REAL NOT NULL DEFAULT 162.5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("buildingAreaSf", "createdAt", "docsReceived", "earthworkSfPerTrip", "flexibleBaseCap", "flexibleBaseThicknessNote", "id", "limeTreatedPavementSubgrade", "location", "moistureConditionedSubgrade", "moistureDepthNote", "name", "notes", "pavementAreaSf", "pavementLfPerTrip", "pavementNotes", "pavementSfPerTrip", "pavementSubgradeLf", "sidewalkBunchedLfPerTrip", "sidewalkLf", "sidewalkSpreadLfPerTrip", "sidewalksBunchedTogether", "updatedAt") SELECT "buildingAreaSf", "createdAt", "docsReceived", "earthworkSfPerTrip", "flexibleBaseCap", "flexibleBaseThicknessNote", "id", "limeTreatedPavementSubgrade", "location", "moistureConditionedSubgrade", "moistureDepthNote", "name", "notes", "pavementAreaSf", "pavementLfPerTrip", "pavementNotes", "pavementSfPerTrip", "pavementSubgradeLf", "sidewalkBunchedLfPerTrip", "sidewalkLf", "sidewalkSpreadLfPerTrip", "sidewalksBunchedTogether", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
