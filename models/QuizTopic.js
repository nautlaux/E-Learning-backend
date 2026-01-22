const { Schema, model, Types } = require('mongoose');

const quizTopicSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

quizTopicSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = model('QuizTopic', quizTopicSchema);

