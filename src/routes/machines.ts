import { Router } from 'express';
import { MachineController } from '../controllers/MachineController';
import { AuthMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { createMachineSchema, updateMachineSchema, updateMachineStatusSchema, searchMachinesSchema } from '../validators/machine';

const router = Router();
const machineController = new MachineController();
const authMiddleware = new AuthMiddleware();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware.authenticate);

// Rutas para técnicos, coordinadores y admins
router.get('/search', authMiddleware.requireTechnician, validate(searchMachinesSchema), machineController.searchMachines);
router.get('/', authMiddleware.requireTechnician, machineController.getAllMachines);
router.get('/:id', authMiddleware.requireTechnician, machineController.getMachineById);

// Rutas solo para coordinadores y admins
router.post('/', authMiddleware.requireCoordinator, validate(createMachineSchema), machineController.createMachine);
router.put('/:id', authMiddleware.requireCoordinator, validate(updateMachineSchema), machineController.updateMachine);
router.patch('/:id/status', authMiddleware.requireCoordinator, validate(updateMachineStatusSchema), machineController.updateMachineStatus);

// Rutas solo para admins
router.delete('/:id', authMiddleware.requireAdmin, machineController.deleteMachine);


export default router; 