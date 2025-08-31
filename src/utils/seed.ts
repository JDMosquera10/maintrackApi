import { UserModel } from '../models/User';
import { MachineModel } from '../models/Machine';
import { MaintenanceModel } from '../models/Maintenance';
import { UserRole, MachineStatus, MaintenanceType } from '../types';
import { AuthService } from '../services/AuthService';
import databaseConnection from '../config/database';

const authService = new AuthService();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Conectar a la base de datos
    await databaseConnection.connect();

    // Limpiar datos existentes
    await UserModel.deleteMany({});
    await MachineModel.deleteMany({});
    await MaintenanceModel.deleteMany({});

    console.log('Cleared existing data');

    // Crear usuarios de prueba
    const users = [
      {
        email: 'admin@engine.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true
      },
      {
        email: 'coordinator@engine.com',
        password: 'coord123',
        firstName: 'Coordinator',
        lastName: 'User',
        role: UserRole.COORDINATOR,
        isActive: true
      },
      {
        email: 'technician@engine.com',
        password: 'tech123',
        firstName: 'Technician',
        lastName: 'User',
        role: UserRole.TECHNICIAN,
        isActive: true
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await authService.hashPassword(userData.password);
      const user = new UserModel({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${userData.email}`);
    }

    // Crear máquinas de prueba
    const machines = [
      {
        model: 'Excavadora CAT 320',
        serialNumber: 'CAT320-001',
        usageHours: 1500,
        client: 'Constructora ABC',
        location: 'Sitio de construcción Norte',
        status: MachineStatus.OPERATIONAL
      },
      {
        model: 'Bulldozer Komatsu D65',
        serialNumber: 'KOMD65-002',
        usageHours: 2200,
        client: 'Constructora XYZ',
        location: 'Sitio de construcción Sur',
        status: MachineStatus.OPERATIONAL
      },
      {
        model: 'Cargador frontal Volvo L120',
        serialNumber: 'VOLL120-003',
        usageHours: 800,
        client: 'Minería Delta',
        location: 'Mina principal',
        status: MachineStatus.MAINTENANCE
      }
    ];

    const createdMachines = [];
    for (const machineData of machines) {
      const machine = new MachineModel(machineData);
      await machine.save();
      createdMachines.push(machine);
      console.log(`Created machine: ${machineData.model}`);
    }

    // Crear mantenimientos de prueba
    const maintenances = [
      {
        machineId: createdMachines[0]._id,
        date: new Date(),
        type: MaintenanceType.PREVENTIVE,
        spareParts: ['Filtro de aceite', 'Filtro de aire'],
        technicianId: createdUsers[2]._id, // Técnico
        isCompleted: false
      },
      {
        machineId: createdMachines[1]._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
        type: MaintenanceType.CORRECTIVE,
        spareParts: ['Bomba hidráulica', 'Mangueras'],
        technicianId: createdUsers[2]._id,
        workHours: 8,
        observations: 'Cambio de bomba hidráulica completado exitosamente',
        isCompleted: true,
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        machineId: createdMachines[2]._id,
        date: new Date(),
        type: MaintenanceType.PREVENTIVE,
        spareParts: ['Filtros', 'Aceite hidráulico'],
        technicianId: createdUsers[2]._id,
        isCompleted: false
      }
    ];

    for (const maintenanceData of maintenances) {
      const maintenance = new MaintenanceModel(maintenanceData);
      await maintenance.save();
      console.log(`Created maintenance for machine: ${maintenanceData.machineId}`);
    }

    console.log('Database seeding completed successfully!');
    console.log('Test Data Summary:');
    console.log(` Users: ${createdUsers.length}`);
    console.log(`Machines: ${createdMachines.length}`);
    console.log(`Maintenances: ${maintenances.length}`);
    console.log('Test Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Coordinator: coordinator@example.com / coord123');
    console.log('Technician: technician@example.com / tech123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await databaseConnection.disconnect();
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 