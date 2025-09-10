import mongoose, { Schema } from 'mongoose';

const companySchema = new Schema({
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
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

companySchema.index({ name: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ email: 1 });

export const CompanyModel = mongoose.model('Company', companySchema);
