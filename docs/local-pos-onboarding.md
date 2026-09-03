# 🏪 Local POS Onboarding & Offline Licensing Engine

Comprehensive technical guide and architectural documentation for the **On-Premise Cafe POS System**. This guide explains how cafes activate their POS offline using cryptographic license tokens issued by the Golden DB Support Platform, manage local staff access via JWT & quick PINs, and operate seamlessly with zero cloud dependencies.

---

## 📌 Table of Contents
1. [Overview & Philosophy](#1-overview--philosophy)
2. [Why Offline Cryptographic Licensing?](#2-why-offline-cryptographic-licensing)
3. [Architecture & Workflow](#3-architecture--workflow)
4. [Database Schemas](#4-database-schemas)
5. [Cryptographic Signature & Verification](#5-cryptographic-signature--verification)
6. [Anti-Clock-Tampering Guard](#6-anti-clock-tampering-guard)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Local JWT Authentication & Role-Based Access](#8-local-jwt-authentication--role-based-access)
9. [Frontend User Experience & Flow](#9-frontend-user-experience--flow)
10. [Developer Testing & Verification Guide](#10-developer-testing--verification-guide)
11. [Environment Setup & Prisma Generation](#11-environment-setup--prisma-generation)

---

## 1. Overview & Philosophy

The **Local Cafe POS** is designed to run entirely on-premise on a single Billing PC / mini-PC functioning as the **Local Hub**. Tablets and mobile phones (waiters, kitchen displays) communicate over the cafe's local Wi-Fi router.

* 🚫 **Zero Cloud Infrastructure Cost in Year 1**: No monthly AWS EC2 or cloud database bills.
* ⚡ **100% Offline Resilient**: Billing and order dispatch continue uninterrupted even during internet or broadband outages.
* 🔐 **Cryptographically Tamper-Proof**: Licenses are mathematically signed with HMAC-SHA256 and cannot be spoofed or altered without the master secret salt.

---

## 2. Why Offline Cryptographic Licensing?

### The Problem
Traditional SaaS POS systems require an active internet connection to ping a cloud license server on every startup. In Indian tier-1/2/3 cafes, internet disconnects can halt operations and cause significant revenue loss.

### The Solution: Asymmetric Offline Tokens
1. The developer generates a signed cryptographic token from the **Golden DB Support Platform** (e.g. `LIC-CFMUM001-90D-89B24C797D9EE8EF-...`).
2. The cafe owner inputs their **Cafe Code** and **License Key** into their local POS software on first startup.
3. The local POS software verifies the mathematical HMAC signature **offline** in $< 5\text{ ms}$, activates the store, and enables POS billing for 90 days (or the plan duration).

---

## 3. Architecture & Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Developer as Developer / Support Platform
    actor Owner as Cafe Owner
    participant POS_UI as Local POS Frontend (:5173)
    participant POS_API as Local POS Backend (:3000)
    participant POS_DB as Local POS Database

    Note over Developer,Owner: 1. Store Registration in Golden DB
    Developer->>Owner: Sends WhatsApp Message with Cafe Code (CF-MUM-001) & Master License Key

    Note over Owner,POS_UI: 2. First-Time Local POS Setup
    Owner->>POS_UI: Launches Cafe POS (First Run)
    POS_UI-->>Owner: Displays "Activate Cafe POS License" Screen
    Owner->>POS_UI: Enters Cafe Code + License Key + Sets Master Admin PIN (e.g. 1234)

    POS_UI->>POS_API: POST /api/license/activate
    POS_API->>POS_API: 1. Decodes Base64URL Payload<br/>2. Verifies HMAC-SHA256 Signature<br/>3. Confirms Cafe Code & Expiration Date
    POS_API->>POS_DB: Saves StoreProfile, LocalLicense & LocalUser (Owner)
    POS_API-->>POS_UI: Returns Success & Activated Store Profile

    Note over Owner,POS_UI: 3. Daily Staff Operations (Local JWT)
    Owner->>POS_UI: Enters 4-Digit Staff PIN on Numpad
    POS_UI->>POS_API: POST /api/auth/login { pin: "1234" }
    POS_API->>POS_API: 1. Validates PIN<br/>2. Checks License Validity (Date.now() < expiresAt)
    POS_API-->>POS_UI: Issues Local JWT Token (12h session)
    POS_UI-->>Owner: Opens POS Dashboard (Tables, Counter, KDS, Inventory)
```

---

## 4. Database Schemas

The following models are integrated into the local POS database (`backend/prisma/schema.prisma`):

```prisma
// ==========================================
// 1. STORE PROFILE (Cafe Identity & Settings)
// ==========================================
model StoreProfile {
  id              String    @id // e.g. "202609021788355184890" (Pure Numeric: YYYYMMDD + Timestamp ms)
  cafeCode        String    @unique // e.g. "CF-MUM-001"
  businessName    String    // e.g. "The Urban Bistro"
  ownerName       String
  phone           String
  email           String?
  city            String    @default("Mumbai")
  state           String    @default("Maharashtra")
  address         String?
  gstin           String?
  currencySymbol  String    @default("₹")
  receiptFooter   String?   @default("Thank you for visiting! Please visit again.")
  isActivated     Boolean   @default(false)
  activatedAt     DateTime?
  updatedAt       DateTime  @updatedAt
}

// ==========================================
// 2. LOCAL LICENSE REGISTRY & INTEGRITY
// ==========================================
model LocalLicense {
  id              String    @id // e.g. "202609021788355184970" (Pure Numeric: YYYYMMDD + Timestamp ms)
  licenseKey      String    @db.Text
  planCode        String    // e.g. "TRIAL_3M", "PAID_1Y"
  durationDays    Int
  issuedAt        DateTime
  expiresAt       DateTime
  maxTerminals    Int       @default(10)
  allowedModules  Json      // ["COUNTER_POS", "TABLE_POS", "KDS", "INVENTORY", "GDRIVE_BACKUP"]
  status          String    @default("ACTIVE") // ACTIVE | EXPIRED | SUSPENDED
  lastKnownClock  DateTime  @default(now())   // Anti-Clock-Tampering Guard
  updatedAt       DateTime  @updatedAt
}

// ==========================================
// 3. LOCAL STAFF & ROLES (Multi-Device Auth)
// ==========================================
model LocalUser {
  id              String    @id // e.g. "202609021788355184984" (Pure Numeric: YYYYMMDD + Timestamp ms)
  username        String    @unique
  fullName        String
  pinCodeHash     String    // Fast 4-digit PIN for Cashiers/Waiters (e.g. "1234")
  passwordHash    String?   // Password for Store Owner / Admin Settings
  role            String    @default("CASHIER") // OWNER | MANAGER | CASHIER | WAITER | KITCHEN
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 5. Cryptographic Signature & Verification

### License Key Token Anatomy
```text
LIC-CFMUM001-90D-89B24C797D9EE8EF-eyJjYWZlQ29kZSI6IkNGLU1VTS...
│   │        │   │                │
│   │        │   │                └─► 5. Base64URL-encoded JSON Payload
│   │        │   └──────────────────► 4. 16-Character HMAC-SHA256 Signature
│   │        └──────────────────────► 3. Validity Duration (90 Days)
│   └───────────────────────────────► 2. Sanitized Cafe Code
└───────────────────────────────────► 1. License Prefix Indicator
```

### Verification Algorithm
1. Split the token on `-` into `['LIC', cafeCode, duration, signature, payloadB64]`.
2. Decode `payloadB64` to string and parse the JSON payload:
   ```json
   {
     "cafeCode": "CF-MUM-001",
     "businessName": "The Urban Bistro",
     "planCode": "TRIAL_3M",
     "durationDays": 90,
     "issuedAt": "2026-09-02T12:15:59.682Z",
     "expiresAt": "2026-12-01T12:15:59.682Z",
     "maxTerminals": 10,
     "modules": ["COUNTER_POS", "TABLE_POS", "KDS", "INVENTORY", "GDRIVE_BACKUP"]
   }
   ```
3. Compute expected HMAC:
   $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{payloadJson}, \text{SECRET\_SALT})[0..16]$$
4. Assert:
   - $\text{Expected Signature} == \text{Token Signature}$ (Prevents forged keys).
   - $\text{Token Cafe Code} == \text{Entered Cafe Code}$ (Prevents sharing licenses between cafes).
   - $\text{Current Date} < \text{Payload ExpiresAt}$ (Ensures valid date range).

### 5.1 Calendar-Day License Expiration Calculation
The local POS calculates live days remaining using the calendar midnight difference (`src/common/date-util.ts`):
```typescript
export function calculateDaysRemaining(expiresAt: Date | string, fromDate: Date | string = new Date()): number {
  const expiry = new Date(expiresAt);
  const current = new Date(fromDate);

  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();
  const currentMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();

  return Math.round((expiryMidnight - currentMidnight) / (1000 * 60 * 60 * 24));
}
```
- Normalizing to midnight prevents raw millisecond rounding artifacts (e.g. 23 hours elapsed no longer shows the full original duration).
- Displays exact calendar days left to the user: Day 0 = full duration, Day 1 = `duration - 1`, Expiry Day = 0 (`Expires today`), Post-Expiry = Expired.

---

## 6. Anti-Clock-Tampering Guard

### The Attack Vector
A store owner might attempt to keep a 3-month free trial running forever by rolling back the operating system clock (e.g. changing the PC clock from December 2026 back to September 2026).

### The POS Defense
* Every time a staff member logs in or an order is created, the POS checks:
  $$\text{Current System Time} \ge \text{lastKnownClock}$$
* If $\text{Current System Time} < \text{lastKnownClock}$, the POS locks transaction creation with error `CLOCK_TAMPERING_DETECTED` and prompts the user to correct the system date/time.
* On every successful transaction, `lastKnownClock` is updated to $\max(\text{lastKnownClock}, \text{Current System Time})$.

---

## 7. API Endpoints Reference

### License Management (`/api/license`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/license/activate` | First-time store activation | `{ cafeCode, licenseKey, ownerPin, ownerPassword }` |
| `GET` | `/api/license/status` | Check license health, days left, modules | *None* |
| `POST` | `/api/license/renew` | Apply a newly purchased renewal key | `{ licenseKey }` |

### Local Authentication (`/api/auth`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Staff PIN or Owner Password Login | `{ pin }` OR `{ username, password }` |
| `GET` | `/api/auth/me` | Retrieve active staff session & store profile | Bearer Token in `Authorization` header |
| `GET` | `/api/auth/staff` | List active staff for quick switch | *None* |
| `POST` | `/api/auth/staff` | Create new waiter/cashier staff with PIN | `{ username, fullName, pin, role }` |

---

## 8. Local JWT Authentication & Role-Based Access

The local JWT token issued on login has a 12-hour validity and contains:
```json
{
  "sub": "usr_20260902123456",
  "username": "rajesh_owner",
  "fullName": "Rajesh Sharma",
  "role": "OWNER",
  "cafeCode": "CF-MUM-001",
  "allowedModules": ["COUNTER_POS", "TABLE_POS", "KDS", "INVENTORY", "GDRIVE_BACKUP"],
  "iat": 1788350000,
  "exp": 1788393200
}
```

### Role Hierarchy
* 👑 **`OWNER`**: Full access to all menus, inventory, pricing, revenue reports, license renewal, and staff PIN management.
* 💼 **`MANAGER`**: Menu management, inventory restock, discount approvals, and shift reports.
* 💳 **`CASHIER`**: Order creation, table billing, bill settlement, and receipt printing.
* 📱 **`WAITER`**: Mobile/tablet table selection, order placing, and KOT dispatch.
* 👨‍🍳 **`KITCHEN`**: Kitchen Display System (KDS) order progress and status updates.

---

## 9. Frontend User Experience & Flow

1. **Unregistered State (First Launch)**:
   - POS automatically detects `isActivated: false` and routes to `ActivateLicenseView`.
   - Clean card prompting for **Cafe Code** (`CF-MUM-001`), **License Key**, and **Master 4-Digit Owner PIN** (`1234`).
2. **Activated State (Daily Use)**:
   - Displays sleek login interface with store name (`The Urban Bistro`), Cafe Code badge, and live days remaining counter.
   - Quick **4-Digit Numpad** for fast cashier/waiter punch-in, plus **Password Login** tab for Owner settings.
3. **Trial Expiry State (After 90 Days)**:
   - If license expires, order creation is gracefully disabled.
   - A modal provides 1-click access to **Export Daily Sales to Excel / Google Drive**, ensuring zero data lock-in.
   - Owner can paste the new renewal key from WhatsApp to immediately resume operations.

---

## 10. Developer Testing & Verification Guide

### Test Store Credentials
* **Store Name**: `The Urban Bistro`
* **Cafe Code**: `CF-MUM-001`
* **Master License Key**:
  ```text
  LIC-CFMUM001-90D-89B24C797D9EE8EF-eyJjYWZlQ29kZSI6IkNGLU1VTS0wMDEiLCJidXNpbmVzc05hbWUiOiJUaGUgVXJiYW4gQmlzdHJvIiwicGxhbkNvZGUiOiJUUklBTF8zTSIsImR1cmF0aW9uRGF5cyI6OTAsImlzc3VlZEF0IjoiMjAyNi0wOS0wMlQxMjoxNTo1OS42ODJaIiwiZXhwaXJlc0F0IjoiMjAyNi0xMi0wMVQxMjoxNTo1OS42ODJaIiwibWF4VGVybWluYWxzIjoxMCwibW9kdWxlcyI6WyJDT1VOVEVSX1BPUyIsIlRBQkxFX1BPUyIsIktEUyIsIklOVkVOVE9SWSIsIkdEUklWRV9CQUNLVVAiXX0
  ```
* **Default Owner PIN**: `1234`
* **Default Owner Password**: `admin123`

---

## 11. Environment Setup & Prisma Generation

### Local POS Backend (`backend/.env`):
```env
# Server Port
PORT=3000

# Database Configuration (MySQL / MariaDB)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=qsr_db
DATABASE_CONNECTION_LIMIT=10

# Prisma Database Connection URL
DATABASE_URL="mysql://root:root@localhost:3306/qsr_db"
```

### Initial Prisma Client Setup:
Before starting the backend or running unit/E2E tests, generate the Prisma client:
```bash
cd backend
npx prisma generate
```

---
*Created by AyCreationConnect Engineering Team for QSR On-Premise Suite.*
