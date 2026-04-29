const { Seminar, SeminarRegistration, User, SeminarHomeConfig } = require('../models');
const paginate = require('../utils/pagination');

const normalizeDays = (days) => {
  if (!Array.isArray(days)) return [];
  const uniq = Array.from(new Set(days.map((d) => Number(d)).filter((d) => Number.isFinite(d) && d >= 0 && d <= 6)));
  return uniq.sort((a, b) => a - b);
};

const IST_TZ = 'Asia/Kolkata';

const formatMonthNameIST = (d) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: IST_TZ, month: 'long' }).format(d);

const formatDayIST = (d) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: IST_TZ, day: '2-digit' }).format(d);

const formatTimeIST = (d) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: IST_TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(d);

const getISTDayOfWeek = (date) => {
  // Convert to IST by adding offset (+05:30), then use UTC day to avoid local timezone issues.
  const ist = new Date(date.getTime() + 330 * 60 * 1000);
  return ist.getUTCDay(); // 0=Sun ... 6=Sat in IST context
};

const buildNextOccurrenceUTC = ({ now, daysOfWeek, timeHHmm, durationMinutes = 60 }) => {
  const [hh, mm] = String(timeHHmm || '19:00').split(':').map((x) => Number(x));
  const hour = Number.isFinite(hh) ? hh : 19;
  const minute = Number.isFinite(mm) ? mm : 0;

  // "now" in IST components using fixed offset
  const istNow = new Date(now.getTime() + 330 * 60 * 1000);
  const baseY = istNow.getUTCFullYear();
  const baseM = istNow.getUTCMonth();
  const baseD = istNow.getUTCDate();

  const todayDowIST = istNow.getUTCDay();
  const timeNowMinutes = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();
  const targetMinutes = hour * 60 + minute;

  const candidateOffsets = [];
  const days = Array.isArray(daysOfWeek) ? daysOfWeek : [];

  for (const dow of days) {
    if (!Number.isFinite(dow) || dow < 0 || dow > 6) continue;
    let diff = (dow - todayDowIST + 7) % 7;
    if (diff === 0 && targetMinutes <= timeNowMinutes) diff = 7; // today already passed -> next week
    candidateOffsets.push(diff);
  }

  if (!candidateOffsets.length) return null;
  const minDiff = Math.min(...candidateOffsets);

  // Build IST datetime as UTC fields (because we shifted to IST context via offset)
  const istTarget = new Date(Date.UTC(baseY, baseM, baseD + minDiff, hour, minute, 0, 0));
  // Convert back to UTC by subtracting IST offset
  const startUTC = new Date(istTarget.getTime() - 330 * 60 * 1000);
  const endUTC = new Date(startUTC.getTime() + (Number(durationMinutes) || 60) * 60 * 1000);

  return { startUTC, endUTC };
};

// ADMIN: POST /api/seminars
const createSeminar = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const createdBy = req.user?.userId || null;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const { title, description, bannerImageUrl, meetingUrl, schedule, isActive } = req.body || {};

    const doc = await Seminar.create({
      organizationId,
      title: title !== undefined ? String(title).trim() : '',
      description: description !== undefined ? String(description).trim() : '',
      bannerImageUrl: bannerImageUrl !== undefined ? String(bannerImageUrl).trim() : '',
      meetingUrl: meetingUrl !== undefined ? String(meetingUrl).trim() : '',
      schedule: schedule
        ? {
            type: 'weekly',
            daysOfWeek: normalizeDays(schedule.daysOfWeek),
            time: schedule.time !== undefined ? String(schedule.time).trim() : '19:00',
            timezone: schedule.timezone !== undefined ? String(schedule.timezone).trim() : 'Asia/Kolkata',
            durationMinutes: schedule.durationMinutes !== undefined ? Number(schedule.durationMinutes) || 60 : 60,
            startDate: schedule.startDate ? new Date(schedule.startDate) : null,
            endDate: schedule.endDate ? new Date(schedule.endDate) : null,
          }
        : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('createSeminar error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// USER: GET /api/seminars/home
// Returns only next immediate seminar info + achievements
const getSeminarHome = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const config = await SeminarHomeConfig.findOne({ organizationId, isActive: true }).lean();
    const achievements = Array.isArray(config?.achievements) ? config.achievements : [];
    const whatsapp_message = config?.whatsapp_message || '';

    const now = new Date();
    const seminars = await Seminar.find({ organizationId, isActive: true }).lean();

    let best = null;
    for (const s of seminars) {
      const sch = s.schedule || {};
      if (sch.type !== 'weekly') continue;
      const occ = buildNextOccurrenceUTC({
        now,
        daysOfWeek: sch.daysOfWeek,
        timeHHmm: sch.time,
        durationMinutes: sch.durationMinutes,
      });
      if (!occ) continue;

      // Optional schedule window constraints
      if (sch.startDate && occ.startUTC < new Date(sch.startDate)) continue;
      if (sch.endDate && occ.startUTC > new Date(sch.endDate)) continue;

      if (!best || occ.startUTC < best.startUTC) {
        best = { seminar: s, startUTC: occ.startUTC, endUTC: occ.endUTC };
      }
    }

    const is_live = best ? now >= best.startUTC && now <= best.endUTC : false;
    const webinar = best
      ? {
          is_live,
          day: formatDayIST(best.startUTC),
          month: formatMonthNameIST(best.startUTC),
          time: formatTimeIST(best.startUTC),
          whatsapp_message,
          seminarId: String(best.seminar._id),
          title: best.seminar.title || '',
          meetingUrl: best.seminar.meetingUrl || '',
        }
      : {
          is_live: false,
          day: '',
          month: '',
          time: '',
          whatsapp_message,
        };

    return res.json({
      success: true,
      data: {
        achievements,
        webinar,
      },
    });
  } catch (err) {
    console.error('getSeminarHome error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ADMIN: PUT /api/seminars/home-config
const upsertSeminarHomeConfig = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const updatedBy = req.user?.userId || null;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const { achievements, whatsapp_message, isActive } = req.body || {};
    const updates = { updatedBy };
    if (Array.isArray(achievements)) {
      updates.achievements = achievements.map((x) => String(x)).filter(Boolean);
    }
    if (whatsapp_message !== undefined) updates.whatsapp_message = String(whatsapp_message).trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const saved = await SeminarHomeConfig.findOneAndUpdate(
      { organizationId },
      { $set: { organizationId, ...updates } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({
      success: true,
      data: {
        achievements: saved.achievements || [],
        whatsapp_message: saved.whatsapp_message || '',
        isActive: saved.isActive,
      },
    });
  } catch (err) {
    console.error('upsertSeminarHomeConfig error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// USER: GET /api/seminars
const listSeminars = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const { page, limit, includeInactive } = req.query;
    const filter = { organizationId };
    if (!includeInactive || includeInactive === 'false') filter.isActive = true;

    const result = await paginate(Seminar, { filter, page, limit, sort: { createdAt: -1 } });
    return res.json(result);
  } catch (err) {
    console.error('listSeminars error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// USER: GET /api/seminars/:seminarId
const getSeminarById = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const { seminarId } = req.params;
    const doc = await Seminar.findOne({ _id: seminarId, organizationId }).lean();
    if (!doc) return res.status(404).json({ message: 'Seminar not found' });
    if (!doc.isActive && req.query.includeInactive !== 'true') return res.status(404).json({ message: 'Seminar not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('getSeminarById error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ADMIN: PUT /api/seminars/:seminarId
const updateSeminar = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const { seminarId } = req.params;
    const { title, description, bannerImageUrl, meetingUrl, schedule, isActive } = req.body || {};

    const updates = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (bannerImageUrl !== undefined) updates.bannerImageUrl = String(bannerImageUrl).trim();
    if (meetingUrl !== undefined) updates.meetingUrl = String(meetingUrl).trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (schedule !== undefined && schedule && typeof schedule === 'object') {
      updates.schedule = {
        type: 'weekly',
        daysOfWeek: schedule.daysOfWeek !== undefined ? normalizeDays(schedule.daysOfWeek) : undefined,
        time: schedule.time !== undefined ? String(schedule.time).trim() : undefined,
        timezone: schedule.timezone !== undefined ? String(schedule.timezone).trim() : undefined,
        durationMinutes: schedule.durationMinutes !== undefined ? Number(schedule.durationMinutes) || 60 : undefined,
        startDate: schedule.startDate !== undefined ? (schedule.startDate ? new Date(schedule.startDate) : null) : undefined,
        endDate: schedule.endDate !== undefined ? (schedule.endDate ? new Date(schedule.endDate) : null) : undefined,
      };
      // Remove undefined keys so we don't overwrite unintentionally
      Object.keys(updates.schedule).forEach((k) => updates.schedule[k] === undefined && delete updates.schedule[k]);
    }

    const doc = await Seminar.findOneAndUpdate(
      { _id: seminarId, organizationId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: 'Seminar not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('updateSeminar error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ADMIN: DELETE /api/seminars/:seminarId
const deleteSeminar = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const { seminarId } = req.params;
    const deleted = await Seminar.findOneAndDelete({ _id: seminarId, organizationId }).lean();
    if (!deleted) return res.status(404).json({ message: 'Seminar not found' });
    return res.json({ success: true, message: 'Seminar deleted' });
  } catch (err) {
    console.error('deleteSeminar error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// USER: POST /api/seminars/:seminarId/register
const registerForSeminar = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { seminarId } = req.params;
    const seminar = await Seminar.findOne({ _id: seminarId, organizationId, isActive: true }).lean();
    if (!seminar) return res.status(404).json({ message: 'Seminar not found' });

    const user = await User.findById(userId).lean();
    const name = user?.name ? String(user.name).trim() : '';
    const mobile = user?.mobile ? String(user.mobile).trim() : '';
    const email = user?.email ? String(user.email).trim().toLowerCase() : '';
    const interestedIn = user?.interestedIn ? String(user.interestedIn).trim().toLowerCase() : '';

    const reg = await SeminarRegistration.findOneAndUpdate(
      { organizationId, seminarId, userId },
      {
        $set: {
          name,
          mobile,
          email,
          interestedIn: interestedIn === 'import' || interestedIn === 'export' ? interestedIn : '',
          status: 'REGISTERED',
          registeredAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({ success: true, data: reg });
  } catch (err) {
    console.error('registerForSeminar error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// USER: GET /api/seminars/me/registrations
const mySeminarRegistrations = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const userId = req.user?.userId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const regs = await SeminarRegistration.find({ organizationId, userId, status: 'REGISTERED' })
      .sort({ registeredAt: -1 })
      .lean();
    return res.json({ success: true, data: regs });
  } catch (err) {
    console.error('mySeminarRegistrations error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ADMIN: GET /api/seminars/:seminarId/registrations?page=&limit=
const listRegistrationsForSeminar = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) return res.status(400).json({ message: 'User organization not found' });

    const { seminarId } = req.params;
    const { page, limit, status } = req.query;

    const filter = { organizationId, seminarId };
    if (status) filter.status = String(status).toUpperCase();

    const result = await paginate(SeminarRegistration, {
      filter,
      page,
      limit,
      sort: { registeredAt: -1 },
    });
    return res.json(result);
  } catch (err) {
    console.error('listRegistrationsForSeminar error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createSeminar,
  getSeminarHome,
  upsertSeminarHomeConfig,
  listSeminars,
  getSeminarById,
  updateSeminar,
  deleteSeminar,
  registerForSeminar,
  mySeminarRegistrations,
  listRegistrationsForSeminar,
};

