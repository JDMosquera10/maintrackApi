import { z } from 'zod';
import { MaintenanceType } from '../types';

export const createMaintenanceSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  date: z.string().datetime('Invalid date format').or(z.date()),
  type: z.nativeEnum(MaintenanceType),
  spareParts: z.array(z.string()).optional().default([]),
  technicianId: z.string().min(1, 'Technician ID is required'),
  workHours: z.number().min(0, 'Work hours must be non-negative').optional(),
  observations: z.string().optional()
});

export const updateMaintenanceSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required').optional(),
  date: z.string().datetime('Invalid date format').or(z.date()).optional(),
  type: z.nativeEnum(MaintenanceType).optional(),
  spareParts: z.array(z.string()).optional(),
  technicianId: z.string().min(1, 'Technician ID is required').optional(),
  workHours: z.number().min(0, 'Work hours must be non-negative').optional(),
  observations: z.string().optional(),
  isCompleted: z.boolean().optional()
});

export const completeMaintenanceSchema = z.object({
  workHours: z.number().min(0, 'Work hours must be non-negative'),
  observations: z.string().min(1, 'Observations are required')
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type CompleteMaintenanceInput = z.infer<typeof completeMaintenanceSchema>; 