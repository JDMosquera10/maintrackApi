import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { loginSchema, registerSchema } from '../validators/auth';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

// Rutas públicas
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);

// Rutas protegidas
router.get('/profile', authMiddleware.authenticate, authController.getProfile);

export default router; 