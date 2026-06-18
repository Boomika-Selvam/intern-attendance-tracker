const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Attendance = require('../models/Attendance');

const getRows = async (req) => {
  const query = {};
  if (req.query.internId) {
    query.internId = String(req.query.internId).trim().toUpperCase();
  }
  return Attendance.find(query).sort({ createdAt: -1 });
};

const exportExcel = async (req, res, next) => {
  try {
    const rows = await getRows(req);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'Attendance ID', key: 'attendanceId', width: 38 },
      { header: 'Intern ID', key: 'internId', width: 14 },
      { header: 'Login Time', key: 'loginTime', width: 24 },
      { header: 'Logout Time', key: 'logoutTime', width: 24 },
      { header: 'Hours', key: 'totalWorkingHours', width: 10 },
      { header: 'Logged In', key: 'isLoggedIn', width: 12 },
      { header: 'Notification', key: 'notificationType', width: 20 }
    ];

    rows.forEach((row) => sheet.addRow(row.toObject()));
    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

const exportPdf = async (req, res, next) => {
  try {
    const rows = await getRows(req);
    const doc = new PDFDocument({ margin: 32, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Intern Attendance Report', { underline: true });
    doc.moveDown();

    rows.forEach((row) => {
      doc.fontSize(10).text(
        `${row.internId} | Login: ${row.loginTime ? row.loginTime.toISOString() : '-'} | Logout: ${
          row.logoutTime ? row.logoutTime.toISOString() : '-'
        } | Hours: ${row.totalWorkingHours}`
      );
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { exportExcel, exportPdf };
