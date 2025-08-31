import { MaintenanceModel } from '../models/Maintenance';
import { MachineModel } from '../models/Machine';
import { IMaintenanceService } from '../interfaces/services';
import { Maintenance, MachineStatus } from '../types';
import { convertObjectIdToString, convertArrayObjectIdsToString, convertIdsToString } from '../utils/helpers';

export class MaintenanceService implements IMaintenanceService {
  async createMaintenance(maintenanceData: Omit<Maintenance, '_id' | 'createdAt' | 'updatedAt'>): Promise<Maintenance> {
    // Verificar que la máquina existe
    const machine = await MachineModel.findById(maintenanceData.machineId);
    if (!machine) {
      throw new Error('Machine not found');
    }

    // Cambiar el estado de la máquina a mantenimiento
    await MachineModel.findByIdAndUpdate(maintenanceData.machineId, {
      status: MachineStatus.MAINTENANCE
    });

    const maintenance = new MaintenanceModel(maintenanceData);
    await maintenance.save();
    // const result = await 
    return this.getMaintenanceById(maintenance._id.toString()) as any;
  }

  async getMaintenanceById(id: string): Promise<Maintenance | null> {
    const maintenance = await MaintenanceModel.findById(id)
      .populate('machineId', 'model serialNumber client location')
      .populate('technicianId', 'firstName lastName email');
    if (!maintenance) return null;
    maintenance._id = convertIdsToString(maintenance._id);
    return maintenance as any;
    // return convertObjectIdToString(maintenance.toObject()) as any;
  }

  async updateMaintenance(id: string, maintenanceData: Partial<Maintenance>): Promise<Maintenance | null> {
    const maintenance = await MaintenanceModel.findByIdAndUpdate(
      id,
      maintenanceData,
      { new: true, runValidators: true }
    );
    if (!maintenance) return null;
    return this.getMaintenanceById(maintenance._id.toString()) as any;
    // return convertObjectIdToString(maintenance.toObject()) as any;
  }

  async deleteMaintenance(id: string): Promise<boolean> {
    const maintenance = await MaintenanceModel.findById(id);
    if (!maintenance) {
      return false;
    }

    // Si el mantenimiento está completado, no permitir eliminarlo
    if (maintenance.isCompleted) {
      throw new Error('Cannot delete completed maintenance');
    }

    // Cambiar el estado de la máquina de vuelta a operativa
    await MachineModel.findByIdAndUpdate(maintenance.machineId, {
      status: MachineStatus.OPERATIONAL
    });

    const result = await MaintenanceModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllMaintenances(): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.find({})
      .populate('machineId', 'model serialNumber client location')
      .populate('technicianId', 'firstName lastName email')
      .sort({ date: -1 });
    // return convertArrayObjectIdsToString(maintenances.map(maintenance => maintenance.toObject())) as any;
    return maintenances.map(maintenance => {
      maintenance._id = convertIdsToString(maintenance._id);
      return maintenance.toObject() as unknown as Maintenance;
    }) as any;
  }

  async completeMaintenance(id: string, workHours: number, observations: string): Promise<Maintenance | null> {
    const maintenance = await MaintenanceModel.findById(id);
    if (!maintenance) {
      throw new Error('Maintenance not found');
    }

    if (maintenance.isCompleted) {
      throw new Error('Maintenance is already completed');
    }

    // Actualizar el mantenimiento
    const updatedMaintenance = await MaintenanceModel.findByIdAndUpdate(
      id,
      {
        workHours,
        observations,
        isCompleted: true,
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedMaintenance) {
      return null;
    }

    // Cambiar el estado de la máquina a operativa
    await MachineModel.findByIdAndUpdate(maintenance.machineId, {
      status: MachineStatus.OPERATIONAL
    });

    return convertObjectIdToString(updatedMaintenance.toObject()) as any;
  }

  async getMaintenancesByMachine(machineId: string): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.find({ machineId })
      .populate('technicianId', 'firstName lastName email')
      .sort({ date: -1 });
    return maintenances.map(maintenance => {
      maintenance._id = convertIdsToString(maintenance._id);
      maintenance.technicianId._id = convertIdsToString(maintenance.technicianId._id);
      return maintenance.toObject() as unknown as Maintenance;
    }) as any;
  }

  async getMaintenancesByTechnician(technicianId: string): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.find({ technicianId })
      .populate('machineId', 'model serialNumber client location')
      .sort({ date: -1 });
    return maintenances.map(maintenance => {
      maintenance._id = convertIdsToString(maintenance._id);
      maintenance.machineId._id = convertIdsToString(maintenance.machineId._id);
      return maintenance.toObject() as unknown as Maintenance;
    }) as any;
  }

  async getPendingMaintenancesByTechnician(technicianId: string): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.find({ technicianId, isCompleted: false })
      .populate('machineId', 'model serialNumber client location')
      .sort({ date: -1 });
    return maintenances.map(maintenance => {
      maintenance._id = convertIdsToString(maintenance._id);
      maintenance.machineId._id = convertIdsToString(maintenance.machineId._id);
      return maintenance.toObject() as unknown as Maintenance;
    }) as any;
  }

  async getPendingMaintenances(): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.find({ isCompleted: false })
      .populate('machineId', 'model serialNumber client location')
      .populate('technicianId', 'firstName lastName email')
      .sort({ date: -1 });
    return maintenances.map(maintenance => {
      maintenance._id = convertIdsToString(maintenance._id);
      maintenance.machineId._id = convertIdsToString(maintenance.machineId._id);
      maintenance.technicianId._id = convertIdsToString(maintenance.technicianId._id);
      return maintenance.toObject() as unknown as Maintenance;
    });
  }

  async getCompletedMaintenances(): Promise<Maintenance[]> {
    const maintenances = await MaintenanceModel.find({ isCompleted: true })
      .populate('machineId', 'model serialNumber client location')
      .populate('technicianId', 'firstName lastName email')
      .sort({ completedAt: -1 });
    return maintenances.map(maintenance => {
      maintenance._id = convertIdsToString(maintenance._id);
      maintenance.machineId._id = convertIdsToString(maintenance.machineId._id);
      maintenance.technicianId._id = convertIdsToString(maintenance.technicianId._id);
      return maintenance.toObject() as unknown as Maintenance;
    }) as unknown as Maintenance[];
  }
} 