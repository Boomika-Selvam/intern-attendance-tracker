const express = require('express');
const upload = require('../middleware/upload');
const { registerIntern, getInterns, getInternById } = require('../controllers/intern.controller');

const router = express.Router();

router.post('/register', upload.single('photo'), registerIntern);
router.get('/interns', getInterns);
router.get('/interns/:internId', getInternById);

module.exports = router;
