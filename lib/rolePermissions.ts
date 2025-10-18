// Role-based permissions and status management

export type UserRole = 'seller' | 'operator';
export type OrderStatus = 'confirm' | 'inProcess' | 'ready' | 'completed';

export interface RolePermissions {
  canUpdateStatus: (currentStatus: OrderStatus, newStatus: OrderStatus) => boolean;
  allowedStatuses: OrderStatus[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  seller: {
    canUpdateStatus: (currentStatus: OrderStatus, newStatus: OrderStatus) => {
      // Seller can only update from 'ready' to 'completed'
      return currentStatus === 'ready' && newStatus === 'completed';
    },
    allowedStatuses: ['completed']
  },
  operator: {
    canUpdateStatus: (currentStatus: OrderStatus, newStatus: OrderStatus) => {
      // Operator can manage all status transitions
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        'confirm': ['inProcess', 'ready', 'completed'],
        'inProcess': ['ready', 'completed'],
        'ready': ['completed'],
        'completed': [] // No transitions from completed
      };
      return validTransitions[currentStatus]?.includes(newStatus) || false;
    },
    allowedStatuses: ['confirm', 'inProcess', 'ready', 'completed']
  }
};

export const getStatusDisplayName = (status: OrderStatus): string => {
  const statusNames: Record<OrderStatus, string> = {
    'confirm': 'Confirmed',
    'inProcess': 'In Process',
    'ready': 'Ready',
    'completed': 'Completed'
  };
  return statusNames[status];
};

export const getStatusColor = (status: OrderStatus): string => {
  const statusColors: Record<OrderStatus, string> = {
    'confirm': '#3b82f6', // Blue
    'inProcess': '#f59e0b', // Amber
    'ready': '#10b981', // Green
    'completed': '#6b7280' // Gray
  };
  return statusColors[status];
};

export const canUserUpdateStatus = (userRole: UserRole, currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.canUpdateStatus(currentStatus, newStatus);
};

export const getAvailableStatusUpdates = (userRole: UserRole, currentStatus: OrderStatus): OrderStatus[] => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.allowedStatuses.filter(status => 
    permissions.canUpdateStatus(currentStatus, status)
  );
};
