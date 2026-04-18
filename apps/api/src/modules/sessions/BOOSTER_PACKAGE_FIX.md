# Fix: Jenis Booster Dilewati

## Problem

Session tidak menampilkan Step 4 (Jenis Booster) karena session dibuat **tanpa booster package**.

## Root Cause

Saat create session, `boosterPackageId` tidak di-assign, sehingga:
```typescript
step4_boosterType: session.boosterPackageId ? !!session.boosterType : true
// Jika boosterPackageId = null → step4 = true (di-skip)
```

## Solution

### Option 1: Create New Session with Booster (Recommended)

Saat membuat session baru, pastikan:
1. Member punya booster package yang aktif
2. Pilih booster package saat create session
3. Field `boosterPackageId` terisi

**Frontend Form:**
```typescript
// Saat create session
{
  memberId: "...",
  memberPackageId: "...", // BASIC package
  boosterPackageId: "...", // BOOSTER package (optional)
  therapyPlanId: "...",
  // ... other fields
}
```

### Option 2: Add Booster to Existing Session

Jika session sudah dibuat tanpa booster, ada 2 cara:

#### A. Manual Database Update (Quick Fix)

```sql
-- Check session
SELECT id, "sessionCode", "boosterPackageId" 
FROM "TreatmentSession" 
WHERE "sessionCode" = 'SES-PST-01-2604-J5T73';

-- Find available booster package for member
SELECT mp.id, mp."packageCode", mp."packageType", mp."totalSessions", mp."usedSessions"
FROM "MemberPackage" mp
JOIN "TreatmentSession" ts ON ts."encounterId" IN (
  SELECT id FROM "Encounter" WHERE "memberId" = (
    SELECT "memberId" FROM "Encounter" WHERE id = ts."encounterId"
  )
)
WHERE mp."packageType" = 'BOOSTER' 
  AND mp.status = 'ACTIVE'
  AND mp."usedSessions" < mp."totalSessions"
LIMIT 1;

-- Update session with booster package
UPDATE "TreatmentSession"
SET "boosterPackageId" = 'BOOSTER_PACKAGE_ID_HERE'
WHERE "sessionCode" = 'SES-PST-01-2604-J5T73';
```

#### B. Add API Endpoint (Proper Fix)

Tambah endpoint untuk assign booster package:

**Backend:**
```typescript
// sessions.service.ts
async assignBoosterPackage(sessionId: string, boosterPackageId: string, userId: string) {
  // Validate session
  const session = await prisma.treatmentSession.findUnique({
    where: { id: sessionId },
    include: { encounter: true },
  });

  if (!session) {
    throw { status: 404, code: 'SESSION_NOT_FOUND', message: 'Sesi tidak ditemukan' };
  }

  if (session.isCompleted) {
    throw { status: 409, code: 'SESSION_COMPLETED', message: 'Sesi sudah selesai' };
  }

  if (session.boosterPackageId) {
    throw { status: 409, code: 'BOOSTER_ALREADY_ASSIGNED', message: 'Booster sudah di-assign' };
  }

  // Validate booster package
  const boosterPackage = await prisma.memberPackage.findUnique({
    where: { id: boosterPackageId },
  });

  if (!boosterPackage) {
    throw { status: 404, code: 'BOOSTER_NOT_FOUND', message: 'Booster package tidak ditemukan' };
  }

  if (boosterPackage.packageType !== 'BOOSTER') {
    throw { status: 400, code: 'INVALID_PACKAGE_TYPE', message: 'Package bukan tipe BOOSTER' };
  }

  if (boosterPackage.status !== 'ACTIVE') {
    throw { status: 422, code: 'BOOSTER_NOT_ACTIVE', message: 'Booster package tidak aktif' };
  }

  const remaining = boosterPackage.totalSessions - boosterPackage.usedSessions;
  if (remaining <= 0) {
    throw { status: 422, code: 'BOOSTER_EXHAUSTED', message: 'Sesi booster sudah habis' };
  }

  // Assign booster package
  await prisma.$transaction(async (tx) => {
    await tx.treatmentSession.update({
      where: { id: sessionId },
      data: { boosterPackageId },
    });

    await tx.memberPackage.update({
      where: { id: boosterPackageId },
      data: { usedSessions: { increment: 1 } },
    });
  });

  await logAudit({
    userId,
    action: AuditAction.UPDATE,
    resource: 'TreatmentSession',
    resourceId: sessionId,
    meta: { action: 'ASSIGN_BOOSTER', boosterPackageId },
  });

  return {
    sessionId,
    boosterPackageId,
    message: 'Booster package berhasil di-assign',
  };
}
```

**Route:**
```typescript
// PATCH /treatment-sessions/:sessionId/assign-booster
router.patch(
  '/:sessionId/assign-booster',
  authenticate,
  authorize(ALLSTAFF),
  controller.assignBoosterPackage.bind(controller)
);
```

**Frontend:**
```typescript
// Add button to assign booster if not assigned
{!session.boosterPackageId && availableBoosterPackages.length > 0 && (
  <button onClick={() => assignBooster(selectedBoosterId)}>
    Tambah Booster Package
  </button>
)}
```

## Prevention

Untuk mencegah masalah ini di masa depan:

### 1. Improve Create Session Form

Tambahkan section untuk booster package:

```typescript
// Create Session Form
<FormSection title="Booster Package (Optional)">
  <Select
    label="Pilih Booster Package"
    options={availableBoosterPackages}
    value={formData.boosterPackageId}
    onChange={(value) => setFormData({...formData, boosterPackageId: value})}
  />
  <p className="text-sm text-gray-400">
    Kosongkan jika tidak menggunakan booster
  </p>
</FormSection>
```

### 2. Show Warning if Member Has Booster

```typescript
// Check if member has active booster packages
const hasActiveBooster = memberPackages.some(
  pkg => pkg.packageType === 'BOOSTER' && pkg.status === 'ACTIVE'
);

{hasActiveBooster && !formData.boosterPackageId && (
  <Alert type="warning">
    Member memiliki booster package aktif. Apakah ingin menggunakan booster?
  </Alert>
)}
```

### 3. Validation on Backend

```typescript
// sessions.service.ts - createSession
// Check if member has active booster but not selected
const activeBooster = await prisma.memberPackage.findFirst({
  where: {
    memberId: data.memberId,
    packageType: PackageType.BOOSTER,
    status: PackageStatus.ACTIVE,
  },
});

if (activeBooster && !data.boosterPackageId) {
  // Log warning or notify
  console.warn(`Member ${data.memberId} has active booster but not selected`);
}
```

## Testing

After fix, verify:

1. ✅ Step 4 (Jenis Booster) muncul
2. ✅ Bisa pilih HHO atau NO2
3. ✅ Booster package usage ter-update
4. ✅ Progress calculation correct

---

**Quick Fix**: Use SQL update (Option 2A)
**Proper Fix**: Add API endpoint (Option 2B)
**Prevention**: Improve create session form
