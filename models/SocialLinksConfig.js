const { Schema, model, Types } = require('mongoose');

const socialLinksConfigSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: 'Organization', required: true },

    whatsapp_number: { type: String, default: '', trim: true },
    youtube_url: { type: String, default: '', trim: true },
    instagram_url: { type: String, default: '', trim: true },
    facebook_url: { type: String, default: '', trim: true },
    twitter_url: { type: String, default: '', trim: true },
    linkedin_url: { type: String, default: '', trim: true },
    telegram_url: { type: String, default: '', trim: true },
    website_url: { type: String, default: '', trim: true },
    support_email: { type: String, default: '', trim: true },

    isActive: { type: Boolean, default: true },
    createdBy: { type: Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

socialLinksConfigSchema.index({ organizationId: 1 }, { unique: true });

module.exports = model('SocialLinksConfig', socialLinksConfigSchema);

