import { Request, Response } from 'express';
import { MaintenanceService } from '../services/MaintenanceService';
import { ApiResponse } from '../types';
import WebSocketManager from '../utils/WebSocketManager';

export class MaintenanceController {
  private maintenanceService: MaintenanceService;

  constructor() {
    this.maintenanceService = new MaintenanceService();
  }

  createMaintenance = async (req: Request, res: Response): Promise<void> => {
    try {
      const maintenance = await this.maintenanceService.createMaintenance(req.body);

      // Enviar evento WebSocket de nuevo mantenimiento
      WebSocketManager.broadcastMaintenanceUpdate(
        maintenance._id?.toString() || '',
        'created',
        {
          machineId: maintenance.machineId,
          type: maintenance.type,
          date: maintenance.date,
          isCompleted: maintenance.isCompleted
        }
      );

      const response: ApiResponse<typeof maintenance> = {
        success: true,
        payload: maintenance,
        message: 'Maintenance created successfully'
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to create maintenance'
      };

      res.status(400).json(response);
    }
  };

  getMaintenanceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const maintenance = await this.maintenanceService.getMaintenanceById(id);

      if (!maintenance) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Maintenance not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof maintenance> = {
        success: true,
        payload: maintenance,
        message: 'Maintenance retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get maintenance'
      };

      res.status(500).json(response);
    }
  };

  getAllMaintenances = async (req: Request, res: Response): Promise<void> => {
    try {
      const maintenances = await this.maintenanceService.getAllMaintenances();

      const response: ApiResponse<typeof maintenances> = {
        success: true,
        payload: maintenances,
        message: 'Maintenances retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get maintenances'
      };

      res.status(500).json(response);
    }
  };

  updateMaintenance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const maintenance = await this.maintenanceService.updateMaintenance(id, req.body);

      if (!maintenance) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Maintenance not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof maintenance> = {
        success: true,
        payload: maintenance,
        message: 'Maintenance updated successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to update maintenance'
      };

      res.status(400).json(response);
    }
  };

  deleteMaintenance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.maintenanceService.deleteMaintenance(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Maintenance not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Maintenance deleted successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to delete maintenance'
      };

      res.status(500).json(response);
    }
  };

  completeMaintenance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { workHours, observations } = req.body;
      
      const maintenance = await this.maintenanceService.completeMaintenance(id, workHours, observations);

      if (!maintenance) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Maintenance not found'
        };
        res.status(404).json(response);
        return;
      }

      // Enviar evento WebSocket de mantenimiento completado
      WebSocketManager.broadcastMaintenanceUpdate(
        maintenance._id?.toString() || '',
        'completed',
        {
          machineId: maintenance.machineId,
          type: maintenance.type,
          workHours: maintenance.workHours,
          isCompleted: maintenance.isCompleted,
          completedAt: new Date()
        }
      );

      const response: ApiResponse<typeof maintenance> = {
        success: true,
        payload: maintenance,
        message: 'Maintenance completed successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to complete maintenance'
      };

      res.status(400).json(response);
    }
  };

  getMaintenancesByMachine = async (req: Request, res: Response): Promise<void> => {
    try {
      const { machineId } = req.params;
      const maintenances = await this.maintenanceService.getMaintenancesByMachine(machineId);

      const response: ApiResponse<typeof maintenances> = {
        success: true,
        payload: maintenances,
        message: 'Machine maintenances retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get machine maintenances'
      };

      res.status(500).json(response);
    }
  };

  getPendingMaintenancesByTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { technicianId } = req.params;
      const maintenances = await this.maintenanceService.getPendingMaintenancesByTechnician(technicianId);

      const response: ApiResponse<typeof maintenances> = {
        success: true,
        payload: maintenances,
        message: 'Pending maintenances by technician retrieved successfully'
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get pending maintenances by technician'
      };
      res.status(500).json(response);
    }
  };

  getMaintenancesByTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { technicianId } = req.params;
      const maintenances = await this.maintenanceService.getMaintenancesByTechnician(technicianId);

      const response: ApiResponse<typeof maintenances> = {
        success: true,
        payload: maintenances,
        message: 'Technician maintenances retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get technician maintenances'
      };

      res.status(500).json(response);
    }
  };

  getPendingMaintenances = async (req: Request, res: Response): Promise<void> => {
    try {
      const maintenances = await this.maintenanceService.getPendingMaintenances();

      const response: ApiResponse<typeof maintenances> = {
        success: true,
        payload: maintenances,
        message: 'Pending maintenances retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get pending maintenances'
      };

      res.status(500).json(response);
    }
  };

  getCompletedMaintenances = async (req: Request, res: Response): Promise<void> => {
    try {
      const maintenances = await this.maintenanceService.getCompletedMaintenances();

      const response: ApiResponse<typeof maintenances> = {
        success: true,
        payload: maintenances,
        message: 'Completed maintenances retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get completed maintenances'
      };

      res.status(500).json(response);
    }
  };
} 