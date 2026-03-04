/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "eventId" TEXT,
ALTER COLUMN "date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentSubject" ADD COLUMN     "completionPeriod" INTEGER,
ADD COLUMN     "completionYear" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Exam_eventId_key" ON "Exam"("eventId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
