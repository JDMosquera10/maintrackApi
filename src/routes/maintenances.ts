import { Router } from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { AuthMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { createMaintenanceSchema, updateMaintenanceSchema, completeMaintenanceSchema } from '../validators/maintenance';

const router = Router();
const maintenanceController = new MaintenanceController();
const authMiddleware = new AuthMiddleware();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware.authenticate);

// Rutas para técnicos, coordinadores y admins
router.get('/', authMiddleware.requireTechnician, maintenanceController.getAllMaintenances);
router.get('/pending', authMiddleware.requireTechnician, maintenanceController.getPendingMaintenances);
router.get('/completed', authMiddleware.requireTechnician, maintenanceController.getCompletedMaintenances);
router.get('/machine/:machineId', authMiddleware.requireTechnician, maintenanceController.getMaintenancesByMachine);
router.get('/technician/:technicianId', authMiddleware.requireTechnician, maintenanceController.getMaintenancesByTechnician);
router.get('/technician/:technicianId/pending', authMiddleware.requireTechnician, maintenanceController.getPendingMaintenancesByTechnician);
router.get('/:id', authMiddleware.requireTechnician, maintenanceController.getMaintenanceById);

// Rutas para técnicos (completar mantenimientos)
router.patch('/:id/complete', authMiddleware.requireTechnician, validate(completeMaintenanceSchema), maintenanceController.completeMaintenance);

// Rutas para coordinadores y admins
router.post('/', authMiddleware.requireCoordinator, validate(createMaintenanceSchema), maintenanceController.createMaintenance);
router.put('/:id', authMiddleware.requireCoordinator, validate(updateMaintenanceSchema), maintenanceController.updateMaintenance);

// Rutas solo para admins
router.delete('/:id', authMiddleware.requireAdmin, maintenanceController.deleteMaintenance);

export default router; 