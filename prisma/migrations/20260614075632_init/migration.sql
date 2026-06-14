-- CreateTable
CREATE TABLE "Chair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CatalogView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChairClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chairId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChairClick_chairId_fkey" FOREIGN KEY ("chairId") REFERENCES "Chair" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
