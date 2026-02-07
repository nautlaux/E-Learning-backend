const { Schema, model } = require('mongoose');

const appModuleConfigSchema = new Schema(
  {
    carousel: { type: Boolean, default: true },
    courses: { type: Boolean, default: true },
    continueLearning: { type: Boolean, default: false },
    quizzes: { type: Boolean, default: false },
    freeVideos: { type: Boolean, default: true },
    tools: { type: Boolean, default: true },
    news: { type: Boolean, default: true },
    banners: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Single global config: use a fixed document id so we only ever have one
appModuleConfigSchema.statics.getSingleton = function () {
  return this.findOne().sort({ createdAt: 1 }).lean();
};

module.exports = model('AppModuleConfig', appModuleConfigSchema);
