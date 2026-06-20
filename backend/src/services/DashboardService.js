const { Lead, ActivityLog, User } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class DashboardService {
  async getDashboardStats(userId, userRole) {
    // We provide a mock structure for Redis Caching.
    // In a fully-caching setup, we would read a stringified JSON key like: 'dashboard_stats:' + userId
    // if cache exists, return JSON.parse(cache);
    
    const scopeWhere = {};
    if (userRole === 'AGENT') {
      scopeWhere.assignedTo = userId;
    }

    // 1. Total Leads count
    const totalLeads = await Lead.count({ where: scopeWhere });

    // 2. Leads count by Status
    const statusBreakdownRaw = await Lead.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: scopeWhere,
      group: ['status'],
      raw: true
    });
    
    // Format breakdown nicely with defaults
    const statusBreakdown = { New: 0, Contacted: 0, Qualified: 0, Lost: 0, Closed: 0 };
    statusBreakdownRaw.forEach(item => {
      statusBreakdown[item.status] = parseInt(item.count, 10);
    });

    // 3. Leads count by Source
    const sourceBreakdownRaw = await Lead.findAll({
      attributes: ['source', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: scopeWhere,
      group: ['source'],
      raw: true
    });
    const sourceBreakdown = {};
    sourceBreakdownRaw.forEach(item => {
      sourceBreakdown[item.source] = parseInt(item.count, 10);
    });

    // 4. Recent Activities
    let activitiesWhere = {};
    if (userRole === 'AGENT') {
      // Fetch activity logs linked to leads assigned to the Agent
      const agentLeads = await Lead.findAll({
        attributes: ['id'],
        where: { assignedTo: userId },
        raw: true
      });
      const leadIds = agentLeads.map(l => l.id);
      activitiesWhere = {
        [Op.or]: [
          { leadId: { [Op.in]: leadIds } },
          { userId } // Actions they took
        ]
      };
    }

    const recentActivities = await ActivityLog.findAll({
      where: activitiesWhere,
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'role'] },
        { model: Lead, as: 'lead', attributes: ['id', 'name', 'status'], paranoid: false }
      ]
    });

    // 5. Agent Lead Load Ranking (Only for Admin/Manager dashboard view)
    let agentLoads = [];
    if (userRole !== 'AGENT') {
      // Find all agents and their active lead counts
      const agentLoadsRaw = await User.findAll({
        where: { role: 'AGENT' },
        attributes: ['id', 'name', 'email'],
        include: [{
          model: Lead,
          as: 'assignedLeads',
          attributes: ['id'],
          where: { status: { [Op.notIn]: ['Lost', 'Closed'] } },
          required: false
        }],
        order: [['name', 'ASC']]
      });

      agentLoads = agentLoadsRaw.map(agent => ({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        activeLeadsCount: agent.assignedLeads ? agent.assignedLeads.length : 0
      }));
    }

    const stats = {
      totalLeads,
      statusBreakdown,
      sourceBreakdown,
      recentActivities,
      agentLoads
    };

    // Cache saving structure mock:
    // await redis.set('dashboard_stats:' + userId, JSON.stringify(stats), 'EX', 300); // cache for 5 minutes

    return stats;
  }
}

module.exports = new DashboardService();
