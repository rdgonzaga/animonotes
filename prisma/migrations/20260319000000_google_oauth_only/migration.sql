-- Remove credentials-based auth fields now that auth is Google OAuth only
ALTER TABLE "User"
  DROP COLUMN IF EXISTS "password",
  DROP COLUMN IF EXISTS "securityQuestion",
  DROP COLUMN IF EXISTS "securityAnswer";

ALTER TABLE "Account"
  DROP COLUMN IF EXISTS "password";
