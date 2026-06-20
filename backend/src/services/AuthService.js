const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const RefreshTokenRepository = require('../repositories/RefreshTokenRepository');
const AuditLogService = require('./AuditLogService');

const ACCESS_SECRET = process.env.JWT_SECRET || 'access_secret_key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRY }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );
  }

  async register({ name, email, password, role }) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email address');
    }

    const newUser = await UserRepository.create({ name, email, password, role });
    
    // Log registration
    await AuditLogService.log('User Registered', null, newUser.id, `User ${newUser.email} registered with role ${newUser.role}`);
    
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days matching REFRESH_EXPIRY
    await RefreshTokenRepository.create(user.id, refreshToken, expiresAt);

    // Log login
    await AuditLogService.log('User Login', null, user.id, `User ${user.email} logged in successfully`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async refresh(token) {
    if (!token) {
      throw new Error('Refresh token is required');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check database
    const tokenRecord = await RefreshTokenRepository.findByToken(token);
    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      if (tokenRecord) {
        await RefreshTokenRepository.deleteByToken(token);
      }
      throw new Error('Refresh token expired or revoked');
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Refresh Token Rotation (RTR): Delete old token, generate new access and refresh tokens
    await RefreshTokenRepository.deleteByToken(token);

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshTokenRepository.create(user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async logout(token) {
    if (!token) return;
    
    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
      // If verification fails but token exists in DB, we still want to clean it up
    }

    await RefreshTokenRepository.deleteByToken(token);

    if (decoded && decoded.id) {
      await AuditLogService.log('User Logout', null, decoded.id, `User logged out and refresh token revoked`);
    }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      return null;
    }
  }
}

module.exports = new AuthService();
