const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  class_name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 30
  },
  academic_year: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer'],
    default: 'Fall'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);

