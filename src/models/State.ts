import mongoose, { Schema } from 'mongoose';

const StateSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

StateSchema.index({ isActive: 1 });
StateSchema.index({ name: 1 });

export const MaintenanceModel = mongoose.model('State', StateSchema);
