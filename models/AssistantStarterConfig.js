const { Schema, model, Types } = require('mongoose');

const starterSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const assistantStarterConfigSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },
    starters: { type: [starterSchema], default: [] },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

assistantStarterConfigSchema.index({ organizationId: 1 }, { unique: true });

module.exports = model('AssistantStarterConfig', assistantStarterConfigSchema);
