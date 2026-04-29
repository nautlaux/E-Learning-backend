const { Schema, model, Types } = require('mongoose');

const scheduleSchema = new Schema(
  {
    // Only "weekly" supported for now (Tue/Thu/Sun etc.), can be extended later.
    type: { type: String, enum: ['weekly'], default: 'weekly' },
    // 0=Sunday ... 6=Saturday
    daysOfWeek: { type: [Number], default: [] },
    // "HH:mm" in the given timezone (e.g., "19:00")
    time: { type: String, default: '19:00', trim: true },
    timezone: { type: String, default: 'Asia/Kolkata', trim: true },
    durationMinutes: { type: Number, default: 60 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { _id: false }
);

const seminarSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    bannerImageUrl: { type: String, default: '', trim: true },
    meetingUrl: { type: String, default: '', trim: true }, // Zoom/Meet/YouTube live etc.

    schedule: { type: scheduleSchema, default: () => ({}) },

    isActive: { type: Boolean, default: true },
    createdBy: { type: Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

seminarSchema.index({ organizationId: 1, isActive: 1, createdAt: -1 });

module.exports = model('Seminar', seminarSchema);

