# Fitur Staff Management untuk Admin Cabang ✅

## Overview

Fitur ini memungkinkan **Admin Cabang** untuk:
1. ✅ Membuat staff baru (DOCTOR, NURSE, ADMIN_LAYANAN) di cabangnya
2. ✅ Memantau daftar staff di cabangnya
3. ✅ Melihat aktivitas/audit log staff
4. ✅ Mengaktifkan/menonaktifkan staff
5. ✅ Melihat detail staff

## Struktur Implementasi

### 1. Backend API

#### A. Audit Logs Module
**File Baru:**
- `apps/api/src/modules/audit/audit.controller.ts` - Controller untuk audit logs
- `apps/api/src/modules/audit/audit.routes.ts` - Routes untuk audit logs

**Endpoints:**
```
GET /api/v1/audit-logs
- Query params: page, limit, action, resource, startDate, endDate
- Authorization: ADMIN_CABANG, ADMIN_MANAGER, SUPER_ADMIN
- Response: Paginated audit logs filtered by branch (for ADMIN_CABANG)

GET /api/v1/audit-logs/stats
- Authorization: ADMIN_CABANG, ADMIN_MANAGER, SUPER_ADMIN
- Response: Statistics (total actions, actions by type, top users)
```

**Features:**
- ✅ Branch-level filtering (Admin Cabang hanya melihat log staff di cabangnya)
- ✅ Filter by action type (CREATE, UPDATE, DELETE, VERIFY)
- ✅ Filter by resource type
- ✅ Date range filtering
- ✅ Pagination support
- ✅ Statistics dashboard

#### B. Users Module (Existing - Enhanced)
**Existing Endpoints Used:**
```
GET /api/v1/users
- Query params: page, limit, role, branchId, search, isActive
- Authorization: ADMIN_CABANG, ADMIN_MANAGER, SUPER_ADMIN
- Response: Paginated users filtered by branch (for ADMIN_CABANG)

POST /api/v1/users
- Body: { email, password, role, fullName, phone, branchId }
- Authorization: ADMIN_CABANG, ADMIN_MANAGER, SUPER_ADMIN
- Response: Created user with auto-generated staffCode

PATCH /api/v1/users/:userId
- Body: { fullName, phone, branchId, isActive }
- Authorization: ADMIN_CABANG, ADMIN_MANAGER, SUPER_ADMIN
- Response: Updated user

GET /api/v1/users/:userId
- Authorization: ADMIN_CABANG, ADMIN_MANAGER, SUPER_ADMIN
- Response: User details
```

**Security Features:**
- ✅ Admin Cabang automatically assigned to their branch
- ✅ Admin Cabang can only see/manage staff in their branch
- ✅ Password validation (min 8 chars, uppercase, lowercase, number)
- ✅ Email uniqueness validation
- ✅ Auto-generated staff codes
- ✅ Audit logging for all actions

### 2. Frontend UI

#### A. Staff Management Page
**File:** `apps/web/src/app/(staff)/staff-management/page.tsx`

**Features:**
- ✅ Two tabs: "Daftar Staff" and "Aktivitas Staff"
- ✅ Create staff modal with form validation
- ✅ Staff cards with role badges and status indicators
- ✅ Toggle active/inactive status
- ✅ View staff details modal
- ✅ Activity timeline with action badges
- ✅ Real-time data fetching
- ✅ Error handling and toast notifications

**UI Components:**
1. **Header**
   - Title and description
   - "Tambah Staff" button

2. **Tabs**
   - Daftar Staff (Staff List)
   - Aktivitas Staff (Staff Activity)

3. **Staff Grid** (Tab 1)
   - Card-based layout
   - Shows: Name, Staff Code, Email, Phone, Role, Status, Last Login
   - Actions: Activate/Deactivate, View Details

4. **Activity List** (Tab 2)
   - Timeline-style layout
   - Shows: Action type, User, Resource, Timestamp
   - Color-coded action badges

5. **Create Staff Modal**
   - Form fields: Role, Full Name, Email, Password, Phone
   - Validation and error messages
   - Auto-assigns to Admin Cabang's branch

6. **Staff Detail Modal**
   - Complete staff information
   - Read-only view

#### B. CSS Module
**File:** `apps/web/src/app/(staff)/staff-management/page.module.css`

**Design Features:**
- ✅ Modern glassmorphism effects
- ✅ Gradient backgrounds
- ✅ Color-coded role badges (Doctor: Purple, Nurse: Blue, Admin: Green)
- ✅ Color-coded action badges (Create: Green, Update: Blue, Delete: Red, Verify: Purple)
- ✅ Smooth animations and transitions
- ✅ Responsive grid layout
- ✅ Hover effects and tooltips
- ✅ Modal with backdrop blur
- ✅ Custom scrollbars

### 3. Navigation

#### Sidebar Integration
**File:** `apps/web/src/components/layout/Sidebar.tsx`

**Added Menu Item:**
```typescript
{
  label: 'Staff Management',
  href: '/staff-management',
  icon: <Users size={18} />,
  roles: ['ADMIN_CABANG'],
}
```

**Location:** Under "Manajemen" section, visible only to ADMIN_CABANG

## User Flow

### 1. Membuat Staff Baru

```
1. Admin Cabang login
2. Navigate to "Staff Management" from sidebar
3. Click "➕ Tambah Staff" button
4. Fill form:
   - Select Role (DOCTOR, NURSE, ADMIN_LAYANAN)
   - Enter Full Name
   - Enter Email
   - Enter Password (min 8 chars, uppercase, lowercase, number)
   - Enter Phone (optional)
5. Click "✓ Buat Staff"
6. System:
   - Validates input
   - Auto-assigns branchId from Admin Cabang
   - Generates unique staffCode
   - Hashes password
   - Creates user and profile
   - Logs audit entry
7. Success toast shown
8. Staff list refreshed
```

### 2. Memantau Staff

```
1. Admin Cabang opens Staff Management page
2. View "Daftar Staff" tab:
   - See all staff in their branch
   - Filter by role, status
   - Search by name, email, staff code
3. View staff cards showing:
   - Name and staff code
   - Role badge (color-coded)
   - Email and phone
   - Active/Inactive status
   - Last login time
4. Actions available:
   - Toggle active/inactive
   - View full details
```

### 3. Memantau Aktivitas

```
1. Admin Cabang switches to "Aktivitas Staff" tab
2. View activity timeline:
   - All actions by staff in their branch
   - Action type (CREATE, UPDATE, DELETE, VERIFY)
   - Resource affected
   - Timestamp
   - Staff who performed action
3. Activities are sorted by most recent first
4. Pagination for large datasets
```

## Security & Authorization

### Role-Based Access Control

**ADMIN_CABANG Permissions:**
- ✅ Create staff (DOCTOR, NURSE, ADMIN_LAYANAN) in their branch only
- ✅ View staff in their branch only
- ✅ Update staff in their branch only
- ✅ Activate/deactivate staff in their branch only
- ✅ View audit logs for staff in their branch only
- ❌ Cannot create ADMIN_CABANG, ADMIN_MANAGER, or SUPER_ADMIN
- ❌ Cannot access staff from other branches
- ❌ Cannot modify branch assignments

### Data Isolation

**Branch-Level Filtering:**
```typescript
// Backend automatically filters by branch
if (req.user.role === Role.ADMIN_CABANG && req.user.branchId) {
  where.branchId = req.user.branchId;
}
```

**Audit Log Filtering:**
```typescript
// Only show logs from users in the same branch
const branchUsers = await prisma.user.findMany({
  where: { branchId: req.user.branchId },
  select: { id: true },
});

where.userId = {
  in: branchUsers.map(u => u.id),
};
```

### Password Security

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Hashed with bcrypt (12 rounds)

**Validation:**
```typescript
password: z.string()
  .min(8, 'Password minimal 8 karakter.')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password harus mengandung huruf besar, huruf kecil, dan angka.'
  )
```

## Database Schema

### Existing Tables Used

**User Table:**
```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  password    String
  role        Role
  staffCode   String?   @unique
  branchId    String?
  isActive    Boolean   @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  branch  Branch?      @relation(fields: [branchId], references: [id])
  profile UserProfile?
  // ... other relations
}
```

**UserProfile Table:**
```prisma
model UserProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  fullName  String
  phone     String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**AuditLog Table:**
```prisma
model AuditLog {
  id         String      @id @default(cuid())
  userId     String
  action     AuditAction
  resource   String
  resourceId String?
  meta       Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime    @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

## API Response Examples

### 1. Get Staff List

**Request:**
```http
GET /api/v1/users?limit=100
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "email": "doctor@example.com",
      "role": "DOCTOR",
      "staffCode": "DOC-001",
      "isActive": true,
      "lastLoginAt": "2026-04-18T10:30:00Z",
      "createdAt": "2026-04-01T08:00:00Z",
      "profile": {
        "fullName": "Dr. John Doe",
        "phone": "08123456789"
      },
      "branch": {
        "name": "Cabang Jakarta",
        "branchCode": "JKT"
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

### 2. Create Staff

**Request:**
```http
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "nurse@example.com",
  "password": "SecurePass123",
  "role": "NURSE",
  "fullName": "Jane Smith",
  "phone": "08987654321"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx456...",
    "email": "nurse@example.com",
    "role": "NURSE",
    "staffCode": "NRS-002",
    "isActive": true,
    "branchId": "clx789...",
    "createdAt": "2026-04-18T12:00:00Z",
    "profile": {
      "fullName": "Jane Smith",
      "phone": "08987654321"
    },
    "branch": {
      "name": "Cabang Jakarta",
      "branchCode": "JKT"
    }
  }
}
```

### 3. Get Audit Logs

**Request:**
```http
GET /api/v1/audit-logs?limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx999...",
      "action": "CREATE",
      "resource": "User",
      "resourceId": "clx456...",
      "createdAt": "2026-04-18T12:00:00Z",
      "user": {
        "id": "clx111...",
        "email": "admin@example.com",
        "staffCode": "ADM-001",
        "role": "ADMIN_CABANG",
        "profile": {
          "fullName": "Admin Jakarta"
        }
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

## Testing Checklist

### Backend Testing

- [ ] Admin Cabang can create DOCTOR
- [ ] Admin Cabang can create NURSE
- [ ] Admin Cabang can create ADMIN_LAYANAN
- [ ] Admin Cabang cannot create ADMIN_CABANG
- [ ] Admin Cabang cannot create SUPER_ADMIN
- [ ] Staff is auto-assigned to Admin Cabang's branch
- [ ] Staff code is auto-generated and unique
- [ ] Password validation works correctly
- [ ] Email uniqueness is enforced
- [ ] Admin Cabang can only see staff in their branch
- [ ] Admin Cabang can toggle staff active/inactive
- [ ] Audit logs are created for all actions
- [ ] Audit logs are filtered by branch for Admin Cabang

### Frontend Testing

- [ ] Page loads correctly for ADMIN_CABANG
- [ ] Page is not accessible to other roles
- [ ] Staff list displays correctly
- [ ] Create staff modal opens and closes
- [ ] Form validation works (email, password, required fields)
- [ ] Staff creation succeeds with valid data
- [ ] Staff creation fails with invalid data
- [ ] Success/error toasts display correctly
- [ ] Staff list refreshes after creation
- [ ] Toggle active/inactive works
- [ ] Staff detail modal displays correct information
- [ ] Activity tab shows audit logs
- [ ] Activity logs are sorted by date (newest first)
- [ ] Role badges display correct colors
- [ ] Action badges display correct colors
- [ ] Responsive design works on mobile
- [ ] Loading states display correctly
- [ ] Empty states display correctly

## Future Enhancements

### Potential Features

1. **Advanced Filtering**
   - Filter by date range
   - Filter by multiple roles
   - Filter by activity status

2. **Staff Performance Metrics**
   - Number of sessions handled
   - Average session duration
   - Patient satisfaction scores

3. **Bulk Operations**
   - Bulk activate/deactivate
   - Bulk role assignment
   - Export staff list to CSV

4. **Staff Scheduling**
   - View staff schedules
   - Assign shifts
   - Track attendance

5. **Notifications**
   - Email notifications for new staff
   - Alert when staff is deactivated
   - Weekly activity summary

6. **Advanced Analytics**
   - Activity heatmap
   - Performance trends
   - Comparative analysis

## Troubleshooting

### Common Issues

**Issue 1: 401 Unauthorized**
- **Cause:** Token expired or invalid
- **Solution:** Re-login to get new token

**Issue 2: 403 Forbidden**
- **Cause:** User is not ADMIN_CABANG
- **Solution:** Ensure user has correct role

**Issue 3: Staff not appearing in list**
- **Cause:** Staff belongs to different branch
- **Solution:** Verify branchId matches

**Issue 4: Cannot create staff**
- **Cause:** Email already exists or password invalid
- **Solution:** Check validation errors in response

**Issue 5: Audit logs not showing**
- **Cause:** No activities yet or wrong branch
- **Solution:** Perform some actions first

## Conclusion

Fitur Staff Management untuk Admin Cabang telah berhasil diimplementasikan dengan:

✅ **Backend API** - Secure, role-based, branch-filtered
✅ **Frontend UI** - Modern, responsive, user-friendly
✅ **Security** - Password validation, data isolation, audit logging
✅ **Documentation** - Complete API docs and user guides

Admin Cabang sekarang dapat dengan mudah mengelola staff di cabangnya dan memantau aktivitas mereka secara real-time.
