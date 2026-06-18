const errorHandler = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  return res.status(error.status || 500).json({
    message: error.message || 'Server error'
  });
};

module.exports = errorHandler;
