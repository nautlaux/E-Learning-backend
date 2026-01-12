const express = require('express');
const { createTeacher, getAllTeachers } = require('../controllers/teacherController');

const router = express.Router();

router.post('/', createTeacher);
router.get('/', getAllTeachers);

module.exports = router;

