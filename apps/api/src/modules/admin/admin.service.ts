import { prisma } from '../../lib/prisma';
import { logAudit } from '../../utils/auditLog';
import { AuditAction, Role, BranchType } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class AdminService {
  // ============================================================
  // ADMIN CABANG - KPI & DASHBOARD
  // ============================================================

  async getBranchKPI(branchId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Member aktif di cabang
    const activeMembersCount = await prisma.member.count({
      where: {
        registrationBranchId: branchId,
        memberPackages: {
          some: {
            status: 'ACTIVE',
            branchId: branchId
          }
        }
      }
    });

    // Sesi hari ini
    const todaySessionsCount = await prisma.treatmentSession.count({
      where: {
        branchId: branchId,
        treatmentDate: {
          gte: startOfDay
        }
      }
    });

    // Sesi bulan ini
    const monthlySessionsCount = await prisma.treatmentSession.count({
      where: {
        branchId: branchId,
        treatmentDate: {
          gte: startOfMonth
        }
      }
    });

    // Stok kritis
    const criticalStockCount = await prisma.inventoryItem.count({
      where: {
        branchId: branchId,
        stock: {
          lt: prisma.inventoryItem.fields.minThreshold
        }
      }
    });

    // Paket pending verifikasi
    const pendingPackagesCount = await prisma.memberPackage.count({
      where: {
        branchId: branchId,
        status: 'PENDING_PAYMENT'
      }
    });

    // Revenue bulan ini (dari paket yang sudah dibayar)
    const monthlyRevenue = await prisma.memberPackage.aggregate({
      where: {
        branchId: branchId,
        status: 'ACTIVE',
        paidAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        finalPrice: true
      }
    });

    return {
      activeMembers: activeMembersCount,
      todaySessions: todaySessionsCount,
      monthlySessions: monthlySessionsCount,
      criticalStock: criticalStockCount,
      pendingPackages: pendingPackagesCount,
      monthlyRevenue: Number(monthlyRevenue._sum.finalPrice) || 0
    };
  }

  async getBranchStockStatus(branchId: string) {
    const stockItems = await prisma.inventoryItem.findMany({
      where: { branchId },
      include: {
        masterProduct: {
          select: {
            name: true,
            category: true,
            unit: true
          }
        }
      },
      orderBy: [
        { stock: 'asc' }, // Stok terendah dulu
        { masterProduct: { name: 'asc' } }
      ]
    });

    return stockItems.map(item => ({
      id: item.id,
      productName: item.masterProduct.name,
      category: item.masterProduct.category,
      currentStock: Number(item.stock),
      minThreshold: Number(item.minThreshold),
      unit: item.masterProduct.unit,
      status: Number(item.stock) === 0 ? 'OUT_OF_STOCK' : 
              Number(item.stock) < Number(item.minThreshold) ? 'LOW_STOCK' : 'OK',
      isLowStock: Number(item.stock) < Number(item.minThreshold),
      isOutOfStock: Number(item.stock) === 0
    }));
  }

  async getPendingPackages(branchId: string) {
    const pendingPackages = await prisma.memberPackage.findMany({
      where: {
        branchId: branchId,
        status: 'PENDING_PAYMENT'
      },
      include: {
        member: {
          select: {
            memberNo: true,
            userId: true
          }
        },
        assignedByUser: {
          include: {
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit untuk performa
    });

    // Get member names
    const memberUserIds = pendingPackages.map(pkg => pkg.member.userId);
    const memberProfiles = await prisma.userProfile.findMany({
      where: {
        userId: { in: memberUserIds }
      },
      select: {
        userId: true,
        fullName: true
      }
    });

    const profileMap = new Map(memberProfiles.map(p => [p.userId, p.fullName]));

    return pendingPackages.map(pkg => ({
      id: pkg.id,
      packageCode: pkg.packageCode,
      packageType: pkg.packageType,
      totalSessions: pkg.totalSessions,
      finalPrice: Number(pkg.finalPrice),
      memberNo: pkg.member.memberNo,
      memberName: profileMap.get(pkg.member.userId) || 'Unknown',
      assignedBy: pkg.assignedByUser.profile?.fullName || 'Unknown',
      createdAt: pkg.createdAt
    }));
  }

  // ============================================================
  // ADMIN CABANG - USER MANAGEMENT
  // ============================================================

  async createBranchUser(userData: any, branchId: string, createdBy: string) {
    // Validasi role yang diizinkan untuk Admin Cabang
    const allowedRoles = [Role.ADMIN_LAYANAN, Role.DOCTOR, Role.NURSE];
    if (!allowedRoles.includes(userData.role)) {
      throw {
        status: 403,
        code: 'INVALID_ROLE',
        message: 'Admin Cabang hanya bisa membuat user dengan role ADMIN_LAYANAN, DOCTOR, atau NURSE'
      };
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw {
        status: 409,
        code: 'EMAIL_EXISTS',
        message: 'Email sudah terdaftar'
      };
    }

    // Generate staff code
    const staffCode = await this.generateStaffCode(userData.role);
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          branchId: branchId,
          staffCode: staffCode,
          isActive: true
        }
      });

      // Create profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
          fullName: userData.fullName,
          phone: userData.phone || null
        }
      });

      return user;
    });

    await logAudit({
      userId: createdBy,
      action: AuditAction.CREATE,
      resource: 'User',
      resourceId: result.id,
      meta: {
        role: userData.role,
        branchId: branchId,
        email: userData.email
      }
    });

    return result;
  }

  async getBranchUsers(branchId: string) {
    const users = await prisma.user.findMany({
      where: {
        branchId: branchId,
        role: {
          in: [Role.ADMIN_LAYANAN, Role.DOCTOR, Role.NURSE, Role.ADMIN_CABANG]
        }
      },
      include: {
        profile: {
          select: {
            fullName: true,
            phone: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { profile: { fullName: 'asc' } }
      ]
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      staffCode: user.staffCode,
      isActive: user.isActive,
      fullName: user.profile?.fullName || 'Unknown',
      phone: user.profile?.phone,
      createdAt: user.createdAt
    }));
  }

  async deactivateUser(userId: string, branchId: string, deactivatedBy: string) {
    // Verify user belongs to this branch
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        branchId: branchId
      }
    });

    if (!user) {
      throw {
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan di cabang ini'
      };
    }

    // Cannot deactivate ADMIN_CABANG or higher roles
    if ([Role.ADMIN_CABANG, Role.ADMIN_MANAGER, Role.SUPER_ADMIN].includes(user.role)) {
      throw {
        status: 403,
        code: 'CANNOT_DEACTIVATE',
        message: 'Tidak dapat menonaktifkan user dengan role ini'
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    await logAudit({
      userId: deactivatedBy,
      action: AuditAction.UPDATE,
      resource: 'User',
      resourceId: userId,
      meta: {
        action: 'DEACTIVATE',
        previousStatus: user.isActive
      }
    });
  }

  // ============================================================
  // ADMIN CABANG - STOCK REQUEST
  // ============================================================

  async createStockRequest(requestData: any, branchId: string, requestedBy: string) {
    // Generate request code
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { branchCode: true }
    });

    if (!branch) {
      throw {
        status: 404,
        code: 'BRANCH_NOT_FOUND',
        message: 'Cabang tidak ditemukan'
      };
    }

    const requestCode = await this.generateStockRequestCode(branch.branchCode);

    const stockRequest = await prisma.stockRequest.create({
      data: {
        requestCode: requestCode,
        branchId: branchId,
        requestedBy: requestedBy,
        status: 'PENDING',
        notes: requestData.notes,
        items: {
          create: requestData.items.map((item: any) => ({
            masterProductId: item.masterProductId,
            requestedQuantity: item.quantity,
            notes: item.notes
          }))
        }
      },
      include: {
        items: {
          include: {
            masterProduct: {
              select: {
                name: true,
                unit: true
              }
            }
          }
        }
      }
    });

    await logAudit({
      userId: requestedBy,
      action: AuditAction.CREATE,
      resource: 'StockRequest',
      resourceId: stockRequest.id,
      meta: {
        requestCode: requestCode,
        itemsCount: requestData.items.length
      }
    });

    return stockRequest;
  }

  async getBranchStockRequests(branchId: string) {
    const requests = await prisma.stockRequest.findMany({
      where: { branchId },
      include: {
        items: {
          include: {
            masterProduct: {
              select: {
                name: true,
                unit: true
              }
            }
          }
        },
        requestedByUser: {
          include: {
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests.map(request => ({
      id: request.id,
      requestCode: request.requestCode,
      status: request.status,
      notes: request.notes,
      requestedBy: request.requestedByUser.profile?.fullName || 'Unknown',
      createdAt: request.createdAt,
      items: request.items.map(item => ({
        productName: item.masterProduct.name,
        requestedQuantity: item.requestedQuantity,
        unit: item.masterProduct.unit,
        notes: item.notes
      }))
    }));
  }

  // ============================================================
  // ADMIN MANAGER - MULTI-BRANCH KPI
  // ============================================================

  async getMultiBranchKPI() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total branches
    const totalBranches = await prisma.branch.count({
      where: { isActive: true }
    });

    // Total active members across all branches
    const totalActiveMembers = await prisma.member.count({
      where: {
        memberPackages: {
          some: {
            status: 'ACTIVE'
          }
        }
      }
    });

    // Total sessions this month
    const monthlySessionsCount = await prisma.treatmentSession.count({
      where: {
        treatmentDate: {
          gte: startOfMonth
        }
      }
    });

    // Total revenue this month
    const monthlyRevenue = await prisma.memberPackage.aggregate({
      where: {
        status: 'ACTIVE',
        paidAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        finalPrice: true
      }
    });

    // Active packages by type
    const packagesByType = await prisma.memberPackage.groupBy({
      by: ['packageType'],
      where: {
        status: 'ACTIVE'
      },
      _count: {
        id: true
      }
    });

    // Critical stock across all branches
    const criticalStockCount = await prisma.inventoryItem.count({
      where: {
        stock: {
          lt: prisma.inventoryItem.fields.minThreshold
        }
      }
    });

    return {
      totalBranches,
      totalActiveMembers,
      monthlySessionsCount,
      monthlyRevenue: Number(monthlyRevenue._sum.finalPrice) || 0,
      packagesByType: packagesByType.reduce((acc, item) => {
        acc[item.packageType] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      criticalStockCount
    };
  }

  async getSessionsPerBranch(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessionsPerBranch = await prisma.treatmentSession.groupBy({
      by: ['branchId'],
      where: {
        treatmentDate: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    });

    // Get branch names
    const branchIds = sessionsPerBranch.map(item => item.branchId);
    const branches = await prisma.branch.findMany({
      where: {
        id: { in: branchIds }
      },
      select: {
        id: true,
        name: true,
        branchCode: true
      }
    });

    const branchMap = new Map(branches.map(b => [b.id, b]));

    return sessionsPerBranch.map(item => ({
      branchId: item.branchId,
      branchName: branchMap.get(item.branchId)?.name || 'Unknown',
      branchCode: branchMap.get(item.branchId)?.branchCode || 'UNK',
      sessionCount: item._count.id
    }));
  }

  // ============================================================
  // ADMIN MANAGER - BRANCH MANAGEMENT
  // ============================================================

  async createBranch(branchData: any, createdBy: string) {
    // Check branch code uniqueness
    const existingBranch = await prisma.branch.findUnique({
      where: { branchCode: branchData.branchCode }
    });

    if (existingBranch) {
      throw {
        status: 409,
        code: 'BRANCH_CODE_EXISTS',
        message: 'Kode cabang sudah digunakan'
      };
    }

    const branch = await prisma.branch.create({
      data: {
        branchCode: branchData.branchCode,
        name: branchData.name,
        address: branchData.address,
        city: branchData.city,
        phone: branchData.phone,
        type: branchData.type || BranchType.KLINIK,
        operatingHours: branchData.operatingHours,
        isActive: true
      }
    });

    await logAudit({
      userId: createdBy,
      action: AuditAction.CREATE,
      resource: 'Branch',
      resourceId: branch.id,
      meta: {
        branchCode: branchData.branchCode,
        name: branchData.name
      }
    });

    return branch;
  }

  async getAllBranches() {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: {
            users: {
              where: { isActive: true }
            },
            members: true,
            memberPackages: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return branches.map(branch => ({
      id: branch.id,
      branchCode: branch.branchCode,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      type: branch.type,
      operatingHours: branch.operatingHours,
      isActive: branch.isActive,
      stats: {
        activeUsers: branch._count.users,
        totalMembers: branch._count.members,
        activePackages: branch._count.memberPackages
      },
      createdAt: branch.createdAt
    }));
  }

  async updateBranch(branchId: string, updateData: any, updatedBy: string) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      throw {
        status: 404,
        code: 'BRANCH_NOT_FOUND',
        message: 'Cabang tidak ditemukan'
      };
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: updateData
    });

    await logAudit({
      userId: updatedBy,
      action: AuditAction.UPDATE,
      resource: 'Branch',
      resourceId: branchId,
      meta: {
        changes: updateData
      }
    });

    return updatedBranch;
  }

  // ============================================================
  // ADMIN MANAGER - PACKAGE PRICING
  // ============================================================

  async updatePackagePricing(pricingId: string, updateData: any, updatedBy: string) {
    const pricing = await prisma.packagePricing.findUnique({
      where: { id: pricingId }
    });

    if (!pricing) {
      throw {
        status: 404,
        code: 'PRICING_NOT_FOUND',
        message: 'Harga paket tidak ditemukan'
      };
    }

    const updatedPricing = await prisma.packagePricing.update({
      where: { id: pricingId },
      data: updateData
    });

    await logAudit({
      userId: updatedBy,
      action: AuditAction.UPDATE,
      resource: 'PackagePricing',
      resourceId: pricingId,
      meta: {
        changes: updateData,
        previousPrice: pricing.price
      }
    });

    return updatedPricing;
  }

  async getAllPackagePricing() {
    const pricing = await prisma.packagePricing.findMany({
      include: {
        branch: {
          select: {
            name: true,
            branchCode: true
          }
        }
      },
      orderBy: [
        { branch: { name: 'asc' } },
        { packageType: 'asc' },
        { totalSessions: 'asc' }
      ]
    });

    return pricing.map(item => ({
      id: item.id,
      branchName: item.branch.name,
      branchCode: item.branch.branchCode,
      packageType: item.packageType,
      name: item.name,
      totalSessions: item.totalSessions,
      price: Number(item.price),
      isActive: item.isActive,
      createdAt: item.createdAt
    }));
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private async generateStaffCode(role: Role): Promise<string> {
    const rolePrefix = {
      [Role.ADMIN_LAYANAN]: 'AL',
      [Role.DOCTOR]: 'DR',
      [Role.NURSE]: 'NR'
    }[role] || 'ST';

    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    let counter = 1;
    let staffCode: string;
    
    do {
      const counterStr = counter.toString().padStart(3, '0');
      staffCode = `${rolePrefix}-${dateStr}-${counterStr}`;
      
      const existing = await prisma.user.findFirst({
        where: { staffCode }
      });
      
      if (!existing) break;
      counter++;
    } while (counter <= 999);

    return staffCode;
  }

  private async generateStockRequestCode(branchCode: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const prefix = `REQ-${branchCode}-${year}${month}`;
    
    const lastRequest = await prisma.stockRequest.findFirst({
      where: {
        requestCode: {
          startsWith: prefix
        }
      },
      orderBy: {
        requestCode: 'desc'
      }
    });

    let sequence = 1;
    if (lastRequest) {
      const lastSeq = parseInt(lastRequest.requestCode.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }
}