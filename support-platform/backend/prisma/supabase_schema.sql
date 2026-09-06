-- ==============================================================================
-- 🛡️ VIDHARA QSR SUPPORT PLATFORM & GOLDEN DB SCHEMA (SUPABASE POSTGRESQL)
-- Project Ref: vhowowbxyqztakovrqwy
-- Region: aws-0-ap-south-1 (Mumbai)
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE "PlanType" AS ENUM ('FREE_TRIAL', 'PAID', 'EXTENSION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LicenseStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLE: plan_templates
CREATE TABLE IF NOT EXISTS "plan_templates" (
    "id" VARCHAR(64) PRIMARY KEY,
    "planCode" VARCHAR(64) NOT NULL UNIQUE,
    "name" VARCHAR(191) NOT NULL,
    "planType" "PlanType" NOT NULL DEFAULT 'FREE_TRIAL',
    "durationDays" INTEGER NOT NULL DEFAULT 90,
    "price" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxTerminals" INTEGER NOT NULL DEFAULT 10,
    "allowedModules" JSONB,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLE: cafe_masters
CREATE TABLE IF NOT EXISTS "cafe_masters" (
    "id" VARCHAR(64) PRIMARY KEY,
    "cafeCode" VARCHAR(64) NOT NULL UNIQUE,
    "businessName" VARCHAR(191) NOT NULL,
    "ownerName" VARCHAR(191) NOT NULL,
    "ownerPhone" VARCHAR(50) NOT NULL UNIQUE,
    "ownerEmail" VARCHAR(191),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "address" TEXT,
    "planId" VARCHAR(64) NOT NULL REFERENCES "plan_templates"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
    "licenseStatus" "LicenseStatus" NOT NULL DEFAULT 'TRIAL',
    "currentLicenseKey" TEXT NOT NULL,
    "trialStartedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "licenseExpiresAt" TIMESTAMPTZ NOT NULL,
    "gdriveLinked" BOOLEAN NOT NULL DEFAULT false,
    "appVersion" VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE: license_histories
CREATE TABLE IF NOT EXISTS "license_histories" (
    "id" VARCHAR(64) PRIMARY KEY,
    "cafeId" VARCHAR(64) NOT NULL REFERENCES "cafe_masters"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    "planId" VARCHAR(64) REFERENCES "plan_templates"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    "action" VARCHAR(50) NOT NULL,
    "issuedLicenseKey" TEXT NOT NULL,
    "previousExpiry" TIMESTAMPTZ,
    "newExpiry" TIMESTAMPTZ NOT NULL,
    "issuedByAdmin" VARCHAR(100) NOT NULL DEFAULT 'Developer Admin',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE: admin_users
CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" VARCHAR(64) PRIMARY KEY,
    "username" VARCHAR(100) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS "idx_cafe_code" ON "cafe_masters"("cafeCode");
CREATE INDEX IF NOT EXISTS "idx_cafe_status" ON "cafe_masters"("licenseStatus");
CREATE INDEX IF NOT EXISTS "idx_cafe_expires" ON "cafe_masters"("licenseExpiresAt");
CREATE INDEX IF NOT EXISTS "idx_history_cafe" ON "license_histories"("cafeId");

-- 7. INITIAL SEED: SUPER-ADMIN USER (aycreationconnect / ay@creationconnect123$)
INSERT INTO "admin_users" ("id", "username", "passwordHash", "fullName", "role", "createdAt")
VALUES (
    '202609010000000000001',
    'aycreationconnect',
    'a75727e02a00b848bb06cbda3f6fe0b59b58fcad68fe39103c814b7e8d386ea4630a916e7f7b11d9a26388481e3a0b5f137ebf279f972b9a7c36a46cf11ff5b8',
    'AyCreationConnect Super-Admin',
    'SUPER_ADMIN',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO UPDATE 
SET "fullName" = EXCLUDED."fullName", "role" = EXCLUDED."role";

-- 8. INITIAL SEED: DEFAULT PLAN TEMPLATES
INSERT INTO "plan_templates" ("id", "planCode", "name", "planType", "durationDays", "price", "isDefault", "isActive", "maxTerminals", "allowedModules", "description")
VALUES
(
    '202609010000000000010',
    'TRIAL_3M',
    '3 Months Free Trial',
    'FREE_TRIAL',
    90,
    0.00,
    true,
    true,
    10,
    '["COUNTER_POS", "TABLE_POS", "KDS", "INVENTORY", "GDRIVE_BACKUP"]'::jsonb,
    'Standard 90-day comprehensive introductory trial for newly onboarded cafes.'
),
(
    '202609010000000000020',
    'TRIAL_1M',
    '1 Month Free Trial',
    'FREE_TRIAL',
    30,
    0.00,
    false,
    true,
    5,
    '["COUNTER_POS", "TABLE_POS", "INVENTORY"]'::jsonb,
    'Quick 30-day trial for single-counter QSR stores.'
),
(
    '202609010000000000030',
    'EXTEND_15D',
    '15 Days Trial Extension',
    'EXTENSION',
    15,
    0.00,
    false,
    true,
    10,
    '["COUNTER_POS", "TABLE_POS", "KDS", "INVENTORY", "GDRIVE_BACKUP"]'::jsonb,
    'Complimentary 15-day extension for cafes evaluating paid plan renewals.'
),
(
    '202609010000000000040',
    'PAID_1Y',
    'Annual Commercial License',
    'PAID',
    365,
    9999.00,
    false,
    true,
    25,
    '["COUNTER_POS", "TABLE_POS", "KDS", "INVENTORY", "GDRIVE_BACKUP", "MULTI_COUNTER"]'::jsonb,
    'Full 365-day commercial production subscription with priority developer support.'
)
ON CONFLICT ("planCode") DO NOTHING;
