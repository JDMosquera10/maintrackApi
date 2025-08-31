import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { registerSchema, updateUserSchema } from '../validators/auth';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

// Todas las rutas de usuarios requieren autenticación
router.use(authMiddleware.authenticate);

// Rutas CRUD
router.post('/', validate(registerSchema), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/actives', userController.getUsersActives);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router; 