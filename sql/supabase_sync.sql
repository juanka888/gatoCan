BEGIN;

-- =============================================================
-- 1) TABLAS BASE (Prisma + Auth + Foro)
-- =============================================================

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "password" TEXT,
  "googleId" TEXT,
  "name" TEXT,
  "image" TEXT,
  "runnerBestScore" INTEGER NOT NULL DEFAULT 0,
  "runnerBestDistance" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Profile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "nombreCompleto" TEXT,
  "telefono" TEXT,
  "dniNie" TEXT,
  "direccion" TEXT,
  "codigoPostal" TEXT,
  "poblacion" TEXT,
  "karmaPoints" INTEGER NOT NULL DEFAULT 0,
  "karmaRank" INTEGER,
  "totalDonaciones" NUMERIC(65,30) NOT NULL DEFAULT 0,
  "runnerBestScore" INTEGER NOT NULL DEFAULT 0,
  "runnerBestDistanceM" INTEGER NOT NULL DEFAULT 0,
  "aceptaPoliticas" BOOLEAN NOT NULL DEFAULT FALSE,
  "runnerGlobalRank" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías del foro (aunque el código hoy consume string en ForumPost.category)
CREATE TABLE IF NOT EXISTS "Category" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ForumPost" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'General',
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Comment" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "postId" INTEGER NOT NULL,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Donation" (
  "id" TEXT PRIMARY KEY,
  "amount" NUMERIC(65,30) NOT NULL,
  "animalName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'succeeded',
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Compatibilidad NextAuth (aunque la sesión actual sea JWT)
CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

-- =============================================================
-- 2) SINCRONIZACIÓN DE COLUMNAS (ADD/MODIFY)
-- =============================================================

-- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "runnerBestScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "runnerBestDistance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ALTER COLUMN "email" TYPE TEXT;

-- Profile
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "nombreCompleto" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "telefono" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "dniNie" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "direccion" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "codigoPostal" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "poblacion" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "karmaPoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "karmaRank" INTEGER;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "totalDonaciones" NUMERIC(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "runnerBestScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "runnerBestDistanceM" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "aceptaPoliticas" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "runnerGlobalRank" INTEGER;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Profile" ALTER COLUMN "totalDonaciones" TYPE NUMERIC(65,30) USING "totalDonaciones"::NUMERIC;

-- ForumPost
ALTER TABLE "ForumPost" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "ForumPost" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "ForumPost" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'General';
ALTER TABLE "ForumPost" ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE "ForumPost" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Comment
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "postId" INTEGER;
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "authorId" TEXT;
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Donation
ALTER TABLE "Donation" ADD COLUMN IF NOT EXISTS "amount" NUMERIC(65,30);
ALTER TABLE "Donation" ADD COLUMN IF NOT EXISTS "animalName" TEXT;
ALTER TABLE "Donation" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'succeeded';
ALTER TABLE "Donation" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Donation" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Donation" ALTER COLUMN "amount" TYPE NUMERIC(65,30) USING "amount"::NUMERIC;

-- Account / Session / VerificationToken
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refresh_token" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "access_token" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "expires_at" INTEGER;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "token_type" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "scope" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "id_token" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "session_state" TEXT;

-- =============================================================
-- 3) LIMPIEZA DE COLUMNAS LEGACY (sin DROP TABLE)
-- =============================================================

-- ForumPost / Comment legacy naming
ALTER TABLE "ForumPost" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "Comment" DROP COLUMN IF EXISTS "userId";

-- Profile legacy distance naming (el código usa runnerBestDistanceM)
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "runnerBestDistance";

-- Donation legacy naming
ALTER TABLE "Donation" DROP COLUMN IF EXISTS "catName";

-- User legacy auth columns no usadas en este repo
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";

-- =============================================================
-- 4) ÍNDICES Y CONSTRAINTS
-- =============================================================

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId") WHERE "googleId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");
CREATE INDEX IF NOT EXISTS "Profile_karmaPoints_idx" ON "Profile"("karmaPoints");
CREATE INDEX IF NOT EXISTS "Profile_runnerBestScore_idx" ON "Profile"("runnerBestScore");

CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");

CREATE INDEX IF NOT EXISTS "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");
CREATE INDEX IF NOT EXISTS "ForumPost_category_idx" ON "ForumPost"("category");

CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "Comment_authorId_idx" ON "Comment"("authorId");

CREATE INDEX IF NOT EXISTS "Donation_userId_idx" ON "Donation"("userId");
CREATE INDEX IF NOT EXISTS "Donation_createdAt_idx" ON "Donation"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key"
  ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key"
  ON "Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key"
  ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key"
  ON "VerificationToken"("identifier", "token");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Profile_userId_fkey'
  ) THEN
    ALTER TABLE "Profile"
      ADD CONSTRAINT "Profile_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ForumPost_authorId_fkey'
  ) THEN
    ALTER TABLE "ForumPost"
      ADD CONSTRAINT "ForumPost_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Comment_postId_fkey'
  ) THEN
    ALTER TABLE "Comment"
      ADD CONSTRAINT "Comment_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Comment_authorId_fkey'
  ) THEN
    ALTER TABLE "Comment"
      ADD CONSTRAINT "Comment_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Donation_userId_fkey'
  ) THEN
    ALTER TABLE "Donation"
      ADD CONSTRAINT "Donation_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ForumPost_category_fkey'
  ) THEN
    ALTER TABLE "ForumPost"
      ADD CONSTRAINT "ForumPost_category_fkey"
      FOREIGN KEY ("category") REFERENCES "Category"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Account_userId_fkey'
  ) THEN
    ALTER TABLE "Account"
      ADD CONSTRAINT "Account_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_fkey'
  ) THEN
    ALTER TABLE "Session"
      ADD CONSTRAINT "Session_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- =============================================================
-- 5) SEEDING CATEGORÍAS
-- =============================================================

INSERT INTO "Category" ("name", "description") VALUES
  ('General', 'Conversación general sobre gatos y comunidad'),
  ('Salud', 'Consultas y consejos de salud felina'),
  ('Adopciones', 'Publicaciones para adopción responsable'),
  ('Rescate', 'Casos de rescate y seguimiento')
ON CONFLICT ("name") DO NOTHING;

-- Aseguramos datos válidos antes de FK category->Category.name
UPDATE "ForumPost"
SET "category" = 'General'
WHERE "category" IS NULL
   OR "category" = ''
   OR "category" NOT IN (SELECT "name" FROM "Category");

COMMIT;
