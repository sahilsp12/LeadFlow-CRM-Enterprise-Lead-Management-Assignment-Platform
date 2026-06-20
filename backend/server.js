require('dotenv').config();
const app = require('./src/app');
const { sequelize, User } = require('./src/models');

const PORT = process.env.PORT || 5000;

// Database Connection & Synchronization
async function startServer() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database tables (creates tables if they do not exist)
    // In production, database migrations are preferred. For this setup, sync is stable and instant.
    await sequelize.sync({ force: false });
    console.log('Database models synchronized successfully.');

    // Seed database with initial Admin, Manager, and Agent if table is empty
    await seedDemoData();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Server is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Swagger Docs: http://localhost:${PORT}/api/docs`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('CRITICAL: Unable to start the server due to database connectivity failure:', error);
    process.exit(1);
  }
}

async function seedDemoData() {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Database is empty. Seeding demo users...');

      await User.create({
        name: 'System Admin',
        email: 'admin@waanee.ai',
        password: 'admin123',
        role: 'ADMIN'
      });

      await User.create({
        name: 'Sales Manager',
        email: 'manager@waanee.ai',
        password: 'manager123',
        role: 'MANAGER'
      });

      await User.create({
        name: 'Sales Agent 1',
        email: 'agent@waanee.ai',
        password: 'agent123',
        role: 'AGENT'
      });

      console.log('Demo users seeded successfully!');
      console.log('Credentials:');
      console.log(' - Admin: admin@waanee.ai / admin123');
      console.log(' - Manager: manager@waanee.ai / manager123');
      console.log(' - Agent: agent@waanee.ai / agent123');
    }
  } catch (err) {
    console.error('Failed to seed demo users:', err);
  }
}

// Start execution
startServer();
