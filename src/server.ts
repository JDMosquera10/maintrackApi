import App from './app';

const app = new App();

// Manejar señales de terminación
process.on('SIGINT', async () => {
  console.log(' Received SIGINT. Graceful shutdown...');
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log(' Received SIGTERM. Graceful shutdown...');
  await app.stop();
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Iniciar la aplicación
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 