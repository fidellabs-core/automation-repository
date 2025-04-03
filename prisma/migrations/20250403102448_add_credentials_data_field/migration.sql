/*
  Warnings:

  - The primary key for the `PlatformCredential` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `consumerKey` on the `PlatformCredential` table. All the data in the column will be lost.
  - You are about to drop the column `consumerSecret` on the `PlatformCredential` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `PlatformCredential` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `PlatformCredential` table. All the data in the column will be lost.
  - You are about to drop the column `tokenSecret` on the `PlatformCredential` table. All the data in the column will be lost.
  - The `id` column on the `PlatformCredential` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[platform]` on the table `PlatformCredential` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PlatformCredential" DROP CONSTRAINT "PlatformCredential_pkey",
DROP COLUMN "consumerKey",
DROP COLUMN "consumerSecret",
DROP COLUMN "expiresAt",
DROP COLUMN "refreshToken",
DROP COLUMN "tokenSecret",
ADD COLUMN     "credentialsData" JSONB,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PlatformCredential_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformCredential_platform_key" ON "PlatformCredential"("platform");
