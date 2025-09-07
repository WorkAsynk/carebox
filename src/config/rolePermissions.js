// Role-based Access Control Configuration
// This file defines the permission structure for different user roles

export const ROLES = {
  ADMIN: 'Admin',
  FRANCHISE: 'Franchise', 
  OPERATIONAL_MANAGER: 'Operational Manager',
  DEVELOPER: 'Developer',
  CLIENT: 'Client'
};

// Route permissions mapping
export const ROUTE_PERMISSIONS = {
  // Public routes (no authentication required)
  '/login': [],
  
  // Home - accessible to all authenticated users
  '/': [], // Empty array means all authenticated users
  
  // User Management - Admin only
  '/create-user': [ROLES.ADMIN],
  '/userlist': [ROLES.ADMIN],
  
  // Address Management - Admin, Franchise, Operational Manager
  '/create-address': [ROLES.ADMIN, ROLES.FRANCHISE, ROLES.OPERATIONAL_MANAGER],
  '/addresslist': [ROLES.ADMIN, ROLES.FRANCHISE, ROLES.OPERATIONAL_MANAGER],
  
  // Order Management
  '/create-order': [ROLES.ADMIN, ROLES.FRANCHISE, ROLES.OPERATIONAL_MANAGER, ROLES.DEVELOPER],
  '/orderlist': [ROLES.ADMIN, ROLES.FRANCHISE, ROLES.OPERATIONAL_MANAGER, ROLES.DEVELOPER],
  '/edit-order/:id': [ROLES.ADMIN, ROLES.FRANCHISE, ROLES.OPERATIONAL_MANAGER],
  '/order-details/:id': [ROLES.ADMIN, ROLES.FRANCHISE, ROLES.OPERATIONAL_MANAGER, ROLES.DEVELOPER, ROLES.CLIENT],
  
  // Account Management - accessible to all authenticated users
  '/account-details': []
};

// Role hierarchy and capabilities
export const ROLE_CAPABILITIES = {
  [ROLES.ADMIN]: {
    description: 'Full system access with all administrative privileges',
    capabilities: [
      'User Management (Create, Read, Update, Delete)',
      'Address Management (Create, Read, Update, Delete)', 
      'Order Management (Create, Read, Update, Delete)',
      'System Configuration',
      'Reports and Analytics',
      'Account Management'
    ]
  },
  
  [ROLES.FRANCHISE]: {
    description: 'Franchise owner with operational access',
    capabilities: [
      'Address Management (Create, Read, Update, Delete)',
      'Order Management (Create, Read, Update, Delete)',
      'Reports for their franchise',
      'Account Management'
    ]
  },
  
  [ROLES.OPERATIONAL_MANAGER]: {
    description: 'Operations management with order and address control',
    capabilities: [
      'Address Management (Create, Read, Update, Delete)',
      'Order Management (Create, Read, Update, Delete)',
      'Operational Reports',
      'Account Management'
    ]
  },
  
  [ROLES.DEVELOPER]: {
    description: 'Developer access for testing and debugging',
    capabilities: [
      'Order Management (Create, Read)',
      'Order Details (Read)',
      'System Testing',
      'Account Management'
    ]
  },
  
  [ROLES.CLIENT]: {
    description: 'Client access to view their orders',
    capabilities: [
      'Order Details (Read only)',
      'Account Management (Limited)',
      'Track Orders'
    ]
  }
};

// Helper function to check if user has access to a route
export const hasAccess = (userRole, routePermissions) => {
  // If no permissions specified, allow all authenticated users
  if (!routePermissions || routePermissions.length === 0) {
    return true;
  }
  
  // Check if user's role is in allowed roles
  return routePermissions.includes(userRole);
};

// Helper function to get user capabilities
export const getUserCapabilities = (userRole) => {
  return ROLE_CAPABILITIES[userRole] || null;
};
