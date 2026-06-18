const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Attendance = require('../models/Attendance');
const Intern = require('../models/Intern');

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
};

const getRows = async (req) => {
  const query = {};

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

  const records = await Attendance.find(query).sort({ createdAt: -1 });
  const internIds = records.map((record) => record.internId);

  const interns = await Intern.find({ internId: { $in: internIds } }).select('internId name');

  const nameById = interns.reduce((acc, intern) => {
    acc[intern.internId] = intern.name;
    return acc;
  }, {});

  return records.map((record) => ({
    ...record.toObject(),
    name: nameById[record.internId] || '-'
  }));
};

const exportExcel = async (req, res, next) => {
  try {
    const rows = await getRows(req);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    sheet.columns = [
      { header: 'Intern ID', key: 'internId', width: 14 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Login Time', key: 'loginTimeFormatted', width: 24 },
      { header: 'Logout Time', key: 'logoutTimeFormatted', width: 24 },
      { header: 'Hours', key: 'totalWorkingHours', width: 10 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Notification', key: 'notificationType', width: 20 }
    ];

    rows.forEach((row) => {
      sheet.addRow({
        internId: row.internId,
        name: row.name,
        loginTimeFormatted: formatDateTime(row.loginTime),
        logoutTimeFormatted: formatDateTime(row.logoutTime),
        totalWorkingHours: row.totalWorkingHours || 0,
        status: row.isLoggedIn ? 'Logged In' : 'Logged Out',
        notificationType: row.notificationType || '-'
      });
    });

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' }
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9E2EC' } },
          left: { style: 'thin', color: { argb: 'FFD9E2EC' } },
          bottom: { style: 'thin', color: { argb: 'FFD9E2EC' } },
          right: { style: 'thin', color: { argb: 'FFD9E2EC' } }
        };
      });
    });

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
    const doc = new PDFDocument({ margin: 36, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text('Intern Attendance Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor('#666').text(`Generated on ${formatDateTime(new Date())}`, {
      align: 'center'
    });

    doc.moveDown(1.2);

    const startX = 36;
    const widths = [60, 90, 120, 120, 50, 70];
    const headers = ['Intern ID', 'Name', 'Login Time', 'Logout Time', 'Hours', 'Status'];
    let y = doc.y;

    doc.rect(startX, y, 510, 24).fill('#1F4E78');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);

    let x = startX;
    headers.forEach((header, index) => {
      doc.text(header, x + 4, y + 8, { width: widths[index] - 8 });
      x += widths[index];
    });

    y += 24;
    doc.font('Helvetica').fontSize(8).fillColor('#111111');

    rows.forEach((row, rowIndex) => {
      if (y > 760) {
        doc.addPage();
        y = 36;
      }

      const fill = rowIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      doc.rect(startX, y, 510, 28).fill(fill);
      doc.fillColor('#111111');

      const values = [
        row.internId,
        row.name || '-',
        formatDateTime(row.loginTime),
        formatDateTime(row.logoutTime),
        String(row.totalWorkingHours || 0),
        row.isLoggedIn ? 'Logged In' : 'Logged Out'
      ];

      x = startX;
      values.forEach((value, index) => {
        doc.text(value, x + 4, y + 8, { width: widths[index] - 8 });
        x += widths[index];
      });

      y += 28;
    });

    if (!rows.length) {
      doc.fontSize(11).fillColor('#666').text('No attendance records found.', { align: 'center' });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { exportExcel, exportPdf };