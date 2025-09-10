import { CompanyModel } from '../models/Company';
import { PermissionModel } from '../models/Permission';
import { RoleModel } from '../models/Role';

export const seedRolesAndPermissions = async () => {
  try {
    // Crear permisos básicos
    const permissions = [
      // Permisos para máquinas
      { name: 'machines.create', description: 'Crear máquinas', resource: 'machines', action: 'create' },
      { name: 'machines.read', description: 'Ver máquinas', resource: 'machines', action: 'read' },
      { name: 'machines.update', description: 'Actualizar máquinas', resource: 'machines', action: 'update' },
      { name: 'machines.delete', description: 'Eliminar máquinas', resource: 'machines', action: 'delete' },

      // Permisos para mantenimientos
      { name: 'maintenances.create', description: 'Crear mantenimientos', resource: 'maintenances', action: 'create' },
      { name: 'maintenances.read', description: 'Ver mantenimientos', resource: 'maintenances', action: 'read' },
      { name: 'maintenances.update', description: 'Actualizar mantenimientos', resource: 'maintenances', action: 'update' },
      { name: 'maintenances.delete', description: 'Eliminar mantenimientos', resource: 'maintenances', action: 'delete' },

      // Permisos para usuarios
      { name: 'users.create', description: 'Crear usuarios', resource: 'users', action: 'create' },
      { name: 'users.read', description: 'Ver usuarios', resource: 'users', action: 'read' },
      { name: 'users.update', description: 'Actualizar usuarios', resource: 'users', action: 'update' },
      { name: 'users.delete', description: 'Eliminar usuarios', resource: 'users', action: 'delete' },

      // Permisos para roles
      { name: 'roles.create', description: 'Crear roles', resource: 'roles', action: 'create' },
      { name: 'roles.read', description: 'Ver roles', resource: 'roles', action: 'read' },
      { name: 'roles.update', description: 'Actualizar roles', resource: 'roles', action: 'update' },
      { name: 'roles.delete', description: 'Eliminar roles', resource: 'roles', action: 'delete' },

      // Permisos para empresas
      { name: 'companies.create', description: 'Crear empresas', resource: 'companies', action: 'create' },
      { name: 'companies.read', description: 'Ver empresas', resource: 'companies', action: 'read' },
      { name: 'companies.update', description: 'Actualizar empresas', resource: 'companies', action: 'update' },
      { name: 'companies.delete', description: 'Eliminar empresas', resource: 'companies', action: 'delete' },

      // Permisos para dashboard
      { name: 'dashboard.read', description: 'Ver dashboard', resource: 'dashboard', action: 'read' },

      // Permisos para reportes
      { name: 'reports.read', description: 'Ver reportes', resource: 'reports', action: 'read' },
    ];

    // Crear permisos si no existen
    for (const permission of permissions) {
      await PermissionModel.findOneAndUpdate(
        { name: permission.name },
        permission,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Permisos creados/actualizados');

    // Obtener todos los permisos para asignarlos a los roles
    const allPermissions = await PermissionModel.find({ isActive: true });

    // Crear roles con sus permisos correspondientes
    const roles = [
      {
        name: 'Admin',
        description: 'Administrador del sistema con acceso completo',
        permissions: allPermissions.map(p => p._id)
      },
      {
        name: 'Supervisor',
        description: 'Supervisor con acceso a gestión y reportes',
        permissions: allPermissions
          .filter(p =>
            p.resource === 'machines' ||
            p.resource === 'maintenances' ||
            p.resource === 'users' ||
            p.resource === 'dashboard' ||
            p.resource === 'reports'
          )
          .map(p => p._id)
      },
      {
        name: 'Operador',
        description: 'Operador con acceso a máquinas y mantenimientos',
        permissions: allPermissions
          .filter(p =>
            (p.resource === 'machines' && p.action !== 'delete') ||
            (p.resource === 'maintenances' && p.action !== 'delete') ||
            p.resource === 'dashboard'
          )
          .map(p => p._id)
      },
      {
        name: 'Cliente',
        description: 'Cliente con acceso de solo lectura',
        permissions: allPermissions
          .filter(p =>
            p.action === 'read' &&
            (p.resource === 'machines' || p.resource === 'maintenances' || p.resource === 'dashboard')
          )
          .map(p => p._id)
      }
    ];

    // Crear roles si no existen
    for (const role of roles) {
      await RoleModel.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Roles creados/actualizados');

    // Crear empresa por defecto
    const defaultCompany = await CompanyModel.findOneAndUpdate(
      { name: 'Empresa Principal' },
      {
        name: 'Empresa Principal',
        description: 'Empresa principal del sistema',
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Empresa por defecto creada/actualizada');

    return {
      permissions: allPermissions,
      roles: await RoleModel.find({ isActive: true }),
      defaultCompany
    };

  } catch (error) {
    console.error('❌ Error al crear roles y permisos:', error);
    throw error;
  }
};
