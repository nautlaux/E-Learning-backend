const express = require('express');
const { createSalesUser, listSalesUsers, updateSalesUser } = require('../controllers/salesController');

const router = express.Router();

router.post('/', createSalesUser);
router.get('/', listSalesUsers);
router.put('/:userId', updateSalesUser);

module.exports = router;

