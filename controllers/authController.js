const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Unified auth: accepts mobile and role; returns whether user exists and sends static OTP 1234
const authWithOtp = async (req, res) => {
  try {
    const { mobile, role = 'USER'} = req.body;
    if (!mobile) {
      return res.status(400).json({ message: 'mobile is required' });
    }

    let user = await User.findOne({ mobile, role });
    const exists = !!user;

    return res.json({
      message: 'OTP sent',
      userExists: exists,
      userId: user ? user._id : null,
      // pendingUser: !exists ? { name, email, role, mobile, organizationId } : undefined,
    });
  } catch (err) {
    console.error('authentication error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify OTP: accepts mobile+role or userId, static otp 1234
const verifyOtp = async (req, res) => {
  try {
    const { mobile, role = 'USER', userId, otp, name = '', email = '', organizationId = null } = req.body;
    if (!otp) return res.status(400).json({ message: 'otp is required' });
    if (otp !== '1234') return res.status(400).json({ message: 'Invalid OTP' });

    const query = userId ? { _id: userId } : { mobile, role };
    let user = await User.findOne(query);

    if (!user) {
      // Create user after successful OTP verification; include email only when provided
      const payload = { name, role, mobile, organizationId };
      if (email && email.trim()) {
        payload.email = email;
      }
      user = await User.create(payload);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    return res.json({ message: 'OTP verified', user, token });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  authWithOtp,
  verifyOtp,
};

