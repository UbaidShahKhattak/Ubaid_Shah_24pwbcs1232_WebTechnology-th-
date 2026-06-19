// models/Book.js
// MongoDB Schema for Book using Mongoose

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    genre: {
      type: String,
      trim: true,
      default: 'General'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    publishedDate: {
      type: Date,
      default: null
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Book', bookSchema);
