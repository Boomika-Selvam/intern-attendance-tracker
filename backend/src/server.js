require('dotenv').config();
console.log("MONGODB_URI =", process.env.MONGODB_URI);

const app = require('./app');
const connectDB = require('./config/db');
const { startNotificationCron } = require('./services/notificationCron.service');

connectDB();

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;

  startNotificationCron();

  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

module.exports = app;