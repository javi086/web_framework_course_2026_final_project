const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('FATAL ERROR: MONGO_URI is missing in your .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error('MongoDB Atlas Connection Failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;