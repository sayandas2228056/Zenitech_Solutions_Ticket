const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('=== AUTHENTICATION START ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Auth headers:', {
    authorization: authHeader ? 'present' : 'missing',
    'content-type': req.headers['content-type'] || 'not provided'
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'Authentication token is required',
      error: 'NO_TOKEN'
    });
  }

  try {
    console.log('🔑 Verifying token...');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    if (!decoded) {
      console.log('❌ Token verification failed: No payload');
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    // Get user ID from token in order of preference
    const userId = decoded.userId || decoded._id || decoded.id;
    
    if (!userId) {
      console.log('❌ No user ID found in token:', JSON.stringify(decoded, null, 2));
      return res.status(403).json({
        success: false,
        message: 'Invalid token: missing user ID',
        error: 'INVALID_TOKEN_PAYLOAD'
      });
    }
    
    // Create user object with standardized properties
    const user = {
      ...decoded,
      userId: userId.toString(), // Ensure userId is a string
      role: decoded.role || 'user' // Default to 'user' role if not specified
    };
    
    console.log('✅ Authenticated user:', {
      userId: user.userId,
      role: user.role,
      email: user.email || 'no-email'
    });
    
    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.log('❌ Token verification error:', err.message);
    const isExpired = err.name === 'TokenExpiredError';
    
    return res.status(403).json({
      success: false,
      message: isExpired ? 'Token expired' : 'Invalid token',
      error: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    console.log('=== AUTHENTICATION END ===\n');
  }
};

// Role-based access control middleware
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole
};