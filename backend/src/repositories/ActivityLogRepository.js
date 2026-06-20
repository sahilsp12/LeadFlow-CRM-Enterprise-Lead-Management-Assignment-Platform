const { ActivityLog, User, Lead } = require('../models');

class ActivityLogRepository {
  async create(logData, transaction) {
    return ActivityLog.create(logData, { transaction });
  }

  async findAll(options = {}) {
    return ActivityLog.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: Lead, as: 'lead', attributes: ['id', 'name', 'status'], paranoid: false } // Include soft-deleted leads
      ],
      order: [['created_at', 'DESC']],
      ...options
    });
  }

  async findByLeadId(leadId) {
    return ActivityLog.findAll({
      where: { leadId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });
  }
}

module.exports = new ActivityLogRepository();
