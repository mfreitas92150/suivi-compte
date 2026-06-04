-- CreateTable
CREATE TABLE "MonthlyItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "recurringId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyItem_label_month_year_type_key" ON "MonthlyItem"("label", "month", "year", "type");
