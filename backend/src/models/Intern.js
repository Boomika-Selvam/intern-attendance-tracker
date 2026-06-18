const mongoose = require('mongoose');

const internSchema = new mongoose.Schema(
  {
    internId: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    photoUrl: {
      type: String,
      required: true
    },
    isRegistered: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Intern', internSchema);
