const mongoose = require('mongoose');
const { Schema } = mongoose;

const analyticsMetaSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.AnalyticsMeta || mongoose.model('AnalyticsMeta', analyticsMetaSchema);

