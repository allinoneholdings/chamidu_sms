const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  marked_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per student per class per date
attendanceSchema.index({ class_id: 1, student_id: 1, date: 1 }, { unique: true });

// Virtual for formatted date
attendanceSchema.virtual('formatted_date').get(function() {
  return this.date.toLocaleDateString();
});

// Ensure virtual fields are serialized
attendanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

