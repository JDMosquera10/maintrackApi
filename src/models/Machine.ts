import mongoose, { Schema } from 'mongoose';
import { MachineStatus } from '../types';

const machineSchema = new Schema({
  model: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  usageHours: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  client: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(MachineStatus),
    default: MachineStatus.OPERATIONAL,
    required: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
machineSchema.index({ client: 1 });
machineSchema.index({ status: 1 });
machineSchema.index({ location: 1 });

export const MachineModel = mongoose.model('Machine', machineSchema); 