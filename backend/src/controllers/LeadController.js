const LeadService = require('../services/LeadService');

class LeadController {
  async createLead(req, res, next) {
    try {
      const lead = await LeadService.createLead(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: { lead }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }

  async getLeadById(req, res, next) {
    try {
      const lead = await LeadService.getLeadById(req.params.id, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        message: 'Lead retrieved successfully',
        data: { lead }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }

  async updateLead(req, res, next) {
    try {
      const lead = await LeadService.updateLead(req.params.id, req.body, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: { lead }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }

  async deleteLead(req, res, next) {
    try {
      await LeadService.deleteLead(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Lead soft-deleted successfully',
        data: {}
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }

  async listLeads(req, res, next) {
    try {
      const { page, limit, search, status, source, sortBy, sortOrder } = req.query;
      const result = await LeadService.listLeads(
        { page, limit, search, status, source, sortBy, sortOrder },
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: 'Leads retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async suggestLead(req, res, next) {
    try {
      const suggestion = await LeadService.suggestLead();
      res.status(200).json({
        success: true,
        message: 'Random lead suggestion fetched successfully',
        data: { suggestion }
      });
    } catch (error) {
      res.status(502).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }
}

module.exports = new LeadController();
