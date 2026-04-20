const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const exchangeRateCacheSchema = new Schema(
  {
    base_code: { type: String, required: true, trim: true, uppercase: true, index: true },

    result: { type: String, default: '' },
    documentation: { type: String, default: '' },
    terms_of_use: { type: String, default: '' },

    time_last_update_unix: { type: Number, default: 0 },
    time_last_update_utc: { type: String, default: '' },
    time_next_update_unix: { type: Number, default: 0 },
    time_next_update_utc: { type: String, default: '' },

    conversion_rates: { type: Schema.Types.Mixed, default: {} },

    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

exchangeRateCacheSchema.index({ base_code: 1, time_last_update_unix: -1 });

module.exports = model('ExchangeRateCache', exchangeRateCacheSchema);

