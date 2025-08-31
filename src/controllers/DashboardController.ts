import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { ApiResponse, DashboardData } from '../types';
import WebSocketManager from '../utils/WebSocketManager';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.dashboardService.getDashboardStats();

      const response: ApiResponse<typeof stats> = {
        success: true,
        payload: stats,
        message: 'Dashboard stats retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get dashboard stats'
      };

      res.status(500).json(response);
    }
  };

  getDashboardCharts = async (req: Request, res: Response): Promise<void> => {
    try {
      const charts = await this.dashboardService.getDashboardCharts();

      const response: ApiResponse<typeof charts> = {
        success: true,
        payload: charts,
        message: 'Dashboard charts retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get dashboard charts'
      };

      res.status(500).json(response);
    }
  };

  getMaintenanceAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      const alerts = await this.dashboardService.getMaintenanceAlerts();

      const response: ApiResponse<typeof alerts> = {
        success: true,
        payload: alerts,
        message: 'Maintenance alerts retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get maintenance alerts'
      };

      res.status(500).json(response);
    }
  };

  getRecentMachines = async (req: Request, res: Response): Promise<void> => {
    try {
      const recentMachines = await this.dashboardService.getRecentMachines();

      const response: ApiResponse<typeof recentMachines> = {
        success: true,
        payload: recentMachines,
        message: 'Recent machines retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get recent machines'
      };

      res.status(500).json(response);
    }
  };

  /**
   * Obtiene todos los datos del dashboard y los envía via WebSocket
   */
  getDashboardData = async (req: Request, res: Response): Promise<void> => {
    try {
      const [stats, charts, alerts, recentMachines] = await Promise.all([
        this.dashboardService.getDashboardStats(),
        this.dashboardService.getDashboardCharts(),
        this.dashboardService.getMaintenanceAlerts(),
        this.dashboardService.getRecentMachines()
      ]);

      const dashboardData: DashboardData = {
        stats,
        charts,
        alerts,
        recentMachines,
        lastUpdated: new Date()
      };

      // Enviar datos via WebSocket a todos los clientes conectados
      WebSocketManager.broadcastDashboardUpdate(dashboardData);

      const response: ApiResponse<DashboardData> = {
        success: true,
        payload: dashboardData,
        message: 'Dashboard data retrieved and broadcasted successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get dashboard data'
      };

      res.status(500).json(response);
    }
  };

  /**
   * Fuerza una actualización del dashboard via WebSocket
   */
  broadcastDashboardUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
      const [stats, charts, alerts, recentMachines] = await Promise.all([
        this.dashboardService.getDashboardStats(),
        this.dashboardService.getDashboardCharts(),
        this.dashboardService.getMaintenanceAlerts(),
        this.dashboardService.getRecentMachines()
      ]);

      const dashboardData: DashboardData = {
        stats,
        charts,
        alerts,
        recentMachines,
        lastUpdated: new Date()
      };

      // Enviar datos via WebSocket
      WebSocketManager.broadcastDashboardUpdate(dashboardData);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        payload: { message: 'Dashboard update broadcasted successfully' },
        message: 'Dashboard update sent to all connected clients'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to broadcast dashboard update'
      };

      res.status(500).json(response);
    }
  };
}
