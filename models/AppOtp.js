const { Schema, model } = require('mongoose');

const appOtpSchema = new Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model('AppOtp', appOtpSchema);