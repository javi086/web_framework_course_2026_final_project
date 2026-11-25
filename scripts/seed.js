require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Job = require('../src/models/Job');

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    const datasetPath = path.join(__dirname, '..', 'data', 'dataset.json');
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const jobs = JSON.parse(rawData);

    await Job.deleteMany({});
    console.log('Cleared existing documents in jobs collection.');

    const inserted = await Job.insertMany(jobs);
    console.log(`Success! Imported ${inserted.length} job records into MongoDB Atlas.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();