const axios = require('axios');
const LeadRepository = require('../repositories/LeadRepository');
const UserRepository = require('../repositories/UserRepository');
const AuditLogService = require('./AuditLogService');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

class LeadService {
  /**
   * Creates a lead, executing least-loaded agent assignment if assignedTo is null/undefined.
   */
  async createLead(leadData, creatorId) {
    const t = await sequelize.transaction();

    try {
      let assignedAgentId = leadData.assignedTo || null;
      let logDescription = `Lead created by user ${creatorId}`;

      // Auto-assignment check: if creator did not specify an agent, assign to least loaded agent.
      if (!assignedAgentId) {
        const leastLoadedAgent = await LeadRepository.findLeastLoadedAgent(t);
        if (leastLoadedAgent) {
          assignedAgentId = leastLoadedAgent.id;
          logDescription += ` and automatically assigned to agent ${leastLoadedAgent.name} (least loaded with ${leastLoadedAgent.active_count} active leads)`;
        } else {
          logDescription += ` (remained unassigned, no agent available)`;
        }
      } else {
        const agent = await UserRepository.findById(assignedAgentId);
        if (!agent || agent.role !== 'AGENT') {
          throw new Error('Assigned user must exist and have the AGENT role');
        }
        logDescription += ` and manually assigned to agent ${agent.name}`;
      }

      const newLead = await LeadRepository.create({
        ...leadData,
        assignedTo: assignedAgentId,
        createdBy: creatorId
      }, t);

      // Audit logs within the transaction
      await AuditLogService.log('Lead Created', newLead.id, creatorId, logDescription, t);

      if (assignedAgentId) {
        await AuditLogService.log('Lead Assigned', newLead.id, creatorId, `Lead assigned to agent ${assignedAgentId}`, t);
      }

      await t.commit();
      
      // Fetch fully loaded lead details to return
      return await LeadRepository.findById(newLead.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getLeadById(id, userId, userRole) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Role boundary checks
    if (userRole === 'AGENT' && lead.assignedTo !== userId) {
      throw new Error('Access denied: You are not assigned to this lead');
    }

    return lead;
  }

  async updateLead(id, updateData, userId, userRole) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Agent permission check
    if (userRole === 'AGENT') {
      if (lead.assignedTo !== userId) {
        throw new Error('Access denied: You are not assigned to this lead');
      }

      // Agents are only allowed to update status and notes
      const allowedKeys = ['status', 'notes'];
      const filteredUpdate = {};
      
      for (const key of allowedKeys) {
        if (updateData[key] !== undefined) {
          filteredUpdate[key] = updateData[key];
        }
      }

      if (Object.keys(filteredUpdate).length === 0) {
        throw new Error('Access denied: Agents can only update status and notes');
      }

      const t = await sequelize.transaction();
      try {
        const oldStatus = lead.status;
        const updatedLead = await LeadRepository.update(id, filteredUpdate, t);

        if (filteredUpdate.status && oldStatus !== filteredUpdate.status) {
          await AuditLogService.log('Status Changed', lead.id, userId, `Status changed from '${oldStatus}' to '${filteredUpdate.status}' by assigned agent`, t);
        } else {
          await AuditLogService.log('Lead Updated', lead.id, userId, `Notes updated by agent`, t);
        }

        await t.commit();
        return await LeadRepository.findById(id);
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }

    // Manager / Admin update logic (can update everything)
    const t = await sequelize.transaction();
    try {
      const oldStatus = lead.status;
      const oldAssignedTo = lead.assignedTo;

      // If updating assignedTo, verify it is a valid agent
      if (updateData.assignedTo && updateData.assignedTo !== oldAssignedTo) {
        const agent = await UserRepository.findById(updateData.assignedTo);
        if (!agent || agent.role !== 'AGENT') {
          throw new Error('Assigned user must have the AGENT role');
        }
      }

      const updatedLead = await LeadRepository.update(id, updateData, t);

      // Auditing
      if (updateData.assignedTo && updateData.assignedTo !== oldAssignedTo) {
        await AuditLogService.log('Lead Assigned', lead.id, userId, `Lead reassigned from user ${oldAssignedTo} to ${updateData.assignedTo}`, t);
      }
      if (updateData.status && oldStatus !== updateData.status) {
        await AuditLogService.log('Status Changed', lead.id, userId, `Status updated from '${oldStatus}' to '${updateData.status}'`, t);
      }
      await AuditLogService.log('Lead Updated', lead.id, userId, `Lead profile details updated`, t);

      await t.commit();
      return await LeadRepository.findById(id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async deleteLead(id, userId) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const t = await sequelize.transaction();
    try {
      await LeadRepository.delete(id, t);
      await AuditLogService.log('Lead Deleted', id, userId, `Lead '${lead.name}' soft-deleted`, t);
      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async listLeads(filters = {}, userId, userRole) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    // Standard Filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.source) {
      where.source = filters.source;
    }

    // Search filters (case-insensitive iLike searches)
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
        { phone: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    // Role-based visibility scoping
    if (userRole === 'AGENT') {
      where.assignedTo = userId;
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';

    // Map camelCase fields to snake_case for sequelize query ordering if necessary
    const orderField = sortBy === 'createdAt' ? 'created_at' : sortBy;

    const { count, rows } = await LeadRepository.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderField, sortOrder]]
    });

    return {
      leads: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Connects to external RandomUser API to return candidate data for new leads.
   */
  async suggestLead() {
    const apiUrl = process.env.RANDOMUSER_API || 'https://randomuser.me/api/';
    try {
      const response = await axios.get(apiUrl, { timeout: 5000 });
      if (!response.data || !response.data.results || response.data.results.length === 0) {
        throw new Error('Empty response received from RandomUser API');
      }

      const user = response.data.results[0];
      return {
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        phone: user.phone,
        source: 'RandomUser API Suggestion',
        notes: `Enriched via randomuser.me profile. Gender: ${user.gender}. Country: ${user.location.country}.`
      };
    } catch (error) {
      console.error(`External API Integration Error: ${error.message}`);
      throw new Error(`Failed to retrieve lead suggestion from RandomUser: ${error.message}`);
    }
  }
}

module.exports = new LeadService();
