import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();
const adminController = new AdminController();

// Apply authentication to all admin routes
router.use(authenticate);

// ============================================================
// ADMIN CABANG ROUTES - Requires ADMIN_CABANG role
// ============================================================

// KPI & Dashboard
router.get('/branch/kpi', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.getBranchKPI.bind(adminController)
);

router.get('/branch/stock-status', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.getBranchStockStatus.bind(adminController)
);

router.get('/branch/pending-packages', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.getPendingPackages.bind(adminController)
);

// User Management
router.post('/branch/users', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.createBranchUser.bind(adminController)
);

router.get('/branch/users', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.getBranchUsers.bind(adminController)
);

router.patch('/branch/users/:userId/deactivate', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.deactivateUser.bind(adminController)
);

// Stock Requests
router.post('/branch/stock-requests', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.createStockRequest.bind(adminController)
);

router.get('/branch/stock-requests', 
  authorize([Role.ADMIN_CABANG]), 
  adminController.getBranchStockRequests.bind(adminController)
);

// ============================================================
// ADMIN MANAGER ROUTES - Requires ADMIN_MANAGER role
// ============================================================

// Multi-Branch KPI
router.get('/manager/kpi', 
  authorize([Role.ADMIN_MANAGER]), 
  adminController.getMultiBranchKPI.bind(adminController)
);

router.get('/manager/sessions-per-branch', 
  authorize([Role.ADMIN_MANAGER]), 
  adminController.getSessionsPerBranch.bind(adminController)
);

// Branch Management
router.post('/manager/branches', 
  authorize([Role.ADMIN_MANAGER]), 
  adminController.createBranch.bind(adminController)
);

router.get('/manager/branches', 
  authorize([Role.ADMIN_MANAGER]), 
  adminController.getAllBranches.bind(adminController)
);

router.patch('/manager/branches/:branchId', 
  authorize([Role.ADMIN_MANAGER]), 
  adminController.updateBranch.bind(adminController)
);

// Package Pricing Management
router.get('/manager/package-pricing', 
  authorize([Role.ADMIN_MANAGER]), 
  adminController.getAllPackagePricing.bind(adminController)
);

router.patch('/manager/package-pricing/:pricingId', 
  authorize([Role.ADMIN_MANAGER]), 
  adminController.updatePackagePricing.bind(adminController)
);

// ============================================================
// SHARED ROUTES - Both ADMIN_CABANG and ADMIN_MANAGER can access
// ============================================================

// View all branches (read-only for ADMIN_CABANG)
router.get('/branches', 
  authorize([Role.ADMIN_CABANG, Role.ADMIN_MANAGER]), 
  adminController.getAllBranches.bind(adminController)
);

export { router as adminRoutes };