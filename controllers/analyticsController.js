const { AnalyticsClick } = require('../analytics');

const GRID_SIZE_DEFAULT = 10;

/** Record one or many click events (app sends xPercent, yPercent 0-100) */
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

/** Get heatmap grid for admin: counts per cell (gridSize x gridSize) */
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

/** List distinct (screenName, sectionKey) for org (admin dropdowns) */
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

module.exports = {
  recordClicks,
  getHeatmap,
  getScreens,
};
