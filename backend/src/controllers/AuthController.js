const AuthService = require('../services/AuthService');

// Custom helper to parse cookies manually from the headers
function getCookie(req, name) {
  const rc = req.headers.cookie;
  if (!rc) return null;
  const cookies = rc.split(';').reduce((acc, cookie) => {
    const parts = cookie.split('=');
    acc[parts.shift().trim()] = decodeURI(parts.join('='));
    return acc;
  }, {});
  return cookies[name] || null;
}

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const user = await AuthService.register({ name, email, password, role });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(email, password);

      // Set Refresh Token as HTTP-Only Cookie for security against XSS
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //https
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken,
          refreshToken // Sent as fallback for clients not using cookies
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }

  async refresh(req, res, next) {
    try {
      // Look up refresh token in cookie first, then fallback to request body
      const token = getCookie(req, 'refreshToken') || req.body.refreshToken;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is missing',
          errors: []
        });
      }

      const { accessToken, refreshToken, user } = await AuthService.refresh(token);

      // Reset rotated refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        errors: []
      });
    }
  }

  async logout(req, res, next) {
    try {
      const token = getCookie(req, 'refreshToken') || req.body.refreshToken;
      
      if (token) {
        await AuthService.logout(token);
      }

      // Clear the cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: {}
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
