/******************************************************************************
* ITE5315 - Final Project (Phase 1)
* I declare that this assignment is my own work in accordance with Humber
* Academic Policy. No part of this assignment has been copied manually or
* electronically from any other source, including websites, or distributed
* to other students.
*
* I understand that I may use Generative AI for learning, debugging, and
* brainstorming, but the submitted work must be customized to my selected
* dataset and I must be able to explain the code and design decisions.
*
* Name: JOSE JAVIER SANTANA VERA  Student ID: N01753766  Date: NOV/25/26
******************************************************************************/

require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./src/config/db');
const apiRoutes = require('./src/routes/api');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5500;

// Configure EJS as the view engine (from Assignment 2)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Built-in Middleware (Must run before routes)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Custom Logger Middleware
function requestLogger(req, res, next) {
  const time = new Date().toLocaleString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
}
app.use(requestLogger);

// Formatting for JSON responses
app.set('json spaces', 2);

// Mount Phase 1 MongoDB Atlas API routes FIRST
app.use('/api', apiRoutes);

// Mount existing Assignment 2 routes
app.use('/', routes);

// Connect to MongoDB Atlas, then start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();