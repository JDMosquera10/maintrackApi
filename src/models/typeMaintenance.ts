import mongoose, { Schema } from 'mongoose';

const typeMaintenanceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: false
  },
  statesIds: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'State'
    }],
  }
}, {
  timestamps: true
});

typeMaintenanceSchema.index({ isActive: 1 });
typeMaintenanceSchema.index({ name: 1 });

export const MaintenanceModel = mongoose.model('TypeMaintenance', typeMaintenanceSchema);
