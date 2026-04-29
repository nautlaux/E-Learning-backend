const express = require('express');
const {
  createTestimonial,
  listTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

const router = express.Router();

router.post('/', createTestimonial);
router.get('/', listTestimonials);
router.get('/:testimonialId', getTestimonialById);
router.put('/:testimonialId', updateTestimonial);
router.delete('/:testimonialId', deleteTestimonial);

module.exports = router;

