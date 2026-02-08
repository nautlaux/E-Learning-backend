const express = require('express');
const { authWithOtp, verifyOtp, refreshToken } = require('../controllers/authController');

const router = express.Router();

router.post('/', authWithOtp); // unified auth (send OTP)
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refreshToken); // exchange expired/valid token for new token

module.exports = router;

