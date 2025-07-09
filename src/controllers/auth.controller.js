const authService = require('../services/auth.service');

exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register(email, password, name);
    res.status(201).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.cookie('jwt', token, { httpOnly: true });
    res.json({ status: 'success', token });
  } catch (err) {
    next(err);
  }
};