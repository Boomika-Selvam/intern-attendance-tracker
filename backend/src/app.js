const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const internRoutes = require('./routes/intern.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const exportRoutes = require('./routes/export.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', internRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', exportRoutes);
app.use(errorHandler);

module.exports = app;
