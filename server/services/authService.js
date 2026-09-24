const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signup = async (username, password) => {
  if (!username?.trim() || !password) {
    const error = new Error('Username and password are required');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ username: username.trim() });
  if (existingUser) {
    const error = new Error('Username already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username: username.trim(), password: hashedPassword });
};

const login = async (username, password) => {
  if (!username?.trim() || !password) {
    const error = new Error('Username and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ username: username.trim() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, username: user.username };
};

module.exports = { signup, login };
