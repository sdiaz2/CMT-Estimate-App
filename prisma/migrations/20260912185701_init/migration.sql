-- CreateTable
CREATE TABLE "ParentTaskCatalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'field',
    "relatedHints" TEXT NOT NULL DEFAULT '[]',
    "defaultDrivers" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "LineTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "catalogId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "units" TEXT NOT NULL,
    "isLab" BOOLEAN NOT NULL DEFAULT false,
    "includesOT" BOOLEAN NOT NULL DEFAULT false,
    "includesVehicle" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "qtyHint" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "LineTemplate_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "ParentTaskCatalog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "docsReceived" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectParent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "drivers" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "ProjectParent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectParent_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "ParentTaskCatalog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectParentId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "units" TEXT NOT NULL,
    "trips" REAL,
    "isLab" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "rateDisplay" REAL,
    CONSTRAINT "LineItem_projectParentId_fkey" FOREIGN KEY ("projectParentId") REFERENCES "ProjectParent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentTaskCatalog_name_key" ON "ParentTaskCatalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectParent_projectId_catalogId_key" ON "ProjectParent"("projectId", "catalogId");
