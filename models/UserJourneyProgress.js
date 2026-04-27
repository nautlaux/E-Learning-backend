const { Schema, model, Types } = require('mongoose');

const stepResultSchema = new Schema(
  {
    stepId: { type: Number, required: true },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userJourneyProgressSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    journeyType: { type: String, enum: ['import', 'export'], required: true, index: true },

    configVersion: { type: Number, default: 1 },
    completedSteps: { type: [Number], default: [] },
    lastActiveStep: { type: Number, default: 1 },
    stepResults: { type: [stepResultSchema], default: [] },
  },
  { timestamps: true }
);

userJourneyProgressSchema.index({ organizationId: 1, userId: 1, journeyType: 1 }, { unique: true });

module.exports = model('UserJourneyProgress', userJourneyProgressSchema);

