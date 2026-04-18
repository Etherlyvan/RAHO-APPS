import { PrismaClient, BranchType } from '@prisma/client';

export async function seedBranches(prisma: PrismaClient) {
  console.log('🏢 Seeding branches...');

  const branchPusat = await prisma.branch.upsert({
    where: { branchCode: 'PST' },
    update: {},
    create: {
      branchCode: 'PST',
      name: 'Cabang Pusat Jakarta',
      address: 'Jl. Raya Utama No. 1, Jakarta Selatan',
      city: 'Jakarta',
      phone: '021-12345678',
      type: BranchType.KLINIK,
      operatingHours: '08:00 - 20:00',
    },
  });

  const branchBandung = await prisma.branch.upsert({
    where: { branchCode: 'BDG' },
    update: {},
    create: {
      branchCode: 'BDG',
      name: 'Cabang Bandung',
      address: 'Jl. Asia Afrika No. 10, Bandung',
      city: 'Bandung',
      phone: '022-87654321',
      type: BranchType.KLINIK,
      operatingHours: '08:00 - 18:00',
    },
  });

  const branchSurabaya = await prisma.branch.upsert({
    where: { branchCode: 'SBY' },
    update: {},
    create: {
      branchCode: 'SBY',
      name: 'Cabang Surabaya',
      address: 'Jl. Tunjungan No. 25, Surabaya',
      city: 'Surabaya',
      phone: '031-55667788',
      type: BranchType.KLINIK,
      operatingHours: '08:00 - 19:00',
    },
  });

  console.log(`✅ Branches: ${branchPusat.name}, ${branchBandung.name}, ${branchSurabaya.name}`);

  return { branchPusat, branchBandung, branchSurabaya };
}
