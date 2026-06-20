const AuditLogService = require('../services/AuditLogService');
const LeadRepository = require('../repositories/LeadRepository');

class LogController {
  async listLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = parseInt(req.query.offset, 10) || 0;
      
      const logs = await AuditLogService.getLogs(limit, offset);
      res.status(200).json({
        success: true,
        message: 'System logs retrieved successfully',
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }

  async listLeadLogs(req, res, next) {
    try {
      const lead = await LeadRepository.findById(req.params.leadId);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found',
          errors: []
        });
      }

      // Enforce data boundary: agents can only inspect logs for their own assigned leads
      if (req.user.role === 'AGENT' && lead.assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this lead',
          errors: []
        });
      }

      const logs = await AuditLogService.getLeadLogs(req.params.leadId);
      res.status(200).json({
        success: true,
        message: 'Lead activity logs retrieved successfully',
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LogController();
