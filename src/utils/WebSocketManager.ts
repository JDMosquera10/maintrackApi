import { WebSocketService } from '../services/WebSocketService';

/**
 * Singleton para manejar la instancia de WebSocket globalmente
 */
class WebSocketManager {
  private static instance: WebSocketManager;
  private webSocketService: WebSocketService | null = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public setWebSocketService(service: WebSocketService): void {
    this.webSocketService = service;
  }

  public getWebSocketService(): WebSocketService | null {
    return this.webSocketService;
  }

  public broadcastDashboardUpdate(data: any): void {
    if (this.webSocketService) {
      this.webSocketService.broadcastDashboardUpdate(data);
    }
  }

  public broadcastMachineStatusUpdate(machineId: string, status: string, data?: any): void {
    if (this.webSocketService) {
      this.webSocketService.broadcastMachineStatusUpdate(machineId, status, data);
    }
  }

  public broadcastMaintenanceUpdate(maintenanceId: string, action: string, data?: any): void {
    if (this.webSocketService) {
      this.webSocketService.broadcastMaintenanceUpdate(maintenanceId, action, data);
    }
  }
}

export default WebSocketManager.getInstance();
