const { Schema, model, Types } = require('mongoose');

const seminarRegistrationSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    seminarId: { type: Types.ObjectId, ref: 'Seminar', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    // Snapshot fields for easy export/reporting
    name: { type: String, default: '', trim: true },
    mobile: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    interestedIn: { type: String, enum: ['import', 'export', ''], default: '' },

    status: { type: String, enum: ['REGISTERED', 'CANCELLED'], default: 'REGISTERED' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

seminarRegistrationSchema.index({ organizationId: 1, seminarId: 1, userId: 1 }, { unique: true });
seminarRegistrationSchema.index({ organizationId: 1, seminarId: 1, registeredAt: -1 });

module.exports = model('SeminarRegistration', seminarRegistrationSchema);

