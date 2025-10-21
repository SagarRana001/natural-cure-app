// Role-based permissions and status management

export type UserRole = 'seller' | 'operator';
type OrderStatus = 'pending' | 'confirm' | 'inProcess' | 'ready' | 'completed' | 'cancelled';


export interface RolePermissions {
  canUpdateStatus: (currentStatus: OrderStatus, newStatus: OrderStatus) => boolean;
  allowedStatuses: OrderStatus[];
}
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirm'],
  confirm: ['inProcess'],
  inProcess: ['ready'],
  ready: ['completed'],
  completed: [], // no further transitions
  cancelled:[]
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  operator: {
    canUpdateStatus: (currentStatus, newStatus) => {
      // Operator can move only one step forward in sequence
      return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
    },
    allowedStatuses: ['pending', 'confirm', 'inProcess', 'ready', 'completed'],
  },
  seller: {
    canUpdateStatus: (currentStatus, newStatus) => {
      // Seller can only move from ready → completed
      return currentStatus === 'ready' && newStatus === 'completed';
    },
    allowedStatuses: ['completed'],
  },
};

export const getStatusDisplayName = (status: OrderStatus): string => {
  const statusNames: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirm: 'Confirmed',
    inProcess: 'In Process',
    ready: 'Ready',
    completed: 'Completed',
    cancelled:'Cancelled'
  };
  return statusNames[status];
};

export const getStatusColor = (status: OrderStatus): string => {
  const statusColors: Record<OrderStatus, string> = {
    pending: '#9ca3af', // Gray
    confirm: '#3b82f6', // Blue
    inProcess: '#f59e0b', // Amber
    ready: '#10b981', // Green
    completed: '#6b7280', // Dark Gray
    cancelled:  '#6b7280', // Dark Gray 
  };
  return statusColors[status];
};

export const canUserUpdateStatus = (
  userRole: UserRole,
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.canUpdateStatus(currentStatus, newStatus);
};

export const getAvailableStatusUpdates = (
  userRole: UserRole,
  currentStatus: OrderStatus
): OrderStatus[] => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (userRole === 'operator') {
    // Operator can move forward only one step
    return VALID_TRANSITIONS[currentStatus] || [];
  }
  if (userRole === 'seller') {
    // Seller only allowed to complete ready orders
    return currentStatus === 'ready' ? ['completed'] : [];
  }
  return [];
};