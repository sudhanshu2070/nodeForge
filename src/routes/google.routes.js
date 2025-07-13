const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleController = require('../controllers/google.controller');

// router.get('/google', googleController.googleAuth);
router.get('/google', (req, res, next) => {
  console.log('🌐 /google route hit');
  next();
}, googleController.googleAuth);

router.get('/google/callback', 
    (req, res, next) => {
    console.log('📦 /google/callback route hit');
    next();
  },
  passport.authenticate('google', { session: false }),
  googleController.googleCallback
);

module.exports = router;