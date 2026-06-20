const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Web'
  },
  status: {
    type: DataTypes.ENUM('New', 'Contacted', 'Qualified', 'Lost', 'Closed'),
    allowNull: false,
    defaultValue: 'New'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_to',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  timestamps: true,
  paranoid: true, // Enables soft delete (deletedAt column)
  underscored: true,
  tableName: 'leads',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['source']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    },
    {
      name: 'idx_leads_assigned_status',
      fields: ['assigned_to', 'status'],
      where: {
        deleted_at: null
      }
    }
  ]
});

module.exports = Lead;
