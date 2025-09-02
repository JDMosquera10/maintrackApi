import * as cron from 'node-cron';
import { MaintenanceModel } from '../models/Maintenance';
import { MaintenanceAlert } from '../types';
import WebSocketManager from '../utils/WebSocketManager';
import { RedisService } from './RedisService';

export class CronService {
  private redisService: RedisService;
  private maintenanceCheckJob: cron.ScheduledTask | null = null;
  private cleanupJob: cron.ScheduledTask | null = null;

  constructor() {
    this.redisService = RedisService.getInstance();
  }

  /**
   * Inicia todos los trabajos programados
   */
  public startAllJobs(): void {
    // Tarea para verificar mantenimientos cada 10 minutos
    this.startMaintenanceCheckJob();
    // Tarea para limpiar cache cada día a las 2 AM
    this.startCleanupJob();
  }

  /**
   * Inicia la tarea de verificación de mantenimientos
   */
  private startMaintenanceCheckJob(): void {
    // Ejecutar cada 10 minutos: '*/10 * * * *'
    this.maintenanceCheckJob = cron.schedule('*/10 * * * *', async () => {
      await this.checkUpcomingMaintenances();
    }, {
      timezone: 'America/Bogota' // Ajusta según tu zona horaria
    });

    this.maintenanceCheckJob.start();
  }

  /**
   * Inicia la tarea de limpieza de cache
   */
  private startCleanupJob(): void {
    // Ejecutar cada día a las 2 AM: '0 2 * * *'
    this.cleanupJob = cron.schedule('0 2 * * *', async () => {
      await this.redisService.cleanExpiredAlerts();
    }, {
      timezone: 'America/Bogota'
    });

    this.cleanupJob.start();
  }

  /**
   * Verifica mantenimientos próximos a vencer
   */
  private async checkUpcomingMaintenances(): Promise<void> {
    try {
      const startTime = Date.now();

      // Obtener mantenimientos próximos a vencer (≤ 7 días)
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const upcomingMaintenances = await MaintenanceModel.find({
        date: { $gte: now, $lte: sevenDaysFromNow },
        isCompleted: false
      }).populate('machineId', 'model serialNumber client location');
      let totalAlerts = 0;
      const newAlerts: MaintenanceAlert[] = [];

      for (const maintenance of upcomingMaintenances) {
        const alert = await this.checkMaintenanceAlert(maintenance);
        if (alert) {
          newAlerts.push(alert);
          totalAlerts++;
        }
      }

      // Guardar estadísticas
      await this.redisService.setLastCheckStats({
        totalChecked: upcomingMaintenances.length,
        alertsFound: totalAlerts,
        timestamp: new Date()
      });

      const executionTime = Date.now() - startTime;
      console.log(` Verificación completada en ${executionTime}ms. ${totalAlerts} alertas encontradas.`);

      // Enviar alertas por WebSocket si hay nuevas
      if (newAlerts.length > 0) {
        this.sendMaintenanceAlerts(newAlerts);
      }

    } catch (error) {
      console.error(' Error en verificación de mantenimientos:', error);
    }
  }

  /**
   * Verifica si un mantenimiento específico debe generar una alerta
   */
  private async checkMaintenanceAlert(maintenance: any): Promise<MaintenanceAlert | null> {
    const now = new Date();
    const maintenanceDate = new Date(maintenance.date);
    const daysRemaining = Math.ceil((maintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    // Solo alertar si está próximo a vencer (≤ 7 días)
    if (daysRemaining >= 0 && daysRemaining <= 7) {
      const alertId = `maintenance_${maintenance._id}_${maintenanceDate.getTime()}`;

      // Verificar si ya fue reportada
      const alreadyReported = await this.redisService.isAlertReported(alertId);
      if (!alreadyReported) {
        const alert: MaintenanceAlert = {
          id: alertId,
          maintenanceId: maintenance._id.toString(),
          machineId: maintenance.machineId._id.toString(),
          machineModel: maintenance.machineId.model,
          machineSerial: maintenance.machineId.serialNumber,
          client: maintenance.machineId.client,
          dueDate: maintenanceDate,
          daysRemaining,
          maintenanceType: maintenance.type,
          priority: this.calculatePriority(daysRemaining),
          location: maintenance.machineId.location,
          technicianId: maintenance.technicianId.toString(),
          spareParts: maintenance.spareParts || [],
          observations: maintenance.observations
        };

        // Guardar en cache
        await this.redisService.cacheMaintenanceAlert(alert);
        return alert;
      }
    }

    return null;
  }

  /**
   * Calcula la prioridad basada en días restantes
   */
  private calculatePriority(daysRemaining: number): 'low' | 'medium' | 'high' | 'critical' {
    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 5) return 'medium';
    return 'low';
  }

  /**
   * Envía alertas por WebSocket
   */
  private sendMaintenanceAlerts(alerts: MaintenanceAlert[]): void {
    WebSocketManager.broadcastMaintenanceAlerts(alerts);
    console.log(` ${alerts.length} alertas enviadas por WebSocket`);
  }

  /**
   * Ejecuta una verificación manual
   */
  public async runManualCheck(): Promise<{
    totalChecked: number;
    alertsFound: number;
    executionTime: number;
  }> {
    console.log('Ejecutando verificación manual...');
    const startTime = Date.now();

    await this.checkUpcomingMaintenances();

    const executionTime = Date.now() - startTime;
    const stats = await this.redisService.getLastCheckStats();

    return {
      totalChecked: stats?.totalChecked || 0,
      alertsFound: stats?.alertsFound || 0,
      executionTime
    };
  }

  /**
   * Detiene todas las tareas programadas
   */
  public stopAllJobs(): void {
    console.log('Deteniendo tareas programadas...');

    if (this.maintenanceCheckJob) {
      this.maintenanceCheckJob.stop();
      this.maintenanceCheckJob = null;
    }

    if (this.cleanupJob) {
      this.cleanupJob.stop();
      this.cleanupJob = null;
    }

    console.log('Tareas programadas detenidas');
  }

  /**
   * Obtiene el estado de las tareas programadas
   */
  public getJobStatus(): {
    maintenanceCheckActive: boolean;
    cleanupActive: boolean;
    redisConnected: boolean;
  } {
    return {
      maintenanceCheckActive: this.maintenanceCheckJob !== null,
      cleanupActive: this.cleanupJob !== null,
      redisConnected: this.redisService.isConnected()
    };
  }
}
