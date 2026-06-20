const sequelize = require('../config/database');
const User = require('./User');
const Lead = require('./Lead');
const RefreshToken = require('./RefreshToken');
const ActivityLog = require('./ActivityLog');

// Relationships

// Refresh Tokens
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Leads - Agent Assignment
User.hasMany(Lead, { foreignKey: 'assignedTo', as: 'assignedLeads', onDelete: 'SET NULL' });
Lead.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedAgent' });

// Leads - Creator
User.hasMany(Lead, { foreignKey: 'createdBy', as: 'createdLeads', onDelete: 'CASCADE' });
Lead.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Activity Logs - User
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs', onDelete: 'SET NULL' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Activity Logs - Lead
Lead.hasMany(ActivityLog, { foreignKey: 'leadId', as: 'activityLogs', onDelete: 'CASCADE' });
ActivityLog.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

module.exports = {
  sequelize,
  User,
  Lead,
  RefreshToken,
  ActivityLog
};
