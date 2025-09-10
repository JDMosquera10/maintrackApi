export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  OPERATOR = 'operator',
  SUPERVISOR = 'supervisor',
  TECHNICIAN = 'technician',
  COORDINATOR = 'coordinator'
}

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective'
}

export enum MachineStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

import { Types } from 'mongoose';

export interface BaseEntity {
  _id?: string | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User extends BaseEntity {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roleId?: string; // Reference to Role model
  companyId?: string; // Reference to Company model
  isActive: boolean;
}

export interface Machine extends BaseEntity {
  model: string;
  serialNumber: string;
  usageHours: number;
  client: string;
  companyId?: string;
  location: string;
  status: MachineStatus;
}

export interface Maintenance extends BaseEntity {
  machineId: string;
  date: Date;
  type: MaintenanceType;
  spareParts: string[];
  technicianId: string;
  workHours?: number;
  observations?: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface ApiResponse<T> {
  success: boolean;
  payload?: T;
  message?: string;
  error?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalMachines: number;
  activeMachines: number;
  pendingMaintenances: number;
  completedMaintenances: number;
  upcomingAlerts: number;
  totalWorkHours: number;
  averageUsageHours: number;
}

export interface MaintenancesByMonth {
  month: string;
  preventive: number;
  corrective: number;
  total: number;
}

export interface MachineStatusData {
  operational: number;
  maintenance: number;
}

export interface SpareParts {
  month: string;
  filtersUsed: number;
  oilUsed: number;
  partsReplaced: number;
}

export interface DashboardCharts {
  maintenancesByMonth: MaintenancesByMonth[];
  machineStatus: MachineStatusData;
  sparePartsConsumption: SpareParts[];
}

export interface MaintenanceAlert {
  id: string;
  maintenanceId: string;
  machineId: string;
  machineModel: string;
  machineSerial: string;
  client: string;
  dueDate: Date;
  daysRemaining: number;
  maintenanceType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  technicianId: string;
  spareParts: string[];
  observations?: string;
}

export interface RecentMachine {
  id: string;
  model: string;
  serialNumber: string;
  client: string;
  nextMaintenanceDate: Date;
  daysUntilMaintenance: number;
  status: string;
  location: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  alerts: MaintenanceAlert[];
  recentMachines: RecentMachine[];
  lastUpdated: Date;
}

// WebSocket Types
export enum WebSocketEventType {
  DASHBOARD_UPDATE = 'dashboard_update',
  MACHINE_STATUS_UPDATE = 'machine_status_update',
  MAINTENANCE_UPDATE = 'maintenance_update',
  MAINTENANCE_ALERT = 'maintenance_alert',
  UPCOMING_MAINTENANCE_ALERTS = 'upcoming_maintenance_alerts',
  CONNECTION_ESTABLISHED = 'connection_established',
  PING = 'ping',
  PONG = 'pong'
}

export interface DashboardWebSocketEvent {
  type: WebSocketEventType | string;
  data: any;
  timestamp: Date;
}

// New Entity Types
export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: string[]; // Array of permission IDs
  isActive: boolean;
}

export interface Permission extends BaseEntity {
  name: string;
  description?: string;
  resource: string; // e.g., 'machines', 'users', 'maintenances'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  isActive: boolean;
}

export interface Company extends BaseEntity {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}
