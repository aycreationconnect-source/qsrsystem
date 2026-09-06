# 🛡️ Support Platform & Golden DB Architecture Documentation

## 📑 Table of Contents
- [1. Executive Summary & Purpose](#1-executive-summary--purpose)
- [2. Why We Migrated from MySQL to Supabase (PostgreSQL)](#2-why-we-migrated-from-mysql-to-supabase-postgresql)
- [3. System Architecture & High-Level Flow](#3-system-architecture--high-level-flow)
- [4. Database Architecture (Supabase Golden DB)](#4-database-architecture-supabase-golden-db)
- [5. Dynamic Plan Management Engine](#5-dynamic-plan-management-engine)
- [6. Offline Cryptographic Licensing Engine](#6-offline-cryptographic-licensing-engine)
- [7. Backend API Specification](#7-backend-api-specification)
- [8. Frontend Support & Developer UI](#8-frontend-support--developer-ui)
- [9. Onboarding & WhatsApp Card Lifecycle](#9-onboarding--whatsapp-card-lifecycle)
- [10. Environment Configuration & Supabase Setup Guide](#10-environment-configuration--supabase-setup-guide)
- [11. Production Cloud Architecture & Zero-Cost Strategy](#11-production-cloud-architecture--zero-cost-strategy)

---

## 1. Executive Summary & Purpose

### What is the Support Platform?
The **Support Platform** is an independent, developer-facing control center and master licensing hub for the QSR & Table POS ecosystem. It operates completely standalone from the cafe POS codebase and is maintained by the developer/support engineering team.

### Why was it built?
1. **Centralized Cafe Master Record ("Golden DB")**: Retains single source of truth for all onboarded cafes (50+ stores), their owners, contact details, branch locations, and active status.
2. **Offline-First Cryptographic Licensing**: Cafes run locally on-premise without requiring a persistent internet connection. The Support Platform generates cryptographically signed license tokens that the local POS verifies offline using an embedded public key.
3. **Dynamic Subscription & Trial Plan Management**: Allows the developer/support team to configure and assign various plan tiers (e.g., *Free 3 Months*, *Free 1 Month*, *15 Days Trial Extension*, *Paid 1 Month*, *Paid 1 Year*, *Custom Plans*).
4. **1-Click WhatsApp Onboarding**: Generates ready-to-send onboarding credentials and activation instructions that can be dispatched directly to cafe owners via WhatsApp/SMS.
5. **Security Isolation**: Isolates the Master Private Signing Key and confidential multi-tenant records from the cafe POS bundle to prevent reverse-engineering.

---

## 2. Why We Migrated from MySQL to Supabase (PostgreSQL)

### Background & Problem Statement
Originally, the Support Platform was designed to use a local or cloud MySQL instance. However, hosting a remote MySQL database requires purchasing a dedicated VPS, cPanel MySQL with remote access limits, or a paid managed database service (e.g. Hostinger, AWS RDS, DigitalOcean Managed MySQL), incurring **$5 to $25+ per month in recurring hosting costs**.

To achieve a **100% zero-cost commercial architecture**, we migrated the Support Platform's master data layer to **Supabase (PostgreSQL)**.

### Comparison Table: MySQL (Hostinger / VPS) vs. Supabase (PostgreSQL)

| Evaluation Metric | MySQL on Hostinger / VPS | Supabase (PostgreSQL) | Why Supabase Wins |
| :--- | :--- | :--- | :--- |
| **Monthly Cost** | **Paid recurring** ($4 - $20+/mo for VPS; shared hosting restricts remote connections) | **100% Free Tier** ($0/month) | **Zero capital outlay**: 500MB DB storage handles 100,000+ cafe records, license histories, and plans for free. |
| **Server Maintenance** | Manual OS updates, MySQL config tuning, firewall ports (3306), security patches | **Fully Managed Serverless Cloud** | Zero maintenance overhead; automated health checks and upgrades. |
| **Connection Pooling** | MySQL crashes under high connection limits without custom ProxySQL setup | **Built-in Supavisor / PgBouncer** (port 6543) | Handles transaction pooling effortlessly without running out of connections. |
| **Database Administration** | Requires installing desktop HeidiSQL, DBeaver, or phpMyAdmin | **Built-in Supabase Studio Web UI** | Access visual table editors, run SQL queries, and inspect logs directly from any browser. |
| **ORM Compatibility** | Prisma MySQL provider | **Prisma PostgreSQL provider** | Seamless transition via Prisma ORM with `@prisma/client` and direct connection support (`directUrl`). |
| **Client SDK Options** | Raw SQL / REST API only | **PostgreSQL Connection + `@supabase/supabase-js`** | Allows both server-side Prisma access and browser-side real-time query access. |
| **Security & Backups** | Manual mysqldump cron jobs | **Automated Daily Backups + SSL/TLS** | Built-in point-in-time recovery, SSL encryption, and native Row-Level Security (RLS). |

---

## 3. System Architecture & High-Level Flow

```mermaid
graph TD
    subgraph "Cloud Database (Supabase Free Tier - Mumbai AWS ap-south-1)"
        SupabaseCloud[("Supabase Golden DB (PostgreSQL)<br/>Project: vhowowbxyqztakovrqwy<br/>Port 6543 (Pooler) / 5432 (Direct)")]
    end

    subgraph "Developer / Support Control Center"
        SupportUI["Support Web UI (React 19 + Vite)<br/>Port: 5174"]
        SupportAPI["Support Platform NestJS API<br/>Port: 3001"]
        PlanEngine["Dynamic Plan Engine"]
        CryptoEngine["RSA / HMAC-SHA256 Cryptographic Signer"]

        SupportUI <--> SupportAPI
        SupportAPI <-->|"Prisma (PostgreSQL Pooler)"| SupabaseCloud
        SupportUI -.->|"Optional Direct SDK"| SupabaseCloud
        SupportAPI --> PlanEngine
        SupportAPI --> CryptoEngine
    end

    subgraph "Cafe Local Infrastructure (Offline / On-Premise)"
        CafePOS["Local Cafe POS (NestJS + React)<br/>Port: 3000 / 5173"]
        CafeDB[("Local On-Premise DB: qsr_db")]
        EmbeddedPubKey["Embedded Public Verification Key"]

        CafePOS <--> CafeDB
        CafePOS --> EmbeddedPubKey
    end

    CryptoEngine -.->|"1. Signed License Key (WhatsApp / SMS / Email)"| CafePOS
```

---

## 4. Database Architecture (Supabase Golden DB)

- **Database Engine**: PostgreSQL 15+ (Hosted on **Supabase Cloud**)
- **Project Reference**: `vhowowbxyqztakovrqwy`
- **Region**: `aws-0-ap-south-1` (Mumbai, India)
- **Transaction Pooler URL (Port 6543)**: `postgresql://postgres.vhowowbxyqztakovrqwy:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Direct Session URL (Port 5432)**: `postgresql://postgres.vhowowbxyqztakovrqwy:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
- **Web Administration**: [Supabase Studio Dashboard](https://supabase.com/dashboard/project/vhowowbxyqztakovrqwy)
- **Direct SQL DDL Script**: [`support-platform/backend/prisma/supabase_schema.sql`](file:///c:/Learning/projects/vidhara-qsr/support-platform/backend/prisma/supabase_schema.sql)

### Entity-Relationship Diagram

```mermaid
erDiagram
    PlanTemplate ||--o{ CafeMaster : "assigned to"
    CafeMaster ||--o{ LicenseHistory : "has audit trail"
    AdminUser ||--o{ LicenseHistory : "issued by"

    CafeMaster {
        string id PK "e.g. 202609021788342526604 (YYYYMMDD + Timestamp ms)"
        string cafeCode UK "e.g. CF-MUM-001"
        string businessName
        string ownerName
        string ownerPhone UK
        string ownerEmail
        string city
        string state
        string planId FK
        string licenseStatus "TRIAL | ACTIVE | EXPIRED | SUSPENDED"
        text currentLicenseKey
        datetime trialStartedAt
        datetime licenseExpiresAt
        boolean gdriveLinked
        string appVersion
        datetime createdAt
        datetime updatedAt
    }

    PlanTemplate {
        string id PK
        string planCode UK "e.g. TRIAL_3M, PAID_1Y"
        string name "e.g. 3 Months Free Trial"
        string planType "FREE_TRIAL | PAID | EXTENSION"
        int durationDays "e.g. 90, 30, 365, 15"
        decimal price
        boolean isDefault
        boolean isActive
        json allowedModules
        datetime createdAt
        datetime updatedAt
    }

    LicenseHistory {
        string id PK
        string cafeId FK
        string planId FK
        string action "TRIAL_ISSUED | RENEWED | EXTENDED | SUSPENDED"
        text issuedLicenseKey
        datetime previousExpiry
        datetime newExpiry
        string issuedByAdmin
        string notes
        datetime createdAt
    }

    AdminUser {
        string id PK
        string username UK
        string passwordHash
        string fullName
        string role "SUPER_ADMIN | SUPPORT"
        datetime createdAt
    }
```

---

## 4. Dynamic Plan Management Engine

The system supports creating and customizing any plan tier dynamically.

### Default Seeded Plan Templates:
1. **Free 3 Months Trial (`TRIAL_3M`)**: 90 Days validity, ₹0, default plan for initial rollout.
2. **Free 1 Month Trial (`TRIAL_1M`)**: 30 Days validity, ₹0, for upcoming phased onboarding.
3. **Free 2 Months Trial (`TRIAL_2M`)**: 60 Days validity, ₹0.
4. **15 Days Grace Extension (`EXTEND_15D`)**: 15 Days validity, ₹0, for cafes needing trial extensions.
5. **Paid 1 Month (`PAID_1M`)**: 30 Days validity.
6. **Paid 3 Months (`PAID_3M`)**: 90 Days validity.
7. **Paid 1 Year Annual (`PAID_1Y`)**: 365 Days validity.
8. **Custom Enterprise Plan (`CUSTOM`)**: Custom days & custom terminal limits.

---

## 5. Offline Cryptographic Licensing Engine

### How it operates without internet:
1. **Signing Phase (Support Platform)**:
   - When a cafe is registered or renewed, the backend constructs a structured JSON payload:
     ```json
     {
       "cafeCode": "CF-MUM-001",
       "businessName": "Mocha Bliss Cafe",
       "planCode": "TRIAL_3M",
       "issuedAt": "2026-09-02T14:00:00.000Z",
       "expiresAt": "2026-12-01T23:59:59.000Z",
       "maxTerminals": 10,
       "modules": ["COUNTER_POS", "TABLE_POS", "KDS", "INVENTORY", "GDRIVE_BACKUP"]
     }
     ```
   - The payload is signed with the **Developer Master Private Key** (HMAC-SHA256 salted or RSA-256).
   - Formatted into a human-readable token string: `LIC-CF001-90D-E4B2-89A1-C3F0-...`

2. **Verification Phase (Cafe Machine)**:
   - The local POS extracts the token, verifies the cryptographic signature with the public verification key.
   - If verified, it validates `CurrentDate <= expiresAt`.
   - If expired, it locks billing and displays the **Renewal & Backup** screen.
   - Includes **anti-rollback sentinel**: POS remembers the latest recorded transaction timestamp to prevent Windows clock rollbacks.

### 5.1 Calendar-Day License Expiry Calculation
To ensure that days-left counters are intuitive and accurate across the UI, both Support Platform and Local POS backends use a centralized `calculateDaysRemaining()` helper (`common/date-util.ts`):

$$\text{Days Remaining} = \text{round}\left(\frac{\text{Expiry Date (Midnight)} - \text{Current Date (Midnight)}}{86{,}400{,}000\text{ ms}}\right)$$

#### Why Calendar-Day Normalization?
- **Previous Approach (`Math.ceil((expiresAt - now) / msPerDay)`)**: Because `Math.ceil()` operates on raw millisecond differences, a 90-day plan registered yesterday at 12:15 PM and viewed today at 11:30 AM (23 hours later) had `89.03` days remaining, which rounded *up* to `90 Days Left`.
- **Current Approach (Normalized Calendar Midnight)**: Comparing the calendar dates directly ensures that:
  - **Registration Day (Day 0)**: Displays full plan duration (e.g. `90 Days Left` / `30 Days Left`).
  - **Next Calendar Day (Day 1)**: Displays exact elapsed count (e.g. `89 Days Left` / `29 Days Left`), regardless of the time of day.
  - **Expiry Day**: Displays `0 Days Left` (`Expires today`).
  - **Post-Expiry**: Evaluates to $< 0$ (`🛑 Expired`).

### 5.2 Onboarding Date vs First-Time POS Activation
- **Fixed Cryptographic Anchor**: When a cafe is onboarded in the Support Platform, `issuedAt` and `expiresAt` are cryptographically embedded inside the HMAC token.
- **Client Handover Delay**: If a cafe owner is onboarded on Day 0 but only opens/activates their local POS terminal on Day 2, the remaining validity reflects the time elapsed since token issuance.
- **Admin Extension**: If an owner requires their full duration starting from a delayed go-live date, the Admin can click **"Renew / Extend"** in the Support Platform dashboard to issue a +15 Day grace extension or a freshly dated license key with 1 click.

---

## 6. Backend API Specification (`localhost:3001`)

### Plan Management
- `GET /api/plans`: List all available plan templates.
- `POST /api/plans`: Create a new plan template (name, durationDays, planType, price, modules).
- `PUT /api/plans/:id`: Update existing plan template (e.g. change trial days from 90 to 30).
- `DELETE /api/plans/:id`: Archive/deactivate a plan template.

### Cafe Management & Licensing
- `GET /api/cafes`: List all cafes with search, city filter, and status filter (`ALL`, `TRIAL`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`).
- `GET /api/cafes/:id`: Get detailed profile, active license, and full audit history.
- `POST /api/cafes/register`: Register new cafe, assign plan, compute expiry date, generate signed license key, and return WhatsApp share payload.
- `POST /api/cafes/:id/renew`: Renew or extend cafe license with a chosen plan template.
- `POST /api/cafes/:id/toggle-status`: Block/Suspend or Unblock/Restore cafe store access.
- `POST /api/cafes/:id/regenerate-key`: Re-issue the cryptographic key if the cafe owner lost their token.

### Analytics & System Health
- `GET /api/stats`: Dashboard summary:
  - Total Registered Cafes
  - Active Trial Cafes (with days remaining breakdown)
  - Paid Subscriptions
  - Expiring in < 15 Days
  - Expired / Locked Cafes

---

## 7. Frontend Support & Developer UI (`localhost:5174`)

### Pages & Core Features:
1. **Analytics Dashboard**: Real-time counter widgets, expiry horizon warnings, quick actions.
2. **Cafe Directory**: Rich data table with search, status badges (`🟢 Active Trial (68d)`, `🟡 Expiring in 4d`, `🔴 Expired`), and direct action menus.
3. **New Cafe Registration Modal**: Fast onboarding form with instant plan selection and validation.
4. **Plan Manager Screen**: Full CRUD UI to create, edit, or adjust trial durations on the fly.
5. **License Extension & Renewal Modal**: 1-click extension with instant key generation.
6. **Interactive WhatsApp Onboarding Card**: Clean UI component with a **1-Click Copy** button formatted for WhatsApp dispatch.

---

## 8. Onboarding & WhatsApp Card Lifecycle

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 📋 PRE-FORMATTED WHATSAPP ONBOARDING MESSAGE                          │
├────────────────────────────────────────────────────────────────────────┤
│ 🎉 *Welcome to QSR POS System!*                                        │
│                                                                        │
│ ☕ *Cafe Details:*                                                     │
│ • Business Name: Mocha Bliss Cafe                                      │
│ • Cafe ID: CF-MUM-001                                                  │
│ • Plan: 3 Months Free Trial (90 Days)                                  │
│ • Valid Until: 01-Dec-2026                                             │
│                                                                        │
│ 🔑 *Your Activation License Key:*                                      │
│ `LIC-CFMUM001-90D-A8F2-BC90-12DE-94FA`                                 │
│                                                                        │
│ 🚀 *Quick Setup Steps:*                                                │
│ 1. Open QSR POS on your main billing computer.                         │
│ 2. Enter Cafe Code: `CF-MUM-001` and paste your License Key above.     │
│ 3. Once activated, scan the QR code from any Mobile/Tab to connect!    │
│                                                                        │
│ 📞 Support Helpline: +91 9876543210                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Environment Configuration & Supabase Setup Guide

### 1. Support Platform Backend (`support-platform/backend/.env`):
```env
# Server Port
PORT=3001

# Supabase PostgreSQL Database Configuration
# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
DATABASE_URL="postgresql://postgres.vhowowbxyqztakovrqwy:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connect to Postgres via the shared session-mode pooler (used for migrations)
DIRECT_URL="postgresql://postgres.vhowowbxyqztakovrqwy:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Supabase Project Credentials
SUPABASE_PROJECT_REF="vhowowbxyqztakovrqwy"
SUPABASE_URL="https://vhowowbxyqztakovrqwy.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Master Secret for Cryptographic Licensing Engine (Must match local POS secret)
MASTER_LICENSE_SECRET="QSR_MASTER_GOLDEN_SECRET_2026_AY_CONNECT"
```

> [!TIP]
> **How to Initialize Your Supabase Database in 1 Click**:
> 1. Log in to [Supabase Studio](https://supabase.com/dashboard/project/vhowowbxyqztakovrqwy).
> 2. Open the **SQL Editor** tab from the left sidebar.
> 3. Open [`support-platform/backend/prisma/supabase_schema.sql`](file:///c:/Learning/projects/vidhara-qsr/support-platform/backend/prisma/supabase_schema.sql).
> 4. Copy and paste the entire script into the SQL Editor and click **Run**.
> 5. Your tables (`plan_templates`, `cafe_masters`, `license_histories`, `admin_users`) and default seed plans/admin will be initialized immediately!

### 2. Support Platform Frontend (`support-platform/frontend/.env`):
```env
# Support Platform Backend API URL
VITE_API_BASE_URL="http://localhost:3001/api"

# Supabase Cloud Project Configuration
VITE_SUPABASE_PROJECT_REF="vhowowbxyqztakovrqwy"
VITE_SUPABASE_URL="https://vhowowbxyqztakovrqwy.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3. Local POS Backend (`backend/.env`):
```env
PORT=3000

# Local On-Premise Database Configuration (MySQL / MariaDB on Cafe PC)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=qsr_db
DATABASE_CONNECTION_LIMIT=10

# Prisma Database Connection URL
DATABASE_URL="mysql://root:root@localhost:3306/qsr_db"
```

---

## 11. Production Cloud Architecture & Zero-Cost Strategy

By leveraging Supabase Cloud for the Support Platform and keeping local cafe terminals on-premise, the platform achieves:
1. **Zero Recurring Infrastructure Costs**: No Hostinger VPS bills, no AWS RDS bills, and no cPanel hosting fees.
2. **True Air-Gapped Cafe Security**: If the cafe loses internet or power, local billing never stops.
3. **Anywhere Central Management**: The developer or support staff can log in to the Support Platform UI or Supabase Studio from any machine, onboard new cafes, issue/renew licenses, and dispatch WhatsApp cards seamlessly.
4. **Instant Scale**: The transaction pooler handles spikes in licensing validation or cafe registrations without database connection exhaustion.
