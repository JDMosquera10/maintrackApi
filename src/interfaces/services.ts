import { User, Machine, Maintenance, LoginRequest, AuthResponse, ApiResponse, DashboardStats, DashboardCharts, MaintenanceAlert, RecentMachine } from '../types';

export interface IUserService {
  createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersActives(): Promise<User[]>;
}

export interface IAuthService {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<AuthResponse>;
  validateToken(token: string): Promise<User | null>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}

export interface IMachineService {
  createMachine(machineData: Omit<Machine, '_id' | 'createdAt' | 'updatedAt'>): Promise<Machine>;
  getMachineById(id: string): Promise<Machine | null>;
  updateMachine(id: string, machineData: Partial<Machine>): Promise<Machine | null>;
  deleteMachine(id: string): Promise<boolean>;
  getAllMachines(): Promise<Machine[]>;
  updateMachineStatus(id: string, status: Machine['status']): Promise<Machine | null>;
  searchMachines(query: string): Promise<Machine[]>;
}

export interface IMaintenanceService {
  createMaintenance(maintenanceData: Omit<Maintenance, '_id' | 'createdAt' | 'updatedAt'>): Promise<Maintenance>;
  getMaintenanceById(id: string): Promise<Maintenance | null>;
  updateMaintenance(id: string, maintenanceData: Partial<Maintenance>): Promise<Maintenance | null>;
  deleteMaintenance(id: string): Promise<boolean>;
  getAllMaintenances(): Promise<Maintenance[]>;
  completeMaintenance(id: string, workHours: number, observations: string): Promise<Maintenance | null>;
  getMaintenancesByMachine(machineId: string): Promise<Maintenance[]>;
  getMaintenancesByTechnician(technicianId: string): Promise<Maintenance[]>;
}

export interface IDashboardService {
  getDashboardStats(): Promise<DashboardStats>;
  getDashboardCharts(): Promise<DashboardCharts>;
  getMaintenanceAlerts(): Promise<MaintenanceAlert[]>;
  getRecentMachines(): Promise<RecentMachine[]>;
} 