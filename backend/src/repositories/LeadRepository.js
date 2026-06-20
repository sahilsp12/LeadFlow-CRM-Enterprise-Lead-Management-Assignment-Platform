const { Lead, User } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class LeadRepository {
  async findById(id, options = {}) {
    return Lead.findByPk(id, {
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      ...options
    });
  }

  async create(leadData, transaction) {
    return Lead.create(leadData, { transaction });
  }

  async update(id, updateData, transaction) {
    const lead = await Lead.findByPk(id, { transaction });
    if (!lead) return null;
    return lead.update(updateData, { transaction });
  }

  async delete(id, transaction) {
    const lead = await Lead.findByPk(id, { transaction });
    if (!lead) return null;
    return lead.destroy({ transaction }); // Soft delete
  }

  async findAndCountAll(options = {}) {
    return Lead.findAndCountAll({
      include: [
        { model: User, as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      ...options
    });
  }

  /**
   * Finds the agent with the lowest number of active leads.
   * Active leads are leads with status NOT in ('Lost', 'Closed') and not deleted.
   * Lock the returned user row to prevent race conditions during concurrent assignments.
   */
  async findLeastLoadedAgent(transaction) {
    // 1. Query all agents and their active lead counts (no FOR UPDATE lock here, so GROUP BY is allowed)
    const selectAgentsQuery = `
      SELECT u.id, u.name, COUNT(l.id) AS active_count
      FROM users u
      LEFT JOIN leads l ON u.id = l.assigned_to 
        AND l.status NOT IN ('Lost', 'Closed') 
        AND l.deleted_at IS NULL
      WHERE u.role = 'AGENT' AND u.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY active_count ASC, u.created_at ASC
    `;

    const agents = await sequelize.query(selectAgentsQuery, {
      type: sequelize.QueryTypes.SELECT,
      transaction
    });

    if (!agents || agents.length === 0) {
      return null;
    }

    // 2. Loop through the agents (least loaded first) and try to lock their row.
    // If an agent is already locked by another transaction, SKIP LOCKED will skip them, 
    // and we will lock the next least loaded agent.
    for (const agent of agents) {
      const lockAgentQuery = `
        SELECT id, name FROM users 
        WHERE id = :agentId AND deleted_at IS NULL
        FOR UPDATE SKIP LOCKED
      `;

      const lockResults = await sequelize.query(lockAgentQuery, {
        replacements: { agentId: agent.id },
        type: sequelize.QueryTypes.SELECT,
        transaction
      });

      if (lockResults && lockResults.length > 0) {
        // We successfully locked this agent's row. Return their info to be assigned.
        return {
          id: lockResults[0].id,
          name: lockResults[0].name,
          active_count: agent.active_count
        };
      }
    }

    // Fallback: If all agent rows were locked (highly concurrent), return the first agent in the load list.
    return agents[0];
  }
}

module.exports = new LeadRepository();
