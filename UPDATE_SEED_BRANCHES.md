# Update: Branch Seed Data

## Status: ✅ COMPLETED

## Overview
Memperbarui seed data untuk branches agar menggunakan tipe PREMIERE dan PARTNERSHIP sesuai dengan business model baru.

## Changes Made

### File: `apps/api/prisma/seeds/branches.seed.ts`

#### Before
```typescript
// Semua cabang menggunakan KLINIK
{
  branchCode: 'PST',
  name: 'Cabang Pusat Jakarta',
  type: BranchType.KLINIK,
  operatingHours: '08:00 - 20:00',
}

{
  branchCode: 'BDG',
  name: 'Cabang Bandung',
  type: BranchType.KLINIK,
  operatingHours: '08:00 - 18:00',
}

{
  branchCode: 'SBY',
  name: 'Cabang Surabaya',
  type: BranchType.KLINIK,
  operatingHours: '08:00 - 19:00',
}
```

#### After
```typescript
// Mix of PREMIERE and PARTNERSHIP
{
  branchCode: 'PST',
  name: 'RAHO Premiere Jakarta',
  type: BranchType.PREMIERE,
  operatingHours: '24 Jam',
}

{
  branchCode: 'BDG',
  name: 'RAHO Partnership Bandung',
  type: BranchType.PARTNERSHIP,
  operatingHours: '08:00 - 20:00',
}

{
  branchCode: 'SBY',
  name: 'RAHO Premiere Surabaya',
  type: BranchType.PREMIERE,
  operatingHours: '08:00 - 22:00',
}
```

## Seed Data Details

### 1. RAHO Premiere Jakarta (PST)
- **Type**: ⭐ PREMIERE
- **Location**: Jl. Sudirman Kav. 52-53, Jakarta Selatan
- **Phone**: 021-12345678
- **Operating Hours**: 24 Jam (Premium service)
- **Description**: Flagship premiere branch dengan layanan 24 jam

### 2. RAHO Partnership Bandung (BDG)
- **Type**: 🤝 PARTNERSHIP
- **Location**: Jl. Asia Afrika No. 10, Bandung
- **Phone**: 022-87654321
- **Operating Hours**: 08:00 - 20:00
- **Description**: Partnership branch dengan jam operasional extended

### 3. RAHO Premiere Surabaya (SBY)
- **Type**: ⭐ PREMIERE
- **Location**: Jl. Tunjungan No. 25, Surabaya
- **Phone**: 031-55667788
- **Operating Hours**: 08:00 - 22:00
- **Description**: Premiere branch dengan layanan hingga malam

## Key Changes

### 1. Branch Names
- Updated to include "RAHO" branding
- Added type indicator (Premiere/Partnership)
- More professional naming convention

### 2. Branch Types
- **PST**: KLINIK → PREMIERE
- **BDG**: KLINIK → PARTNERSHIP
- **SBY**: KLINIK → PREMIERE

### 3. Operating Hours
- **PST**: Enhanced to 24 hours (premium service)
- **BDG**: Extended to 20:00 (from 18:00)
- **SBY**: Extended to 22:00 (from 19:00)

### 4. Addresses
- **PST**: Updated to more prestigious location (Sudirman)
- **BDG**: Kept at Asia Afrika (good location)
- **SBY**: Kept at Tunjungan (prime location)

## Running the Seed

### Fresh Database
```bash
cd apps/api
npx prisma migrate reset
# This will drop database, run migrations, and seed
```

### Update Existing Data
```bash
cd apps/api
npx prisma db seed
# This will upsert branches (update if exists, create if not)
```

## Impact on Existing Data

### Using `upsert`
The seed uses `upsert` which means:
- If branch with same `branchCode` exists → **No update** (update: {})
- If branch doesn't exist → **Create new** with new data

### Important Note
**Existing branches will NOT be updated automatically**. The `update: {}` means no fields will be changed for existing records.

To update existing branches to new types, you have two options:

#### Option 1: Manual Update via UI
1. Login as ADMIN_MANAGER
2. Go to "Manajemen Cabang"
3. Edit each branch
4. Change type to PREMIERE or PARTNERSHIP

#### Option 2: Database Script
Create a migration or script to update existing branches:
```sql
-- Update existing branches to new types
UPDATE "branches" SET "type" = 'PREMIERE' WHERE "branchCode" = 'PST';
UPDATE "branches" SET "type" = 'PARTNERSHIP' WHERE "branchCode" = 'BDG';
UPDATE "branches" SET "type" = 'PREMIERE' WHERE "branchCode" = 'SBY';
```

## Testing

### 1. Fresh Seed
```bash
# Reset and seed
cd apps/api
npx prisma migrate reset --skip-seed
npx prisma db seed

# Verify
npx prisma studio
# Check branches table
```

### 2. Verify in Application
1. Login to application
2. Navigate to "Manajemen Cabang"
3. Verify branches show correct types:
   - PST: ⭐ Premiere
   - BDG: 🤝 Partnership
   - SBY: ⭐ Premiere

## Benefits

✅ **Realistic Data**: Seed data reflects actual business model
✅ **Type Variety**: Mix of PREMIERE and PARTNERSHIP for testing
✅ **Professional Naming**: Consistent branding with "RAHO"
✅ **Extended Hours**: More realistic operating hours
✅ **Better Testing**: Can test both branch types in development

## Backward Compatibility

✅ **Safe for Existing Data**
- Uses `upsert` with empty `update: {}`
- Won't modify existing branches
- Only creates new branches if they don't exist
- Branch codes remain the same (PST, BDG, SBY)

## Next Steps

1. **For Fresh Development**:
   ```bash
   cd apps/api
   npx prisma migrate reset
   ```
   This will create branches with new types.

2. **For Existing Development Database**:
   - Manually update branches via UI, OR
   - Run SQL update script, OR
   - Keep existing KLINIK types (they still work)

3. **For Production**:
   - Don't run seed (production data should not be seeded)
   - Manually create branches via UI with correct types
   - Or migrate existing branches using SQL script

## Files Modified

1. ✅ `apps/api/prisma/seeds/branches.seed.ts`
   - Updated all branch types
   - Updated branch names
   - Updated operating hours
   - Updated addresses

## Summary

Seed data sekarang mencerminkan business model baru dengan tipe PREMIERE dan PARTNERSHIP, memberikan data yang lebih realistis untuk development dan testing.
