import { Request, Response } from 'express';
import { CronService } from '../services/CronService';
import { RedisService } from '../services/RedisService';
import { ApiResponse } from '../types';

export class CronController {
  private cronService: CronService;
  private redisService: RedisService;

  constructor() {
    this.cronService = new CronService();
    this.redisService = RedisService.getInstance();
  }

  /**
   * Inicia las tareas programadas
   */
  public startJobs = async (req: Request, res: Response): Promise<void> => {
    try {
      this.cronService.startAllJobs();
      
      const response: ApiResponse<{ message: string; status: any }> = {
        success: true,
        payload: {
          message: 'Tareas programadas iniciadas correctamente',
          status: this.cronService.getJobStatus()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al iniciar tareas programadas'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Detiene las tareas programadas
   */
  public stopJobs = async (req: Request, res: Response): Promise<void> => {
    try {
      this.cronService.stopAllJobs();
      
      const response: ApiResponse<{ message: string; status: any }> = {
        success: true,
        payload: {
          message: 'Tareas programadas detenidas correctamente',
          status: this.cronService.getJobStatus()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al detener tareas programadas'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Obtiene el estado de las tareas programadas
   */
  public getJobStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = this.cronService.getJobStatus();
      
      const response: ApiResponse<{ status: any }> = {
        success: true,
        payload: { status }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener estado de tareas programadas'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Ejecuta una verificación manual de mantenimientos
   */
  public runManualCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.cronService.runManualCheck();
      
      const response: ApiResponse<{
        message: string;
        result: any;
      }> = {
        success: true,
        payload: {
          message: 'Verificación manual ejecutada correctamente',
          result
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al ejecutar verificación manual'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Obtiene las alertas cacheadas en Redis
   */
  public getCachedAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      const alerts = await this.redisService.getCachedAlerts();
      
      const response: ApiResponse<{
        alerts: any[];
        count: number;
      }> = {
        success: true,
        payload: {
          alerts,
          count: alerts.length
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener alertas cacheadas'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Obtiene estadísticas de la última verificación
   */
  public getLastCheckStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.redisService.getLastCheckStats();
      
      const response: ApiResponse<{
        stats: any;
        redisConnected: boolean;
      }> = {
        success: true,
        payload: {
          stats,
          redisConnected: this.redisService.isConnected()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener estadísticas'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Limpia alertas expiradas del cache
   */
  public cleanExpiredAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.redisService.cleanExpiredAlerts();
      
      const response: ApiResponse<{ message: string }> = {
        success: true,
        payload: {
          message: 'Alertas expiradas eliminadas correctamente'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al limpiar alertas expiradas'
      };
      res.status(500).json(response);
    }
  };

  /**
   * Obtiene información del sistema de tareas programadas
   */
  public getSystemInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobStatus = this.cronService.getJobStatus();
      const lastStats = await this.redisService.getLastCheckStats();
      const cachedAlerts = await this.redisService.getCachedAlerts();
      
      const response: ApiResponse<{
        jobStatus: any;
        lastStats: any;
        cachedAlertsCount: number;
        redisConnected: boolean;
        systemTime: Date;
      }> = {
        success: true,
        payload: {
          jobStatus,
          lastStats,
          cachedAlertsCount: cachedAlerts.length,
          redisConnected: this.redisService.isConnected(),
          systemTime: new Date()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error al obtener información del sistema'
      };
      res.status(500).json(response);
    }
  };
}
