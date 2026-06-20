const { RefreshToken } = require('../models');
const { Op } = require('sequelize');

class RefreshTokenRepository {
  async create(userId, token, expiresAt) {
    return RefreshToken.create({
      userId,
      token,
      expiresAt
    });
  }

  async findByToken(token) {
    return RefreshToken.findOne({
      where: { token }
    });
  }

  async deleteByToken(token) {
    return RefreshToken.destroy({
      where: { token }
    });
  }

  async deleteByUserId(userId) {
    return RefreshToken.destroy({
      where: { userId }
    });
  }

  async deleteExpired() {
    return RefreshToken.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
  }
}

module.exports = new RefreshTokenRepository();
