/**
 * Configuración centralizada para WebSocket
 */
export interface WebSocketConfig {
  // Configuración del servidor
  server: {
    path: string;
    port?: number;
    host?: string;
  };
  
  // Configuración de reconexión
  reconnection: {
    maxAttempts: number;
    interval: number;
    backoffMultiplier: number;
  };
  
  // Configuración de heartbeat
  heartbeat: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  
  // Configuración de logging
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  
  // Configuración de seguridad
  security: {
    enableAuth: boolean;
    tokenValidation: boolean;
    rateLimit: {
      enabled: boolean;
      maxMessagesPerMinute: number;
    };
  };
  
  // Configuración de eventos
  events: {
    enablePingPong: boolean;
    enableConnectionLogs: boolean;
    enableErrorLogs: boolean;
  };
}

/**
 * Configuración por defecto para desarrollo
 */
export const defaultWebSocketConfig: WebSocketConfig = {
  server: {
    path: '/ws',
    port: 3000,
    host: 'localhost'
  },
  
  reconnection: {
    maxAttempts: 5,
    interval: 5000, // 5 segundos
    backoffMultiplier: 1.5
  },
  
  heartbeat: {
    enabled: true,
    interval: 30000, // 30 segundos
    timeout: 10000 // 10 segundos
  },
  
  logging: {
    enabled: true,
    level: 'info'
  },
  
  security: {
    enableAuth: false, // Habilitar en producción
    tokenValidation: false,
    rateLimit: {
      enabled: false,
      maxMessagesPerMinute: 100
    }
  },
  
  events: {
    enablePingPong: true,
    enableConnectionLogs: true,
    enableErrorLogs: true
  }
};

/**
 * Configuración para producción
 */
export const productionWebSocketConfig: WebSocketConfig = {
  ...defaultWebSocketConfig,
  logging: {
    enabled: true,
    level: 'warn'
  },
  security: {
    enableAuth: true,
    tokenValidation: true,
    rateLimit: {
      enabled: true,
      maxMessagesPerMinute: 50
    }
  }
};

/**
 * Obtiene la configuración según el entorno
 */
export function getWebSocketConfig(): WebSocketConfig {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionWebSocketConfig;
    case 'test':
      return {
        ...defaultWebSocketConfig,
        logging: { enabled: false, level: 'error' },
        heartbeat: { enabled: false, interval: 0, timeout: 0 }
      };
    default:
      return defaultWebSocketConfig;
  }
}

/**
 * Constantes de WebSocket
 */
export const WebSocketConstants = {
  // Estados de conexión
  CONNECTION_STATES: {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  },
  
  // Tipos de mensajes
  MESSAGE_TYPES: {
    PING: 'ping',
    PONG: 'pong',
    ERROR: 'error',
    CONNECTION_ESTABLISHED: 'connection_established'
  },
  
  // Códigos de error
  ERROR_CODES: {
    NORMAL_CLOSURE: 1000,
    GOING_AWAY: 1001,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
    POLICY_VIOLATION: 1008,
    MESSAGE_TOO_BIG: 1009,
    INTERNAL_ERROR: 1011
  },
  
  // Headers personalizados
  HEADERS: {
    CLIENT_ID: 'x-client-id',
    AUTH_TOKEN: 'x-auth-token',
    CLIENT_TYPE: 'x-client-type'
  }
};

/**
 * Utilidades de configuración
 */
export class WebSocketConfigUtils {
  /**
   * Valida la configuración
   */
  static validateConfig(config: WebSocketConfig): boolean {
    if (config.reconnection.maxAttempts < 0) return false;
    if (config.reconnection.interval < 1000) return false;
    if (config.heartbeat.interval < 5000) return false;
    if (config.security.rateLimit.maxMessagesPerMinute < 1) return false;
    
    return true;
  }
  
  /**
   * Obtiene la URL del WebSocket
   */
  static getWebSocketUrl(config: WebSocketConfig, baseUrl?: string): string {
    const { host, port, path } = config.server;
    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    
    if (baseUrl) {
      return baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + path;
    }
    
    return `${protocol}://${host}:${port}${path}`;
  }
  
  /**
   * Obtiene el intervalo de reconexión con backoff exponencial
   */
  static getReconnectionInterval(config: WebSocketConfig, attempt: number): number {
    const { interval, backoffMultiplier } = config.reconnection;
    return Math.min(interval * Math.pow(backoffMultiplier, attempt), 30000); // Máximo 30 segundos
  }
}
