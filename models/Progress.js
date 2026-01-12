const { Schema, model, Types } = require('mongoose');

const progressSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: Types.ObjectId, ref: 'Lesson', default: [] }],
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = model('Progress', progressSchema);

