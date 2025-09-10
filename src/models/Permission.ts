import mongoose, { Schema } from 'mongoose';

const permissionSchema = new Schema({
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
  resource: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ name: 1 });
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const PermissionModel = mongoose.model('Permission', permissionSchema);
