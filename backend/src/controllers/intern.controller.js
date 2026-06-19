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
    const photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const intern = await Intern.create({ internId, name, photoUrl, isRegistered: true });

    return res.status(201).json({ message: 'Intern registered', intern });
  } catch (error) {
    return next(error);
  }
};

const getInterns = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const date = req.query.date;

    const query = {};

    if (search) {
      query.$or = [
        { internId: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') }
      ];
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);

      end.setDate(end.getDate() + 1);

      query.createdAt = {
        $gte: start,
        $lt: end
      };
    }

    const interns = await Intern.find(query).sort({ createdAt: -1 });

    return res.json(interns);
  } catch (error) {
    next(error);
  }
};
module.exports = { registerIntern, getInterns, getInternById };
