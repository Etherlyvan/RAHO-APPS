import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess, sendError } from '../../utils/response';
import { 
  createBranchSchema, 
  updateBranchSchema,
  createUserSchema,
  updatePackagePricingSchema,
  createStockRequestSchema
} from './admin.schema';

const adminService = new AdminService();

export class AdminController {
  // ============================================================
  // ADMIN CABANG - KPI & DASHBOARD
  // ============================================================

  async getBranchKPI(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      const kpi = await adminService.getBranchKPI(branchId);
      return sendSuccess(res, kpi);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async getBranchStockStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      const stockStatus = await adminService.getBranchStockStatus(branchId);
      return sendSuccess(res, stockStatus);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async getPendingPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      const pendingPackages = await adminService.getPendingPackages(branchId);
      return sendSuccess(res, pendingPackages);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  // ============================================================
  // ADMIN CABANG - USER MANAGEMENT
  // ============================================================

  async createBranchUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Data tidak valid', validation.error.errors);
      }

      const branchId = req.user!.branchId;
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      const user = await adminService.createBranchUser(validation.data, branchId, req.user!.userId);
      return sendSuccess(res, user, 201);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async getBranchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      const users = await adminService.getBranchUsers(branchId);
      return sendSuccess(res, users);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const branchId = req.user!.branchId;
      
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      await adminService.deactivateUser(userId, branchId, req.user!.userId);
      return sendSuccess(res, { message: 'User berhasil dinonaktifkan' });
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  // ============================================================
  // ADMIN CABANG - STOCK REQUEST
  // ============================================================

  async createStockRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createStockRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Data tidak valid', validation.error.errors);
      }

      const branchId = req.user!.branchId;
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      const stockRequest = await adminService.createStockRequest(validation.data, branchId, req.user!.userId);
      return sendSuccess(res, stockRequest, 201);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async getBranchStockRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.user!.branchId;
      if (!branchId) {
        return sendError(res, 403, 'BRANCH_REQUIRED', 'User harus terikat dengan cabang');
      }

      const requests = await adminService.getBranchStockRequests(branchId);
      return sendSuccess(res, requests);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  // ============================================================
  // ADMIN MANAGER - MULTI-BRANCH KPI
  // ============================================================

  async getMultiBranchKPI(req: Request, res: Response, next: NextFunction) {
    try {
      const kpi = await adminService.getMultiBranchKPI();
      return sendSuccess(res, kpi);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async getSessionsPerBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = '30' } = req.query;
      const sessions = await adminService.getSessionsPerBranch(Number(period));
      return sendSuccess(res, sessions);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  // ============================================================
  // ADMIN MANAGER - BRANCH MANAGEMENT
  // ============================================================

  async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createBranchSchema.safeParse(req.body);
      if (!validation.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Data tidak valid', validation.error.errors);
      }

      const branch = await adminService.createBranch(validation.data, req.user!.userId);
      return sendSuccess(res, branch, 201);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async getAllBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const branches = await adminService.getAllBranches();
      return sendSuccess(res, branches);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const { branchId } = req.params;
      const validation = updateBranchSchema.safeParse(req.body);
      if (!validation.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Data tidak valid', validation.error.errors);
      }

      const branch = await adminService.updateBranch(branchId, validation.data, req.user!.userId);
      return sendSuccess(res, branch);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  // ============================================================
  // ADMIN MANAGER - PACKAGE PRICING
  // ============================================================

  async updatePackagePricing(req: Request, res: Response, next: NextFunction) {
    try {
      const { pricingId } = req.params;
      const validation = updatePackagePricingSchema.safeParse(req.body);
      if (!validation.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Data tidak valid', validation.error.errors);
      }

      const pricing = await adminService.updatePackagePricing(pricingId, validation.data, req.user!.userId);
      return sendSuccess(res, pricing);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }

  async getAllPackagePricing(req: Request, res: Response, next: NextFunction) {
    try {
      const pricing = await adminService.getAllPackagePricing();
      return sendSuccess(res, pricing);
    } catch (err: any) {
      if (err.status) {
        return sendError(res, err.status, err.code, err.message);
      }
      next(err);
    }
  }
}