import { WebSocket, WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';
import { DashboardWebSocketEvent, WebSocketEventType } from '../types';

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('Nueva conexión WebSocket establecida');
      
      // Agregar cliente a la lista
      this.clients.add(ws);

      // Enviar mensaje de bienvenida
      this.sendToClient(ws, {
        type: 'connection_established',
        data: {
          message: 'Conectado al servidor WebSocket',
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      // Manejar mensajes del cliente
      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Error al parsear mensaje del cliente:', error);
        }
      });

      // Manejar desconexión
      ws.on('close', () => {
        console.log('Cliente WebSocket desconectado');
        this.clients.delete(ws);
      });

      // Manejar errores
      ws.on('error', (error) => {
        console.error('Error en WebSocket:', error);
        this.clients.delete(ws);
      });
    });

    console.log('Servidor WebSocket configurado en /ws');
  }

  private handleClientMessage(ws: WebSocket, data: any): void {
    // Aquí puedes manejar mensajes específicos del cliente si es necesario
    console.log('Mensaje recibido del cliente:', data);
    
    // Ejemplo: responder a ping
    if (data.type === 'ping') {
      this.sendToClient(ws, {
        type: 'pong',
        data: { timestamp: new Date() },
        timestamp: new Date()
      });
    }
  }

  /**
   * Envía un mensaje a un cliente específico
   */
  private sendToClient(ws: WebSocket, event: DashboardWebSocketEvent): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(event));
      } catch (error) {
        console.error('Error enviando mensaje a cliente:', error);
      }
    }
  }

  /**
   * Envía un mensaje a todos los clientes conectados
   */
  public broadcast(event: DashboardWebSocketEvent): void {
    const message = JSON.stringify(event);
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error enviando mensaje broadcast:', error);
          // Remover cliente con error
          this.clients.delete(client);
        }
      } else {
        // Remover clientes desconectados
        this.clients.delete(client);
      }
    });
  }

  /**
   * Envía actualización del dashboard
   */
  public broadcastDashboardUpdate(data: any): void {
    this.broadcast({
      type: WebSocketEventType.DASHBOARD_UPDATE,
      data,
      timestamp: new Date()
    });
  }

  /**
   * Envía actualización de estado de máquina
   */
  public broadcastMachineStatusUpdate(machineId: string, status: string, data?: any): void {
    this.broadcast({
      type: WebSocketEventType.MACHINE_STATUS_UPDATE,
      data: {
        machineId,
        status,
        ...data
      },
      timestamp: new Date()
    });
  }

  /**
   * Envía actualización de mantenimiento
   */
  public broadcastMaintenanceUpdate(maintenanceId: string, action: string, data?: any): void {
    this.broadcast({
      type: WebSocketEventType.MAINTENANCE_UPDATE,
      data: {
        maintenanceId,
        action, // 'created', 'updated', 'completed', 'cancelled'
        ...data
      },
      timestamp: new Date()
    });
  }

  /**
   * Obtiene el número de clientes conectados
   */
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Cierra todas las conexiones
   */
  public close(): void {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    this.clients.clear();
    this.wss.close();
  }
}
