const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
async function disconnect() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnect();
});

process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnect();
  process.exit(0);
});

module.exports = {
  prisma,
  testConnection,
  disconnect
}; 