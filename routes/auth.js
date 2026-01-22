const express = require('express');
const { authWithOtp, verifyOtp } = require('../controllers/authController');

const router = express.Router();

router.post('/', authWithOtp); // unified auth (send OTP)
router.post('/verify-otp', verifyOtp);

module.exports = router;

