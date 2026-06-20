const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('CRITICAL: DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
// Only enable SSL if explicitly requested via environment variable DB_SSL=true
const dbSsl = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: isProduction ? false : console.log,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: dbSsl ? {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necessary for hosted DBs like Supabase/Render
    }
  } : {}
});

module.exports = sequelize;
