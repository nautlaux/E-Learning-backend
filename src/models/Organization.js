const { Schema, model } = require('mongoose');

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

module.exports = model('Organization', organizationSchema);

