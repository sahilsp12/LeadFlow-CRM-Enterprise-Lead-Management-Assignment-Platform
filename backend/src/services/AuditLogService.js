const ActivityLogRepository = require('../repositories/ActivityLogRepository');

class AuditLogService {
  async log(action, leadId, userId, description, transaction) {
    try {
      await ActivityLogRepository.create({
        action,
        leadId,
        userId,
        description
      }, transaction);
    } catch (error) {
      // In production, we don't want audit logging failures to roll back the core business transaction,
      // unless strict regulatory auditability is required.
      console.error(`Failed to write activity log: ${error.message}`);
    }
  }

  async getLogs(limit = 100, offset = 0) {
    return ActivityLogRepository.findAll({
      limit,
      offset
    });
  }

  async getLeadLogs(leadId) {
    return ActivityLogRepository.findByLeadId(leadId);
  }
}

module.exports = new AuditLogService();
