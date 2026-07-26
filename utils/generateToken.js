const jwt = require('jsonwebtoken');

/**
 * Generate Access and Refresh tokens and set them as HTTP-only cookies
 */
const generateToken = (res, userId) => {
  // Short-lived access token (e.g., 15 minutes)
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  // Long-lived refresh token (e.g., 30 days)
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set Access Token as HTTP-Only cookie
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set Refresh Token as HTTP-Only cookie
  res.cookie('jwt_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh', // only sent to refresh endpoint
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return { accessToken, refreshToken };
};

module.exports = generateToken;
