import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import machineRoutes from './routes/machines';
import maintenanceRoutes from './routes/maintenances';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import cronRoutes from './routes/cron';
import testRoutes from './routes/test';

// Importar configuración de base de datos
import databaseConnection from './config/database';

// Importar servicios
import { WebSocketService } from './services/WebSocketService';
import WebSocketManager from './utils/WebSocketManager';
import { CronService } from './services/CronService';
import { RedisService } from './services/RedisService';

dotenv.config();

class App {
  public app: express.Application;
  private server: any;
  private port: number;
  private webSocketService: WebSocketService | null = null;
  private cronService: CronService | null = null;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = Number(process.env.PORT || '3000');
    this.initializeMiddlewares();
    this.initializeBasicRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Middlewares de seguridad
    this.app.use(helmet());
    this.app.use(cors({
      // origin: process.env.CORS_ORIGIN || '*',
      origin: '*',
      credentials: true
    }));

    // Middlewares de logging - comentado temporalmente
    // this.app.use(morgan('combined'));

    // Middlewares de parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private initializeBasicRoutes(): void {
    // Rutas principales de negocio
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/machines', machineRoutes);
    this.app.use('/api/maintenances', maintenanceRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);
    this.app.use('/api/cron', cronRoutes);
    this.app.use('/api/test', testRoutes);

    // Middleware de health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Ruta por defecto
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Maintenance Management API',
        version: '1.0.0',
        status: 'Server is running'
      });
    });

    // Ruta de prueba
    this.app.get('/test', (req, res) => {
      res.json({
        success: true,
        message: 'Test endpoint working'
      });
    });
  }

  private initializeErrorHandling(): void {
    // Middleware para manejar rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    });

    // Middleware para manejar errores globales
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Global error handler:', error);

      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Conectar a la base de datos
      await databaseConnection.connect();

      // Inicializar Redis Service
      const redisService = RedisService.getInstance();
      console.log('🔗 Redis service inicializado');

      // Inicializar WebSocket Service
      this.webSocketService = new WebSocketService(this.server);
      WebSocketManager.setWebSocketService(this.webSocketService);

      // Inicializar Cron Service
      this.cronService = new CronService();
      
      // Iniciar tareas programadas automáticamente
      this.cronService.startAllJobs();

      // Iniciar el servidor
      this.server.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🏥 Health check: http://localhost:${this.port}/health`);
        console.log(`📚 API Documentation: http://localhost:${this.port}/`);
        console.log(`🔌 WebSocket server: ws://localhost:${this.port}/ws`);
        console.log(`⏰ Cron jobs iniciados automáticamente`);
        console.log(`📊 Cron API: http://localhost:${this.port}/api/cron`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      // Detener tareas programadas
      if (this.cronService) {
        this.cronService.stopAllJobs();
      }

      // Cerrar conexiones WebSocket
      if (this.webSocketService) {
        this.webSocketService.close();
      }

      // Cerrar conexión Redis
      const redisService = RedisService.getInstance();
      await redisService.disconnect();
      
      await databaseConnection.disconnect();
      console.log('✅ Server stopped gracefully');
    } catch (error) {
      console.error('❌ Error stopping server:', error);
    }
  }

  public getWebSocketService(): WebSocketService | null {
    return this.webSocketService;
  }
}

export default App;
