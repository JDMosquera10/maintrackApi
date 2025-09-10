import mongoose, { Schema } from 'mongoose';

const maintenanceSchema = new Schema({
  machineId: {
    type: Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  dateEnd: {
    type: Date,
    required: true,
    default: Date.now
  },
  typeId: {
    type: Schema.Types.ObjectId,
    ref: 'TypeMaintenance',
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

maintenanceSchema.index({ machineId: 1 });
maintenanceSchema.index({ technicianId: 1 });
maintenanceSchema.index({ typeId: 1 });
maintenanceSchema.index({ date: 1 });
maintenanceSchema.index({ isCompleted: 1 });
maintenanceSchema.index({ type: 1 });

export const MaintenanceModel = mongoose.model('Maintenance', maintenanceSchema);
