import { Router } from 'express';
import WebSocketManager from '../utils/WebSocketManager';

const router = Router();

/**
 * POST /api/test/maintenance-alerts
 * Simula el envío de alertas de mantenimiento para pruebas
 */
router.post('/maintenance-alerts', (req, res) => {
  try {
    // Datos de prueba
    const testAlerts = [
      {
        id: 'ALERT_001',
        maintenanceId: 'MAINT_001',
        machineId: 'MACH_001',
        machineModel: 'Excavadora CAT 320',
        machineSerial: 'CAT320-2023-001',
        client: 'Constructora ABC',
        dueDate: new Date(Date.now() + 86400000), // Mañana
        daysRemaining: 1,
        maintenanceType: 'preventive',
        priority: 'critical',
        location: 'Sitio A',
        technicianId: 'TECH_001',
        spareParts: ['Filtro de aceite', 'Filtro de aire'],
        observations: 'Mantenimiento crítico próximo a vencer'
      },
      {
        id: 'ALERT_002',
        maintenanceId: 'MAINT_002',
        machineId: 'MACH_002',
        machineModel: 'Bulldozer Komatsu D65',
        machineSerial: 'KOMD65-2023-002',
        client: 'Constructora XYZ',
        dueDate: new Date(Date.now() + 172800000), // En 2 días
        daysRemaining: 2,
        maintenanceType: 'preventive',
        priority: 'high',
        location: 'Sitio B',
        technicianId: 'TECH_002',
        spareParts: ['Filtro de combustible'],
        observations: 'Mantenimiento de alto prioridad'
      }
    ];

    // Enviar alertas por WebSocket
    WebSocketManager.broadcastMaintenanceAlerts(testAlerts);

    console.log(`📡 ${testAlerts.length} alertas de prueba enviadas por WebSocket`);
    console.log('📡 Estructura enviada:', {
      type: 'upcoming_maintenance_alerts',
      data: {
        alerts: testAlerts,
        count: testAlerts.length
      }
    });

    res.json({
      success: true,
      message: `${testAlerts.length} alertas de mantenimiento enviadas por WebSocket`,
      data: {
        alertsSent: testAlerts.length,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error enviando alertas de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando alertas de prueba'
    });
  }
});

/**
 * GET /api/test/websocket-status
 * Obtiene el estado del WebSocket
 */
router.get('/websocket-status', (req, res) => {
  try {
    const webSocketService = WebSocketManager.getWebSocketService();

    if (!webSocketService) {
      return res.json({
        success: false,
        message: 'WebSocket service no está disponible',
        data: {
          connected: false,
          clientsCount: 0
        }
      });
    }

    const clientsCount = webSocketService.getConnectedClientsCount();

    res.json({
      success: true,
      message: 'Estado del WebSocket obtenido',
      data: {
        connected: true,
        clientsCount,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error obteniendo estado del WebSocket:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado del WebSocket'
    });
  }
});

/**
 * POST /api/test/dashboard-update
 * Simula una actualización del dashboard
 */
router.post('/dashboard-update', (req, res) => {
  try {
    const testData = {
      stats: {
        totalMachines: 25,
        activeMachines: 20,
        pendingMaintenances: 5,
        completedMaintenances: 15,
        upcomingAlerts: 3,
        totalWorkHours: 1200,
        averageUsageHours: 48
      },
      lastUpdated: new Date()
    };

    // Enviar actualización por WebSocket
    WebSocketManager.broadcastDashboardUpdate(testData);

    console.log('📡 Actualización del dashboard enviada por WebSocket');

    res.json({
      success: true,
      message: 'Actualización del dashboard enviada por WebSocket',
      data: {
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error enviando actualización del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando actualización del dashboard'
    });
  }
});

export default router;
