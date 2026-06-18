const express = require('express');
const { exportExcel, exportPdf } = require('../controllers/export.controller');

const router = express.Router();

router.get('/export/excel', exportExcel);
router.get('/export/pdf', exportPdf);

module.exports = router;
