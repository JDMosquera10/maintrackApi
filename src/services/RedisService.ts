import Redis from 'ioredis';
import { MaintenanceAlert } from '../types';

export class RedisService {
  private redis: Redis | null = null;
  private static instance: RedisService;
  private inMemoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private isRedisAvailable: boolean = false;

  private constructor() {
    this.initializeRedis();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.setupEventHandlers();

      // Intentar conectar
      await this.redis.connect();
      this.isRedisAvailable = true;
      console.log('Redis conectado exitosamente');
    } catch (error) {
      console.warn('Redis no disponible, usando cache en memoria');
      this.isRedisAvailable = false;
      this.redis = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.redis) return;

    this.redis.on('connect', () => {
      console.log('Redis conectado exitosamente');
      this.isRedisAvailable = true;
    });

    this.redis.on('error', (error) => {
      console.error('Error en Redis:', error);
      this.isRedisAvailable = false;
    });

    this.redis.on('close', () => {
      console.log('Conexión Redis cerrada');
      this.isRedisAvailable = false;
    });

    this.redis.on('reconnecting', () => {
      console.log(' Reconectando a Redis...');
    });
  }

  /**
   * Guarda una alerta de mantenimiento en cache
   */
  public async cacheMaintenanceAlert(alert: MaintenanceAlert): Promise<void> {
    const key = `maintenance_alert:${alert.id}`;
    const expiry = 60 * 60 * 24; // 24 horas

    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(key, expiry, JSON.stringify(alert));
        console.log(`Alerta de mantenimiento cacheada en Redis: ${alert.id}`);
      } else {
        // Fallback a memoria
        const expiryTime = Date.now() + (expiry * 1000);
        this.inMemoryCache.set(key, { data: alert, expiry: expiryTime });
        console.log(`Alerta de mantenimiento cacheada en memoria: ${alert.id}`);
      }
    } catch (error) {
      console.error(' Error cacheando alerta:', error);
      // Fallback a memoria en caso de error
      const expiryTime = Date.now() + (expiry * 1000);
      this.inMemoryCache.set(key, { data: alert, expiry: expiryTime });
    }
  }

  /**
   * Verifica si una alerta ya fue reportada
   */
  public async isAlertReported(alertId: string): Promise<boolean> {
    const key = `maintenance_alert:${alertId}`;

    try {
      if (this.isRedisAvailable && this.redis) {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } else {
        // Fallback a memoria
        const cached = this.inMemoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error verificando alerta:', error);
      // Fallback a memoria
      const cached = this.inMemoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return true;
      }
      return false;
    }
  }

  /**
   * Obtiene todas las alertas cacheadas
   */
  public async getCachedAlerts(): Promise<MaintenanceAlert[]> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.keys('maintenance_alert:*');
        if (keys.length === 0) return [];

        const alerts: MaintenanceAlert[] = [];
        for (const key of keys) {
          const data = await this.redis.get(key);
          if (data) {
            alerts.push(JSON.parse(data));
          }
        }
        return alerts;
      } else {
        // Fallback a memoria
        const alerts: MaintenanceAlert[] = [];
        const now = Date.now();

        for (const [key, value] of this.inMemoryCache.entries()) {
          if (key.startsWith('maintenance_alert:') && value.expiry > now) {
            alerts.push(value.data);
          }
        }
        return alerts;
      }
    } catch (error) {
      console.error(' Error obteniendo alertas cacheadas:', error);
      return [];
    }
  }

  /**
   * Limpia alertas expiradas
   */
  public async cleanExpiredAlerts(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.keys('maintenance_alert:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(` ${keys.length} alertas expiradas eliminadas de Redis`);
        }
      } else {
        // Fallback a memoria
        const now = Date.now();
        let deletedCount = 0;

        for (const [key, value] of this.inMemoryCache.entries()) {
          if (key.startsWith('maintenance_alert:') && value.expiry <= now) {
            this.inMemoryCache.delete(key);
            deletedCount++;
          }
        }
        console.log(` ${deletedCount} alertas expiradas eliminadas de memoria`);
      }
    } catch (error) {
      console.error('Error limpiando alertas expiradas:', error);
    }
  }

  /**
   * Guarda estadísticas de la última consulta
   */
  public async setLastCheckStats(stats: {
    totalChecked: number;
    alertsFound: number;
    timestamp: Date;
  }): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(
          'last_check_stats',
          60 * 60 * 24, // 24 horas
          JSON.stringify(stats)
        );
      } else {
        // Fallback a memoria
        const expiryTime = Date.now() + (60 * 60 * 24 * 1000);
        this.inMemoryCache.set('last_check_stats', { data: stats, expiry: expiryTime });
      }
    } catch (error) {
      console.error(' Error guardando estadísticas:', error);
    }
  }

  /**
   * Obtiene estadísticas de la última consulta
   */
  public async getLastCheckStats(): Promise<{
    totalChecked: number;
    alertsFound: number;
    timestamp: Date;
  } | null> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const data = await this.redis.get('last_check_stats');
        return data ? JSON.parse(data) : null;
      } else {
        // Fallback a memoria
        const cached = this.inMemoryCache.get('last_check_stats');
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Cierra la conexión de Redis
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
        console.log('Conexión Redis cerrada correctamente');
      }
    } catch (error) {
      console.error('Error cerrando Redis:', error);
    }
  }

  /**
   * Verifica si Redis está conectado
   */
  public isConnected(): boolean {
    return this.isRedisAvailable;
  }
}
