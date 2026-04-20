# Task 24: Branch Selection for ADMIN_MANAGER in Create User Modal

## Status: ✅ COMPLETED

## Overview
Added branch selection functionality for ADMIN_MANAGER when creating users, allowing them to:
1. Create ADMIN_CABANG users (in addition to DOCTOR, NURSE, ADMIN_LAYANAN)
2. Select which branch to assign the new user to

## Changes Made

### Frontend Changes

#### 1. CreateStaffModal Component (`apps/web/src/components/staff/CreateStaffModal.tsx`)
- Added `userRole` prop to determine if user is ADMIN_MANAGER
- Added `branches` state and `loadBranches()` function to fetch available branches
- Added `selectedBranchId` to formData
- Added branch validation (required for ADMIN_MANAGER)
- Updated `getAvailableRoles()` to include ADMIN_CABANG for ADMIN_MANAGER
- Added branch selection dropdown UI (Step 2 for ADMIN_MANAGER)
- Updated step numbering dynamically based on role
- Branch dropdown shows: `{branchCode} - {name}` format
- Loading state for branches with "Memuat data cabang..." message

#### 2. Users Page (`apps/web/src/app/(staff)/admin/users/page.tsx`)
- Updated CreateStaffModal props to pass `userRole={user?.role || ''}`
- Changed `branchId` prop from `''` to `null` for ADMIN_MANAGER compatibility

### Backend (Already Implemented)

The backend was already properly configured:

#### 1. User Service (`apps/api/src/modules/users/users.service.ts`)
- `createUserService` accepts `callerRole` and `callerBranchId`
- Logic already handles:
  - ADMIN_CABANG: Forces new user to same branch as caller
  - ADMIN_MANAGER/SUPER_ADMIN: Uses `branchId` from input

#### 2. User Schema (`apps/api/src/modules/users/users.schema.ts`)
- `createUserSchema` already accepts `branchId` as nullable field

#### 3. User Controller (`apps/api/src/modules/users/users.controller.ts`)
- Already passes `req.user.role` and `req.user.branchId` to service

## User Flow

### For ADMIN_CABANG:
1. Opens Create User Modal
2. Sees 3 steps: Role Selection → Personal Info → Account Info
3. Can create: DOCTOR, NURSE, ADMIN_LAYANAN
4. New user automatically assigned to ADMIN_CABANG's branch

### For ADMIN_MANAGER:
1. Opens Create User Modal
2. Sees 4 steps: Role Selection → **Branch Selection** → Personal Info → Account Info
3. Can create: **ADMIN_CABANG**, DOCTOR, NURSE, ADMIN_LAYANAN
4. Must select which branch to assign the new user to
5. Branch dropdown shows only branches created by this ADMIN_MANAGER

### For SUPER_ADMIN:
1. Opens Create User Modal
2. Sees 4 steps: Role Selection → **Branch Selection** → Personal Info → Account Info
3. Can create: **ADMIN_CABANG**, DOCTOR, NURSE, ADMIN_LAYANAN
4. Must select which branch to assign the new user to
5. Branch dropdown shows ALL branches in the system

## Validation

- Branch selection is **required** for ADMIN_MANAGER
- Error message: "Cabang harus dipilih"
- Form cannot be submitted without selecting a branch
- Branch dropdown disabled while loading

## API Integration

### Fetch Branches
```typescript
GET /api/v1/branches/all
Authorization: Bearer {token}
```

Response filters branches based on user role:
- ADMIN_MANAGER: Only branches they created (`createdBy` filter)
- SUPER_ADMIN: All branches

### Create User
```typescript
POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "role": "ADMIN_CABANG",
  "fullName": "John Doe",
  "phone": "08123456789",
  "branchId": "cm..." // Selected branch ID
}
```

## UI/UX Details

### Branch Selection Section
- Title: "2. Pilih Cabang"
- Label: "Cabang *" (with red asterisk)
- Placeholder: "-- Pilih Cabang --"
- Format: `{branchCode} - {name}` (e.g., "JKT01 - Jakarta Pusat")
- Loading state: "Memuat data cabang..."
- Error state: Red border + error message below

### Role Cards
- ADMIN_CABANG: 👨‍💼 icon
- Description: "Mengelola cabang, staff, dan operasional cabang"

## Testing Checklist

- [x] No TypeScript errors
- [x] No linting errors
- [x] Backend schema accepts branchId
- [x] Backend service handles role-based logic
- [x] Frontend passes userRole prop
- [x] Branch dropdown loads correctly
- [x] Validation works for required branch
- [x] Form submission includes branchId

## Next Steps

User should test:
1. Login as ADMIN_MANAGER
2. Navigate to "Kelola User"
3. Click "➕ Tambah User"
4. Verify ADMIN_CABANG appears in role options
5. Verify branch selection dropdown appears
6. Select a branch and create a user
7. Verify new user is assigned to selected branch
