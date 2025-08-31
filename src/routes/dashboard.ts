import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();
const dashboardController = new DashboardController();
const authMiddleware = new AuthMiddleware();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware.authenticate);

// Rutas para técnicos, coordinadores y admins
// Todos los usuarios autenticados pueden ver el dashboard
router.get('/stats', authMiddleware.requireTechnician, dashboardController.getDashboardStats);
router.get('/charts', authMiddleware.requireTechnician, dashboardController.getDashboardCharts);
router.get('/alerts', authMiddleware.requireTechnician, dashboardController.getMaintenanceAlerts);
router.get('/machines/recent', authMiddleware.requireTechnician, dashboardController.getRecentMachines);

// Nuevas rutas para WebSocket
router.get('/data', authMiddleware.requireTechnician, dashboardController.getDashboardData);
router.post('/broadcast', authMiddleware.requireCoordinator, dashboardController.broadcastDashboardUpdate);

export default router;
