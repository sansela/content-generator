const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');
const UserStore = require('../utils/userStore');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (UserStore.getUser(email)) {
        return res.status(400).json({
          message: 'User already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      const user = {
        username,
        email,
        password: hashedPassword,
        role: 'user'
      };

      UserStore.addUser(user);

      res.status(201).json({
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Error occurred while registering user'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = UserStore.getUser(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const token = jwt.sign({ email: user.email }, config.secret, {
        expiresIn: config.jwtExpiration
      });

      res.json({
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken: token
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Error occurred while logging in'
      });
    }
  }
}

module.exports = new AuthController(); 