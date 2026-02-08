const ROLES = {
  ADMIN: 'admin',
  FINANCE_MANAGER: 'finance_manager',
  FINANCE_STAFF: 'finance_staff',
  PURCHASE_MANAGER: 'purchase_manager',
  SALES_STAFF: 'sales_staff',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  PRODUCTION_MANAGER: 'production_manager',
  HR_MANAGER: 'hr_manager',
  EMPLOYEE: 'employee'
};

const PERMISSIONS = {
  AUTH_MANAGE: 'auth_manage',
  SYSTEM_SETTING: 'system_setting',
  BASIC_DATA: 'basic_data',
  GENERAL_LEDGER: 'general_ledger',
  ACCOUNTS_RECEIVABLE: 'accounts_receivable',
  ACCOUNTS_PAYABLE: 'accounts_payable',
  FIXED_ASSETS: 'fixed_assets',
  PAYROLL: 'payroll',
  COST_MANAGEMENT: 'cost_management',
  PURCHASE_MANAGE: 'purchase_manage',
  SALES_MANAGE: 'sales_manage',
  INVENTORY_MANAGE: 'inventory_manage',
  INVENTORY_ACCOUNTING: 'inventory_accounting',
  PRODUCTION_PLAN: 'production_plan',
  WORKSHOP_MANAGE: 'workshop_manage',
  BOM_MANAGE: 'bom_manage',
  HR_MANAGE: 'hr_manage',
  ATTENDANCE_MANAGE: 'attendance_manage',
  FINANCIAL_REPORT: 'financial_report',
  BUSINESS_ANALYSIS: 'business_analysis',
  AI_ASSISTANT: 'ai_assistant'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.AUTH_MANAGE,
    PERMISSIONS.SYSTEM_SETTING,
    PERMISSIONS.BASIC_DATA,
    PERMISSIONS.GENERAL_LEDGER,
    PERMISSIONS.ACCOUNTS_RECEIVABLE,
    PERMISSIONS.ACCOUNTS_PAYABLE,
    PERMISSIONS.FIXED_ASSETS,
    PERMISSIONS.PAYROLL,
    PERMISSIONS.COST_MANAGEMENT,
    PERMISSIONS.PURCHASE_MANAGE,
    PERMISSIONS.SALES_MANAGE,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_ACCOUNTING,
    PERMISSIONS.PRODUCTION_PLAN,
    PERMISSIONS.WORKSHOP_MANAGE,
    PERMISSIONS.BOM_MANAGE,
    PERMISSIONS.HR_MANAGE,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.FINANCIAL_REPORT,
    PERMISSIONS.BUSINESS_ANALYSIS,
    PERMISSIONS.AI_ASSISTANT
  ],
  [ROLES.FINANCE_MANAGER]: [
    PERMISSIONS.GENERAL_LEDGER,
    PERMISSIONS.ACCOUNTS_RECEIVABLE,
    PERMISSIONS.ACCOUNTS_PAYABLE,
    PERMISSIONS.FIXED_ASSETS,
    PERMISSIONS.PAYROLL,
    PERMISSIONS.COST_MANAGEMENT,
    PERMISSIONS.FINANCIAL_REPORT,
    PERMISSIONS.BASIC_DATA
  ],
  [ROLES.FINANCE_STAFF]: [
    PERMISSIONS.GENERAL_LEDGER,
    PERMISSIONS.ACCOUNTS_RECEIVABLE,
    PERMISSIONS.ACCOUNTS_PAYABLE,
    PERMISSIONS.FINANCIAL_REPORT
  ],
  [ROLES.PURCHASE_MANAGER]: [
    PERMISSIONS.PURCHASE_MANAGE,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.BASIC_DATA
  ],
  [ROLES.SALES_STAFF]: [
    PERMISSIONS.SALES_MANAGE,
    PERMISSIONS.ACCOUNTS_RECEIVABLE
  ],
  [ROLES.WAREHOUSE_MANAGER]: [
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.INVENTORY_ACCOUNTING
  ],
  [ROLES.PRODUCTION_MANAGER]: [
    PERMISSIONS.PRODUCTION_PLAN,
    PERMISSIONS.WORKSHOP_MANAGE,
    PERMISSIONS.BOM_MANAGE,
    PERMISSIONS.INVENTORY_MANAGE
  ],
  [ROLES.HR_MANAGER]: [
    PERMISSIONS.HR_MANAGE,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.PAYROLL,
    PERMISSIONS.BASIC_DATA
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.FINANCIAL_REPORT,
    PERMISSIONS.BUSINESS_ANALYSIS,
    PERMISSIONS.AI_ASSISTANT
  ]
};

const permissionCache = new Map();
const CACHE_TTL = 60000;

function getCacheKey(userInfo, permission) {
  return `${userInfo?.userId || 'guest'}:${permission}`;
}

function checkPermission(userInfo, permission) {
  if (!userInfo || !userInfo.role) {
    return false;
  }
  
  if (userInfo.role === ROLES.ADMIN) {
    return true;
  }
  
  const cacheKey = getCacheKey(userInfo, permission);
  const cached = permissionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  const rolePermissions = ROLE_PERMISSIONS[userInfo.role] || [];
  const result = rolePermissions.includes(permission);
  
  permissionCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  return result;
}

function checkRole(userInfo, role) {
  if (!userInfo || !userInfo.role) {
    return false;
  }
  
  if (userInfo.role === ROLES.ADMIN) {
    return true;
  }
  
  return userInfo.role === role;
}

function getUserPermissions(userInfo) {
  if (!userInfo || !userInfo.role) {
    return [];
  }
  
  if (userInfo.role === ROLES.ADMIN) {
    return Object.values(PERMISSIONS);
  }
  
  return ROLE_PERMISSIONS[userInfo.role] || [];
}

function checkPagePermission(pagePath, userInfo) {
  const publicPages = [
    '/pages/auth/login',
    '/pages/auth/register',
    '/pages/auth/forgotPassword'
  ];
  
  if (publicPages.includes(pagePath)) {
    return true;
  }
  
  const pagePermissions = {
    '/pages/generalLedger/index': PERMISSIONS.GENERAL_LEDGER,
    '/pages/accountsReceivable/index': PERMISSIONS.ACCOUNTS_RECEIVABLE,
    '/pages/accountsPayable/index': PERMISSIONS.ACCOUNTS_PAYABLE,
    '/pages/fixedAssets/index': PERMISSIONS.FIXED_ASSETS,
    '/pages/payroll/index': PERMISSIONS.PAYROLL,
    '/pages/costManagement/index': PERMISSIONS.COST_MANAGEMENT,
    '/pages/purchase/index': PERMISSIONS.PURCHASE_MANAGE,
    '/pages/sales/index': PERMISSIONS.SALES_MANAGE,
    '/pages/inventory/index': PERMISSIONS.INVENTORY_MANAGE,
    '/pages/inventoryAccounting/index': PERMISSIONS.INVENTORY_ACCOUNTING,
    '/pages/productionPlan/index': PERMISSIONS.PRODUCTION_PLAN,
    '/pages/workshop/index': PERMISSIONS.WORKSHOP_MANAGE,
    '/pages/bom/index': PERMISSIONS.BOM_MANAGE,
    '/pages/hr/index': PERMISSIONS.HR_MANAGE,
    '/pages/attendance/index': PERMISSIONS.ATTENDANCE_MANAGE,
    '/pages/statistics/index': PERMISSIONS.FINANCIAL_REPORT,
    '/pages/analytics/index': PERMISSIONS.BUSINESS_ANALYSIS,
    '/pages/ai-assistant/index': PERMISSIONS.AI_ASSISTANT,
    '/pages/settings/index': PERMISSIONS.SYSTEM_SETTING,
    '/pages/basic/index': PERMISSIONS.BASIC_DATA
  };
  
  const requiredPermission = pagePermissions[pagePath];
  if (!requiredPermission) {
    return !!userInfo;
  }
  
  return checkPermission(userInfo, requiredPermission);
}

function clearPermissionCache() {
  permissionCache.clear();
}

function getPermissionCacheStats() {
  return {
    size: permissionCache.size,
    entries: Array.from(permissionCache.entries()).map(([key, value]) => ({
      key,
      result: value.result,
      age: Date.now() - value.timestamp
    }))
  };
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  checkPermission,
  checkRole,
  getUserPermissions,
  checkPagePermission,
  clearPermissionCache,
  getPermissionCacheStats
};