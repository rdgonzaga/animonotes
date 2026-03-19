-- Better Auth stores access token expiry as Date, so Account.expires_at must be TIMESTAMP
ALTER TABLE "Account"
ALTER COLUMN "expires_at" TYPE TIMESTAMP(3)
USING CASE
  WHEN "expires_at" IS NULL THEN NULL
  ELSE to_timestamp("expires_at")
END;
