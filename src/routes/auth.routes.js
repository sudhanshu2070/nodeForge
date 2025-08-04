const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verify-token', authController.verifyToken);
router.post('/verifyOnRefresh', authController.verifyOnRefresh);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/setup-password', authController.setupPassword); // For Google users
router.get('/check-password', authController.checkPasswordStatus); // For Google users

module.exports = router;