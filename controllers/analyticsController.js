const { AnalyticsClick, AnalyticsLogEvent, AnalyticsInstall } = require('../analytics');

const GRID_SIZE_DEFAULT = 10;

// POST /api/analytics/clicks
const recordClicks = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.body.organizationId;
    if (!organizationId) {
      return res.status(400).json({ message: 'organizationId required' });
    }

    const userId = req.user?.userId || req.body.userId || null;
    const events = req.body.events
      ? req.body.events
      : req.body.screenName != null
        ? [req.body]
        : [];

    if (!events.length) {
      return res.status(400).json({ message: 'Provide events array or single event with screenName, sectionKey, xPercent, yPercent' });
    }

    const docs = events.map((e) => ({
      organizationId,
      userId: e.userId || userId,
      screenName: e.screenName,
      sectionKey: e.sectionKey != null ? String(e.sectionKey) : '',
      xPercent: Number(e.xPercent),
      yPercent: Number(e.yPercent),
      viewportWidth: e.viewportWidth != null ? Number(e.viewportWidth) : null,
      viewportHeight: e.viewportHeight != null ? Number(e.viewportHeight) : null,
    }));

    const invalid = docs.find((d) => d.screenName === undefined || d.xPercent === undefined || d.yPercent === undefined);
    if (invalid) {
      return res.status(400).json({ message: 'Each event must have screenName, xPercent, yPercent' });
    }

    await AnalyticsClick.insertMany(docs);
    return res.status(201).json({ message: 'Clicks recorded', count: docs.length });
  } catch (err) {
    console.error('recordClicks error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/analytics/heatmap
const getHeatmap = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    const { screenName, sectionKey, from, to, gridSize: qsGrid } = req.query;

    if (!organizationId || !screenName) {
      return res.status(400).json({ message: 'organizationId and screenName required' });
    }

    const gridSize = Math.min(20, Math.max(5, parseInt(qsGrid, 10) || GRID_SIZE_DEFAULT));
    const filter = { organizationId, screenName };
    if (sectionKey != null && sectionKey !== '') filter.sectionKey = sectionKey;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const clicks = await AnalyticsClick.find(filter, { xPercent: 1, yPercent: 1 }).lean();
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    for (const c of clicks) {
      const x = Math.min(gridSize - 1, Math.max(0, Math.floor((c.xPercent / 100) * gridSize)));
      const y = Math.min(gridSize - 1, Math.max(0, Math.floor((c.yPercent / 100) * gridSize)));
      grid[y][x] += 1;
    }

    return res.json({
      screenName,
      sectionKey: sectionKey || '',
      grid,
      gridSize,
      totalClicks: clicks.length,
    });
  } catch (err) {
    console.error('getHeatmap error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/analytics/screens
const getScreens = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    if (!organizationId) {
      return res.status(400).json({ message: 'organizationId required' });
    }

    const list = await AnalyticsClick.aggregate([
      { $match: { organizationId } },
      { $group: { _id: { screenName: '$screenName', sectionKey: '$sectionKey' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { screenName: '$_id.screenName', sectionKey: '$_id.sectionKey', count: 1, _id: 0 } },
    ]);

    return res.json(list);
  } catch (err) {
    console.error('getScreens error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatUTCDate(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function formatUTCYearMonth(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

function getMondayStartUTC(d) {
  // getUTCDay(): Sun=0, Mon=1 ... Sat=6
  const day = d.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  const ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return new Date(ms - diffToMonday * 24 * 60 * 60 * 1000);
}

// GET /api/analytics/installs?period=daily|weekly|monthly|yearly&date=YYYY-MM-DD&count=7
const getInstallStats = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    if (!organizationId) {
      return res.status(400).json({ message: 'organizationId required' });
    }

    // Note: AnalyticsInstall model currently does not store organizationId.
    // We still keep this signature for future compatibility.
    const period = (req.query.period || 'daily').toLowerCase();
    const dateStr = req.query.date;
    const count = Math.max(1, Math.min(60, parseInt(req.query.count, 10) || 7));

    if (!dateStr) return res.status(400).json({ message: 'date is required' });
    const baseDate = new Date(dateStr);
    if (Number.isNaN(baseDate.getTime())) return res.status(400).json({ message: 'Invalid date' });

    let rangeStart;
    let rangeEnd;
    const labels = [];

    if (period === 'daily') {
      rangeEnd = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate() + 1));
      rangeStart = new Date(rangeEnd.getTime() - (count - 1) * 24 * 60 * 60 * 1000);
      for (let i = 0; i < count; i++) {
        const d = new Date(rangeStart.getTime() + i * 24 * 60 * 60 * 1000);
        labels.push(formatUTCDate(d));
      }
    } else if (period === 'weekly') {
      const baseWeekStart = getMondayStartUTC(baseDate);
      rangeEnd = new Date(baseWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      rangeStart = new Date(rangeEnd.getTime() - (count - 1) * 7 * 24 * 60 * 60 * 1000);
      for (let i = 0; i < count; i++) {
        const d = new Date(rangeStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        labels.push(formatUTCDate(d));
      }
    } else if (period === 'monthly') {
      const baseMonthStart = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), 1));
      const baseNextMonthStart = new Date(Date.UTC(baseMonthStart.getUTCFullYear(), baseMonthStart.getUTCMonth() + 1, 1));
      rangeEnd = baseNextMonthStart;
      rangeStart = new Date(rangeEnd.getTime());
      rangeStart.setUTCMonth(rangeStart.getUTCMonth() - (count - 1));
      for (let i = 0; i < count; i++) {
        const d = new Date(Date.UTC(baseMonthStart.getUTCFullYear(), baseMonthStart.getUTCMonth() - (count - 1) + i, 1));
        labels.push(formatUTCYearMonth(d));
      }
    } else if (period === 'yearly') {
      const year = baseDate.getUTCFullYear();
      rangeEnd = new Date(Date.UTC(year + 1, 0, 1));
      rangeStart = new Date(Date.UTC(year - (count - 1), 0, 1));
      for (let y = year - (count - 1); y <= year; y++) labels.push(String(y));
    } else {
      return res.status(400).json({ message: 'Invalid period. Use daily|weekly|monthly|yearly' });
    }

    const match = {
      timestamp: { $gte: rangeStart, $lt: rangeEnd },
    };
    // AnalyticsInstall stores attribution inside `parameters` (Mixed), so we can optionally
    // scope installs to an organization if the client included `parameters.organizationId`.
    if (organizationId) {
      match['parameters.organizationId'] = organizationId;
    }

    const pipeline = [
      { $match: match },
    ];

    if (period === 'daily') {
      pipeline.push({
        $project: { label: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp', timezone: 'UTC' } } },
      });
      pipeline.push({ $group: { _id: '$label', count: { $sum: 1 } } });
    } else if (period === 'weekly') {
      pipeline.push({
        $project: {
          weekStart: {
            $dateSubtract: {
              startDate: '$timestamp',
              unit: 'day',
              amount: {
                $mod: [{ $add: [{ $dayOfWeek: '$timestamp' }, 5] }, 7],
              },
            },
          },
        },
      });
      pipeline.push({
        $project: { label: { $dateToString: { format: '%Y-%m-%d', date: '$weekStart', timezone: 'UTC' } } },
      });
      pipeline.push({ $group: { _id: '$label', count: { $sum: 1 } } });
    } else if (period === 'monthly') {
      pipeline.push({
        $project: { label: { $dateToString: { format: '%Y-%m', date: '$timestamp', timezone: 'UTC' } } },
      });
      pipeline.push({ $group: { _id: '$label', count: { $sum: 1 } } });
    } else {
      pipeline.push({
        $project: { label: { $dateToString: { format: '%Y', date: '$timestamp', timezone: 'UTC' } } },
      });
      pipeline.push({ $group: { _id: '$label', count: { $sum: 1 } } });
    }

    const agg = await AnalyticsInstall.aggregate(pipeline);
    const countMap = new Map(agg.map((x) => [x._id, x.count]));

    const data = labels.map((label) => ({
      label,
      count: countMap.get(label) || 0,
    }));

    return res.json({
      period,
      date: dateStr,
      count,
      data,
    });
  } catch (err) {
    console.error('getInstallStats error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/analytics/clicks/summary?screenName=...&sectionKey=&from=&to=
const getClicksSummary = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.query.organizationId;
    if (!organizationId) {
      return res.status(400).json({ message: 'organizationId required' });
    }
    const { screenName, sectionKey, from, to } = req.query;
    if (!screenName) {
      return res.status(400).json({ message: 'screenName is required' });
    }

    const filter = { organizationId, screenName };
    if (sectionKey != null && sectionKey !== '') filter.sectionKey = String(sectionKey);
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const agg = await AnalyticsClick.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniqueUsersSet: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueUsersCount: {
            $size: {
              $filter: {
                input: '$uniqueUsersSet',
                as: 'u',
                cond: { $ne: ['$$u', null] },
              },
            },
          },
        },
      },
    ]);

    const row = agg[0] || { totalClicks: 0, uniqueUsersCount: 0 };
    return res.json({ screenName, sectionKey: sectionKey || '', ...row });
  } catch (err) {
    console.error('getClicksSummary error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/analytics/log-event
const logEvent = async (req, res) => {
  try {
    const { event_name, parameters, phone_number, timestamp } = req.body;

    if (!event_name || typeof event_name !== 'string' || !event_name.trim()) {
      return res.status(400).json({ success: false, message: 'event_name is required and must be a non-empty string' });
    }

    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();
    if (Number.isNaN(eventTimestamp.getTime())) {
      return res.status(400).json({ success: false, message: 'timestamp must be a valid ISO 8601 date string' });
    }

    const doc = {
      organizationId: req.user?.organizationId || null,
      userId: req.user?.userId || null,
      event_name: event_name.trim(),
      parameters: parameters && typeof parameters === 'object' ? parameters : {},
      phone_number: phone_number != null ? String(phone_number).trim() : '',
      event_timestamp: eventTimestamp,
    };

    await AnalyticsLogEvent.create(doc);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('logEvent error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/analytics/log-install
const logInstall = async (req, res) => {
  try {
    const { timestamp, parameters } = req.body || {};

    if (!timestamp) {
      return res.status(400).json({ success: false, message: 'timestamp is required' });
    }
    const ts = new Date(timestamp);
    if (Number.isNaN(ts.getTime())) {
      return res.status(400).json({ success: false, message: 'timestamp must be a valid ISO 8601 date string' });
    }

    if (!parameters || typeof parameters !== 'object') {
      return res.status(400).json({ success: false, message: 'parameters is required and must be an object' });
    }

    await AnalyticsInstall.create({
      timestamp: ts,
      parameters,
    });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('logInstall error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  recordClicks,
  getHeatmap,
  getScreens,
  logEvent,
  logInstall,
  getInstallStats,
  getClicksSummary,
};
