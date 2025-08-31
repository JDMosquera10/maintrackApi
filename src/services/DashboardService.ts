import { MachineModel } from '../models/Machine';
import { MaintenanceModel } from '../models/Maintenance';
import { IDashboardService } from '../interfaces/services';
import { 
  DashboardStats, 
  DashboardCharts, 
  MaintenanceAlert, 
  RecentMachine,
  MachineStatus,
  MaintenanceType
} from '../types';

export class DashboardService implements IDashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    // Estadísticas de máquinas
    const totalMachines = await MachineModel.countDocuments();
    const activeMachines = await MachineModel.countDocuments({ 
      status: { $in: [MachineStatus.OPERATIONAL, MachineStatus.MAINTENANCE] } 
    });

    // Estadísticas de mantenimientos
    const pendingMaintenances = await MaintenanceModel.countDocuments({ 
      isCompleted: false 
    });
    const completedMaintenances = await MaintenanceModel.countDocuments({ 
      isCompleted: true 
    });

    // Alertas próximas (mantenimientos pendientes que vencen en los próximos 7 días)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const upcomingAlerts = await MaintenanceModel.countDocuments({
      isCompleted: false,
      date: { $lte: sevenDaysFromNow }
    });

    // Horas totales de trabajo
    const workHoursAggregate = await MaintenanceModel.aggregate([
      { $match: { isCompleted: true, workHours: { $exists: true } } },
      { $group: { _id: null, totalWorkHours: { $sum: '$workHours' } } }
    ]);
    const totalWorkHours = workHoursAggregate.length > 0 ? workHoursAggregate[0].totalWorkHours : 0;

    // Promedio de horas de uso de máquinas
    const usageHoursAggregate = await MachineModel.aggregate([
      { $group: { _id: null, averageUsageHours: { $avg: '$usageHours' } } }
    ]);
    const averageUsageHours = usageHoursAggregate.length > 0 ? 
      Math.round(usageHoursAggregate[0].averageUsageHours) : 0;

    return {
      totalMachines,
      activeMachines,
      pendingMaintenances,
      completedMaintenances,
      upcomingAlerts,
      totalWorkHours,
      averageUsageHours
    };
  }

  async getDashboardCharts(): Promise<DashboardCharts> {
    // Mantenimientos por mes (últimos 12 meses)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const maintenancesByMonth = await MaintenanceModel.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          preventive: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', MaintenanceType.PREVENTIVE] }, '$count', 0]
            }
          },
          corrective: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', MaintenanceType.CORRECTIVE] }, '$count', 0]
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedMaintenancesByMonth = maintenancesByMonth.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      preventive: item.preventive,
      corrective: item.corrective,
      total: item.total
    }));

    // Estado de máquinas
    const machineStatusData = await MachineModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const machineStatus = {
      operational: 0,
      maintenance: 0
    };

    machineStatusData.forEach(item => {
      switch (item._id) {
        case MachineStatus.OPERATIONAL:
          machineStatus.operational = item.count;
          break;
        case MachineStatus.MAINTENANCE:
          machineStatus.maintenance = item.count;
          break;
      }
    });

    // Consumo de repuestos por mes (simulado basado en mantenimientos)
    const sparePartsConsumption = await MaintenanceModel.aggregate([
      {
        $match: {
          isCompleted: true,
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          maintenances: { $sum: 1 },
          spareParts: { $push: '$spareParts' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedSparePartsConsumption = sparePartsConsumption.map(item => {
      const month = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      
      // Simulación basada en la cantidad de mantenimientos
      // En un escenario real, esto vendría de un sistema de inventario
      const filtersUsed = Math.floor(item.maintenances * 0.7); // 70% de mantenimientos usan filtros
      const oilUsed = Math.floor(item.maintenances * 0.5); // 50% usan aceite
      const partsReplaced = Math.floor(item.maintenances * 0.3); // 30% reemplazan partes

      return {
        month,
        filtersUsed,
        oilUsed,
        partsReplaced
      };
    });

    return {
      maintenancesByMonth: formattedMaintenancesByMonth,
      machineStatus,
      sparePartsConsumption: formattedSparePartsConsumption
    };
  }

  async getMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const alerts = await MaintenanceModel.find({
      isCompleted: false,
      date: { $lte: thirtyDaysFromNow }
    })
    .populate('machineId', 'model serialNumber client location')
    .sort({ date: 1 })
    .limit(10);

    return alerts.map(maintenance => {
      const machine = maintenance.machineId as any;
      const daysRemaining = Math.ceil((maintenance.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let priority: 'low' | 'medium' | 'high' | 'critical';
      if (daysRemaining < 0) {
        priority = 'critical';
      } else if (daysRemaining <= 3) {
        priority = 'high';
      } else if (daysRemaining <= 7) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      return {
        id: maintenance._id.toString(),
        machineId: machine._id.toString(),
        machineModel: machine.model,
        machineSerial: machine.serialNumber,
        client: machine.client,
        dueDate: maintenance.date,
        daysRemaining,
        maintenanceType: maintenance.type,
        priority,
        location: machine.location
      };
    });
  }

  async getRecentMachines(): Promise<RecentMachine[]> {
    const machines = await MachineModel.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    const machinesWithMaintenance = await Promise.all(
      machines.map(async (machine) => {
        // Buscar el próximo mantenimiento pendiente
        const nextMaintenance = await MaintenanceModel.findOne({
          machineId: machine._id,
          isCompleted: false
        }).sort({ date: 1 });

        const today = new Date();
        let nextMaintenanceDate = new Date();
        let daysUntilMaintenance = 0;

        if (nextMaintenance) {
          nextMaintenanceDate = nextMaintenance.date;
          daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // Si no hay mantenimiento programado, simular uno basado en horas de uso
          // Mantenimiento cada 500 horas aprox
          const hoursUntilMaintenance = 500 - (machine.usageHours % 500);
          daysUntilMaintenance = Math.ceil(hoursUntilMaintenance / 8); // 8 horas por día de trabajo
          nextMaintenanceDate = new Date();
          nextMaintenanceDate.setDate(today.getDate() + daysUntilMaintenance);
        }

        return {
          id: machine._id.toString(),
          model: machine.model,
          serialNumber: machine.serialNumber,
          client: machine.client,
          nextMaintenanceDate,
          daysUntilMaintenance,
          status: machine.status,
          location: machine.location
        };
      })
    );

    return machinesWithMaintenance;
  }
}
