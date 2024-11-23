const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const UserStore = require('../utils/userStore');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.secret);
    const user = UserStore.getUser(decoded.email);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
    return;
  }
  res.status(403).json({ message: 'Require Admin Role!' });
}; 