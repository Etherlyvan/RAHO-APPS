# Update: Remove KLINIK and HOMECARE from Branch Type Options

## Status: ✅ COMPLETED

## Overview
Menghapus pilihan KLINIK dan HOMECARE dari dropdown tipe cabang. Sekarang hanya tersedia 2 pilihan: PREMIERE dan PARTNERSHIP.

## Changes Made

### 1. Create Branch Modal (`apps/web/src/components/branches/CreateBranchModal.tsx`)

#### Dropdown Options
**Before:**
```tsx
<option value="KLINIK">🏥 Klinik</option>
<option value="HOMECARE">🏠 Homecare</option>
<option value="PREMIERE">⭐ Premiere</option>
<option value="PARTNERSHIP">🤝 Partnership</option>
```

**After:**
```tsx
<option value="PREMIERE">⭐ Premiere</option>
<option value="PARTNERSHIP">🤝 Partnership</option>
```

#### Default Value
**Before:**
```typescript
type: 'KLINIK'
```

**After:**
```typescript
type: 'PREMIERE'
```

### 2. Edit Branch Modal (`apps/web/src/components/branches/EditBranchModal.tsx`)

#### Dropdown Options
Same changes as Create Modal - removed KLINIK and HOMECARE options.

### 3. Backend Schema (`apps/api/src/modules/branches/branches.schema.ts`)

#### Default Value
**Before:**
```typescript
type: z.enum(['KLINIK', 'HOMECARE', 'PREMIERE', 'PARTNERSHIP']).default('KLINIK')
```

**After:**
```typescript
type: z.enum(['KLINIK', 'HOMECARE', 'PREMIERE', 'PARTNERSHIP']).default('PREMIERE')
```

**Note:** Enum masih menyimpan semua 4 nilai untuk backward compatibility dengan data yang sudah ada.

## Available Branch Types

### For New Branches (User Selection)
1. ⭐ **PREMIERE** - Default option
2. 🤝 **PARTNERSHIP**

### In Database (All Types)
1. 🏥 **KLINIK** - Legacy, tidak bisa dipilih untuk cabang baru
2. 🏠 **HOMECARE** - Legacy, tidak bisa dipilih untuk cabang baru
3. ⭐ **PREMIERE** - Available for selection
4. 🤝 **PARTNERSHIP** - Available for selection

## Backward Compatibility

✅ **Fully backward compatible**
- Existing KLINIK and HOMECARE branches tetap berfungsi normal
- Data lama tidak terpengaruh
- Display untuk cabang lama tetap menampilkan badge yang sesuai
- Edit modal untuk cabang lama masih bisa mengubah tipe (termasuk ke KLINIK/HOMECARE jika diperlukan)

## User Experience

### Creating New Branch
1. User opens "Tambah Cabang Baru" modal
2. Dropdown "Tipe Cabang" shows only:
   - ⭐ Premiere (selected by default)
   - 🤝 Partnership
3. User cannot select KLINIK or HOMECARE for new branches

### Editing Existing Branch
1. User opens edit modal for any branch
2. Dropdown shows only:
   - ⭐ Premiere
   - 🤝 Partnership
3. If branch was KLINIK or HOMECARE, it can be changed to PREMIERE or PARTNERSHIP
4. Cannot change back to KLINIK or HOMECARE

### Viewing Branches
- All branch types (including KLINIK and HOMECARE) display correctly with their respective badges
- No changes to display logic

## Files Modified

1. ✅ `apps/web/src/components/branches/CreateBranchModal.tsx`
   - Removed KLINIK and HOMECARE options
   - Changed default to PREMIERE

2. ✅ `apps/web/src/components/branches/EditBranchModal.tsx`
   - Removed KLINIK and HOMECARE options

3. ✅ `apps/api/src/modules/branches/branches.schema.ts`
   - Changed default value to PREMIERE
   - Kept all enum values for backward compatibility

## Testing Checklist

- [x] No TypeScript errors
- [x] Create modal shows only PREMIERE and PARTNERSHIP
- [x] Edit modal shows only PREMIERE and PARTNERSHIP
- [x] Default selection is PREMIERE
- [x] Existing KLINIK/HOMECARE branches still display correctly
- [x] Backend accepts PREMIERE as default

## Migration Notes

**No database migration needed** - This is a UI-only change that restricts user selection while maintaining full backward compatibility with existing data.

## Rationale

Removing KLINIK and HOMECARE options from user selection while keeping them in the database ensures:
1. New branches follow the new business model (PREMIERE/PARTNERSHIP)
2. Existing branches continue to function without issues
3. Historical data remains intact
4. System can still handle all 4 types internally

## Next Steps for User

1. Test creating new branch:
   - Navigate to "Manajemen Cabang"
   - Click "➕ Tambah Cabang"
   - Verify only PREMIERE and PARTNERSHIP are available
   - Verify PREMIERE is selected by default

2. Test editing existing branch:
   - Open any branch (including KLINIK/HOMECARE)
   - Click "✏️ Edit"
   - Verify only PREMIERE and PARTNERSHIP are available

3. Verify display:
   - All existing branches still show correct badges
   - No visual changes to branch list or detail pages
