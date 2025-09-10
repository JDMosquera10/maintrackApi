# Nuevas Entidades del Sistema

## Resumen de Cambios

Se han agregado tres nuevas entidades al sistema de gestión de mantenimiento:

1. **Role** - Roles de usuario
2. **Permission** - Permisos del sistema
3. **Company** - Empresas

## Entidades

### 1. Role (Roles)

**Ubicación:** `src/models/Role.ts`

**Campos:**
- `name`: Nombre del rol (único)
- `description`: Descripción del rol
- `permissions`: Array de referencias a Permission
- `isActive`: Estado activo/inactivo
- `createdAt`, `updatedAt`: Timestamps automáticos

**Roles predefinidos:**
- Admin: Acceso completo al sistema
- Supervisor: Gestión y reportes
- Operador: Operaciones con máquinas y mantenimientos
- Cliente: Solo lectura

### 2. Permission (Permisos)

**Ubicación:** `src/models/Permission.ts`

**Campos:**
- `name`: Nombre del permiso (único)
- `description`: Descripción del permiso
- `resource`: Recurso (machines, users, maintenances, etc.)
- `action`: Acción (create, read, update, delete)
- `isActive`: Estado activo/inactivo
- `createdAt`, `updatedAt`: Timestamps automáticos

**Permisos disponibles:**
- `machines.*`: CRUD de máquinas
- `maintenances.*`: CRUD de mantenimientos
- `users.*`: CRUD de usuarios
- `roles.*`: CRUD de roles
- `companies.*`: CRUD de empresas
- `dashboard.read`: Acceso al dashboard
- `reports.read`: Acceso a reportes

### 3. Company (Empresa)

**Ubicación:** `src/models/Company.ts`

**Campos:**
- `name`: Nombre de la empresa (único)
- `description`: Descripción de la empresa
- `address`: Dirección
- `phone`: Teléfono
- `email`: Email
- `isActive`: Estado activo/inactivo
- `createdAt`, `updatedAt`: Timestamps automáticos

## Relaciones

### User ↔ Role
- **Tipo:** Many-to-One (opcional)
- **Campo en User:** `roleId` (referencia a Role)
- **Mantiene:** Campo `role` (enum) para compatibilidad

### User ↔ Company
- **Tipo:** Many-to-One (opcional)
- **Campo en User:** `companyId` (referencia a Company)

### Role ↔ Permission
- **Tipo:** Many-to-Many
- **Campo en Role:** `permissions` (array de referencias a Permission)

### Machine ↔ Company
- **Tipo:** Many-to-One (opcional)
- **Campo en Machine:** `companyId` (referencia a Company)

## Actualizaciones en Modelos Existentes

### User Model
- Agregado `roleId`: Referencia opcional a Role
- Agregado `companyId`: Referencia opcional a Company
- Mantiene `role`: Enum para compatibilidad hacia atrás

### Machine Model
- Agregado `companyId`: Referencia opcional a Company

### UserRole Enum
- Actualizado con nuevos roles: ADMIN, CLIENT, OPERATOR, SUPERVISOR
- Mantiene roles existentes: TECHNICIAN, COORDINATOR

## Inicialización

### Seed de Datos
**Archivo:** `src/utils/seedRolesAndPermissions.ts`

Este archivo contiene funciones para:
1. Crear permisos básicos del sistema
2. Crear roles predefinidos con sus permisos
3. Crear empresa por defecto

**Uso:**
```typescript
import { seedRolesAndPermissions } from './utils/seedRolesAndPermissions';

// Ejecutar al inicializar la aplicación
await seedRolesAndPermissions();
```

## Índices de Base de Datos

### Permission
- `{ resource: 1, action: 1 }` (único)
- `{ isActive: 1 }`
- `{ name: 1 }`

### Role
- `{ name: 1 }`
- `{ isActive: 1 }`
- `{ permissions: 1 }`

### Company
- `{ name: 1 }`
- `{ isActive: 1 }`
- `{ email: 1 }`

### User (actualizado)
- `{ role: 1 }`
- `{ roleId: 1 }` (nuevo)
- `{ companyId: 1 }` (nuevo)
- `{ isActive: 1 }`

### Machine (actualizado)
- `{ client: 1 }`
- `{ companyId: 1 }` (nuevo)
- `{ status: 1 }`
- `{ location: 1 }`

## Consideraciones de Migración

1. **Compatibilidad:** Los campos existentes se mantienen para compatibilidad
2. **Opcional:** Las nuevas relaciones son opcionales
3. **Gradual:** Se puede migrar gradualmente de enum a referencias
4. **Seed:** Ejecutar el seed para inicializar datos básicos

## Próximos Pasos

1. Actualizar servicios para manejar las nuevas relaciones
2. Actualizar controladores para validar permisos
3. Crear middleware de autorización basado en roles
4. Actualizar frontend para mostrar información de empresa
5. Implementar gestión de roles y permisos en la interfaz
