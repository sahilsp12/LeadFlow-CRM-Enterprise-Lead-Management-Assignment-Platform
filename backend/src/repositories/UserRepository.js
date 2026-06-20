const { User } = require('../models');

class UserRepository {
  async findById(id) {
    return User.findByPk(id);
  }

  async findByEmail(email) {
    return User.findOne({
      where: { email }
    });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(updateData);
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.destroy(); // Soft delete because paranoid: true is enabled
  }

  async findAll(options = {}) {
    return User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      ...options
    });
  }
}

module.exports = new UserRepository();
