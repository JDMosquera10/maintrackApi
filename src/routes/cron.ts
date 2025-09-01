import { Router } from 'express';
import { CronController } from '../controllers/CronController';
import { AuthMiddleware } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();
const cronController = new CronController();
const authMiddleware = new AuthMiddleware();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware.authenticate);

// Rutas para administradores y coordinadores
router.post('/start', (req, res, next) => {
  if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.COORDINATOR) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador o coordinador.'
    });
  }
  next();
}, cronController.startJobs);

router.post('/stop', (req, res, next) => {
  if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.COORDINATOR) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador o coordinador.'
    });
  }
  next();
}, cronController.stopJobs);

router.post('/manual-check', (req, res, next) => {
  if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.COORDINATOR) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador o coordinador.'
    });
  }
  next();
}, cronController.runManualCheck);

router.post('/clean-alerts', (req, res, next) => {
  if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.COORDINATOR) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador o coordinador.'
    });
  }
  next();
}, cronController.cleanExpiredAlerts);

// Rutas de consulta (accesibles para técnicos también)
router.get('/status', cronController.getJobStatus);
router.get('/cached-alerts', cronController.getCachedAlerts);
router.get('/stats', cronController.getLastCheckStats);
router.get('/system-info', cronController.getSystemInfo);

export default router;
