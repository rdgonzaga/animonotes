-- Convert User.emailVerified from DateTime? to Boolean safely for Better Auth
ALTER TABLE "User" ADD COLUMN "emailVerified_new" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "emailVerified_new" = CASE
  WHEN "emailVerified" IS NULL THEN false
  ELSE true
END;

ALTER TABLE "User" DROP COLUMN "emailVerified";
ALTER TABLE "User" RENAME COLUMN "emailVerified_new" TO "emailVerified";
