const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleController = require('../controllers/google.controller');

// router.get('/google', googleController.googleAuth);
router.get('/google', (req, res, next) => {
  next();
}, googleController.googleAuth);

router.get('/google/callback', 
    (req, res, next) => {
    next();
  },
  passport.authenticate('google', { session: false }),
  googleController.googleCallback
);

module.exports = router;