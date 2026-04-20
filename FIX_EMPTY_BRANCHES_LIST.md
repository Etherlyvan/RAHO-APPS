# Fix: Empty Branches List for Admin Manager

## Problem

Halaman "Manajemen Cabang" kosong untuk Admin Manager karena:
1. Admin Manager hanya bisa melihat cabang yang mereka buat (`createdBy = userId`)
2. Cabang dari seed tidak memiliki field `createdBy`
3. Filter di backend membuat cabang tanpa `createdBy` tidak muncul

## Root Cause

### Backend Logic (`apps/api/src/modules/branches/branches.service.ts`)
```typescript
export async function getAllBranchesWithStatsService(userId?: string, userRole?: string) {
  const where: Prisma.BranchWhereInput = {};
  if (userRole === 'ADMIN_MANAGER' && userId) {
    where.createdBy = userId;  // ← Filter ini membuat cabang tanpa createdBy tidak muncul
  }
  // ...
}
```

### Seed Data (`apps/api/prisma/seeds/branches.seed.ts`)
Sebelumnya tidak ada field `createdBy`:
```typescript
create: {
  branchCode: 'PST',
  name: 'RAHO Premiere Jakarta',
  // createdBy: undefined ← Field ini tidak ada
}
```

## Solutions

### Solution 1: Run Script to Assign Existing Branches (Quick Fix)

Untuk database yang sudah ada, jalankan script untuk assign cabang ke Admin Manager:

```bash
cd apps/api
npx ts-node scripts/assignBranchesToManager.ts
```

**Output:**
```
🔧 Assigning existing branches to Admin Manager...
✅ Found Admin Manager: manager@raho.id (cmo2phlws0007osq3ngjdut49)
✅ Updated 3 branches

📋 Branches now owned by Admin Manager:
   - PST: RAHO Premiere Jakarta (PREMIERE)
   - BDG: RAHO Partnership Bandung (PARTNERSHIP)
   - SBY: RAHO Premiere Surabaya (PREMIERE)
```

### Solution 2: Reset Database with Updated Seed (Clean Start)

Untuk database baru atau development:

```bash
cd apps/api
npx prisma migrate reset
```

Ini akan:
1. Drop database
2. Run migrations
3. Run seed dengan `createdBy` yang sudah diupdate

### Solution 3: Create Branches via UI (Production)

Untuk production, buat cabang baru melalui UI:
1. Login sebagai Admin Manager
2. Klik "➕ Tambah Cabang"
3. Isi form dan submit
4. Cabang akan otomatis ter-assign ke Admin Manager yang membuat

## Changes Made

### 1. Updated Seed File (`apps/api/prisma/seeds/branches.seed.ts`)

**Before:**
```typescript
const branchPusat = await prisma.branch.upsert({
  where: { branchCode: 'PST' },
  update: {},
  create: {
    branchCode: 'PST',
    name: 'RAHO Premiere Jakarta',
    // No createdBy field
  },
});
```

**After:**
```typescript
// Get Admin Manager user to set as creator
const adminManager = await prisma.user.findUnique({
  where: { email: 'manager@raho.id' },
});

const createdBy = adminManager?.id || undefined;

const branchPusat = await prisma.branch.upsert({
  where: { branchCode: 'PST' },
  update: {},
  create: {
    branchCode: 'PST',
    name: 'RAHO Premiere Jakarta',
    createdBy,  // ← Now includes createdBy
  },
});
```

### 2. Created Script (`apps/api/scripts/assignBranchesToManager.ts`)

Script untuk assign cabang yang sudah ada ke Admin Manager:
- Finds Admin Manager by email
- Updates all branches with `createdBy = null`
- Sets `createdBy` to Admin Manager's ID
- Shows summary of updated branches

## Testing

### 1. Verify Script Works
```bash
cd apps/api
npx ts-node scripts/assignBranchesToManager.ts
```

### 2. Check Database
```bash
cd apps/api
npx prisma studio
```
- Open `branches` table
- Verify `createdBy` field is populated

### 3. Test in Application
1. Login as Admin Manager (manager@raho.id / Manager@123)
2. Navigate to "Manajemen Cabang"
3. Should see 3 branches:
   - RAHO Premiere Jakarta
   - RAHO Partnership Bandung
   - RAHO Premiere Surabaya

## Why This Happens

### Design Decision
The system is designed so that:
- **ADMIN_MANAGER**: Can only see and manage branches they created
- **SUPER_ADMIN**: Can see and manage all branches

This provides:
- ✅ Data isolation between managers
- ✅ Clear ownership of branches
- ✅ Better security and access control

### Seed Data Issue
Seed data didn't include `createdBy` because:
- Field was added later (migration `20260418000000_add_created_by_to_branches`)
- Seed wasn't updated at the same time
- Existing branches have `createdBy = null`

## Prevention

### For Future Seeds
Always include `createdBy` when creating branches in seed:
```typescript
const adminManager = await prisma.user.findUnique({
  where: { email: 'manager@raho.id' },
});

await prisma.branch.create({
  data: {
    // ... other fields
    createdBy: adminManager?.id,
  },
});
```

### For Production
- Don't use seed data
- Create branches via UI
- `createdBy` will be automatically set by backend

## Files Modified

1. ✅ `apps/api/prisma/seeds/branches.seed.ts`
   - Added logic to fetch Admin Manager
   - Added `createdBy` field to all branches

2. ✅ `apps/api/scripts/assignBranchesToManager.ts` (NEW)
   - Script to fix existing data
   - Assigns branches to Admin Manager

## Quick Reference

### Commands

```bash
# Fix existing database
cd apps/api
npx ts-node scripts/assignBranchesToManager.ts

# Reset database with updated seed
cd apps/api
npx prisma migrate reset

# Check database
cd apps/api
npx prisma studio
```

### Login Credentials

```
Admin Manager:
Email: manager@raho.id
Password: Manager@123
```

## Summary

**Problem**: Empty branches list for Admin Manager
**Cause**: Missing `createdBy` field in seed data
**Solution**: Run script to assign existing branches OR reset database
**Prevention**: Always include `createdBy` in seed data

After running the fix, Admin Manager will see all 3 branches in the "Manajemen Cabang" page.
