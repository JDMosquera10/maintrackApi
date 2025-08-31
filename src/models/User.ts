import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../types';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.TECHNICIAN,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      if (ret.password) {
        delete ret.password;
      }
      return ret;
    }
  }
});

// Índices para mejorar el rendimiento
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export const UserModel = mongoose.model('User', userSchema); 