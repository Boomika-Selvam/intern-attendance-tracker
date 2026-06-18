const express = require('express');
const {
  login,
  logout,
  getAttendance,
  getAttendanceByIntern
} = require('../controllers/attendance.controller');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/attendance', getAttendance);
router.get('/attendance/:internId', getAttendanceByIntern);

module.exports = router;
