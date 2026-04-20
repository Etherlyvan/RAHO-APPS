# Update: Modal Tambah Staff Baru ✅

## Perubahan

Modal tambah staff baru telah diperbarui dengan design yang sama seperti Invoice Modal untuk konsistensi UI/UX.

## File Baru

### 1. CreateStaffModal Component
**File:** `apps/web/src/components/staff/CreateStaffModal.tsx`

**Features:**
- ✅ Standalone modal component dengan React Portal
- ✅ 3-step form layout yang terstruktur
- ✅ Role selection dengan card-based UI
- ✅ Form validation real-time
- ✅ Password visibility toggle
- ✅ Confirm password validation
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations

**Form Sections:**
1. **Pilih Role Staff**
   - Card-based selection
   - Visual icons (👨‍⚕️ Doctor, 👩‍⚕️ Nurse, 👔 Admin)
   - Role descriptions
   - Active state indicator

2. **Informasi Personal**
   - Nama Lengkap (required)
   - Nomor Telepon (optional)

3. **Informasi Akun**
   - Email (required, validated)
   - Password (required, min 8 chars, uppercase, lowercase, number)
   - Konfirmasi Password (required, must match)
   - Password visibility toggles

### 2. CreateStaffModal CSS Module
**File:** `apps/web/src/components/staff/CreateStaffModal.module.css`

**Design Features:**
- ✅ Matches Invoice Modal style
- ✅ Smooth backdrop blur
- ✅ Slide-up animation
- ✅ Sticky header
- ✅ Scrollable body with custom scrollbar
- ✅ Role cards with hover effects
- ✅ Form grid layout (2 columns on desktop, 1 on mobile)
- ✅ Input focus states
- ✅ Error states with red borders
- ✅ Responsive design
- ✅ Disabled states

## File yang Diupdate

### apps/web/src/app/(staff)/staff-management/page.tsx

**Changes:**
- ✅ Removed inline form states
- ✅ Removed inline form submission handler
- ✅ Replaced inline modal with CreateStaffModal component
- ✅ Simplified component logic

**Before:**
```tsx
// Inline form states
const [formData, setFormData] = useState({...});
const [formLoading, setFormLoading] = useState(false);

// Inline form handler
const handleCreateStaff = async (e: React.FormEvent) => {
  // 50+ lines of form handling code
};

// Inline modal JSX
{showCreateModal && (
  <div className={styles.modal}>
    {/* 100+ lines of form JSX */}
  </div>
)}
```

**After:**
```tsx
// Clean component usage
<CreateStaffModal
  show={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onSuccess={fetchStaff}
  accessToken={accessToken || ''}
  branchId={user?.branchId || ''}
/>
```

## UI/UX Improvements

### 1. Visual Consistency
- ✅ Same backdrop blur as Invoice Modal
- ✅ Same animation timing
- ✅ Same border radius and shadows
- ✅ Same button styles
- ✅ Same color scheme

### 2. Better User Experience
- ✅ Clear 3-step process
- ✅ Visual role selection (easier than dropdown)
- ✅ Password strength hints
- ✅ Real-time validation feedback
- ✅ Confirm password to prevent typos
- ✅ Show/hide password toggles
- ✅ Responsive on all devices

### 3. Form Validation

**Email:**
- Required field
- Valid email format

**Password:**
- Required field
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

**Confirm Password:**
- Required field
- Must match password

**Full Name:**
- Required field
- Minimum 2 characters

**Phone:**
- Optional field
- If filled, must be valid format

### 4. Error Handling

**Visual Feedback:**
- Red border on invalid inputs
- Error message below field
- Toast notification on submission error

**Validation Timing:**
- On form submission
- Prevents submission if invalid
- Shows all errors at once

## Component Props

```typescript
interface Props {
  show: boolean;           // Control modal visibility
  onClose: () => void;     // Called when modal closes
  onSuccess: () => void;   // Called after successful creation
  accessToken: string;     // JWT token for API call
  branchId: string;        // Branch ID to assign staff
}
```

## API Integration

**Endpoint:** `POST /api/v1/users`

**Request Body:**
```json
{
  "email": "staff@example.com",
  "password": "SecurePass123",
  "role": "NURSE",
  "fullName": "Jane Doe",
  "phone": "08123456789",
  "branchId": "clx..."
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "staff@example.com",
    "role": "NURSE",
    "staffCode": "NRS-001",
    "profile": {
      "fullName": "Jane Doe"
    }
  }
}
```

## Usage Example

```tsx
import CreateStaffModal from '@/components/staff/CreateStaffModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const { accessToken, user } = useAuthStore();

  const handleSuccess = () => {
    // Refresh staff list
    fetchStaff();
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Add Staff
      </button>

      <CreateStaffModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        accessToken={accessToken || ''}
        branchId={user?.branchId || ''}
      />
    </>
  );
}
```

## Benefits

### 1. Code Organization
- ✅ Separated concerns (modal logic vs page logic)
- ✅ Reusable component
- ✅ Easier to maintain
- ✅ Cleaner page component

### 2. Consistency
- ✅ Matches existing modal patterns
- ✅ Consistent user experience
- ✅ Familiar interaction patterns

### 3. Maintainability
- ✅ Single source of truth for modal
- ✅ Easier to update styling
- ✅ Easier to add features
- ✅ Better testability

## Testing Checklist

- [ ] Modal opens when "Tambah Staff" clicked
- [ ] Modal closes when backdrop clicked
- [ ] Modal closes when X button clicked
- [ ] Modal closes when Batal button clicked
- [ ] Role selection works (all 3 roles)
- [ ] Form validation works for all fields
- [ ] Password visibility toggle works
- [ ] Confirm password validation works
- [ ] Email format validation works
- [ ] Phone format validation works (if filled)
- [ ] Submit button disabled during loading
- [ ] Success toast shows after creation
- [ ] Staff list refreshes after creation
- [ ] Modal resets when reopened
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Error messages display correctly

## Future Enhancements

1. **Avatar Upload**
   - Add avatar upload field
   - Preview before upload
   - Crop functionality

2. **Additional Fields**
   - Specialization (for doctors)
   - License number
   - Work schedule

3. **Bulk Import**
   - CSV import
   - Excel import
   - Template download

4. **Email Verification**
   - Send verification email
   - Verify before activation

## Conclusion

Modal tambah staff baru sekarang memiliki:
- ✅ Design yang konsisten dengan Invoice Modal
- ✅ UX yang lebih baik dengan 3-step layout
- ✅ Validasi yang lebih robust
- ✅ Code yang lebih maintainable
- ✅ Reusable component architecture

Perubahan ini meningkatkan kualitas UI/UX dan memudahkan maintenance di masa depan.
