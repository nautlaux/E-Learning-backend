const { Schema, model, Types } = require('mongoose');

const questionSchema = new Schema(
  {
    id: { type: Number, required: true },
    questionText: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correctAnswerIndex: { type: Number, required: true },
  },
  { _id: false }
);

const stepSchema = new Schema(
  {
    stepId: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    isPremium: { type: Boolean, default: false },
    questions: { type: [questionSchema], default: [] },
  },
  { _id: false }
);

const journeyConfigSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true, index: true },
    journeyType: { type: String, enum: ['import', 'export'], required: true, index: true },
    version: { type: Number, default: 1 },
    steps: { type: [stepSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

journeyConfigSchema.index({ organizationId: 1, journeyType: 1 }, { unique: true });

module.exports = model('JourneyConfig', journeyConfigSchema);

