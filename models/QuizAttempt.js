const { Schema, model, Types } = require('mongoose');

const answerSchema = new Schema(
  {
    questionId: { type: Types.ObjectId, ref: 'QuizQuestion', required: true },
    selectedOptionIndex: { type: Number, required: true },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    topicId: { type: Types.ObjectId, ref: 'QuizTopic', required: true },
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED'], default: 'IN_PROGRESS' },
    currentQuestionIndex: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
    restartedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = model('QuizAttempt', quizAttemptSchema);

