const https = require('https');

const { ExchangeRateCache } = require('../models');

const EXCHANGE_RATE_API_KEY =
  process.env.EXCHANGE_RATE_API_KEY || '0e68e791dfe80a5637280ec3';

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw || '{}');
            resolve({ statusCode: res.statusCode || 0, data: parsed });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });

// GET /api/dashboard/exchange-rates?base=INR
const getExchangeRates = async (req, res) => {
  try {
    const base = String(req.query.base || 'INR').trim().toUpperCase();
    const nowUnix = Math.floor(Date.now() / 1000);

    const cached = await ExchangeRateCache.findOne({ base_code: base })
      .sort({ time_last_update_unix: -1, createdAt: -1 })
      .lean();

    const canUseCache =
      cached &&
      typeof cached.time_next_update_unix === 'number' &&
      cached.time_next_update_unix > 0 &&
      nowUnix < cached.time_next_update_unix;

      const cachedDataToReturn = {
        result: cached.result,
        base_code: cached.base_code,
        conversion_rates: cached.conversion_rates,
      };

    if (canUseCache) {
      return res.json({ source: 'cache', data: cachedDataToReturn });
    }

    const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${encodeURIComponent(base)}`;
    const { statusCode, data } = await fetchJson(url);

    if (statusCode < 200 || statusCode >= 300 || !data || data.result !== 'success') {
      if (cached) return res.json({ source: 'cache', data: cached });
      return res.status(502).json({ message: 'Failed to fetch exchange rates' });
    }

    const toStore = {
      base_code: data.base_code || base,
      result: data.result || '',
      documentation: data.documentation || '',
      terms_of_use: data.terms_of_use || '',
      time_last_update_unix: Number(data.time_last_update_unix || 0),
      time_last_update_utc: String(data.time_last_update_utc || ''),
      time_next_update_unix: Number(data.time_next_update_unix || 0),
      time_next_update_utc: String(data.time_next_update_utc || ''),
      conversion_rates: data.conversion_rates || {},
      fetchedAt: new Date(),
    };

    const saved = await ExchangeRateCache.findOneAndUpdate(
      { base_code: toStore.base_code },
      { $set: toStore },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    const dataToReturn = {
      result: saved.result,
      base_code: saved.base_code,
      conversion_rates: saved.conversion_rates,
    };

    return res.json({ source: 'live', data: dataToReturn });
  } catch (err) {
    console.error('getExchangeRates error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getExchangeRates };

