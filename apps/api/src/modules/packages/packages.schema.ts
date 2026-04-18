import { z } from 'zod';
import { PackageType } from '@prisma/client';

// Extended booster types (NO, GT, MB, KCL, H2S, H2SK, O3)
const ExtendedBoosterTypeEnum = z.enum(['NO', 'GT', 'MB', 'KCL', 'H2S', 'H2SK', 'O3']);

// Service types for pricing
const ServiceTypeEnum = z.enum(['HC', 'PS', 'PTY', 'PDA', 'PHC']);

export const assignPackageSchema = z.object({
  // Array of packages to assign
  packages: z.array(z.object({
    pricingId: z.string(),
    quantity: z.number().int().min(1),
    boosterType: ExtendedBoosterTypeEnum.optional(), // For booster packages
    serviceType: ServiceTypeEnum.optional(), // For booster packages
  })).min(1, 'Minimal 1 paket harus dipilih'),
  
  // Discount
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  discountNote: z.string().optional(),
  notes: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  notes: z.string().optional(),
});

export const createPackagePricingSchema = z.object({
  packageType: z.nativeEnum(PackageType),
  name: z.string().min(3, 'Nama paket minimal 3 karakter'),
  totalSessions: z.number().int().min(1, 'Jumlah sesi minimal 1'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updatePackagePricingSchema = z.object({
  name: z.string().min(3).optional(),
  price: z.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type AssignPackageInput = z.infer<typeof assignPackageSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type CreatePackagePricingInput = z.infer<typeof createPackagePricingSchema>;
export type UpdatePackagePricingInput = z.infer<typeof updatePackagePricingSchema>;
