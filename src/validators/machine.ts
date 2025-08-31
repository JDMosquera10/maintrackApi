import { z } from 'zod';
import { MachineStatus } from '../types';

export const createMachineSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  usageHours: z.number().min(0, 'Usage hours must be non-negative'),
  client: z.string().min(1, 'Client is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.nativeEnum(MachineStatus, "status is invalid").optional().default(MachineStatus.OPERATIONAL)
});

export const updateMachineSchema = z.object({
  model: z.string().min(1, 'Model is required').optional(),
  serialNumber: z.string().min(1, 'Serial number is required').optional(),
  usageHours: z.number().min(0, 'Usage hours must be non-negative').optional(),
  client: z.string().min(1, 'Client is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  status: z.nativeEnum(MachineStatus).optional()
});

export const updateMachineStatusSchema = z.object({
  status: z.nativeEnum(MachineStatus, "status is invalid")
});

export const searchMachinesSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long')
});

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>; 