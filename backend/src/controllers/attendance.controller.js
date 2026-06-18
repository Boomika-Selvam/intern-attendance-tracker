const { v4: uuidv4 } = require('uuid');
const Attendance = require('../models/Attendance');
const Intern = require('../models/Intern');

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

const dateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

const buildDateFilter = (dateValue) => {
  if (!dateValue) {
    return {};
  }
  const key = String(dateValue).slice(0, 10);
  const date = new Date(key);
  return {
    $or: [
      { attendanceDate: key },
      {
        attendanceDate: { $exists: false },
        createdAt: { $gte: startOfDay(date), $lt: endOfDay(date) }
      }
    ]
  };
};

const login = async (req, res, next) => {
  try {
    const internId = String(req.body.internId || '').trim().toUpperCase();
    const intern = await Intern.findOne({ internId });
    if (!intern) {
      return res.status(404).json({ message: 'Intern does not exist' });
    }

    const attendanceDate = dateKey();
    const todayFilter = buildDateFilter(attendanceDate);
    const activeRecord = await Attendance.findOne({ internId, isLoggedIn: true, ...todayFilter });
    if (activeRecord) {
      return res.status(409).json({ message: 'You are already logged in. Please logout first.' });
    }

    const todaysRecord = await Attendance.findOne({ internId, ...todayFilter });
    if (todaysRecord) {
      return res.status(409).json({ message: 'Attendance already marked for today. Only one login and one logout are allowed per day.' });
    }

    const attendance = await Attendance.create({
      attendanceId: uuidv4(),
      internId,
      attendanceDate,
      loginTime: new Date(),
      isLoggedIn: true,
      nextNotificationAt: new Date(Date.now() + FOUR_HOURS_MS)
    });

    return res.status(201).json({ message: 'Login successful', attendance });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const internId = String(req.body.internId || '').trim().toUpperCase();
    const activeRecord = await Attendance.findOne({
      internId,
      isLoggedIn: true,
      ...buildDateFilter(dateKey())
    }).sort({ loginTime: -1 });

    if (!activeRecord) {
      return res.status(409).json({ message: 'No active login found' });
    }

    const logoutTime = new Date();
    const totalWorkingHours = Number(((logoutTime - activeRecord.loginTime) / 36e5).toFixed(2));

    activeRecord.logoutTime = logoutTime;
    activeRecord.totalWorkingHours = totalWorkingHours;
    activeRecord.isLoggedIn = false;
    if (!activeRecord.notificationSent) {
      activeRecord.notificationSent = true;
      activeRecord.notificationType = 'logged_out';
      activeRecord.lastNotificationAt = logoutTime;
    }
    await activeRecord.save();

    return res.json({ message: 'Logout successful', attendance: activeRecord });
  } catch (error) {
    return next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const query = {
      ...buildDateFilter(req.query.date)
    };

    if (req.query.internId) {
      const search = String(req.query.internId).trim();

      const matchingInterns = await Intern.find({
        $or: [
          { internId: new RegExp(search, 'i') },
          { name: new RegExp(search, 'i') }
        ]
      }).select('internId name');

      query.internId = { $in: matchingInterns.map((intern) => intern.internId) };
    }

    if (req.query.currentlyLoggedIn === 'true') {
      query.isLoggedIn = true;
    }

    const records = await Attendance.find(query).sort({ createdAt: -1 });

    const internIds = records.map((record) => record.internId);
    const interns = await Intern.find({ internId: { $in: internIds } }).select('internId name');

    const nameById = interns.reduce((acc, intern) => {
      acc[intern.internId] = intern.name;
      return acc;
    }, {});

    const rows = records.map((record) => ({
      ...record.toObject(),
      name: nameById[record.internId] || '-'
    }));

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

const getAttendanceByIntern = async (req, res, next) => {
  try {
    const records = await Attendance.find({
      internId: req.params.internId.toUpperCase(),
      ...buildDateFilter(req.query.date)
    }).sort({ createdAt: -1 });
    return res.json(records);
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, logout, getAttendance, getAttendanceByIntern };