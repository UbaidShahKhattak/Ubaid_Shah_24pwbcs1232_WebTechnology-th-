// server.js
// Main entry point for Online Bookstore Management API
// CS224 - Web Technologies | Assignment No. 02

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const logger   = require('./middleware/logger');
const bookRoutes = require('./routes/books');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────

// Parse incoming JSON requests
app.use(express.json());

// Custom request logger middleware (logs method, endpoint, date/time)
app.use(logger);

// ─────────────────────────────────────────────
// DATABASE CONNECTION — MongoDB via Mongoose
// ─────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
  });

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Home route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📚 Welcome to Online Bookstore Management API',
    version: '1.0.0',
    endpoints: {
      getAllBooks:    'GET    /api/books',
      searchBooks:   'GET    /api/books?author=xyz&genre=abc',
      pagination:    'GET    /api/books?page=1&limit=5',
      getSingleBook: 'GET    /api/books/:id',
      addBook:       'POST   /api/books',
      updateBook:    'PUT    /api/books/:id',
      deleteBook:    'DELETE /api/books/:id'
    }
  });
});

// Books API routes
app.use('/api/books', bookRoutes);

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER — 404 for unknown routes
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler — catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`📚  API available at http://localhost:${PORT}/api/books`);
});
