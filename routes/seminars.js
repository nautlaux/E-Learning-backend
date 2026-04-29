const express = require('express');
const requireOrgAdmin = require('../middlewares/requireOrgAdmin');
const {
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
} = require('../controllers/seminarController');

const router = express.Router();

// User APIs
router.get('/home', getSeminarHome);
router.get('/', listSeminars);
router.get('/me/registrations', mySeminarRegistrations);
router.get('/:seminarId', getSeminarById);
router.post('/:seminarId/register', registerForSeminar);

// Admin APIs
router.put('/home-config', requireOrgAdmin, upsertSeminarHomeConfig);
router.post('/', requireOrgAdmin, createSeminar);
router.put('/:seminarId', requireOrgAdmin, updateSeminar);
router.delete('/:seminarId', requireOrgAdmin, deleteSeminar);
router.get('/:seminarId/registrations', requireOrgAdmin, listRegistrationsForSeminar);

module.exports = router;

