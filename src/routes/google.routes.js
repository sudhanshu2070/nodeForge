const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleController = require('../controllers/google.controller');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleController.googleCallback
);

module.exports = router;