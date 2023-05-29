/*
  Warnings:

  - Added the required column `supplyLeft` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "row" TEXT,
ADD COLUMN     "section" TEXT,
ADD COLUMN     "supplyLeft" INTEGER NOT NULL;
