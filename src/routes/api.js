const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');

const router = express.Router();

// 1. GET /api/health - Public health check (no secrets)
router.get('/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    service: 'AI Jobs Explorer API',
    phase: 'Phase 1',
    database: dbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 2. GET /api/jobs - List jobs from Atlas with safe max response size
router.get('/jobs', async (req, res) => {
  try {
    const requestedLimit = parseInt(req.query.limit, 10) || 20;
    const safeLimit = Math.min(Math.max(requestedLimit, 1), 50);

    const total = await Job.countDocuments();
    const jobs = await Job.find().limit(safeLimit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalInDatabase: total,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve jobs from database.' });
  }
});

// 3. GET /api/jobs/:id - Single job by job_id (e.g., AIJOB0001) or MongoDB _id
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ job_id: id }, { _id: id }] }
      : { job_id: id };

    const job = await Job.findOne(query);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job record '${id}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching single job:', error.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve job record.' });
  }
});

// 4. GET /api/applications - List saved applications (helps verify persistence after restart)
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve applications.' });
  }
});

// 5. POST /api/applications - Persistent CREATE with input validation
router.post('/applications', async (req, res) => {
  try {
    const { jobId, status, notes } = req.body;
    const allowedStatuses = ['saved', 'applied', 'interviewing', 'offer', 'rejected'];
    const errors = [];

    // Validate required field and type
    if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
      errors.push('jobId is required and must be a non-empty string.');
    }

    // Validate optional status field
    if (status !== undefined) {
      if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
        errors.push(`status must be one of: ${allowedStatuses.join(', ')}.`);
      }
    }

    // Validate optional notes field
    if (notes !== undefined && typeof notes !== 'string') {
      errors.push('notes must be a string.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Verify referenced job exists in Atlas
    const jobExists = await Job.findOne({ job_id: jobId.trim() });
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        error: `Referenced jobId '${jobId.trim()}' does not exist in the jobs collection.`
      });
    }

    const newApplication = await Application.create({
      jobId: jobId.trim(),
      status: status || 'saved',
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Job application saved to MongoDB Atlas.',
      data: newApplication
    });
  } catch (error) {
    console.error('Error creating application:', error.message);
    res.status(500).json({ success: false, error: 'Failed to save job application.' });
  }
});

module.exports = router;