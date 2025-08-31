# WebSocket API Documentation

## Conexión WebSocket

El servidor WebSocket está disponible en:
```
ws://localhost:3000/ws
```

### Eventos WebSocket

El servidor envía los siguientes tipos de eventos a los clientes conectados:

#### 1. Connection Established
Enviado cuando un cliente se conecta exitosamente.

```json
{
  "type": "connection_established",
  "data": {
    "message": "Conectado al servidor WebSocket",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 2. Dashboard Update
Enviado cuando se actualizan los datos del dashboard.

```json
{
  "type": "dashboard_update",
  "data": {
    "stats": {
      "totalMachines": 25,
      "activeMachines": 20,
      "pendingMaintenances": 5,
      "completedMaintenances": 150,
      "upcomingAlerts": 3,
      "totalWorkHours": 1200,
      "averageUsageHours": 450
    },
    "charts": {
      "maintenancesByMonth": [...],
      "machineStatus": {
        "operational": 15,
        "maintenance": 5,
        "offline": 5
      },
      "sparePartsConsumption": [...]
    },
    "alerts": [...],
    "recentMachines": [...],
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 3. Machine Status Update
Enviado cuando se actualiza el estado de una máquina.

```json
{
  "type": "machine_status_update",
  "data": {
    "machineId": "507f1f77bcf86cd799439011",
    "status": "maintenance",
    "model": "CAT 320D",
    "serialNumber": "CAT123456",
    "client": "Constructora ABC",
    "location": "Obra Norte"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 4. Maintenance Update
Enviado cuando se crea, actualiza o completa un mantenimiento.

```json
{
  "type": "maintenance_update",
  "data": {
    "maintenanceId": "507f1f77bcf86cd799439012",
    "action": "completed", // 'created', 'updated', 'completed', 'cancelled'
    "machineId": "507f1f77bcf86cd799439011",
    "type": "preventive",
    "workHours": 4,
    "isCompleted": true,
    "completedAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Mensajes del Cliente

Los clientes pueden enviar mensajes al servidor:

#### Ping
```json
{
  "type": "ping"
}
```

Respuesta del servidor:
```json
{
  "type": "pong",
  "data": {
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## Endpoints HTTP relacionados

### GET /api/dashboard/data
Obtiene todos los datos del dashboard y los envía via WebSocket a todos los clientes conectados.

### POST /api/dashboard/broadcast
Fuerza el envío de una actualización del dashboard via WebSocket (requiere rol coordinator o admin).

## Integración con Angular

Tu servicio WebSocket de Angular ya está configurado correctamente para recibir estos eventos. Los eventos que recibirás son:

- `dashboard_update`: Actualización completa del dashboard
- `machine_status_update`: Cambio de estado de máquina
- `maintenance_update`: Actualización de mantenimiento

### Ejemplo de uso en Angular:

```typescript
// En tu componente
ngOnInit() {
  this.webSocketService.dashboardEvents$.subscribe(event => {
    switch(event.type) {
      case 'dashboard_update':
        this.updateDashboardData(event.data);
        break;
      case 'machine_status_update':
        this.updateMachineStatus(event.data);
        break;
      case 'maintenance_update':
        this.updateMaintenance(event.data);
        break;
    }
  });
}
```

## Reconexión Automática

El cliente Angular implementa reconexión automática:
- Máximo 5 intentos de reconexión
- Intervalo de 5 segundos entre intentos
- Estado de conexión disponible via `connectionStatus$`

## Seguridad

- El WebSocket no requiere autenticación para la conexión
- Los datos sensibles deben ser manejados en los endpoints HTTP con autenticación
- Los eventos WebSocket son de solo lectura desde el cliente
