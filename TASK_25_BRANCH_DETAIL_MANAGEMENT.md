# Task 25: Branch Detail & User Management Page

## Status: ✅ COMPLETED

## Overview
Membuat halaman detail cabang yang dapat diakses dengan mengklik card di halaman manajemen cabang. Halaman ini menampilkan informasi lengkap cabang dan memungkinkan pengelolaan user di cabang tersebut.

## Features Implemented

### 1. Branch Detail Page (`/admin/branches/[branchId]`)

#### A. Header Section
- Tombol "← Kembali" untuk kembali ke daftar cabang
- Nama cabang dan kode cabang
- Badge tipe cabang (🏥 Klinik / 🏠 Homecare)
- Badge status (✓ Aktif / ✗ Nonaktif)

#### B. Statistics Cards
Menampilkan 3 KPI cards:
- 👥 **User Aktif**: Jumlah user aktif di cabang
- 🧑‍⚕️ **Total Member**: Jumlah member terdaftar
- 📦 **Paket Aktif**: Jumlah paket yang sedang aktif

#### C. Tab Navigation
**Tab 1: Informasi Cabang**
- 📍 Informasi Lokasi:
  - Alamat lengkap
  - Kota
  - Nomor telepon
  - Jam operasional
- 📅 Informasi Sistem:
  - Tanggal dibuat
  - Terakhir diupdate

**Tab 2: Kelola User**
- Daftar semua user di cabang
- Tombol "➕ Tambah User"
- User cards dengan informasi:
  - Nama lengkap & staff code
  - Role badge (Admin Cabang, Dokter, Perawat, Admin Layanan)
  - Email & telepon
  - Status aktif/nonaktif
  - Login terakhir
- Aksi per user:
  - ✓ Aktifkan / 🚫 Nonaktifkan

### 2. Clickable Branch Cards

#### Updated Branch List Page
- Card cabang sekarang clickable
- Hover effect menunjukkan card dapat diklik
- Judul cabang berubah warna saat hover
- Tombol aksi:
  - 👁️ **Detail**: Membuka halaman detail
  - ✏️ **Edit**: Membuka modal edit
  - 🚫 **Nonaktifkan**: Menonaktifkan cabang

### 3. User Management Integration

#### Create User Modal
- Modal yang sama dengan halaman "Kelola User"
- Otomatis mengisi `branchId` dengan ID cabang saat ini
- Untuk ADMIN_MANAGER: Dropdown branch disabled, sudah terisi otomatis
- Setelah berhasil membuat user:
  - Refresh daftar user
  - Refresh statistics cards

#### User Actions
- Toggle status aktif/nonaktif user
- Real-time update statistics setelah perubahan

## File Changes

### Frontend Files Created
1. **`apps/web/src/app/(staff)/admin/branches/[branchId]/page.tsx`**
   - Main page component dengan dynamic routing
   - State management untuk branch detail dan users
   - Tab navigation (Overview & Users)
   - Integration dengan CreateStaffModal

2. **`apps/web/src/app/(staff)/admin/branches/[branchId]/page.module.css`**
   - ~500+ lines custom CSS
   - Responsive design
   - Modern card layouts
   - Smooth transitions dan hover effects

### Frontend Files Modified
1. **`apps/web/src/app/(staff)/admin/branches/page.tsx`**
   - Added clickable wrapper untuk branch cards
   - Added "Detail" button
   - Added `stopPropagation` untuk Edit dan Delete buttons
   - Added router navigation ke detail page

2. **`apps/web/src/app/(staff)/admin/branches/page.module.css`**
   - Added `.branchClickable` class
   - Added `.actionBtn.view` styles
   - Updated card structure untuk support clickable area
   - Added hover effect untuk title

### Backend (Already Exists)
- ✅ `GET /api/v1/branches/:branchId` - Get single branch with stats
- ✅ `GET /api/v1/users?branchId={id}` - Get users by branch
- ✅ `POST /api/v1/users` - Create user with branchId
- ✅ `PATCH /api/v1/users/:userId` - Update user status

## API Endpoints Used

### 1. Get Branch Detail
```typescript
GET /api/v1/branches/{branchId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "cm...",
    "branchCode": "JKT01",
    "name": "Jakarta Pusat",
    "address": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "phone": "021-12345678",
    "type": "KLINIK",
    "operatingHours": "08:00 - 20:00",
    "isActive": true,
    "createdAt": "2026-04-15T...",
    "updatedAt": "2026-04-15T...",
    "stats": {
      "activeUsers": 5,
      "totalMembers": 120,
      "activePackages": 45
    }
  }
}
```

### 2. Get Branch Users
```typescript
GET /api/v1/users?branchId={branchId}&limit=100
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "cm...",
      "email": "doctor@example.com",
      "role": "DOCTOR",
      "staffCode": "DOC-001",
      "isActive": true,
      "lastLoginAt": "2026-04-20T...",
      "createdAt": "2026-04-15T...",
      "profile": {
        "fullName": "Dr. John Doe",
        "phone": "08123456789"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 100
  }
}
```

### 3. Create User for Branch
```typescript
POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123",
  "role": "NURSE",
  "fullName": "Jane Smith",
  "phone": "08123456789",
  "branchId": "cm..." // Branch ID dari halaman detail
}
```

### 4. Toggle User Status
```typescript
PATCH /api/v1/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "isActive": false
}
```

## User Flow

### Accessing Branch Detail
1. User navigates to "Manajemen Cabang"
2. Clicks on any branch card (anywhere on card except action buttons)
3. Redirected to `/admin/branches/{branchId}`
4. Page loads branch detail and user list

### Managing Users in Branch
1. On branch detail page, click "Kelola User" tab
2. View all users assigned to this branch
3. Click "➕ Tambah User" to create new user
4. Modal opens with branchId pre-filled
5. Fill form and submit
6. New user appears in list
7. Statistics updated automatically

### Toggling User Status
1. Find user card in "Kelola User" tab
2. Click "✓ Aktifkan" or "🚫 Nonaktifkan"
3. Confirmation toast appears
4. User list refreshes
5. Statistics updated

## Access Control

### Role Permissions
- **ADMIN_MANAGER**: 
  - Can access branch detail for branches they created
  - Can manage users in their branches
  - Can create users for their branches
  
- **SUPER_ADMIN**:
  - Can access all branch details
  - Can manage users in any branch
  - Can create users for any branch

- **ADMIN_CABANG**:
  - ❌ Cannot access branch management pages
  - Uses "Kelola User" page instead

## UI/UX Features

### Visual Feedback
- Loading spinner while fetching data
- Hover effects on clickable elements
- Smooth transitions between tabs
- Color-coded role badges
- Status indicators (active/inactive)

### Responsive Design
- Mobile-friendly layout
- Grid adapts to screen size
- Touch-friendly buttons
- Readable on all devices

### Empty States
- "Belum Ada User" message when no users
- Call-to-action button to add first user
- Friendly icons and messaging

## Role Badge Colors

```css
Admin Cabang: Purple gradient (#667eea → #764ba2)
Dokter: Pink gradient (#f093fb → #f5576c)
Perawat: Blue gradient (#4facfe → #00f2fe)
Admin Layanan: Green gradient (#43e97b → #38f9d7)
```

## Statistics Calculation

Backend automatically calculates:
- **activeUsers**: `COUNT(users WHERE branchId = X AND isActive = true AND role != MEMBER)`
- **totalMembers**: `COUNT(members WHERE registrationBranchId = X)`
- **activePackages**: `COUNT(memberPackages WHERE branchId = X AND status = ACTIVE)`

## Testing Checklist

- [x] No TypeScript errors
- [x] No CSS errors
- [x] Branch card clickable
- [x] Detail page loads correctly
- [x] Statistics display correctly
- [x] Tab navigation works
- [x] User list loads
- [x] Create user modal opens
- [x] User creation works
- [x] Toggle user status works
- [x] Back button works
- [x] Responsive on mobile

## Next Steps for User

1. Login as ADMIN_MANAGER
2. Navigate to "Manajemen Cabang"
3. Click on any branch card
4. Explore branch details
5. Switch to "Kelola User" tab
6. Try creating a new user
7. Try toggling user status
8. Verify statistics update

## Benefits

✅ **Centralized Management**: All branch info and users in one place
✅ **Better UX**: Intuitive navigation from list to detail
✅ **Real-time Stats**: Live statistics for monitoring
✅ **Efficient Workflow**: Quick access to user management
✅ **Role-based Access**: Proper security and data isolation
✅ **Responsive Design**: Works on all devices
