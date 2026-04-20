# Test Create Branch Request

## Cara Test dengan Postman/Thunder Client:

### Request:
```
POST http://localhost:5000/api/v1/branches
```

### Headers:
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

### Body (JSON):
```json
{
  "branchCode": "TEST01",
  "name": "Test Branch",
  "address": "Jl. Test No. 123",
  "city": "Jakarta",
  "phone": "021-12345678",
  "type": "KLINIK",
  "operatingHours": "08:00-17:00"
}
```

## Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "id": "...",
    "branchCode": "TEST01",
    "name": "Test Branch",
    ...
  }
}
```

## Possible Errors:

### 1. Error 400 - Validation Error
Kemungkinan:
- Field yang required tidak diisi
- Format data tidak sesuai (misal phone terlalu pendek)
- Type masih menggunakan "BRANCH" bukan "KLINIK"

### 2. Error 409 - Duplicate Branch Code
```json
{
  "success": false,
  "error": {
    "code": "BRANCH_CODE_DUPLICATE",
    "message": "Kode cabang sudah digunakan"
  }
}
```

## Troubleshooting:

### Jika masih error 400:
1. **Restart API Server** - Perubahan schema perlu restart
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Clear browser cache** - Refresh halaman dengan Ctrl+Shift+R

3. **Check console** - Buka browser DevTools > Console untuk lihat error detail

4. **Check network tab** - Buka DevTools > Network > klik request yang error > lihat Response

### Jika error "type is invalid":
Berarti API server belum restart. Schema validation masih pakai yang lama.

### Jika error "address too short":
Alamat minimal 5 karakter.

### Jika error "phone too short":
Telepon minimal 8 karakter.
