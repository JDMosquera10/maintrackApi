import { Request, Response } from 'express';
import { MachineService } from '../services/MachineService';
import { ApiResponse } from '../types';
import WebSocketManager from '../utils/WebSocketManager';

export class MachineController {
  private machineService: MachineService;

  constructor() {
    this.machineService = new MachineService();
  }

  createMachine = async (req: Request, res: Response): Promise<void> => {
    try {
      const machine = await this.machineService.createMachine(req.body);

      const response: ApiResponse<typeof machine> = {
        success: true,
        payload: machine,
        message: 'Machine created successfully'
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to create machine'
      };

      res.status(400).json(response);
    }
  };

  getMachineById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const machine = await this.machineService.getMachineById(id);

      if (!machine) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Machine not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof machine> = {
        success: true,
        payload: machine,
        message: 'Machine retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get machine'
      };

      res.status(500).json(response);
    }
  };

  getAllMachines = async (req: Request, res: Response): Promise<void> => {
    try {
      const machines = await this.machineService.getAllMachines();

      const response: ApiResponse<typeof machines> = {
        success: true,
        payload: machines,
        message: 'Machines retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get machines'
      };

      res.status(500).json(response);
    }
  };

  updateMachine = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const machine = await this.machineService.updateMachine(id, req.body);

      if (!machine) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Machine not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof machine> = {
        success: true,
        payload: machine,
        message: 'Machine updated successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to update machine'
      };

      res.status(400).json(response);
    }
  };

  deleteMachine = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.machineService.deleteMachine(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Machine not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Machine deleted successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to delete machine'
      };

      res.status(500).json(response);
    }
  };

  updateMachineStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const machine = await this.machineService.updateMachineStatus(id, status);

      if (!machine) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Machine not found'
        };
        res.status(404).json(response);
        return;
      }

      // Enviar evento WebSocket de actualización de estado de máquina
      WebSocketManager.broadcastMachineStatusUpdate(
        machine._id?.toString() || '',
        machine.status,
        {
          model: machine.model,
          serialNumber: machine.serialNumber,
          client: machine.client,
          location: machine.location
        }
      );

      const response: ApiResponse<typeof machine> = {
        success: true,
        payload: machine,
        message: 'Machine status updated successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to update machine status'
      };

      res.status(400).json(response);
    }
  };

  searchMachines = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Search query parameter "q" is required'
        };
        res.status(400).json(response);
        return;
      }

      const machines = await this.machineService.searchMachines(q);

      const response: ApiResponse<typeof machines> = {
        success: true,
        payload: machines,
        message: `Found ${machines.length} machines matching "${q}"`
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to search machines'
      };

      res.status(500).json(response);
    }
  };
} 