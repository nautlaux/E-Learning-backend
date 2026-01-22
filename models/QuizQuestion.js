const { Schema, model, Types } = require('mongoose');

const optionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const quizQuestionSchema = new Schema(
  {
    topicId: { type: Types.ObjectId, ref: 'QuizTopic', required: true, index: true },
    prompt: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      validate: [(opts) => Array.isArray(opts) && opts.length >= 4, 'At least 4 options required'],
      required: true,
    },
    correctOptionIndex: { type: Number, required: true },
    order: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quizQuestionSchema.index({ topicId: 1, order: 1 });

module.exports = model('QuizQuestion', quizQuestionSchema);

