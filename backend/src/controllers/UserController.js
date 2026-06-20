const UserRepository = require('../repositories/UserRepository');
const AuditLogService = require('../services/AuditLogService');

class UserController {
  async listUsers(req, res, next) {
    try {
      const { role } = req.query;
      const options = {};
      if (role) {
        options.where = { role };
      }
      const users = await UserRepository.findAll(options);
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered',
          errors: []
        });
      }

      const user = await UserRepository.create({ name, email, password, role });
      
      await AuditLogService.log(
        'User Created', 
        null, 
        req.user.id, 
        `Admin created user ${user.email} with role ${user.role}`
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { name, email, role } = req.body;
      const updated = await UserRepository.update(req.params.id, { name, email, role });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: []
        });
      }

      await AuditLogService.log(
        'User Updated', 
        null, 
        req.user.id, 
        `Admin updated user profile for ${updated.email}`
      );

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const user = await UserRepository.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          errors: []
        });
      }

      await UserRepository.delete(req.params.id);
      
      await AuditLogService.log(
        'User Deleted', 
        null, 
        req.user.id, 
        `Admin soft-deleted user ${user.email}`
      );

      res.status(200).json({
        success: true,
        message: 'User soft-deleted successfully',
        data: {}
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
