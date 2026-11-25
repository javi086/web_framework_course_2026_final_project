const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    job_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    job_title: {
      type: String,
      required: true,
      trim: true
    },
    job_category: {
      type: String,
      required: true,
      trim: true
    },
    experience_level: {
      type: String,
      default: 'Mid',
      trim: true
    },
    annual_salary_usd: {
      type: Number,
      required: true,
      min: 0
    },
    location: {
      city: { type: String, default: 'Remote' },
      country: { type: String, default: 'Global' }
    },
    skillsList: {
      type: [String],
      default: []
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imageAlt: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);