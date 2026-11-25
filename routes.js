/******************************************************************************
* ITE5315 - Assignment 1
* I declare that this assignment is my own work in accordance with Humber
* Academic Policy. No part of this assignment has been copied manually or
* electronically from any other source, including websites, or distributed
* to other students.
*
* I understand that I may use Generative AI for learning, debugging, and
* brainstorming, but the submitted work must be customized to my selected
* dataset and I must be able to explain the code and design decisions.
*
* Name: JOSE JAVIER SANTANA VERA Student ID: N01753766  Date: 
******************************************************************************/
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();


// HTML table manually using JavaScript
router.get('/table_in_js', (req, res) => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI Jobs Table - JavaScript Version</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>AI Jobs Market - JavaScript Version</h1>
    <p><a href="/">Back to Home</a> | <a href="/add">Add New Job</a></p>
    <table border="1" cellpadding="6" cellspacing="0">
        <thead>
            <tr>
                <th>Job ID</th>
                <th>Job Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Salary (USD)</th>
                <th>Image</th>
            </tr>
        </thead>
        <tbody>`;

    dataset.forEach((job) => {
        const city = job.location ? job.location.city : (job.city || 'Remote');
        const country = job.location ? job.location.country : (job.country || 'Global');

        html += `
            <tr>
                <td>${job.job_id || job.id}</td>
                <td>${job.job_title || job.title}</td>
                <td>${job.job_category || job.category}</td>
                <td>${city}, ${country}</td>
                <td>$${Number(job.annual_salary_usd || 0).toLocaleString()}</td>
                <td><img src="${job.imageUrl}" alt="${job.imageAlt}" width="70"></td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</body>
</html>`;

    res.send(html);
});

// GET /table - Render the table using the EJS view engine
router.get('/table', (req, res) => {
    res.render('table', {
        pageTitle: 'AI Jobs Market Explorer',
        records: dataset
    });
});

// GET /add - Serve the Job Form
router.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add.html'));
});

// Validations
function validateJobForm(req, res, next) {
    const errors = [];
    const { job_title, job_category, annual_salary_usd } = req.body;

    // Rule 1: Check required text fields
    if (!job_title || job_title.trim() === '') {
        errors.push('Job title is required.');
    }
    if (!job_category || job_category.trim() === '') {
        errors.push('Job category is required.');
    }

    // Rule 2: Check numeric salary field
    const salary = Number(annual_salary_usd);
    if (!annual_salary_usd || isNaN(salary) || salary <= 0) {
        errors.push('Annual salary must be a positive number.');
    }

    // If any rule failed, stop and return 400 Bad Request
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors
        });
    }

    // Everything is valid, proceed forward
    next();
}

//  POST /add - Process the submission
router.post('/add', validateJobForm, (req, res) => {
    const skillsInput = req.body.required_skills || '';
    const skillsArray = skillsInput
        .split(/[,|]/)
        .map(s => s.trim())
        .filter(Boolean);

    // Create the new job object matching your enriched structure
    const newJob = {
        job_id: `AIJOB${String(dataset.length + 1).padStart(4, '0')}`,
        job_title: req.body.job_title.trim(),
        job_category: req.body.job_category.trim(),
        annual_salary_usd: Number(req.body.annual_salary_usd),
        location: {
            city: req.body.city ? req.body.city.trim() : 'Remote',
            country: req.body.country ? req.body.country.trim() : 'Global'
        },
        skillsList: skillsArray,
        imageUrl: `https://picsum.photos/seed/${dataset.length + 1}/600/400`,
        imageAlt: `Visual placeholder for ${req.body.job_title}`
    };

    // Add to in-memory dataset array for this session
    dataset.push(newJob);

    // Respond with 201 Created
    res.status(201).json({
        message: 'Job posting accepted for this session.',
        record: newJob
    });
});




// Home Page Route
router.route("/").get(function (req, res) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

// About Page Route
router.route("/about").get(function (req, res) {
        res.sendFile(path.join(__dirname, 'public', 'about.html'));
    });

// Load and Display Enriched JSON Data
let dataset = [];
//async to not block the application
async function loadDataset() {
    try {
        // Getting the information of the dataSet
        const datasetPath = path.join(__dirname, 'data', 'dataset.json');
        const rawData = await fs.readFile(datasetPath, 'utf8');
        dataset = JSON.parse(rawData);
        console.log(`Enriched dataset loaded successfully with ${dataset.length} records!`);
    } catch (error) {
        console.error('Error loading dataset file:', error.message);
    }
}

loadDataset();

router.get('/data', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        totalRecords: dataset.length,
        data: dataset
    }, null, 2));
});

// Dynamic Route Using req.params
router.get('/data/:id', (req, res) => {
    const recordId = req.params.id;
    const record = dataset.find(item => item.job_id == recordId || item.id == recordId);

    if (!record) {
        return res.status(404).json({ error: 'Record not found with the specified ID.' });
    }

    res.json(record);
});

// Search Route Using req.query
router.route("/search").get(function (req, res) {
        const keyword = req.query.keyword;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Missing query parameter: ?keyword=value is required.' });
        }

        const searchTerm = keyword.toLowerCase();
        const results = dataset.filter(item => {
            const title = item.job_title || '';
            const skills = item.required_skills || '';
            return title.toLowerCase().includes(searchTerm) || skills.toLowerCase().includes(searchTerm);
        });

        res.json({
            keywordSearched: keyword,
            matchCount: results.length,
            results: results
        });
    });

// Filter Route Using req.query
router.get('/filter', (req, res) => {
    const categoryValue = req.query.category;

    if (!categoryValue) {
        return res.status(400).json({ error: 'Missing query parameter: ?category=value is required.' });
    }

    const filterTerm = categoryValue.toLowerCase();
    const results = dataset.filter(item => {
        const cat = item.job_category || item.category || item.experience_level || '';
        return cat.toLowerCase() === filterTerm;
    });

    res.type('json').send(JSON.stringify({
        filterCategory: categoryValue,
        matchCount: results.length,
        results: results
    }, null, 2));
});

//Custom Category Statistics
router.get('/categories', (req, res) => {
    try {
        const categoryCounts = {};
        
        dataset.forEach(item => {
            const category = item.job_category || 'Unassigned';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            message: 'Total job count grouped by category',
            totalCategories: Object.keys(categoryCounts).length,
            categories: categoryCounts
        }, null, 2));
        
    } catch (error) {
        console.error('Error processing categories:', error);
        res.status(500).json({ error: 'Unable to generate category statistics.' });
    }
});

// 404 Handler for invalid routes inside router
router.use((req, res) => {
    res.status(404).json({ error: '404 - Route not found. Please check your URL.' });
});

module.exports = router;