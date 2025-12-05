-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('SERVICE', 'RETAIL', 'HYBRID');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "type" "OrgType" NOT NULL DEFAULT 'SERVICE';
