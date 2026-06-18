const Intern = require('../models/Intern');
const { generateInternId } = require('../services/internId.service');

const registerIntern = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Name must contain at least 2 characters' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Profile photo is required' });
    }

    const internId = await generateInternId();
    const photoUrl = `/uploads/${req.file.filename}`;
    const intern = await Intern.create({ internId, name, photoUrl, isRegistered: true });

    return res.status(201).json({ message: 'Intern registered', intern });
  } catch (error) {
    return next(error);
  }
};

const getInterns = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const query = search
      ? { $or: [{ internId: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }] }
      : {};
    const interns = await Intern.find(query).sort({ createdAt: -1 });
    return res.json(interns);
  } catch (error) {
    return next(error);
  }
};

const getInternById = async (req, res, next) => {
  try {
    const intern = await Intern.findOne({ internId: req.params.internId });
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    return res.json(intern);
  } catch (error) {
    return next(error);
  }
};

module.exports = { registerIntern, getInterns, getInternById };
