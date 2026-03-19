-- Ensure Better Auth can create/link OAuth accounts when `type` is omitted
ALTER TABLE "Account" ALTER COLUMN "type" SET DEFAULT 'oauth';
