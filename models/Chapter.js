const { Schema, model, Types } = require('mongoose');

const chapterSchema = new Schema(
  {
    courseId: { type: Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 1 },
    createdBy: { type: Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

chapterSchema.index({ courseId: 1, order: 1 });

module.exports = model('Chapter', chapterSchema);
