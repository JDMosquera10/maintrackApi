# 🛠️ Maintenance Management API

Sistema de gestión de mantenimiento de máquinas construido con principios SOLID, TypeScript y MongoDB.

## 🏗️ Arquitectura

El proyecto sigue los principios SOLID y está estructurado de manera modular:

```
src/
├── config/          # Configuración de base de datos
├── controllers/     # Controladores (Responsabilidad única)
├── interfaces/      # Interfaces para inversión de dependencias
├── middlewares/     # Middlewares de autenticación y validación
├── models/          # Modelos de MongoDB
├── routes/          # Rutas de la API
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
├── utils/           # Utilidades
├── validators/      # Validación con Zod
├── app.ts           # Configuración de Express
└── server.ts        # Punto de entrada
```

## 🚀 Características

- ✅ **Autenticación JWT** con roles (Técnico, Coordinador, Admin)
- ✅ **Gestión de máquinas** (CRUD completo)
- ✅ **Gestión de mantenimientos** con estados
- ✅ **Completar mantenimientos** con horas trabajadas y observaciones
- ✅ **Validación de datos** con Zod
- ✅ **Principios SOLID** implementados
- ✅ **Arquitectura escalable** y modular
- ✅ **Seguridad** con Helmet y CORS
- ✅ **Logging** con Morgan
- ✅ **Manejo de errores** global

## 📋 Modelos de Datos

### Usuario (User)
- Email, contraseña, nombre, apellido
- Roles: Técnico, Coordinador, Admin
- Estado activo/inactivo

### Máquina (Machine)
- Modelo, número de serie, horas de uso
- Cliente, ubicación
- Estado: Operativa, Mantenimiento, Fuera de servicio

### Mantenimiento (Maintenance)
- Fecha, tipo (Preventivo/Correctivo)
- Lista de repuestos
- Técnico asignado
- Horas trabajadas, observaciones
- Estado completado/pendiente

## 🔐 Roles y Permisos

### Técnico
- Ver máquinas y mantenimientos
- Completar mantenimientos
- Ver mantenimientos por máquina/técnico

### Coordinador
- Todo lo del técnico
- Crear/editar máquinas
- Crear/editar mantenimientos
- Actualizar estado de máquinas

### Admin
- Todo lo del coordinador
- Eliminar máquinas y mantenimientos
- Gestión completa del sistema

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd back
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
npm start
```

## 📡 Endpoints de la API

### Autenticación
```
POST /api/auth/login     - Iniciar sesión
POST /api/auth/register  - Registrar usuario
GET  /api/auth/profile   - Obtener perfil
```

### Máquinas
```
GET    /api/machines           - Listar máquinas
GET    /api/machines/:id       - Obtener máquina
POST   /api/machines           - Crear máquina (Coord/Admin)
PUT    /api/machines/:id       - Actualizar máquina (Coord/Admin)
PATCH  /api/machines/:id/status - Actualizar estado (Coord/Admin)
DELETE /api/machines/:id       - Eliminar máquina (Admin)
```

### Mantenimientos
```
GET    /api/maintenances                    - Listar mantenimientos
GET    /api/maintenances/pending            - Mantenimientos pendientes
GET    /api/maintenances/completed          - Mantenimientos completados
GET    /api/maintenances/:id                - Obtener mantenimiento
GET    /api/maintenances/machine/:machineId - Por máquina
GET    /api/maintenances/technician/:techId - Por técnico
POST   /api/maintenances                    - Crear mantenimiento (Coord/Admin)
PUT    /api/maintenances/:id                - Actualizar mantenimiento (Coord/Admin)
PATCH  /api/maintenances/:id/complete       - Completar mantenimiento (Técnico)
DELETE /api/maintenances/:id                - Eliminar mantenimiento (Admin)
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Construir para producción
npm start        # Ejecutar en producción
npm test         # Ejecutar tests
npm run lint     # Verificar código
npm run lint:fix # Corregir código automáticamente
npm run format   # Formatear código
```

## 🧪 Testing

```bash
npm test
```

## 📊 Health Check

```
GET /health
```

Respuesta:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## 🔒 Seguridad

- **JWT** para autenticación
- **bcrypt** para hashing de contraseñas
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Validación** de datos con Zod
- **Rate limiting** (configurable)

## 📝 Variables de Entorno

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## 🏛️ Principios SOLID Implementados

### Single Responsibility Principle (SRP)
- Cada clase tiene una única responsabilidad
- Controladores manejan HTTP, servicios manejan lógica de negocio

### Open/Closed Principle (OCP)
- Interfaces permiten extensión sin modificación
- Servicios implementan interfaces para flexibilidad

### Liskov Substitution Principle (LSP)
- Implementaciones de servicios son intercambiables
- Middlewares siguen contratos consistentes

### Interface Segregation Principle (ISP)
- Interfaces específicas para cada servicio
- No hay dependencias innecesarias

### Dependency Inversion Principle (DIP)
- Controladores dependen de interfaces, no implementaciones
- Inyección de dependencias en constructores

## 🚀 Despliegue

### Docker (Recomendado)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Producción
- Cambiar `JWT_SECRET` por una clave segura
- Configurar `MONGODB_URI` de producción
- Establecer `NODE_ENV=production`
- Configurar `CORS_ORIGIN` apropiadamente

## 📈 Monitoreo

- Health check endpoint
- Logging estructurado
- Manejo de errores global
- Métricas de uptime

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🆘 Soporte

Para soporte, crear un issue en el repositorio o contactar al equipo de desarrollo. 