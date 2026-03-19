ALTER TABLE "User"
ADD COLUMN "username" TEXT,
ADD COLUMN "college" TEXT,
ADD COLUMN "course" TEXT,
ADD COLUMN "biography" TEXT;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
