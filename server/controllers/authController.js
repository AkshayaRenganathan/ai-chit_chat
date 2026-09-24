const authService = require('../services/authService');

const signup = async (req, res, next) => {
  try {
    await authService.signup(req.body.username, req.body.password);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.username, req.body.password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
