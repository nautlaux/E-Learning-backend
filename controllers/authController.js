const { User } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '30d';

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
    const {
      mobile,
      role = 'USER',
      userId,
      otp,
      name = '',
      email = '',
      organizationId = null,
      fcm_token,
    } = req.body;
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
      if (fcm_token && typeof fcm_token === 'string' && fcm_token.trim()) {
        payload.fcmToken = fcm_token.trim();
      }
      user = await User.create(payload);
    } else if (fcm_token && typeof fcm_token === 'string' && fcm_token.trim()) {
      // Update existing user's FCM token
      const cleanedToken = fcm_token.trim();
      if (user.fcmToken !== cleanedToken) {
        user.fcmToken = cleanedToken;
        await user.save();
      }
    }

    // Generate JWT token (expiry from env: JWT_EXPIRY, e.g. 15m, 1h, 7d)
    const token = jwt.sign(
      { userId: user._id, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.json({ message: 'OTP verified', user, token });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/** Refresh token: accepts expired or valid access token, returns new token. Frontend calls after TOKEN_EXPIRED. */
const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenFromHeader || req.body?.token;

    if (!token) {
      return res.status(401).json({ success: false, code: 'NO_TOKEN', message: 'No token provided or invalid format' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    } catch (err) {
      return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return res.status(401).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const newToken = jwt.sign(
      { userId: user._id, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.json({ success: true, token: newToken, user });
  } catch (err) {
    console.error('refreshToken error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  authWithOtp,
  verifyOtp,
  refreshToken,
};

