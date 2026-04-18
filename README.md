# 🏥 RAHO Klinik — System Management

> Sistem Manajemen Klinik Terapi Infus — Monorepo (Backend + Frontend)

## 📁 Struktur Project

```
agpROJ/
├── apps/
│   ├── api/                  ← Express.js + Prisma + PostgreSQL + MinIO
│   └── web/                  ← Next.js 14 App Router
├── Requirements/             ← Dokumen spesifikasi & desain
├── docker-compose.dev.yml    ← PostgreSQL 15 + MinIO
├── package.json              ← Root monorepo
└── 🚀 Sprint Plan.md         ← Sprint roadmap
```

## ⚡ Quick Start

### 1. Prasyarat

- Node.js ≥ 18
- Docker Desktop (untuk PostgreSQL + MinIO)
- npm ≥ 9

### 2. Clone & Install

```bash
# Install semua dependencies (backend + frontend)
cd apps/api && npm install
cd ../web   && npm install
```

### 3. Environment Variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env sesuai kebutuhan

# Frontend
cp apps/web/.env.local.example apps/web/.env.local
```

### 4. Start Infrastructure (Docker)

```bash
docker compose -f docker-compose.dev.yml up -d
```

Containers yang berjalan:
| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | - |
| MinIO API | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |

### 5. Setup Database

```bash
cd apps/api

# Push schema ke database
npx prisma db push

# Jalankan seed (buat user, branch, produk awal)
npx tsx prisma/seed.ts

# (Opsional) Buat MinIO bucket
npx tsx scripts/initMinio.ts
```

### 6. Jalankan Development Servers

```bash
# Terminal 1 — Backend API (port 4000)
cd apps/api && npm run dev

# Terminal 2 — Frontend Web (port 3000)
cd apps/web && npm run dev
```

| URL | Deskripsi |
|-----|-----------|
| http://localhost:3000 | Frontend (Next.js) |
| http://localhost:4000/health | Backend health check |
| http://localhost:4000/api/v1 | API base URL |
| http://localhost:9001 | MinIO Console |

---

## 🔐 Akun Seed (Development Only)

| Email | Password | Role |
|-------|----------|------|
| superadmin@raho.id | SuperAdmin@123 | SUPER_ADMIN |
| manager@raho.id | Manager@123 | ADMIN_MANAGER |
| admincabang@raho.id | AdminCabang@123 | ADMIN_CABANG |
| adminlayanan@raho.id | AdminLayanan@123 | ADMIN_LAYANAN |
| dokter@raho.id | Dokter@123 | DOCTOR |
| nakes@raho.id | Nakes@123 | NURSE |

---

## 🏛️ Arsitektur

```
[Browser]
    ↓
[Next.js 14]  :3000  (SSR + Client Components)
    ↓ Axios (JWT Bearer)
[Express.js]  :4000  /api/v1
    ↓
[PostgreSQL]  :5432  (via Prisma ORM)
[MinIO]       :9000  (file storage — dokumen, foto)
```

### Middleware Stack (Backend)

```
Request → helmet → cors → rateLimit → authenticate → authorize → assertBranchAccess → handler
                                                                                          ↓
Response ← errorHandler ←───────────────────────────────────────────────────────── service
```

### Role Hierarchy

```
SUPER_ADMIN
  └─ ADMIN_MANAGER
       └─ ADMIN_CABANG
            ├─ ADMIN_LAYANAN
            ├─ DOCTOR
            └─ NURSE
MEMBER (portal terpisah)
```

---

## 📋 API Reference

### Auth

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/auth/login` | Login semua role | - |
| POST | `/api/v1/auth/refresh` | Rotate access token | - |
| POST | `/api/v1/auth/logout` | Logout | Bearer |
| GET | `/api/v1/auth/me` | Data user saat ini | Bearer |

### Response Envelope

**Success:**
```json
{ "success": true, "data": { ... }, "meta": { ... } }
```

**Error:**
```json
{ "success": false, "error": { "code": "ERR_CODE", "message": "..." } }
```

---

## 🗄️ Database Schema

Schema mencakup **6 domain**:

| Domain | Models |
|--------|--------|
| Core | Branch, User, UserProfile |
| Member | Member, MemberDocument, BranchMemberAccess, ReferralCode |
| Package | PackagePricing, MemberPackage |
| Therapy | Encounter, TreatmentSession, Diagnosis, TherapyPlan, VitalSign, InfusionExecution, MaterialUsage, SessionPhoto, EMRNote, DoctorEvaluation |
| Inventory | MasterProduct, InventoryItem, StockMutation |
| Procurement | StockRequest, StockRequestItem, Shipment, ShipmentItem |
| Communication | Notification, ChatRoom, ChatMessage, AuditLog |

---

## 🚀 Sprint Progress

| Sprint | Fokus | Status |
|--------|-------|--------|
| **Sprint 0** | Infrastructure, Auth API, Login UI | ✅ **DONE** |
| Sprint 1 | Auth lengkap semua role, sidebar dinamis | 🔲 |
| Sprint 2 | Dashboard & KPI per role | 🔲 |
| Sprint 3 | Modul Member + MinIO upload | 🔲 |
| Sprint 4 | Paket BASIC + BOOSTER | 🔲 |
| Sprint 5 | Sesi Terapi Step 1–5 | 🔲 |
| Sprint 6 | Sesi Terapi Step 6–10 | 🔲 |
| Sprint 7 | Inventori & stok | 🔲 |
| Sprint 8 | Procurement (request → shipment) | 🔲 |
| Sprint 9 | Notifikasi + Chat | 🔲 |
| Sprint 10 | Portal Member | 🔲 |
| Sprint 11 | Admin Manager & Super Admin | 🔲 |
| Sprint 12 | Audit Log, Master Data, Referral | 🔲 |
| Sprint 13 | QA, Security, Production | 🔲 |

---

## 🛠️ Perintah Berguna

```bash
# Database
npx prisma db push              # Sync schema ke DB tanpa migration
npx prisma migrate dev          # Buat migration baru (interactive)
npx tsx prisma/seed.ts          # Seed data awal
npx prisma studio               # GUI Prisma Studio
npx prisma generate             # Regenerate Prisma Client

# MinIO
npx tsx scripts/initMinio.ts   # Inisialisasi bucket

# Docker
docker compose -f docker-compose.dev.yml up -d    # Start containers
docker compose -f docker-compose.dev.yml down      # Stop containers
docker compose -f docker-compose.dev.yml logs -f   # Follow logs

# Build & Check
npm run type-check --prefix apps/api   # TypeScript check backend
npm run build --prefix apps/web        # Build frontend production
```

---

## 📦 Tech Stack

### Backend (`apps/api`)
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **ORM:** Prisma 5 + PostgreSQL 15
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod
- **Storage:** MinIO (S3-compatible) via AWS SDK v3
- **Logging:** Winston
- **Security:** Helmet, CORS, express-rate-limit

### Frontend (`apps/web`)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State:** Zustand (persisted)
- **HTTP Client:** Axios (auto-refresh interceptor)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts (Sprint 2+)
- **Styling:** Vanilla CSS with CSS variables (dark mode)
