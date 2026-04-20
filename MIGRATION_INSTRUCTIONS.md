# Instruksi Menjalankan Migration

## Langkah-langkah:

### 1. Buka Terminal/Command Prompt baru
Jangan gunakan terminal dari Kiro, buka terminal Windows biasa.

### 2. Masuk ke folder API
```bash
cd C:\Users\jovan\Documents\RAHO\agpROJ\apps\api
```

### 3. Jalankan Migration
```bash
npx prisma migrate deploy
```

Atau jika ingin development mode:
```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client
Setelah migration berhasil, generate ulang Prisma client:
```bash
npx prisma generate
```

### 5. (OPSIONAL) Assign Cabang Existing ke ADMIN_MANAGER
Jika ingin ADMIN_MANAGER bisa melihat cabang yang sudah ada (bukan hanya cabang yang mereka buat), jalankan script ini:

```bash
npx ts-node scripts/assignBranchesToAdminManager.ts
```

Script ini akan:
- Mencari semua ADMIN_MANAGER di database
- Mencari semua cabang yang belum punya creator (createdBy = null)
- Assign semua cabang tersebut ke ADMIN_MANAGER pertama

**ATAU** bisa langsung buat cabang baru dari UI, cabang baru akan otomatis tercatat dengan createdBy.

### 6. Restart API Server
Setelah selesai, restart API server Anda.

## Jika Ada Error

Jika migration gagal karena file migration belum terdeteksi, coba:

```bash
# Reset migration (HATI-HATI: ini akan menghapus data)
npx prisma migrate reset

# Atau buat migration baru
npx prisma migrate dev --name add_created_by_to_branches
```

## Verifikasi

Setelah migration berhasil, cek di database:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'branches' AND column_name = 'createdBy';
```

Harusnya muncul kolom `createdBy` dengan tipe TEXT.

## Penjelasan Behavior

### ADMIN_MANAGER:
- Hanya bisa melihat cabang yang mereka buat (createdBy = userId mereka)
- Cabang dengan createdBy = null TIDAK akan terlihat
- Saat membuat cabang baru, otomatis tercatat sebagai pembuat

### SUPER_ADMIN:
- Bisa melihat SEMUA cabang (tidak ada filter)
- Bisa manage semua cabang

### Cabang Existing (sebelum migration):
- Punya createdBy = null
- Hanya terlihat oleh SUPER_ADMIN
- Bisa di-assign ke ADMIN_MANAGER dengan script di atas

