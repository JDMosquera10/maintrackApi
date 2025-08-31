import { MachineModel } from '../models/Machine';
import { IMachineService } from '../interfaces/services';
import { Machine, MachineStatus } from '../types';
import { convertObjectIdToString, convertArrayObjectIdsToString } from '../utils/helpers';

export class MachineService implements IMachineService {
  async createMachine(machineData: Omit<Machine, '_id' | 'createdAt' | 'updatedAt'>): Promise<Machine> {
    const existingMachine = await MachineModel.findOne({ serialNumber: machineData.serialNumber });
    if (existingMachine) {
      throw new Error('Machine with this serial number already exists');
    }

    const machine = new MachineModel(machineData);
    await machine.save();
    return convertObjectIdToString(machine.toObject());
  }

  async getMachineById(id: string): Promise<Machine | null> {
    const machine = await MachineModel.findById(id);
    if (!machine) return null;
    return convertObjectIdToString(machine.toObject());
  }

  async updateMachine(id: string, machineData: Partial<Machine>): Promise<Machine | null> {
    if (machineData.serialNumber) {
      const existingMachine = await MachineModel.findOne({ 
        serialNumber: machineData.serialNumber,
        _id: { $ne: id }
      });
      if (existingMachine) {
        throw new Error('Machine with this serial number already exists');
      }
    }

    const machine = await MachineModel.findByIdAndUpdate(
      id,
      machineData,
      { new: true, runValidators: true }
    );
    if (!machine) return null;
    return convertObjectIdToString(machine.toObject());
  }

  async deleteMachine(id: string): Promise<boolean> {
    const result = await MachineModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllMachines(): Promise<Machine[]> {
    const machines = await MachineModel.find({});
    return convertArrayObjectIdsToString(machines.map(machine => machine.toObject()));
  }

  async updateMachineStatus(id: string, status: MachineStatus): Promise<Machine | null> {
    const machine = await MachineModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!machine) return null;
    return convertObjectIdToString(machine.toObject());
  }

  async getMachinesByStatus(status: MachineStatus): Promise<Machine[]> {
    const machines = await MachineModel.find({ status });
    return convertArrayObjectIdsToString(machines.map(machine => machine.toObject()));
  }

  async getMachinesByClient(client: string): Promise<Machine[]> {
    const machines = await MachineModel.find({ client });
    return convertArrayObjectIdsToString(machines.map(machine => machine.toObject()));
  }

  async searchMachines(query: string): Promise<Machine[]> {
    const searchRegex = new RegExp(query, 'i'); // 'i' para búsqueda case-insensitive
    const isNumber = !isNaN(Number(query));
    
    const searchConditions: any[] = [
      { model: searchRegex },
      { serialNumber: searchRegex },
      { client: searchRegex },
      { location: searchRegex },
      { status: searchRegex }
    ];

    // Si el query es un número, también buscar por horas de uso
    if (isNumber) {
      const numericQuery = Number(query);
      searchConditions.push({ usageHours: numericQuery });
    }
    
    const machines = await MachineModel.find({
      $or: searchConditions
    });
    
    return convertArrayObjectIdsToString(machines.map(machine => machine.toObject()));
  }
} 