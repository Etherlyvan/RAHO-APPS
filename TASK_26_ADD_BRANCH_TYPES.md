# Task 26: Add PREMIERE and PARTNERSHIP Branch Types

## Status: ✅ COMPLETED

## Overview
Menambahkan 2 tipe cabang baru: PREMIERE dan PARTNERSHIP ke dalam sistem, melengkapi tipe yang sudah ada (KLINIK dan HOMECARE).

## Changes Made

### 1. Database Schema Update

#### Prisma Schema (`apps/api/prisma/schema.prisma`)
```prisma
enum BranchType {
  KLINIK
  HOMECARE
  PREMIERE      // ⭐ NEW
  PARTNERSHIP   // 🤝 NEW
}
```

#### Migration
- File: `apps/api/prisma/migrations/20260420013423_add_premiere_partnership_branch_types/migration.sql`
- SQL:
```sql
ALTER TYPE "BranchType" ADD VALUE 'PREMIERE';
ALTER TYPE "BranchType" ADD VALUE 'PARTNERSHIP';
```

### 2. Backend Updates

#### Schema Validation (`apps/api/src/modules/branches/branches.schema.ts`)
Updated all enum validations:

```typescript
// Create Branch
type: z.enum(['KLINIK', 'HOMECARE', 'PREMIERE', 'PARTNERSHIP']).default('KLINIK')

// Update Branch
type: z.enum(['KLINIK', 'HOMECARE', 'PREMIERE', 'PARTNERSHIP']).optional()

// List Query
type: z.enum(['KLINIK', 'HOMECARE', 'PREMIERE', 'PARTNERSHIP']).optional()
```

### 3. Frontend Updates

#### Type Definitions (`apps/web/src/lib/branchesApi.ts`)
```typescript
type: 'KLINIK' | 'HOMECARE' | 'PREMIERE' | 'PARTNERSHIP';
```

#### Create Branch Modal (`apps/web/src/components/branches/CreateBranchModal.tsx`)
Added new options in dropdown:
```tsx
<option value="KLINIK">🏥 Klinik</option>
<option value="HOMECARE">🏠 Homecare</option>
<option value="PREMIERE">⭐ Premiere</option>
<option value="PARTNERSHIP">🤝 Partnership</option>
```

#### Edit Branch Modal (`apps/web/src/components/branches/EditBranchModal.tsx`)
Same dropdown options as Create Modal.

#### Branch List Page (`apps/web/src/app/(staff)/admin/branches/page.tsx`)
Updated display logic:
```tsx
{branch.type === 'KLINIK' ? '🏥 Klinik' : 
 branch.type === 'HOMECARE' ? '🏠 Homecare' :
 branch.type === 'PREMIERE' ? '⭐ Premiere' : '🤝 Partnership'}
```

#### Branch Detail Page (`apps/web/src/app/(staff)/admin/branches/[branchId]/page.tsx`)
Same display logic as list page.

### 4. CSS Styling

#### Branch List CSS (`apps/web/src/app/(staff)/admin/branches/page.module.css`)
```css
.typeBadge.premiere {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.typeBadge.partnership {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.3);
}
```

#### Branch Detail CSS (`apps/web/src/app/(staff)/admin/branches/[branchId]/page.module.css`)
Same styling as list page.

## Branch Type Details

### 1. 🏥 KLINIK (Existing)
- **Color**: Purple (#c084fc)
- **Icon**: 🏥
- **Description**: Klinik reguler

### 2. 🏠 HOMECARE (Existing)
- **Color**: Pink (#f472b6)
- **Icon**: 🏠
- **Description**: Layanan homecare

### 3. ⭐ PREMIERE (New)
- **Color**: Yellow/Gold (#fbbf24)
- **Icon**: ⭐
- **Description**: Cabang premium dengan layanan eksklusif

### 4. 🤝 PARTNERSHIP (New)
- **Color**: Cyan (#22d3ee)
- **Icon**: 🤝
- **Description**: Cabang kemitraan/kolaborasi

## Visual Design

### Badge Colors
All badges use consistent design pattern:
- Background: `rgba(R, G, B, 0.15)` - 15% opacity
- Text: Full color
- Border: `rgba(R, G, B, 0.3)` - 30% opacity

### Color Palette
```css
Purple (Klinik):      #c084fc
Pink (Homecare):      #f472b6
Yellow (Premiere):    #fbbf24
Cyan (Partnership):   #22d3ee
```

## Files Modified

### Backend
1. ✅ `apps/api/prisma/schema.prisma` - Added enum values
2. ✅ `apps/api/prisma/migrations/20260420013423_add_premiere_partnership_branch_types/migration.sql` - Migration file
3. ✅ `apps/api/src/modules/branches/branches.schema.ts` - Updated validation

### Frontend
1. ✅ `apps/web/src/lib/branchesApi.ts` - Updated types
2. ✅ `apps/web/src/components/branches/CreateBranchModal.tsx` - Added options
3. ✅ `apps/web/src/components/branches/EditBranchModal.tsx` - Added options
4. ✅ `apps/web/src/app/(staff)/admin/branches/page.tsx` - Updated display
5. ✅ `apps/web/src/app/(staff)/admin/branches/[branchId]/page.tsx` - Updated display
6. ✅ `apps/web/src/app/(staff)/admin/branches/page.module.css` - Added styles
7. ✅ `apps/web/src/app/(staff)/admin/branches/[branchId]/page.module.css` - Added styles

## Testing Checklist

- [x] No TypeScript errors
- [x] No CSS errors
- [x] Migration applied successfully
- [x] Backend validation accepts new types
- [x] Create modal shows all 4 options
- [x] Edit modal shows all 4 options
- [x] Branch list displays correct icons and colors
- [x] Branch detail displays correct icons and colors
- [x] Badge styling consistent across pages

## Usage Examples

### Creating PREMIERE Branch
```typescript
POST /api/v1/branches
{
  "branchCode": "PRE01",
  "name": "Jakarta Premiere",
  "address": "Jl. Sudirman No. 1",
  "city": "Jakarta",
  "phone": "021-12345678",
  "type": "PREMIERE",
  "operatingHours": "24/7"
}
```

### Creating PARTNERSHIP Branch
```typescript
POST /api/v1/branches
{
  "branchCode": "PTN01",
  "name": "Partnership Surabaya",
  "address": "Jl. Basuki Rahmat No. 10",
  "city": "Surabaya",
  "phone": "031-87654321",
  "type": "PARTNERSHIP",
  "operatingHours": "Senin-Jumat 08:00-17:00"
}
```

## Migration Notes

- Migration uses `ALTER TYPE` to add new enum values
- Existing data remains unchanged
- New values can be used immediately after migration
- No data migration needed (no existing records to update)

## Backward Compatibility

✅ **Fully backward compatible**
- Existing KLINIK and HOMECARE branches unaffected
- All existing functionality preserved
- New types are additive only

## Next Steps for User

1. Run migration if not already applied:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

2. Restart backend server to load new schema

3. Test creating new branches:
   - Navigate to "Manajemen Cabang"
   - Click "➕ Tambah Cabang"
   - Select "⭐ Premiere" or "🤝 Partnership"
   - Fill form and submit

4. Verify display:
   - Check branch list shows correct badge
   - Click branch card to view detail
   - Verify badge color and icon

## Benefits

✅ **Flexibility**: Support for different business models
✅ **Scalability**: Easy to add more types in future
✅ **Visual Clarity**: Distinct colors and icons for each type
✅ **Consistency**: Same design pattern across all types
✅ **User Experience**: Clear categorization of branches
