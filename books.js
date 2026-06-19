// routes/books.js
// All RESTful API routes for the Bookstore

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// ─────────────────────────────────────────────
// GET /api/books
// Get all books with optional search & pagination
// Query params: author, genre, page, limit
// Example: /api/books?author=John&genre=Fiction&page=1&limit=5
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { author, genre, page = 1, limit = 10 } = req.query;

    // Build search filter dynamically
    const filter = {};
    if (author) filter.author = { $regex: author, $options: 'i' };  // case-insensitive
    if (genre)  filter.genre  = { $regex: genre,  $options: 'i' };

    // Pagination
    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;

    const totalBooks = await Book.countDocuments(filter);
    const books      = await Book.find(filter)
                                 .sort({ createdAt: -1 })
                                 .skip(skip)
                                 .limit(limitNum);

    res.status(200).json({
      success: true,
      total: totalBooks,
      page: pageNum,
      totalPages: Math.ceil(totalBooks / limitNum),
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/books/:id
// Get a single book by its MongoDB ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    // Handle invalid MongoDB ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid book ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/books
// Add a new book
// Required fields: title, author, price
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, author, genre, price, publishedDate, inStock } = req.body;

    // Manual validation for required fields
    if (!title || !author || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, author, price'
      });
    }

    const newBook = new Book({ title, author, genre, price, publishedDate, inStock });
    const savedBook = await newBook.save();

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: savedBook
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/books/:id
// Update an existing book by ID
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { title, author, price } = req.body;

    // Validate required fields if they are being updated
    if (title === '' || author === '' || price === '') {
      return res.status(400).json({
        success: false,
        message: 'title, author, and price cannot be empty'
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }  // return updated doc, run schema validators
    );

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid book ID format' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/books/:id
// Delete a book by ID
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: deletedBook
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid book ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
