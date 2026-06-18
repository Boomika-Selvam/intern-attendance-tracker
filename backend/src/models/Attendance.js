const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: {
      type: String,
      unique: true,
      required: true
    },
    internId: {
      type: String,
      ref: 'Intern',
      required: true,
      index: true
    },
    attendanceDate: {
      type: String,
      required: true
    },
    loginTime: {
      type: Date,
      required: true
    },
    logoutTime: {
      type: Date,
      default: null
    },
    totalWorkingHours: {
      type: Number,
      default: 0
    },
    isLoggedIn: {
      type: Boolean,
      default: true,
      index: true
    },
    notificationSent: {
      type: Boolean,
      default: false
    },
    notificationCount: {
      type: Number,
      default: 0
    },
    lastNotificationAt: {
      type: Date,
      default: null
    },
    nextNotificationAt: {
      type: Date,
      default: null
    },
    notificationType: {
      type: String,
      enum: ['still_logged_in', 'logged_out', null],
      default: null
    }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

attendanceSchema.index(
  { internId: 1, attendanceDate: 1 },
  { unique: true, partialFilterExpression: { attendanceDate: { $exists: true } } }
);

module.exports = mongoose.model('Attendance', attendanceSchema);