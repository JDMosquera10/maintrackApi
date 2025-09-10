import mongoose, { Schema } from 'mongoose';

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ permissions: 1 });

export const RoleModel = mongoose.model('Role', roleSchema);
