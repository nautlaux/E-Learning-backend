const { Schema, model, Types } = require('mongoose');

const lessonSchema = new Schema(
  {
    courseId: { type: Types.ObjectId, ref: 'Course', required: true, index: true },
    chapterId: { type: Types.ObjectId, ref: 'Chapter', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['VIDEO', 'PDF'], required: true },
    contentUrl: { type: String, required: true },
    order: { type: Number, required: true }, // order within chapter
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, chapterId: 1, order: 1 });

module.exports = model('Lesson', lessonSchema);
