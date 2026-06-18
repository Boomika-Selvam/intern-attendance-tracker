const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;