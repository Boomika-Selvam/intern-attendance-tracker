const Intern = require('../models/Intern');

const generateInternId = async () => {
  const lastIntern = await Intern.findOne().sort({ createdAt: -1, internId: -1 });
  if (!lastIntern) {
    return 'INT001';
  }

  const lastNumber = Number(lastIntern.internId.replace('INT', '')) || 0;
  return `INT${String(lastNumber + 1).padStart(3, '0')}`;
};

module.exports = { generateInternId };
