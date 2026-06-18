const cron = require('node-cron');
const Attendance = require('../models/Attendance');

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

const startNotificationCron = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    const activeRecords = await Attendance.find({
      isLoggedIn: true,
      nextNotificationAt: { $lte: now }
    });

    await Promise.all(
      activeRecords.map((record) => {
        record.notificationSent = true;
        record.notificationType = 'still_logged_in';
        record.notificationCount += 1;
        record.lastNotificationAt = now;
        record.nextNotificationAt = new Date(now.getTime() + FOUR_HOURS_MS);
        return record.save();
      })
    );

    const loggedOutRecords = await Attendance.find({
      isLoggedIn: false,
      notificationCount: 0,
      loginTime: { $lte: new Date(now.getTime() - FOUR_HOURS_MS) }
    });

    await Promise.all(
      loggedOutRecords.map((record) => {
        record.notificationSent = true;
        record.notificationType = 'logged_out';
        record.notificationCount = 1;
        record.lastNotificationAt = now;
        record.nextNotificationAt = null;
        return record.save();
      })
    );
  });
};

module.exports = { startNotificationCron };