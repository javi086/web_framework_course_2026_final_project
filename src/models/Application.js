const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: [true, 'jobId is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected'],
      default: 'saved'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);