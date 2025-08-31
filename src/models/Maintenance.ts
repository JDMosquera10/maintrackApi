import mongoose, { Schema } from 'mongoose';
import { MaintenanceType } from '../types';

const maintenanceSchema = new Schema({
  machineId: {
    type: Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: Object.values(MaintenanceType),
    required: true
  },
  spareParts: [{
    type: String,
    trim: true
  }],
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workHours: {
    type: Number,
    min: 0
  },
  observations: {
    type: String,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
maintenanceSchema.index({ machineId: 1 });
maintenanceSchema.index({ technicianId: 1 });
maintenanceSchema.index({ date: 1 });
maintenanceSchema.index({ isCompleted: 1 });
maintenanceSchema.index({ type: 1 });

export const MaintenanceModel = mongoose.model('Maintenance', maintenanceSchema); 