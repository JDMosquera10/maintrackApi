# Dashboard API Endpoints

Esta documentación describe los endpoints del dashboard implementados para el proyecto de gestión de mantenimiento de máquinas.

## Base URL
```
/api/dashboard
```

## Autenticación
Todos los endpoints requieren autenticación con JWT token en el header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Estadísticas del Dashboard
**GET** `/api/dashboard/stats`

Retorna las estadísticas principales del dashboard.

**Respuesta:**
```json
{
  "success": true,
  "payload": {
    "totalMachines": 150,
    "activeMachines": 140,
    "inactiveMachines": 10,
    "pendingMaintenances": 25,
    "completedMaintenances": 320,
    "upcomingAlerts": 8,
    "totalWorkHours": 1250,
    "averageUsageHours": 750
  },
  "message": "Dashboard stats retrieved successfully"
}
```

### 2. Gráficos del Dashboard
**GET** `/api/dashboard/charts`

Retorna los datos para los gráficos del dashboard.

**Respuesta:**
```json
{
  "success": true,
  "payload": {
    "maintenancesByMonth": [
      {
        "month": "2024-01",
        "preventive": 15,
        "corrective": 8,
        "total": 23
      },
      {
        "month": "2024-02",
        "preventive": 12,
        "corrective": 5,
        "total": 17
      }
    ],
    "machineStatus": {
      "operational": 120,
      "maintenance": 20,
      "offline": 10
    },
    "sparePartsConsumption": [
      {
        "month": "2024-01",
        "filtersUsed": 45,
        "oilUsed": 30,
        "partsReplaced": 15
      },
      {
        "month": "2024-02",
        "filtersUsed": 38,
        "oilUsed": 25,
        "partsReplaced": 12
      }
    ]
  },
  "message": "Dashboard charts retrieved successfully"
}
```

### 3. Alertas de Mantenimiento
**GET** `/api/dashboard/alerts`

Retorna las alertas de mantenimientos próximos a vencer.

**Respuesta:**
```json
{
  "success": true,
  "payload": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "machineId": "60f7b3b3b3b3b3b3b3b3b3b4",
      "machineModel": "CAT 320D",
      "machineSerial": "CAT001",
      "client": "Constructora ABC",
      "dueDate": "2024-01-25T00:00:00.000Z",
      "daysRemaining": 3,
      "maintenanceType": "preventive",
      "priority": "high",
      "location": "Obra Principal"
    }
  ],
  "message": "Maintenance alerts retrieved successfully"
}
```

### 4. Máquinas Recientes
**GET** `/api/dashboard/machines/recent`

Retorna las 5 máquinas más recientemente agregadas al sistema.

**Respuesta:**
```json
{
  "success": true,
  "payload": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "model": "CAT 320D",
      "serialNumber": "CAT001",
      "client": "Constructora ABC",
      "nextMaintenanceDate": "2024-02-15T00:00:00.000Z",
      "daysUntilMaintenance": 20,
      "status": "operational",
      "location": "Obra Principal"
    }
  ],
  "message": "Recent machines retrieved successfully"
}
```

## Permisos

Todos los endpoints del dashboard requieren al menos el rol de **técnico**. Los roles que pueden acceder son:
- Técnico (technician)
- Coordinador (coordinator) 
- Administrador (admin)

## Tipos de Datos

### DashboardStats
```typescript
interface DashboardStats {
  totalMachines: number;
  activeMachines: number;
  inactiveMachines: number;
  pendingMaintenances: number;
  completedMaintenances: number;
  upcomingAlerts: number;
  totalWorkHours: number;
  averageUsageHours: number;
}
```

### MaintenancesByMonth
```typescript
interface MaintenancesByMonth {
  month: string; // Formato: YYYY-MM
  preventive: number;
  corrective: number;
  total: number;
}
```

### MachineStatusData
```typescript
interface MachineStatusData {
  operational: number;
  maintenance: number;
  offline: number;
}
```

### SpareParts
```typescript
interface SpareParts {
  month: string; // Formato: YYYY-MM
  filtersUsed: number;
  oilUsed: number;
  partsReplaced: number;
}
```

### MaintenanceAlert
```typescript
interface MaintenanceAlert {
  id: string;
  machineId: string;
  machineModel: string;
  machineSerial: string;
  client: string;
  dueDate: Date;
  daysRemaining: number;
  maintenanceType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
}
```

### RecentMachine
```typescript
interface RecentMachine {
  id: string;
  model: string;
  serialNumber: string;
  client: string;
  nextMaintenanceDate: Date;
  daysUntilMaintenance: number;
  status: string;
  location: string;
}
```

## Notas de Implementación

1. **Consumo de Repuestos**: Los datos de consumo de repuestos están simulados basándose en la cantidad de mantenimientos realizados, ya que no existe un sistema de inventario específico.

2. **Alertas de Prioridad**: La prioridad de las alertas se calcula automáticamente basándose en los días restantes:
   - `critical`: Mantenimientos vencidos (días negativos)
   - `high`: Vencen en 3 días o menos
   - `medium`: Vencen entre 4-7 días
   - `low`: Vencen en más de 7 días

3. **Máquinas Recientes**: Si una máquina no tiene mantenimientos programados, se simula el próximo mantenimiento basándose en las horas de uso (cada 500 horas aproximadamente).

4. **Rendimiento**: Las consultas utilizan agregaciones de MongoDB para optimizar el rendimiento y obtener los datos directamente desde la base de datos.
