const sequelize = require('../src/config/database');

afterAll(async () => {
  await sequelize.close();
});